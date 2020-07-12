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

import { ServerEventConstants } from './utils/ServerEventsConstants';
import { Utils } from './utils/Utils';
import * as alt from "alt-client";
import { Vector3 } from 'alt-client';
import { Camera } from './utils/sdk/camera';
import { WebView } from './utils/sdk/webview';

var authBrowser: WebView
var authCamera: Camera

alt.onServer(ServerEventConstants.Auth.ShowAuthScreen, () => {
    authBrowser = new WebView();
    authBrowser.open(Utils.generateUILink('login'), true)
    authBrowser.on("onEnterRegisterData", (registerData: any) => {
        alt.emitServer("onEnterRegisterData", registerData)
    });
    authCamera = new Camera(new Vector3(-68.1, 468.32, 265.27), 65, new Vector3(-18, 0, -178.5));
    authCamera.render();
})

alt.on("keyup", (key: number) => {
    switch (key) {
        case 74: {
            authBrowser.close()
            authBrowser.destroyWebView()
            authCamera.destroy()
            break
        }
    }
})

alt.on("onEnterLoginData", (loginData: any) => {
    alt.emitServer("onEnterLoginData", loginData)
})

alt.onServer('onRegistrationFailed', (errCode: number, errText: number) => {
    console.log(errCode, errText);
    authBrowser.emit('onRegistrationFailed', errCode, errText);
})

alt.onServer("onRegistrationSuccess", () => {
    alt.log("reg is success")
    authBrowser.close()
    authBrowser.destroyWebView()
    authCamera.destroy()
})