"""
 Copyright (C) 2020 ChronosX88
 
 This file is part of Wayland Project Server.
 
 Wayland Project Server is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 Wayland Project Server is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Wayland Project Server.  If not, see <http://www.gnu.org/licenses/>.
"""

import os
import platform
import urllib.request
from zipfile import ZipFile 
import shutil
from _exec import exec

blobsVersion = "build-1181"
mpLinuxURL = f"https://github.com/WaylandProject/altv-blobs/releases/download/{blobsVersion}/altv-server-linux.zip"
mpWindowsURL = f"https://github.com/WaylandProject/altv-blobs/releases/download/{blobsVersion}/altv-server-windows.zip"
doneFile = ".init"

if os.path.exists(doneFile):
    exit(0)

os.mkdir("../temp")

if platform.system() == "Linux":
    urllib.request.urlretrieve(mpLinuxURL, "../temp/mp.zip")
elif platform.system() == "Windows":
    urllib.request.urlretrieve(mpWindowsURL, "../temp/mp.zip")

print('Server blobs downloaded!') 

with ZipFile("../temp/mp.zip", 'r') as zip:   
    # extracting all the files
    zip.extractall("../mp") 
    print('Server blobs extracted!') 

shutil.rmtree("../temp")
with open(".init", "w") as f:
    f.write("")
    f.close()

# Download NPM dependencies for clientside
exec("cd ../client && npm i", True)
exec("cd ../client/ui && npm i", True)