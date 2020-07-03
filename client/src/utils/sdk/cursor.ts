import * as alt from 'alt-client';

alt.log('Loaded: client->utility->cursor.js');

let cursorCount = 0;

export function showCursor(state: boolean) {
    if (state) {
        cursorCount += 1;
        alt.showCursor(true);
        return;
    }

    for (let i = 0; i < cursorCount; i++) {
        try {
            alt.showCursor(false);
        } catch (e) {}
    }

    cursorCount = 0;
}