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

using System.Collections.Generic;
using AltV.Net;
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

        [ClientEvent("onEnterLoginData")]
        public static void OnEnterLoginData(CustomPlayer player, Dictionary<string, string> loginData)
        {
            //
        }

        [ClientEvent("onEnterRegisterData")]
        public static async void OnEnterRegisterData(CustomPlayer player, Dictionary<string, string> registerData)
        {
            Alt.Log("submit register");
            var pData = new AccountData();
            pData.Email = registerData["email"];
            pData.Login = registerData["login"];
            var passAndSalt = PasswordHasher.CreatePasswordHash(registerData["password"]);
            pData.Password = passAndSalt.Item1;
            pData.Salt = passAndSalt.Item2;
            try
            {
                await accountsCol!.InsertOneAsync(pData);
            }
            catch (MongoWriteException e)
            {
                Alt.Log(e.ToString());
                if (e.WriteError.Code == 11000)
                {
                    player.Emit("onRegistrationFailed", 0, "Player with such email or login already exists!");
                }
                else
                {
                    player.Emit("onRegistrationFailed", 1, e.Message);
                }
                return;
            }
            Alt.Log("reg is completed");
            player.Emit("onRegistrationSuccess");
        }

        [ServerEvent]
        public static void OnStartupDone()
        {
            accountsCol = Context.MongoDB.GetCollection<AccountData>("accounts");
        }
    }
}