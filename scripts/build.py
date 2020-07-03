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
import subprocess
import shutil
import sys
import signal
import shlex
from _exec import exec

def build_server():
    cp_cmd = "cp -r"
    if platform.system() == "Windows":
        cp_cmd = "copy"
    os.chdir("../server")
    exec("dotnet restore", True)
    exec("dotnet build", True)
    shutil.copytree("./compiled/netcoreapp3.1", "../mp/resources/wrp-server",
                    dirs_exist_ok=True)
    shutil.copy("./Config/client_resource.cfg",
                "../mp/resources/wrp/resource.cfg")
    shutil.copy("./Config/server_resource.cfg",
                "../mp/resources/wrp-server/resource.cfg")
    shutil.copy("./Config/server.cfg", "../mp/server.cfg")
    if not os.path.exists("../mp/s_config.toml"):
        shutil.copy("./Config/s_config.sample.toml", "../mp/s_config.toml")
    print("Server was successfully built!")

def build_client():
    os.chdir("../client")
    exec("tsc", True)
    shutil.copytree("./build", "../mp/resources/wrp/client", dirs_exist_ok=True)
    print("Client was successfully built!")

def build_ui():
    os.chdir("../client/ui")
    exec("ng build", True)
    shutil.copytree("./ui/dist", "../mp/resources/wrp/ui",
                    dirs_exist_ok=True)
    print("UI was successfully built!")

def clean_server():
    shutil.rmtree("../mp/resources", ignore_errors=True)
    shutil.rmtree("../client/ui/dist", ignore_errors=True)
    shutil.rmtree("../client/build", ignore_errors=True)
    print("Server was successfully cleaned!")

def start_server():
    os.chdir("../mp")
    exec_name = "altv-server"
    if platform.system() == "Windows":
        exec_name + ".exe"
    exec(f"{exec_name}", True)

def start_ui_dev():
    os.chdir("../client/ui")
    exec("ng serve", True)

try:
    operation = sys.argv[1]
except IndexError:
    clean_server()
    build_client()
    build_ui()
    build_server()
    sys.exit(0)

if operation == "server":
    build_server()
elif operation == "client":
    build_client()
elif operation == "clean":
    clean_server()
elif operation == "start":
    start_server()
elif operation == "ui_dev":
    start_ui_dev()
elif operation == "ui_dev":
    build_ui()
else:
    print("Unknown operation! Available only following operations: server, client, clean, ui_dev or start (or just empty - rebuild whole server and client).")
