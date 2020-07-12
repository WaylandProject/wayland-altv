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

import { Vector3 } from 'alt-client';
import * as alt from 'alt-client';
import * as native from 'natives';


export class Camera {
	private _cam: number
	private _target: number = 0
	private _cameraHeight: number
	private _screenWidth: number
	//private _screenHeight: number
	private _interval: number | undefined
	private _playerControlFunction: () => void
    private _noWASD: boolean = false
    private _rotation: Vector3
    private _position: Vector3
    private _setHDAreaAndFocus: boolean = true;

    constructor(pos: Vector3, fov: number, rot: Vector3 = {x: 0, y: 0, z:0}, setHDAreaAndFocus: boolean = true) {
        const args = native.getActiveScreenResolution(0, 0);

        this._setHDAreaAndFocus = setHDAreaAndFocus;
        if (this._setHDAreaAndFocus) {
            native.setFocusPosAndVel(pos.x, pos.y, pos.z, 0.0, 0.0, 0.0)
            native.setHdArea(pos.x, pos.y, pos.z, 30.0);
        }
        this._cam = native.createCamWithParams(
            'DEFAULT_SCRIPTED_CAMERA',
            pos.x,
            pos.y,
            pos.z,
            rot.x,
            rot.y,
            rot.z,
            fov,
            true,
            0
        );

        this._cameraHeight = 0;
        this._screenWidth = args[1];
		//this._screenHeight = args[2];
        this._playerControlFunction = () => {}
        this._rotation = rot
        this._position = pos
    }

    fov(value: number) {
        native.setCamFov(this._cam, value);
        native.setCamActive(this._cam, true);
        native.renderScriptCams(true, false, 0, true, false, undefined);
    }

    pointAtBone(entity: number, bone: number, offset: Vector3) {
        native.pointCamAtPedBone(
            this._cam,
            entity,
            bone,
            offset.x,
            offset.y,
            offset.z,
            false
        );
        native.setCamActive(this._cam, true);
        native.renderScriptCams(true, false, 0, true, false, undefined);
    }

    pointAtEntity(entity: number, bone: number, offset: Vector3) {
        native.pointCamAtEntity(this._cam, entity, offset.x, offset.y, offset.z, false);
        native.setCamActive(this._cam, true);
        native.renderScriptCams(true, false, 0, true, false, undefined);
    }

    pointAtCoord(pos: Vector3) {
        native.pointCamAtCoord(this._cam, pos.x, pos.y, pos.z);
        native.setCamActive(this._cam, true);
        native.renderScriptCams(true, false, 0, true, false, undefined);
    }

    setPosition(pos: Vector3) {
        this._position = pos;
        if (this._setHDAreaAndFocus) {
            native.setFocusPosAndVel(pos.x, pos.y, pos.z, 0.0, 0.0, 0.0)
            native.setHdArea(pos.x, pos.y, pos.z, 30.0);
        }
        native.setCamCoord(this._cam, pos.x, pos.y, pos.z);
        native.setCamActive(this._cam, true);
        native.renderScriptCams(true, false, 0, true, false, undefined);
    }

    setRotation(pitch: number, roll: number, yaw: number) {
        native.setCamRot(this._cam, pitch, roll, yaw, 0);
        native.setCamActive(this._cam, true);
        native.renderScriptCams(true, false, 0, true, false, undefined);
    }

    unrender() {
        if (this._setHDAreaAndFocus) {
            native.clearFocus();
            native.clearHdArea();
        }
        native.renderScriptCams(false, false, 0, false, false, undefined);
    }

    render() {
        if (this._setHDAreaAndFocus) {
            native.setFocusPosAndVel(this._position.x, this._position.y, this._position.z, 0.0, 0.0, 0.0)
            native.setHdArea(this._position.x, this._position.y, this._position.z, 30.0);
        }
        native.setCamActive(this._cam, true);
        native.renderScriptCams(true, false, 0, true, false, undefined);
    }

    destroy() {
        if (this._setHDAreaAndFocus) {
            native.clearFocus();
            native.clearHdArea();
        }
        native.destroyAllCams(true);
        native.renderScriptCams(false, false, 0, false, false, undefined);

        if (this._interval !== undefined) {
            alt.clearInterval(this._interval);
            this._interval = undefined;
        }
    }

    playerControlsEntity(ent: number, noWASD = false) {
        this._target = ent;
        this._noWASD = noWASD;

        if (this._interval !== undefined) {
            alt.clearInterval(this._interval);
            this._interval = undefined;
        }

        this._playerControlFunction = this.playerControls.bind(this);
        this._interval = alt.setInterval(this._playerControlFunction, 5);
        alt.log(`camera.ts ${this._interval}`);
    }

    // Call in update function.
    playerControls() {
        native.disableAllControlActions(0);
        native.disableAllControlActions(1);
        let mX = alt.getCursorPos().x;
        let fov = native.getCamFov(this._cam);
        let coord = native.getCamCoord(this._cam);

        // Scroll to zoom in.
        if (native.isDisabledControlPressed(0, 14)) {
            if (mX < this._screenWidth / 4) return;
            fov += 3;
            if (fov >= 100) fov = 100;
            this.fov(fov);
        }

        // Scroll to zoom out
        if (native.isDisabledControlPressed(0, 15)) {
            if (mX < this._screenWidth / 4) return;

            fov -= 3;
            if (fov <= 20) fov = 20;
            this.fov(fov);
        }

        // Right-Click
        if (native.isDisabledControlPressed(0, 25)) {
            let heading = native.getEntityHeading(this._target);

            if (mX < this._screenWidth / 2) {
                native.setEntityHeading(this._target, heading - 1.5);
            } else {
                native.setEntityHeading(this._target, heading + 1.5);
            }
        }

        // W
        if (native.isDisabledControlPressed(0, 32) && !this._noWASD) {
            this._cameraHeight += 0.01;
            if (this._cameraHeight > 2) {
                this.setPosition(coord);
            } else {
				coord.z += 0.01
                this.setPosition(coord);
            }
        }

        if (native.isDisabledControlPressed(0, 33) && !this._noWASD) {
            this._cameraHeight -= 0.01;
            if (this._cameraHeight < -0.5) {
                this.setPosition(coord);
            } else {
				coord.z -= 0.01
                this.setPosition(coord);
            }
        }
    }

    get direction()
    {
        let z = this._rotation.z * 0.0174532924;
        let x = this._rotation.x * 0.0174532924;
        
        let num = Math.abs(Math.cos(x));
        
        return new Vector3((-Math.sin(z)) * num, Math.cos(z) * num, Math.sin(x));
    }

    get position() {
        return this._position;
    }

    get rotation() {
        return this._rotation;
    }
}