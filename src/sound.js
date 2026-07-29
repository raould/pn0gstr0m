/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

const kMusicVolume = 0.7;

// this object contains multiple mappings.
// 0-bsed index to name.
// name to meta.
// actively playing sound id to name.
const gAudio = {
    names: [],
    name2meta: {},
    id2name: {},
    musicTimer: undefined,
};

let gMusicID;

/* muting implementation is... tricky? i am 
 * using gStateMuted to prevent the attract
 * mode from playing game blip and explosion sfx,
 * but we still want the music to play.
 */
let gStateMuted = false;
let gMusicMuted = LoadLocal(LocalStorageKeys.musicMuted, false);
let gSfxMuted = LoadLocal(LocalStorageKeys.sfxMuted, false);
function SetMusicMuted(muted) {
    gMusicMuted = muted;
    SaveLocal(LocalStorageKeys.musicMuted, gMusicMuted);
}
function SetSfxMuted(muted) {
    gSfxMuted = muted;
    SaveLocal(LocalStorageKeys.sfxMuted, gSfxMuted);
}

function RegisterMusic(name, basename, props) {
    RegisterSound(name, basename, props, true);
}

function RegisterSfx(name, basename, props) {
    RegisterSound(name, basename, props, false);
}

function RegisterSound(name, basename, props, isMusic) {
    if (!isU(gAudio.name2meta[name])) {
	console.log("RegisterSound: duplicate request", name, basename);
    }
    else {
	console.log("RegisterSound", name, basename);
        var files = ["ogg", "aac", "mp3"].map((e) => `sounds/${basename}.${e}`);
        var howl = new Howl({ // there is no good answer to browser audio at all.
            ...props,
            src: files,
            onload: () => {
		const meta = gAudio.name2meta[name];
                meta.loaded = true;
		console.log("onload", gAudio.name2meta[name]);
                LoadNextSound();
            },
            onloaderror: () => {
                // well, poop.
                console.error("onloaderror", name);
		const meta = gAudio.name2meta[name];
		if (exists(meta)) { meta.loaded = "error"; }
		console.log("onloaderror", gAudio.name2meta[name]);
                LoadNextSound();
            },
            html5: false, // this is a never-win parameter.
            preload: false,
            // only 1 concurrent playback per name.
            onend: () => OnSfxStop(name),
        });
        Assert(!gAudio.names.includes(name), `RegisterSound ${name}`);
        gAudio.names.push(name);
        gAudio.name2meta[name] = /*meta*/ {
            ...gAudio[name],
            basename,
            howl,
            isMusic,
            last: 0,
            loaded: false,
        };
    }
}

function LoadNextSound() {
    // cute for debugging.
    // var report = gAudio.names.map((n) => {
    //     return String(gAudio.name2meta[n].loaded);
    // }).join(',');
    // console.log(report);

    const delay = gDebug ? 500 : 1; // hack to support testing.
    setTimeout(() => {
	var next = Object.values(gAudio.name2meta).find(m => m.loaded === false); // not 'error'.
	if (exists(next)) {
            next.howl.load();
	}
    }, delay);
}

function OnSfxStop(name) {
    var meta = gAudio.name2meta[name];
    if (exists(meta)) {
        delete meta.id;
        // if a piece of music just ended, kick off the next one.
        !!meta.isMusic && BeginMusic();
    }
}

function IsMusicReady() {
    const music = Object.values(gAudio.name2meta).filter(v => v.isMusic);
    const loading = music.filter(m => m.loaded === false); // not 'error'.
    return loading.length === 0;
}

function BeginMusic() {
    StopMusic();
    gAudio.musicTimer = setTimeout(() => {
	console.log("BeginMusic: polling");
	gAudio.musicTimer = undefined;
	if (IsMusicReady()) {
	    BeginMusicPlaying();
	}
	else {
	    BeginMusic();
	}
    }, 1000);
    console.log("BeginMusic, timer", gAudio.musicTimer);
}

function BeginMusicPlaying() {
    console.log("BeginMusicPlaying");
    if (!gMusicMuted) {
	const unplayedAll = Object.entries(gAudio.name2meta).map(([key, value]) => {
	    if (value.isMusic && value.loaded === true) { // not 'error'.
		return key;
	    }
	    return undefined;
	}).filter(Boolean);

        let unplayed = LoadLocal(LocalStorageKeys.unplayed, unplayedAll);
        if (unplayed.length == 0) {
	    console.log("BeginMusicPlaying: resetting unplayed");
	    unplayed = gR.RandomizeArray(unplayedAll);
        }
        Assert(exists(unplayed), "BeginMusicPlaying: null");
        Assert(unplayed.length > 0, "BeginMusicPlaying: 0");
        const name = unplayed.shift();

        // save the now-smaller remaining-items list.
        SaveLocal(LocalStorageKeys.unplayed, unplayed, true);

        console.log("BeginMusicPlaying", name);
        gMusicID = PlayMusic(name);
    }
}

function StopMusic() {
    console.log("StopMusic, clear timer", gAudio.musicTimer);
    if (exists(gAudio.musicTimer)) {
	clearTimeout(gAudio.musicTimer);
	gAudio.musicTimer = undefined;
    }
    gMusicID = undefined;
    Object.values(gAudio.name2meta).forEach(meta => {
        if (meta?.isMusic) { // '?' shouldn't be necessary, old bug?
            meta.howl.stop();
            delete gAudio.id2name[meta.id];
            delete meta.id;
        }
    });
}

function StopSfx() {
    // they only play once so lamely don't bother.
}

function PlayMusic(name) {
    if (!gMusicMuted) {
        console.log("PlayMusic", gAudio.name2meta[name]?.basename);
        return PlaySound(name);
    }
    return undefined;
}

function PlaySfx(name, ignoreMuted=false) {
    if (!gSfxMuted || ignoreMuted) {
        return PlaySound(name);
    }
    return undefined;
}

function PlaySfxDebounced(name, debounceMsec=110) {
    let sid;
    if (!gStateMuted && !gSfxMuted) {
        const meta = gAudio.name2meta[name];
        Assert(exists(meta), name, `PlaySfxDebounced ${name}`);
        if (exists(meta)) {
            const last = meta.last || 0;
            if (Date.now()-last > debounceMsec) {
                sid = PlaySound(name);
            }
        }
    }
    return sid;
}

function PlaySound(name) {
    let sid = undefined;
    const meta = gAudio.name2meta[name];
    Assert(exists(meta), `PlaySound ${name}`);
    if (exists(meta)) {
        const howl = meta.howl;
	let play = false;
	// the web is a lie.
	if (kIsSafari && howl == undefined) {
	    play = true;
	}
	else if (exists(howl)) {
            const id = meta.id;
            if (exists(id)) {
                howl.stop();
            }
	    play = true;
	}
	if (play) {
	    meta.id = sid = howl.play();
	    meta.last = Date.now();
	    gAudio.id2name[sid] = name;
	}
    }
    return sid;
}

function MakePlayFn(count, basename, playfn) {
    Assert(count >= 0, count, `MakePlayFn ${basename}`);
    const gNames = Array(count).fill().map((e,i) => `${basename}${i+1}`);
    return (index) => { // index is unused these days, oh well.
        const name = gNames[index ?? gR.RandomRangeInt(0, count-1)];
        return playfn(name);
    };
}

// this is a mess because i've been trying to work around various
// browser differences, all to no real winning answer, so it all sucks.
const PlayStart = MakePlayFn(1, "start", PlaySfx);
const PlayGameOver = MakePlayFn(1, "gameover", PlaySfx);
const PlayChargeup = MakePlayFn(1, "chargeup", PlaySfx);
const PlayPowerupBoom = MakePlayFn(1, "powerupboom", (name) => PlaySfxDebounced(name, 250));
const PlayBlip = MakePlayFn(1, "blip", (name) => PlaySfxDebounced(name, 55));
const PlayChosen = MakePlayFn(1, "chosen", PlaySfx);
const PlayPaddleHit = MakePlayFn(2, "explosion", (name) => PlaySfxDebounced(name, 55));

function LoadAudio() {
    SaveLocal(LocalStorageKeys.unplayed, []);
    
    // these will load in order 1 by 1 via onload().

    // todo: not enough audible difference between the explosion sfx.
    RegisterSfx("explosion1", "explosionB2", { volume: 0.35 }); // puck hits paddle.
    RegisterSfx("explosion2", "explosionA2", { volume: 0.35 }); // puck hits paddle.

    RegisterSfx("blip1", "blipSelectC", { volume: 0.2 }); // puck hits wall etc.

    RegisterSfx("start1", "start");
    RegisterSfx("chargeup1", "chargeup", { volume: 0.3 });
    RegisterSfx("powerupboom1", "powerUp");
    RegisterSfx("gameover1", "gameover");
    RegisterSfx("chosen1", "chosen");

    RegisterMusic("music1", "nervouslynx", { volume: kMusicVolume });
    RegisterMusic("music2", "candiddonkey", { volume: kMusicVolume });
    RegisterMusic("music3", "devotedhyena", { volume: kMusicVolume });
    RegisterMusic("music4", "sweetgorilla", { volume: kMusicVolume });
    RegisterMusic("music5", "sweettapir", { volume: kMusicVolume });
    RegisterMusic("music6", "uglyshrimp", { volume: kMusicVolume });
    RegisterMusic("music7", "vulgarhamster", { volume: kMusicVolume });
    RegisterMusic("music8", "cynicalsheep2", { volume: kMusicVolume });
    RegisterMusic("music9", "cynicaltermite2", { volume: kMusicVolume });
    RegisterMusic("music10", "grumpywolverine", { volume: kMusicVolume });
    RegisterMusic("music11", "lazymouse", { volume: kMusicVolume });
    RegisterMusic("music12", "lonelymouse", { volume: kMusicVolume });
    RegisterMusic("music13", "modestcamel", { volume: kMusicVolume });
    RegisterMusic("music14", "nastywalrus", { volume: kMusicVolume });
    RegisterMusic("music15", "oldpenguin", { volume: kMusicVolume });
    RegisterMusic("music16", "rudeantelope", { volume: kMusicVolume });
    RegisterMusic("music17", "skinnykoala", { volume: kMusicVolume });
    RegisterMusic("music18", "sneakylabradoodle", { volume: kMusicVolume });
    RegisterMusic("music19", "wickedguppy", { volume: kMusicVolume });
    RegisterMusic("music20", "wickedmoose", { volume: kMusicVolume });
    RegisterMusic("music21", "youngchipmunk", { volume: kMusicVolume });
    RegisterMusic("music22", "youngprawn", { volume: kMusicVolume });
    RegisterMusic("music23", "politetortoise", { volume: kMusicVolume });
    RegisterMusic("music24", "poorhamster", { volume: kMusicVolume });

    // kick off loading chain.
    gAudio.name2meta[gAudio.names[0]].howl.load();
}
