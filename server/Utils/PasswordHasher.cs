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
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;

namespace Wayland.Utils
{
    public static class PasswordHasher
    {
        // First item is password hash, and second item is a salt
        public static Tuple<byte[], byte[]> CreatePasswordHash(string password)
        {
            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password));

            var salt = createSalt();
            argon2.Salt = salt;
            argon2.DegreeOfParallelism = 8; // four cores
            argon2.Iterations = 4;
            argon2.MemorySize = 1024 * 1024; // 1 GB

            return new Tuple<byte[], byte[]>(argon2.GetBytes(32), salt);
        }

        private static byte[] _createPasswordHashWithCustomSalt(string password, byte[] salt)
        {
            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password));

            argon2.Salt = salt;
            argon2.DegreeOfParallelism = 8; // four cores
            argon2.Iterations = 4;
            argon2.MemorySize = 1024 * 1024; // 1 GB

            return argon2.GetBytes(32);
        }

        private static byte[] createSalt()
        {
            var buffer = new byte[16];
            var rng = new RNGCryptoServiceProvider();
            rng.GetBytes(buffer);
            return buffer;
        }

        public static bool VerifyHash(string password, byte[] salt, byte[] hash)
        {
            var newHash = _createPasswordHashWithCustomSalt(password, salt);
            return hash.SequenceEqual(newHash);
        }
    }
}