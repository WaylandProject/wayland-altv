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

import { AltVEventConstants } from './utils/AltVEventsConstants';
import { Utils } from './utils/Utils';
import * as alt from "alt-client";
import { Vector3 } from 'alt-client';
import { Camera } from './utils/sdk/camera';
import { WebView } from './utils/sdk/webview';

var authBrowser: WebView
var authCamera: Camera

alt.onServer(AltVEventConstants.Auth.ShowAuthScreen, () => {
    authBrowser = new WebView();
    authBrowser.open(Utils.generateUILink('login'), true)
    authCamera = new Camera(new Vector3(788.1887817382812, 974.5294189453125, 380.5456237792969), 55, new Vector3(0,0,0));
    authCamera.pointAtCoord(new Vector3(745.0472412109375, 1190.494873046875, 324.84991455078125));
    authCamera.render();
})

alt.on("keyup", (key: number) => {
    switch(key) {
        case 74: {
            authBrowser.close()
            authBrowser.destroyWebView()
            authCamera.destroy()
            break
        }
    }
})