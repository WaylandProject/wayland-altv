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

#nullable disable

using System.Threading.Tasks;
using AltV.Net;
using MongoDB.Driver;
using Wayland.Models;
using Wayland.SDK;

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
            initCollections();
            Alt.Emit("OnStartupDone");
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

        private static async void initCollections()
        {
            var col = MongoDB.GetCollection<AccountData>("accounts");
            var t1 = createUniqueIndex<AccountData>(col, "Email");
            var t2 = createUniqueIndex<AccountData>(col, "Login");
            await Task.WhenAll(t1, t2);
        }

        private static Task createUniqueIndex<T>(IMongoCollection<T> col, string field)
        {
            var options = new CreateIndexOptions
            {
                Unique = true
            };
            var indexKey = Builders<T>.IndexKeys.Ascending(field);
            var indexModel = new CreateIndexModel<T>(indexKey, options);
            return col.Indexes.CreateOneAsync(indexModel);
        }
    }
}