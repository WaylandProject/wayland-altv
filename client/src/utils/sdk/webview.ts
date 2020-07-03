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

import * as alt from 'alt-client';
import * as native from 'natives';
import { showCursor } from './cursor';

alt.log('Loaded: client->utility->view.js');

export let currentView: WebView | null;

alt.on('view:ForceClose', () => {
    currentView?.close();
});

alt.on('view:DestroyAll', () => {
    currentView?.destroyWebView()
});

interface Event {
    name: string
    func: (...args: any[]) => void
}

export class WebView {
    private _view: alt.WebView | null = null
    private _events: Event[] = []
    private _gameControls: (() => void) | null = null
    private _interval: number | null = null;
    
    public ready: boolean = false
   

    constructor() {
        if (alt.Player.local.getMeta('chat')) return; // TODO need to integrate chat
        if (currentView === undefined) {
            currentView = this;
        }
    }

    open(url: string, killControls = true) {
        if (!this._view) {
            this._view = new alt.WebView(url);
            this._events = [];
        } else {
            showCursor(false);
        }

        showCursor(true);
        alt.Player.local.setMeta('viewOpen', true);
        alt.emit('chat:Toggle'); // TODO need to integrate chat

        this.on('close', this.close);
        this._view.url = url;
        this._view.isVisible = true;
        this._view.focus();
        this.ready = true;
        native.displayRadar(false);
        if (killControls) {
            this._gameControls = this.toggleGameControls.bind(this);
            this._interval = alt.setInterval(this._gameControls!, 0);
        }
    }

    // Close view and hide.
    close() {
        this.ready = false;

        this._events.forEach(event => {
            this._view!.off(event.name, event.func);
        });

        this._view!.off('close', this.close);
        //this._view!.url = 'http://resource/client/html/empty/index.html';
        this._view!.unfocus();
        this._events = [];

        for (let i = 0; i < 5; i++) {
            native.triggerScreenblurFadeOut(0);
        }

        showCursor(false);
        native.displayRadar(true);
        alt.Player.local.setMeta('viewOpen', false);
        alt.emit('chat:Toggle'); // TODO need to integrate chat
        if (this._interval !== null) {
            alt.clearInterval(this._interval);
            this._interval = null;
        }
    }

    // Bind on events, but don't turn off.
    on(name: string, func: (...args: any[]) => void) {
        if (this._view === undefined) return;
        if (this._events.find(event => event.name === name)) return;
        const event = {
            name,
            func
        };
        this._events.push(event);
        this._view!.on(name, func);
    }

    emit(name: string, ...args: any[]) {
        if (!this._view) return;
        this._view.emit(name, ...args);
    }

    toggleGameControls() {
        native.disableAllControlActions(0);
        native.disableAllControlActions(1);
    }

    destroyWebView() {
        this._view?.destroy()
    }
}