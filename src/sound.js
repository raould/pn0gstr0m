/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

const kMusicVolume = 0.6;

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
	var howlProps = { // there is no good answer to browser audio at all.
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
            html5: kIsSafari, // this is a never-win parameter.
            preload: false === isMusic,
            // only 1 concurrent playback per name.
            onend: () => OnSfxStop(name),
        };
	console.log("RegisterSound", name, howlProps);
        var howl = new Howl(howlProps);
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

    const delay = 1; // can be increased for testing.
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
        if (meta.isMusic == true) { BeginMusic(); }
    }
}

function IsMusicReady() {
    const music = Object.values(gAudio.name2meta).filter(v => v.isMusic);
    const loading = music.filter(m => m.loaded === true); // not 'error'.
    // start playing asap. sort of assuming more tune data will load
    // while playing the currently available one.
    return loading.length > 0;
}

function BeginMusic() {
    StopMusic();
    gAudio.musicTimer = setTimeout(() => {
	gAudio.musicTimer = undefined;
	if (IsMusicReady()) {
	    BeginUnplayedMusic();
	}
	else {
	    BeginMusic();
	}
    }, 1000);
}

function BeginUnplayedMusic() {
    console.log("BeginUnplayedMusic");
    if (!gMusicMuted) {
	const allMusic = Object.entries(gAudio.name2meta).map(([key, value]) => {
	    if (value.isMusic && value.loaded === true) { // not 'error'.
		return key;
	    }
	    return undefined;
	}).filter(Boolean);
        let unplayed = LoadLocal(LocalStorageKeys.unplayed, allMusic);
        if (unplayed.length == 0) {
	    // played everything we had, refresh with everything available.
	    console.log("BeginUnplayedMusic: resetting unplayed");
	    unplayed = gR.RandomizeArray(allMusic);
        }
	if (allMusic.length > unplayed.length) {
	    // more tunes got loaded in the meantime, so add them to the mix.
	    console.log("BeginUnplayedMusic: adding newly loaded data, before", unplayed);
	    allMusic.forEach(u => { if (false===unplayed.includes(u)) { unplayed.push(u); } } );
	    console.log("BeginUnplayedMusic: adding newly loaded data, after", unplayed);
	}

        // save the now-smaller remaining-items list.
        Assert(exists(unplayed), "BeginUnplayedMusic: null");
        Assert(unplayed.length > 0, "BeginUnplayedMusic: 0");
        SaveLocal(LocalStorageKeys.unplayed, unplayed, true);

        const name = unplayed.shift();
        console.log("BeginUnplayedMusic", name);
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

function PlaySfxDebounced(name, debounceMsec=20) {
    let sid;
    if (!gStateMuted && !gSfxMuted) {
        const meta = gAudio.name2meta[name];
        Assert(exists(meta), name, `PlaySfxDebounced ${name}`);
        if (exists(meta)) {
            const last = meta.last || 0;
	    const diff = Date.now() - last;
            if (diff > debounceMsec) {
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
	    gAudio.id2name[meta.id] = name;
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
const PlayPowerupBoom = MakePlayFn(1, "powerupboom", (name) => PlaySfxDebounced(name, 100));
const PlayBlip = MakePlayFn(1, "blip", (name) => PlaySfxDebounced(name, 30));
const PlayChosen = MakePlayFn(1, "chosen", PlaySfx);
const PlayPaddleHit = MakePlayFn(2, "explosion", (name) => PlaySfxDebounced(name, 10));

function LoadAudio() {
    SaveLocal(LocalStorageKeys.unplayed, []);
    LoadSfx();
    LoadMusic();
    gAudio.name2meta[gAudio.names[0]].howl.load();
}

function LoadSfx() {
    // todo: not enough audible difference between the explosion sfx.
    RegisterSfx("explosion1", "explosionB2", { volume: 0.35 }); // puck hits paddle.
    RegisterSfx("explosion2", "explosionA2", { volume: 0.35 }); // puck hits paddle.
    RegisterSfx("blip1", "blipSelectC", { volume: 0.3 }); // puck hits wall etc.
    RegisterSfx("chargeup1", "chargeup", { volume: 0.5 });
    RegisterSfx("start1", "start");
    RegisterSfx("powerupboom1", "powerUp");
    RegisterSfx("gameover1", "gameover", { volume: 0.8 });
    RegisterSfx("chosen1", "chosen", { volume: 0.9 });
}

function LoadMusic() {
    const musicSources = gR.RandomizeArray([
	"nervouslynx",
	"candiddonkey",
	"devotedhyena",
	"sweetgorilla",
	"sweettapir",
	"uglyshrimp",
	"vulgarhamster",
	"cynicalsheep2",
	"cynicaltermite2",
	"grumpywolverine",
	"lazymouse",
	"lonelymouse",
	"modestcamel",
	"nastywalrus",
	"oldpenguin",
	"rudeantelope",
	"skinnykoala",
	"sneakylabradoodle",
	"wickedguppy",
	"wickedmoose",
	"youngchipmunk",
	"youngprawn",
	"politetortoise",
	"poorhamster",
    ]);
    musicSources.forEach((s, i) => RegisterMusic(`music${i}`, s, { volume: kMusicVolume }));
}
