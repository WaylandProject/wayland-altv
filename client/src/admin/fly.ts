import * as alt from 'alt-client';
import * as native from 'natives';
import { Camera } from '../utils/sdk/camera';
import { Vector3 } from 'alt-client';

let speedMultiplier = 10;
let isEnable = false;

let cam: Camera | undefined = undefined;

alt.log("Start module Fly Camera");

alt.on("keyup", keyUp);
alt.everyTick(update);

alt.onServer("flycam:speed", setSpeed);

function setSpeed(speed: number) {
    speedMultiplier = speed;
}

function keyUp(key: number) {
    switch (key) {
        case 116:
            {
                toogleCamera();
                break;
            }
    }
}

function toogleCamera() {
    if (!isEnable) {
        enabledCamera();
    }
    else {
        disabledCamera();
    }
}

function enabledCamera() {
    isEnable = true;

    alt.log('enable freecam');

    let entityHeight = native.getEntityHeight(alt.Player.local.scriptID, alt.Player.local.pos.x, alt.Player.local.pos.y, alt.Player.local.pos.z, true, false);

    let posPlayer: Vector3 = new Vector3(alt.Player.local.pos.x, alt.Player.local.pos.y, alt.Player.local.pos.z + entityHeight);

    let rotPlayer = native.getEntityRotation(alt.Player.local.scriptID, 2);

    rotPlayer = new Vector3(rotPlayer.x, 0, 0);

    native.setEntityInvincible(alt.Player.local.scriptID, true);
    //native.setEntityAlpha(alt.Player.local.scriptID, 0, 0);
    native.setEntityVisible(alt.Player.local.scriptID, false, false);
    cam = new Camera(posPlayer, 55, rotPlayer);
    cam.render();
}

function disabledCamera() {
    isEnable = false;

    native.setEntityCoordsNoOffset(alt.Player.local.scriptID, cam!.position.x, cam!.position.y, cam!.position.z, false, false, false);
    native.setEntityInvincible(alt.Player.local.scriptID, false);
    //native.setEntityAlpha(alt.Player.local.scriptID, 255, 1);
    native.setEntityVisible(alt.Player.local.scriptID, true, false);

    cam?.unrender();
    // @ts-ignore
    cam = undefined;
    alt.log('disable freecam');
}

function update() {
    if (isEnable) {
        disableControll();

        let dir = cam!.direction;

        if (native.isControlPressed(0, 32)) {
            cam?.setPosition(new Vector3(
                cam.position.x + (dir.x * speedMultiplier),
                cam.position.y + (dir.y * speedMultiplier),
                cam.position.z + (dir.z * speedMultiplier)));
        }

        if (native.isControlPressed(0, 33)) {
            cam?.setPosition(new Vector3(
                cam.position.x - (dir.x * speedMultiplier),
                cam.position.y - (dir.y * speedMultiplier),
                cam.position.z - (dir.z * speedMultiplier)));
        }


        if (native.isControlPressed(0, 34)) {
            cam?.setPosition(new Vector3(
                cam.position.x + (-dir.y * speedMultiplier),
                cam.position.y + (dir.x * speedMultiplier),
                cam.position.z));
        }

        if (native.isControlPressed(0, 35)) {
            cam?.setPosition(new Vector3(
                cam.position.x - (-dir.y * speedMultiplier),
                cam.position.y - (dir.x * speedMultiplier),
                cam.position.z));
        }

        //RotationCamera
        const xMagnitude = native.getDisabledControlNormal(0, 290);
        const yMagnitude = native.getDisabledControlNormal(0, 291);

        cam?.rotate(cam.rotation.x - yMagnitude * 20, cam.rotation.y, cam.rotation.z - xMagnitude * 20);
        native.setEntityCoordsNoOffset(alt.Player.local.scriptID, cam!.position.x, cam!.position.y, cam!.position.z, false, false, false);
    }
}

function disableControll() {
    native.disableControlAction(0, 30, true);
    native.disableControlAction(0, 31, true);
    native.disableControlAction(0, 290, true);
    native.disableControlAction(0, 291, true);
    native.disableControlAction(0, 25, true);
    native.disableControlAction(0, 106, true);

    native.disableControlAction(0, 24, true);
    native.disableControlAction(0, 140, true);
    native.disableControlAction(0, 141, true);
    native.disableControlAction(0, 142, true);
    native.disableControlAction(0, 257, true);
    native.disableControlAction(0, 263, true);
    native.disableControlAction(0, 264, true);

    native.disableControlAction(0, 12, true);
    native.disableControlAction(0, 14, true);
    native.disableControlAction(0, 15, true);
    native.disableControlAction(0, 16, true);
    native.disableControlAction(0, 17, true);
}