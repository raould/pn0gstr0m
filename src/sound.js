/* Copyright (C) 2011-2026 raould@gmail.com License: GPLv2 / GNU General
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
    musicCount: 0,
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

function RegisterMusic(name, basename, props) {
    RegisterSound(name, basename, props, true);
}

function RegisterSfx(name, basename, props) {
    RegisterSound(name, basename, props, false);
}

function RegisterSound(name, basename, props, isMusic) {
    if (isU(gAudio.name2meta[name])) {
        var files = ["ogg", "aac", "mp3"].map((e) => `sounds/${basename}.${e}`);
        var howl = new Howl({ // there is no good answer to browser audio at all.
            ...props,
            src: files,
            onload: () => {
		const meta = gAudio.name2meta[name];
                meta.loaded = true;
		if (meta.isMusic) { ++gAudio.musicCount; }
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
    if (meta != undefined) {
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
	if (IsMusicReady) {
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
	    if (value.isMusic && value.loaded === true) {
		return key;
	    }
	    return undefined;
	}).filter(Boolean);

        // if unknown (or forced), refresh to full list.
        let unplayed = LoadLocal(LocalStorageKeys.unplayed, unplayedAll);
        if (unplayed.length == 0) {
            unplayed = unplayedAll;
        }

        Assert(unplayed != null, "BeginMusic: null");
        Assert(unplayed.length > 0, "BeginMusic: 0");
        const name = unplayed.shift();

        // save the now-smaller remaining-items list.
        SaveLocal(LocalStorageKeys.unplayed, unplayed, true);

        console.log("BeginMusic", name);
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

function PlaySfxDebounced(name) {
    let sid;
    if (!gStateMuted && !gSfxMuted) {
        const meta = gAudio.name2meta[name];
        Assert(meta != undefined, name, `PlaySfxDebounced ${name}`);
        if (meta != undefined) {
            const last = meta.last || 0;
            if (Date.now()-last > gR.RandomCentered(25,10) /*msec*/) {
                sid = PlaySound(name);
            }
        }
    }
    return sid;
}

function PlaySound(name) {
    let sid = undefined;
    const meta = gAudio.name2meta[name];
    Assert(meta != undefined, `PlaySound ${name}`);
    if (meta != undefined) {
        const howl = meta.howl;
        // currently only allowing one name-instance at a time.
        if (howl != undefined) {
            const id = meta.id;
            if (id != undefined) {
                howl.stop();
            }
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
    return (index) => {
        index = index ?? gR.RandomRangeInt(0, count-1);
        const name = gNames[index];
        return playfn(name);
    };
}

const PlayStart = MakePlayFn(1, "start", PlaySfx);
const PlayGameOver = MakePlayFn(1, "gameover", PlaySfx);
const PlayChargeup = MakePlayFn(1, "chargeup", PlaySfx);
const PlayPowerupBoom = MakePlayFn(1, "powerupboom", PlaySfxDebounced);
const kExplosionSfxCount = 3;
const PlayExplosion = MakePlayFn(kExplosionSfxCount, "explosion", PlaySfxDebounced);
const kBlipSfxCount = 3;
const PlayBlip = MakePlayFn(kBlipSfxCount, "blip", PlaySfxDebounced);

function LoadAudio() {
    SaveLocal(LocalStorageKeys.unplayed, []);
    
    // these will load in order 1 by 1 via onload().
    RegisterSfx("explosion1", "explosionA", { volume: 0.35 });
    RegisterSfx("explosion2", "explosionB", { volume: 0.35 });
    RegisterSfx("explosion3", "explosionC", { volume: 0.35 });
    RegisterSfx("blip1", "blipSelectA", { volume: 0.3 });
    RegisterSfx("blip2", "blipSelectB", { volume: 0.3 });
    RegisterSfx("blip3", "blipSelectC", { volume: 0.3 });
    RegisterSfx("start1", "start");
    RegisterSfx("chargeup1", "chargeup", { volume: 0.3 });
    RegisterSfx("powerupboom1", "powerUp");
    RegisterSfx("gameover1", "gameover");
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
    
    Assert(Object.keys(gAudio.name2meta).filter((k)=>k.includes("explosion")).length == kExplosionSfxCount, "explosion count");
    Assert(Object.keys(gAudio.name2meta).filter((k)=>k.includes("blip")).length == kBlipSfxCount, "blip count");

    // kick off loading chain.
    gAudio.name2meta[gAudio.names[0]].howl.load();
}
