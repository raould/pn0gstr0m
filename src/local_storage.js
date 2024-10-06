/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

const LocalStorageKeys = {
    highScores: 'pn0g_level_highs', // per level.
    gameMode: 'pn0g_game_mode',
    sfxMuted: 'pn0g_sfx_muted',
    musicMuted: 'pn0g_music_muted',
    unplayed: 'pn0g_unplayed',
};

const gLocalStorageCache = {};

function LoadLocalStorageCache() {
    Object.values(LocalStorageKeys).forEach(key => {
        const json = localStorage.getItem(key);
        if (exists(json)) {
            gLocalStorageCache[key] = JSON.parse(json);
        }
        else {
            delete gLocalStorageCache[key];
        }
    });
    console.log("LoadLocalStorageCache", gLocalStorageCache);
}

LoadLocalStorageCache();

// ----------------------------------------

// primitives work ok for === but not arrays or objects,
// those would need a deep equals which i'm loathe to import
// hence the 'forced' argument. :-(
function SaveLocal(key, value, forced=false) {
    var v0 = gLocalStorageCache[key];
    if (v0 !== value || forced) {
        localStorage.setItem(key, JSON.stringify(value));
        gLocalStorageCache[key] = value;
        console.log("SaveLocal", key, value);
    }
}

function LoadLocal(key, fallback) {
    var v = gLocalStorageCache[key];
    console.log("LoadLocal", key, v, fallback);
    return v ?? fallback;
}

function DeleteLocal(key) {
    localStorage.removeItem(key);
    delete gLocalStorageCache[key];
    console.log("DeleteLocal", key);
}


