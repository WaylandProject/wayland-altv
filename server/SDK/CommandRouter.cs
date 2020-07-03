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

using System.Reflection;
using System.Collections.Generic;
using System.Linq;
using System;
using AltV.Net;
using AltV.Net.Elements.Entities;

namespace Wayland.SDK
{
    public class CommandRouter
    {
        private IDictionary<string, CommandHandler> commands = new Dictionary<string, CommandHandler>();

        public CommandRouter()
        {
            var scripts = Assembly.GetExecutingAssembly().GetTypes()
                        .Where(t => t.GetInterfaces().Contains(typeof(IScript)))
                        .ToArray();
            foreach (var t in scripts)
            {
                var cmdHandlers = t.GetMethods()
                    .Where(m => m.GetCustomAttributes(typeof(CommandAttribute), false).Length > 0 && m.IsStatic)
                    .ToArray();
                foreach (var h in cmdHandlers)
                {
                    var cmdAttr = (CommandAttribute) h.GetCustomAttributes(typeof(CommandAttribute), false).First();
                    var cmdHandler = new CommandHandler();
                    cmdHandler.MethodInfo = h;
                    cmdHandler.CommandHelpText = cmdAttr.CommandHelpText;
                    commands.Add(cmdAttr.CommandName, cmdHandler);
                }
            }
        }

        /// <summary>
        /// Handles command call from clientside
        /// </summary>
        /// <param name="cmdName">Name of command which currently called</param>
        /// <param name="args">Arguments provided for command</param>
        /// <exception cref="KeyNotFoundException">Command not found</exception>
        public void HandleCommand(IPlayer player, string cmdName, object[] args)
        {
            CommandHandler cmdHandler;
            try {
                cmdHandler = commands[cmdName];
            } catch {
                player.Emit("OnPlayerCommandFailed", "Command not found");
                return;
            }
            var methodParams = cmdHandler.MethodInfo.GetParameters();
            if (args.Length != methodParams.Length)
            {
                onPlayerEnteredInvalidCommand(player, cmdName, methodParams, cmdHandler);
                return;
            }
            for (int i = 0; i < methodParams.Length; i++)
            {
                var arg = args[i];
                if (methodParams[i].ParameterType != arg.GetType()) {
                    onPlayerEnteredInvalidCommand(player, cmdName, methodParams, cmdHandler);
                    return;
                }
            }
            
            cmdHandler.MethodInfo.Invoke(null, args);
        }

        private void onPlayerEnteredInvalidCommand(IPlayer player, string cmdName, ParameterInfo[] parameters, CommandHandler cmdHandler)
        {
            var cmdHelpTxt = "";
            if (cmdHandler.CommandHelpText != "")
            {
                cmdHelpTxt = cmdHandler.CommandHelpText;
            }
            else
            {
                cmdHelpTxt = $"Usage: /{cmdName} ";
                for (int i = 0; i < parameters.Length; i++)
                {
                    cmdHelpTxt += $"[{parameters[i].Name}] ";
                }
            }
            player.Emit("OnPlayerCommandFailed", cmdHelpTxt);
        }
    }

    public class CommandHandler
    {
        public MethodInfo MethodInfo { get; set; }
        public string CommandHelpText { get; set; }
    }
}