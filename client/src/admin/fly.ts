import * as alt from 'alt-client';
import * as native from 'natives';

let freecam = {
    active: false,
    camera: -1,
    interval: -1,
    webView: new alt.WebView("http://resources/wrp/client/other/freecam_ui/index.html"),
    actions: {
        moveF: false,
        moveB: false,
        moveL: false,
        moveR: false,
        moveU: false,
        moveD: false,
        rotU: false,
        rotD: false,
        rotL: false,
        rotR: false
    },
    speed: {
        move: 4.00,
        turn: 1.50
    },
    start: function () {
        if (freecam.active)
            return;

        freecam.active = true;

        let entityHeight = native.getEntityHeight(alt.Player.local.scriptID, alt.Player.local.pos.x, alt.Player.local.pos.y, alt.Player.local.pos.z, true, false);
        let posPlayer = new alt.Vector3(alt.Player.local.pos.x, alt.Player.local.pos.y, alt.Player.local.pos.z + entityHeight);
        let rotPlayer = native.getEntityRotation(alt.Player.local.scriptID, 2);
        rotPlayer = new alt.Vector3(0, 0, rotPlayer.z);

        freecam.camera = native.createCamWithParams("DEFAULT_SCRIPTED_CAMERA", posPlayer.x, posPlayer.y, posPlayer.z, rotPlayer.x, rotPlayer.y, rotPlayer.z, 60, true, 2);
        native.setCamActive(freecam.camera, true);
        native.renderScriptCams(true, false, 0, false, false, false);

        freecam.webView.emit('Position:SetX', posPlayer.x);
        freecam.webView.emit('Position:SetY', posPlayer.y);
        freecam.webView.emit('Position:SetZ', posPlayer.z);
        
        freecam.webView.emit('Rotation:SetZ', rotPlayer.z);

        alt.toggleGameControls(false);
        native.setPlayerInvincible(alt.Player.local.scriptID, true);

        // show webView
        freecam.webView.isVisible = true;
        freecam.webView.focus();

        // show cursor
        alt.showCursor(true);

        freecam.interval = alt.setInterval(function () {
            executeActions();
        }, 10)
    },
    stop: function () {
        if (!freecam.active)
            return;
        
        const camPos = native.getCamCoord(freecam.camera);
        native.setEntityCoordsNoOffset(alt.Player.local.scriptID, camPos.x, camPos.y, camPos.z, false, false, false);
        native.setEntityInvincible(alt.Player.local.scriptID, false);
        native.setEntityVisible(alt.Player.local.scriptID, true, false);

        native.renderScriptCams(false, false, 0, true, false, false);
        native.destroyCam(freecam.camera, true);
        native.setFollowPedCamViewMode(1);
        native.clearFocus();

        alt.clearInterval(freecam.interval);
        freecam.interval = -1;
        freecam.active = false;

        alt.toggleGameControls(true);
        native.setPlayerInvincible(alt.Player.local.scriptID, false);

        // hide webView
        freecam.webView.isVisible = false;
        freecam.webView.unfocus();

        // show cursor
        alt.showCursor(false);
        native.clearFocus();
        native.clearHdArea();
    }
}

alt.setTimeout(() => {
    freecam.webView.isVisible = false;
}, 500);

function executeActions() {
    let camPos = native.getCamCoord(freecam.camera);
    let camRot = native.getCamRot(freecam.camera, 2);

    let newCamPos = { x: camPos.x, y: camPos.y, z: camPos.z };
    let newCamRot = { x: camRot.x, y: camRot.y, z: camRot.z };

    let updatePos = false;
    let updateRot = false;

    if (freecam.actions.moveF) {
        let camDir = calcCameraDirectionForward(camRot);

        newCamPos.x = camPos.x + (camDir.x * freecam.speed.move);
        newCamPos.y = camPos.y + (camDir.y * freecam.speed.move);
        newCamPos.z = camPos.z + (camDir.z * freecam.speed.move);
        updatePos = true;
    }

    if (freecam.actions.moveB) {
        let camDir = calcCameraDirectionForward(camRot);

        newCamPos.x = camPos.x - (camDir.x * freecam.speed.move);
        newCamPos.y = camPos.y - (camDir.y * freecam.speed.move);
        newCamPos.z = camPos.z - (camDir.z * freecam.speed.move);
        updatePos = true;
    }

    if (freecam.actions.moveR) {
        let camDir = calcCameraDirectionRight(camRot);

        newCamPos.x = camPos.x + (camDir.x * freecam.speed.move);
        newCamPos.y = camPos.y + (camDir.y * freecam.speed.move);
        newCamPos.z = camPos.z;
        updatePos = true;
    }

    if (freecam.actions.moveL) {
        let camDir = calcCameraDirectionRight(camRot);

        newCamPos.x = camPos.x - (camDir.x * freecam.speed.move);
        newCamPos.y = camPos.y - (camDir.y * freecam.speed.move);
        newCamPos.z = camPos.z;
        updatePos = true;
    }

    if (freecam.actions.moveU) {
        newCamPos.z = (camPos.z * 1) + (freecam.speed.move);
        updatePos = true;
    }

    if (freecam.actions.moveD) {
        newCamPos.z = (camPos.z * 1) - (freecam.speed.move);
        updatePos = true;
    }

    if (freecam.actions.rotR) {
        newCamRot.z = (camRot.z * 1) - (freecam.speed.turn);
        updateRot = true;
    }

    if (freecam.actions.rotL) {
        newCamRot.z = (camRot.z * 1) + (freecam.speed.turn);
        updateRot = true;
    }

    if (freecam.actions.rotU) {
        newCamRot.x = (camRot.x * 1) + (freecam.speed.turn);
        updateRot = true;
    }

    if (freecam.actions.rotD) {
        newCamRot.x = (camRot.x * 1) - (freecam.speed.turn);
        updateRot = true;
    }

    if (updatePos) {
        native.setCamCoord(
            freecam.camera,
            newCamPos.x,
            newCamPos.y,
            newCamPos.z
        );

        freecam.webView.emit('Position:SetX', newCamPos.x);
        freecam.webView.emit('Position:SetY', newCamPos.y);
        freecam.webView.emit('Position:SetZ', newCamPos.z);
    }

    if (updateRot) {
        native.setCamRot(
            freecam.camera,
            newCamRot.x,
            0,
            newCamRot.z,
            2
        );

        freecam.webView.emit('Rotation:SetX', newCamRot.x);
        freecam.webView.emit('Rotation:SetZ', newCamRot.z);
    }

    native.setFocusPosAndVel(newCamPos.x, newCamPos.y, newCamPos.z, 0.0, 0.0, 0.0)
    native.setHdArea(newCamPos.x, newCamPos.y, newCamPos.z, 30.0);
}


freecam.webView.on("Speed:DecreaseMoveSpeed", function () {
    freecam.speed.move = Math.round((freecam.speed.move * 100) - 10) / 100;
    freecam.webView.emit('Speed:MoveSpeed', freecam.speed.move);
});

freecam.webView.on("Speed:IncreaseMoveSpeed", function () {
    freecam.speed.move = Math.round((freecam.speed.move * 100) + 10) / 100;
    freecam.webView.emit('Speed:MoveSpeed', freecam.speed.move);
});

freecam.webView.on("Speed:DecreaseTurnSpeed", function () {
    freecam.speed.turn = Math.round((freecam.speed.turn * 100) - 10) / 100;
    freecam.webView.emit('Speed:TurnSpeed', freecam.speed.turn);
});

freecam.webView.on("Speed:IncreaseTurnSpeed", function () {
    freecam.speed.turn = Math.round((freecam.speed.turn * 100) + 10) / 100;
    freecam.webView.emit('Speed:TurnSpeed', freecam.speed.turn);
});



alt.on('keydown', (key) => {
    if (key == 118) {
        if (freecam.active) {
            freecam.stop();
        }
        else {
            freecam.start();
        }
    }

    if (key == 87) {
        freecam.actions.moveF = true;
    }

    if (key == 65) {
        freecam.actions.moveL = true;
    }

    if (key == 68) {
        freecam.actions.moveR = true;
    }

    if (key == 83) {
        freecam.actions.moveB = true;
    }

    if (key == 32) {
        freecam.actions.moveU = true;
    }

    if (key == 16) {
        freecam.actions.moveD = true;
    }

    if (key == 38) {
        freecam.actions.rotU = true;
    }

    if (key == 40) {
        freecam.actions.rotD = true;
    }

    if (key == 37) {
        freecam.actions.rotL = true;
    }

    if (key == 39) {
        freecam.actions.rotR = true;
    }
});



alt.on('keyup', (key) => {
    if (key == 87) {
        freecam.actions.moveF = false;
    }

    if (key == 65) {
        freecam.actions.moveL = false;
    }

    if (key == 68) {
        freecam.actions.moveR = false;
    }

    if (key == 83) {
        freecam.actions.moveB = false;
    }

    if (key == 32) {
        freecam.actions.moveU = false;
    }

    if (key == 16) {
        freecam.actions.moveD = false;
    }

    if (key == 38) {
        freecam.actions.rotU = false;
    }

    if (key == 40) {
        freecam.actions.rotD = false;
    }

    if (key == 37) {
        freecam.actions.rotL = false;
    }

    if (key == 39) {
        freecam.actions.rotR = false;
    }
});

function calcCameraDirectionForward(camRot: alt.Vector3) {
    let rotInRad = {
        x: camRot.x * (Math.PI / 180),
        y: camRot.y * (Math.PI / 180),
        z: camRot.z * (Math.PI / 180) + (Math.PI / 2)
    }

    var camDir = {
        x: Math.cos(rotInRad.z),
        y: Math.sin(rotInRad.z),
        z: Math.sin(rotInRad.x)
    }

    return camDir;
}

function calcCameraDirectionRight(camRot: alt.Vector3) {
    let rotInRad = {
        x: camRot.x * (Math.PI / 180),
        y: camRot.y * (Math.PI / 180),
        z: camRot.z * (Math.PI / 180)
    }

    var camDir = {
        x: Math.cos(rotInRad.z),
        y: Math.sin(rotInRad.z),
        z: Math.sin(rotInRad.x)
    }

    return camDir;
}