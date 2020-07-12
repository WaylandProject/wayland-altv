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

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace Wayland.SDK
{
    public class AccountData
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string ID { get; set; }
        public string Email { get; set; }
        public string Login { get; set; }
        public string HwID { get; set; }
        public byte[] Password { get; set; }
        public byte[] Salt { get; set; }
    }
}