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

import subprocess
import shlex
import signal
import sys

def exec(cmd: str, log: bool = False):
    process = subprocess.Popen(shlex.split(cmd), stdout=subprocess.PIPE, shell=True)
    signal.signal(signal.SIGINT, lambda sig, frame: _stop_process(process))
    encodings = ['utf-8', 'cp866']
    while True:
        line = process.stdout.readline()
        if not line:
            break
        if log:
            for e in encodings:
                try:
                    print(line.decode("cp866"), end='')
                except UnicodeDecodeError:
                    pass
                else:
                    break

def _stop_process(process: subprocess.Popen):
    process.send_signal(signal.CTRL_C_EVENT)
    process.wait()
    sys.exit(0)