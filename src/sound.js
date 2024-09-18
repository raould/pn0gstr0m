/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// ship as 'false'.
var _kill_unplayed = false;

// this object contains multiple mappings.
// 0-bsed index to name.
// name to meta.
// actively playing sound id to name.
var gAudio = {
    names: [],
    name2meta: {},
    id2name: {},
};

var gMusicID;

/* muting implementation is... tricky? i am 
 * using gStateMuted to prevent the attract
 * mode from playing game blip and explosion sfx,
 * but we still want the music to play.
 */
var gStateMuted = false;
var gMusicMuted = LoadLocal(LocalStorageKeys.musicMuted, false);
var gSfxMuted = LoadLocal(LocalStorageKeys.sfxMuted, false);

function RegisterMusic(name, basename, props) {
    RegisterSound(name, basename, props, true);
}

function RegisterSfx(name, basename, props) {
    RegisterSound(name, basename, props, false);
}

function RegisterSound(name, basename, props, isMusic) {
    if (isU(gAudio.name2meta[name])) {
        var files = ["ogg", "aac", "mp3"].map((e) => `sounds/${basename}.${e}`);
        var howl = new Howl({
            ...props,
            src: files,
            onload: () => {
                gAudio.name2meta[name].loaded = true;
                LoadNextSound();
            },
            onloaderror: () => {
                // well, poop.
                console.error("onloaderror", name);
                LoadNextSound();
            },
            html5: false,
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
    //  return gAudio.name2meta[n].loaded ? "1" : "0";
    // }).join('');
    // console.log(report);

    var next = Object.values(gAudio.name2meta).find(m => !m.loaded);
    if (exists(next)) {
        next.howl.load();
    }
}

function OnSfxStop(name) {
    var meta = gAudio.name2meta[name];
    if (meta != undefined) {
        delete meta.id;
        // if a piece of music just ended, kick off the next one.
        !!meta.isMusic && BeginMusic();
    }
}

const kMusicSfxCount = 24;
function BeginMusic() {
    StopAudio(true);
    if (!gMusicMuted) {
        // max list of music numbers in order (javascript sucks?).
        const unplayedAll = Array(kMusicSfxCount).fill().map((_,i) => {return i+1;});

        // if unknown (or forced), refresh to full list.
        let unplayed = LoadLocal(LocalStorageKeys.unplayed, unplayedAll);
        if (_kill_unplayed || unplayed.length == 0) {
            unplayed = unplayedAll;
        }

        Assert(unplayed != null, "BeginMusic: null");
        Assert(unplayed.length > 0, "BeginMusic: 0");
        // not random, always play musicN in order since we 'load' them in order.
        const num = unplayed.shift();

        // save the now-smaller remaining-items list.
        SaveLocal(LocalStorageKeys.unplayed, unplayed, true);

        const name = `music${num}`;
        console.log("BeginMusic", name);
        gMusicID = PlayMusic(name);
    }
}

function StopAudio(onlyMusic=false) {
    Object.values(gAudio.name2meta).forEach(meta => {
        if (meta != undefined) {
            if (!onlyMusic || meta.isMusic) {
                meta.howl.stop();
                delete gAudio.id2name[meta.id];
                delete meta.id;
            }
        }
    });
    gMusicID = undefined;
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
    return () => {
        const index = gR.RandomRangeInt(0, count-1);
        const name = gNames[index];
        return playfn(name);
    };
}

const PlayStart = MakePlayFn(1, "start", PlaySfx);
const PlayGameOver = MakePlayFn(1, "gameover", PlaySfx);
const kExplosionSfxCount = 3;
const PlayExplosion = MakePlayFn(kExplosionSfxCount, "explosion", PlaySfxDebounced);
const kBlipSfxCount = 3;
const PlayBlip = MakePlayFn(kBlipSfxCount, "blip", PlaySfxDebounced);
const kPowerupSfxCount = 1;
const PlayPowerupBoom = MakePlayFn(kPowerupSfxCount, "powerupboom", PlaySfxDebounced);

function LoadAudio() {
    // these will load in order 1 by 1 via onload().
    RegisterSfx("explosion1", "explosionA", { volume: 0.5 });
    RegisterSfx("explosion2", "explosionB", { volume: 0.5 });
    RegisterSfx("explosion3", "explosionC", { volume: 0.5 });
    RegisterSfx("blip1", "blipSelectA", { volume: 0.3 });
    RegisterSfx("blip2", "blipSelectB", { volume: 0.3 });
    RegisterSfx("blip3", "blipSelectC", { volume: 0.3 });
    RegisterSfx("start1", "start");
    RegisterSfx("powerupboom1", "powerUp");
    RegisterSfx("gameover1", "gameover");
    RegisterMusic("music1", "nervouslynx");
    RegisterMusic("music2", "candiddonkey");
    RegisterMusic("music3", "devotedhyena");
    RegisterMusic("music4", "sweetgorilla");
    RegisterMusic("music5", "sweettapir");
    RegisterMusic("music6", "uglyshrimp");
    RegisterMusic("music7", "vulgarhamster");
    RegisterMusic("music8", "cynicalsheep2");
    RegisterMusic("music9", "cynicaltermite2");
    RegisterMusic("music10", "grumpywolverine");
    RegisterMusic("music11", "lazymouse");
    RegisterMusic("music12", "lonelymouse");
    RegisterMusic("music13", "modestcamel");
    RegisterMusic("music14", "nastywalrus");
    RegisterMusic("music15", "oldpenguin");
    RegisterMusic("music16", "rudeantelope");
    RegisterMusic("music17", "skinnykoala");
    RegisterMusic("music18", "sneakylabradoodle");
    RegisterMusic("music19", "wickedguppy");
    RegisterMusic("music20", "wickedmoose");
    RegisterMusic("music21", "youngchipmunk");
    RegisterMusic("music22", "youngprawn");
    RegisterMusic("music23", "politetortoise");
    RegisterMusic("music24", "poorhamster");

    Assert(Object.keys(gAudio.name2meta).filter((k)=>k.includes("music")).length == kMusicSfxCount, "music count");
    Assert(Object.keys(gAudio.name2meta).filter((k)=>k.includes("explosion")).length == kExplosionSfxCount, "explosion count");
    Assert(Object.keys(gAudio.name2meta).filter((k)=>k.includes("blip")).length == kBlipSfxCount, "blip count");
    Assert(Object.keys(gAudio.name2meta).filter((k)=>k.includes("powerupboom")).length == kPowerupSfxCount, "powerupboom count");

    // kick off loading chain.
    gAudio.name2meta[gAudio.names[0]].howl.load();
}
