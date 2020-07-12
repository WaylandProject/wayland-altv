import * as alt from "alt-client";
import * as native from "natives";

alt.onServer("player:onSpawn", () => {
    native.clearPedBloodDamage(alt.Player.local.scriptID)
})