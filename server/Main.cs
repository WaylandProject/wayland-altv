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
using Wayland.Utils;
using Wayland.Models;
using Nett;
using AltV.Net.Elements.Entities;
using AltV.Net;
using Wayland.SDK;

namespace Wayland
{
    public class Main : Resource
	{
		public void OnPlayerJoin(CustomPlayer player) {
			Alt.Emit(ServerEventsConstants.DefaultEvents.OnPlayerJoin, player);
		}

		[ClientEvent("saveCamCoords")]
		public void SaveCameraCoords(Player player, string coords, string cameraPos, string name) {
			Console.WriteLine($"Coords: {coords}\nCamera pos: ${cameraPos}\nName: ${name}");
		}

        public override void OnStart()
        {
            var config = ParseConfig("s_config.toml");
			Context.Init(config);
			Alt.Emit(ServerEventsConstants.DefaultEvents.OnServerStart);
			Alt.Log("Wayland Project server started!");
        }

		private Configuration ParseConfig(string filename) {
			return Toml.ReadFile<Configuration>(filename);
		}

        public override void OnStop()
        {
            Alt.Emit(ServerEventsConstants.DefaultEvents.OnServerStop);
        }
    }
}
