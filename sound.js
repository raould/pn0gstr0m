/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
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
var kMusicStorageKey = "pn0g_music";
var gStateMuted = true;
var gUserMuted = false;

function RegisterMusic(name, basename) {
    RegisterSound(name, basename, true);
}

function RegisterSfx(name, basename) {
    RegisterSound(name, basename, false);
}

function RegisterSound(name, basename, isMusic) {
    if (isU(gAudio.name2meta[name])) {
	var files = ["ogg", "aac", "mp3"].map((e) => `sound/${basename}.${e}`);
	var howl = new Howl({
	    src: files,
	    onload: () => {
		gAudio.name2meta[name].loaded = true;
		console.log("onload", name);
		LoadNextSound(name);
	    },
	    onloaderror: () => {
		// well, poop. todo: something better.
		console.log("onloaderror", name);
		LoadNextSound(name);
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

function LoadNextSound(prev) {
    var report = gAudio.names.map((n) => {
	return gAudio.name2meta[n].loaded ? "1" : "0";
    }).join('');
    console.log(report);

    var next = Object.values(gAudio.name2meta).find(m => !m.loaded);
    if (notU(next)) {
	next.howl.load();
    }
}

function OnSfxStop(name) {
    var meta = gAudio.name2meta[name];
    if (meta != undefined) {
	delete meta.id;
	!!meta.isMusic && BeginMusic();
    }
}

const kMusicSfxCount = 24;
function BeginMusic() {
    StopAudio();
    if (!gUserMuted) {
	// max list of music numbers in order (javascript sucks?).
	var unplayedAll = Array(kMusicSfxCount).fill().map((_,i) => {return i+1;});
	// refresh to full list if unknown.
	var unplayedStr = localStorage.getItem(kMusicStorageKey);
	if (unplayedStr == null || _kill_unplayed) {
	    unplayed = unplayedAll;
	}
	// else parse the unplayed list.
	// if that is [] then reset to all.
	else {
	    var unplayed = JSON.parse(unplayedStr);
	    if (unplayed.length == 0) {
		var jsonStr = JSON.stringify(unplayedAll);
		localStorage.setItem(kMusicStorageKey, jsonStr);
	    }
	    unplayedStr = localStorage.getItem(kMusicStorageKey);
	    unplayed = JSON.parse(unplayedStr);
	}
	Assert(unplayed != null, "BeginMusic");
	// not random, always play musicN in order since we 'load' them in order.
	var num = unplayed.shift();
	// save the smaller remaining items list.
	localStorage.setItem(kMusicStorageKey, JSON.stringify(unplayed));
	var name = `music${num}`;
	gMusicID = PlaySound(name, true);
    }
}

function StopAudio() {
    Object.values(gAudio.name2meta).forEach(meta => {
	if (meta != undefined) {
	    meta.howl.stop();
	    delete gAudio.id2name[meta.id];
	    delete meta.id;
	}
    });
    gMusicID = undefined;
}

function PlaySound(name, ignoreMuted=false) {
    var sid;
    if (ignoreMuted || (!gStateMuted && !gUserMuted)) {
	var meta = gAudio.name2meta[name];
	Assert(meta != undefined, `PlaySound ${name}`);
	if (meta != undefined) {
	    var howl = meta.howl;
	    // currently only allowing one name-instance at a time.
	    if (howl != undefined) {
		var id = meta.id;
		if (id != undefined) {
		    howl.stop();
		}
		meta.id = sid = howl.play();
		meta.last = Date.now();
		gAudio.id2name[sid] = name;
	    }
	}
    }
    return sid;
}

function PlaySoundDebounced(name) {
    var sid;
    if (!gStateMuted && !gUserMuted) {
	var meta = gAudio.name2meta[name];
	Assert(meta != undefined, name, `PlaySoundDebounced ${name}`);
	if (meta != undefined) {
	    var last = meta.last || 0;
	    if (Date.now()-last > RandomCentered(25,10) /*msec*/) {
		sid = PlaySound(name);
	    }
	}
    }
    return sid;
}

function MakePlayFn(count, basename, playfn) {
    Assert(count >= 0, count, `MakePlayFn ${basename}`);
    var gNames = Array(count).fill().map((e,i) => `${basename}${i+1}`);
    return () => {
	var index = RandomRangeInt(0, count-1);
	var name = gNames[index];
	return playfn(name);
    };
}

const PlayStart = MakePlayFn(1, "start", PlaySound);
const PlayGameOver = MakePlayFn(1, "gameover", PlaySound);

const kExplosionSfxCount = 3;
const PlayExplosion = MakePlayFn(kExplosionSfxCount, "explosion", PlaySoundDebounced);
const kBlipSfxCount = 3;
const PlayBlip = MakePlayFn(kBlipSfxCount, "blip", PlaySoundDebounced);
const kPowerupSfxCount = 1;
const PlayPowerupBoom = MakePlayFn(kPowerupSfxCount, "powerupboom", PlaySoundDebounced);

function LoadAudio() {
    // these will load in order 1 by 1 via onload().
    RegisterSfx("explosion1", "explosionA");
    RegisterSfx("explosion2", "explosionB");
    RegisterSfx("explosion3", "explosionC");
    RegisterSfx("blip1", "blipSelectA");
    RegisterSfx("blip2", "blipSelectB");
    RegisterSfx("blip3", "blipSelectC");
    RegisterSfx("start1", "powerUp");
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
