using System.Threading.Tasks;
/**
 * Copyright (C) 2020 ChronosX88
 * 
 * This file is part of Wayland Project Server.
 * 
 * Wayland Project Server is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Wayland Project Server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Wayland Project Server.  If not, see <http://www.gnu.org/licenses/>.
 */

using System;
using System.Collections.Generic;
using AltV.Net;
using AltV.Net.Enums;
using MongoDB.Driver;
using Wayland.SDK;
using Wayland.Utils;

namespace Wayland
{
    public class Auth : IScript
    {
        private static IMongoCollection<AccountData>? accountsCol = null;

        [ScriptEvent(ScriptEventType.PlayerConnect)]
        public static void OnPlayerJoin(CustomPlayer player, string reason)
        {
            player.Emit(AltVEventsConstants.Auth.ShowAuthScreen);
        }

        [ClientEvent("auth:enterLoginData")]
        public static async void OnEnterLoginData(CustomPlayer player, Dictionary<string, string> loginData)
        {
            var col = Context.MongoDB.GetCollection<AccountData>("accounts");
            var email = loginData["email"];
            var password = loginData["password"];
            try {
                var filter = Builders<AccountData>.Filter.Eq("Email", email);
                var res = await col.Find(filter).Limit(1).SingleOrDefaultAsync();
                if (res == null) {
                    player.Emit("auth:loginFailed", "account doesn't exist");
                    return;
                }
                var isPasswordCorrect = PasswordHasher.VerifyHash(password, res!.Salt, res!.Password);
                if (isPasswordCorrect) {
                    player.Emit("auth:loginSuccess");
                    player.LoggedIn = true;
                    player.Data = res;
                    spawnPlayer(player, 0);
                    return;
                }
            } catch (Exception e) {
                Alt.Log(e.ToString());
                player.Emit("auth:loginFailed", e.Message);
            }
        }

        [ClientEvent("auth:enterRegisterData")]
        public static async void OnEnterRegisterData(CustomPlayer player, Dictionary<string, string> registerData)
        {
            if (player.LoggedIn) {
                return;
            }
            var pData = new AccountData();
            pData.Email = registerData["email"];
            pData.Login = registerData["login"];
            var passAndSalt = PasswordHasher.CreatePasswordHash(registerData["password"]);
            pData.Password = passAndSalt.Item1;
            pData.Salt = passAndSalt.Item2;
            try
            {
                pData.Save();
            }
            catch (MongoWriteException e)
            {
                Alt.Log(e.ToString());
                if (e.WriteError.Code == 11000)
                {
                    player.Emit("auth:registerFailed", 0, "Player with such email or login already exists!");
                }
                else
                {
                    player.Emit("auth:registerFailed", 1, e.Message);
                }
                return;
            }
            player.LoggedIn = true;
            player.Data = pData;
            player.Emit("auth:registerSuccess");

            player.Model = (uint) PedModel.FreemodeMale01;
            spawnPlayer(player, 0);
        }

        [ScriptEvent(ScriptEventType.PlayerDead)]
        public static async void OnPlayerDead(CustomPlayer player, CustomPlayer killer, uint reason) {
            spawnPlayer(player, 2000);
            await Task.Delay(2000);
            player.Emit("player:onSpawn");
        }

        private static void spawnPlayer(CustomPlayer player, uint delay) {
            player.Spawn(OtherConstants.SPAWN_POS, delay);
            player.Rotation = OtherConstants.SPAWN_ROT;
        }

        [ServerEvent]
        public static void OnStartupDone()
        {
            accountsCol = Context.MongoDB.GetCollection<AccountData>("accounts");
        }
    }
}