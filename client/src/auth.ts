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
import * as native from "natives";
import { Vector3 } from 'alt-client';
import { Camera } from './utils/sdk/camera';
import { WebView } from './utils/sdk/webview';

var authBrowser: WebView
var authCamera: Camera

alt.onServer(ServerEventConstants.Auth.ShowAuthScreen, () => {
    authBrowser = new WebView();
    authBrowser.open(Utils.generateUILink('login'), true)
    authBrowser.on("onEnterRegisterData", (registerData: any) => {
        alt.emitServer("auth:enterRegisterData", registerData)
    })
    authBrowser.on("auth:enterLoginData", (loginData: any) => {
        alt.emitServer("auth:enterLoginData", loginData)
    })
    authCamera = new Camera(new Vector3(-68.1, 468.32, 265.27), 65, new Vector3(-18, 0, -178.5), true);
    authCamera.render();
})

alt.on("keyup", (key: number) => {
    switch (key) {
        case 74: {
            authBrowser.close()
            authBrowser.destroyWebView()
            native.displayRadar(false);
            //authCamera.destroy()
            break
        }
    }
})

alt.onServer('auth:registerFailed', (errCode: number, errText: number) => {
    alt.logError(errCode, errText);
    authBrowser.emit('onRegistrationFailed', errCode, errText);
})

alt.onServer("auth:registerSuccess", () => {
    authBrowser.close()
    authBrowser.destroyWebView()
    authCamera.destroy()
})

alt.onServer("auth:loginSuccess", () => {
    authBrowser.close()
    authBrowser.destroyWebView()
    authCamera.destroy()
})

alt.onServer("auth:loginFailed", (errText: string) => {
    alt.logError(errText);
})