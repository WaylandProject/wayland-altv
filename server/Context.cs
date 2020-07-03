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

using MongoDB.Driver;
using Wayland.Models;

namespace Wayland
{
    // Context is a static class which holds all global objects for using in other classes
    public static class Context
    {
        public static Configuration Config;
        public static IMongoDatabase MongoDB { get; private set; }

        public static void Init(Configuration config)
        {
            Config = config;
            MongoDB = initMongoClient(config);
        }

        private static IMongoDatabase initMongoClient(Configuration config)
        {
            MongoClient client;
            if (config.MongoDB.User == "" && config.MongoDB.Password == "")
            {
                client = new MongoClient($"mongodb://{config.MongoDB.Host}:{config.MongoDB.Port}");
            }
            else
            {
                client = new MongoClient($"mongodb://{config.MongoDB.User}:{config.MongoDB.Password}@{config.MongoDB.Host}:{config.MongoDB.Port}");
            }
            
            var db = client.GetDatabase($"{config.MongoDB.DatabaseName}");
            return db;
        }
    }
}