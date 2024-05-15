/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// both:
// name to meta.
// and
// id to name.
var gAudioMap = {};
var gMusicID;
var kMusicStorageKey = "pn0g_music";
var _kill_unplayed = false;
var gStateMuted = true;
var gUserMuted = false;

function RegisterMusic(name, filebasename, modify_fn) {
    RegisterSound(name, filebasename, true, modify_fn);
}

function RegisterSfx(name, filebasename, modify_fn) {
    RegisterSound(name, filebasename, false, modify_fn);
}

function RegisterSound(name, filebasename, isMusic=false, modify_fn) {
    var files = ["wav", "aac"].map((e) => `sound/${filebasename}.${e}`);
    gAudioMap[name] = {};
    var howl = new Howl({
	src: files,
	// {html: true} was killing my iPad Safari it seemed.
	onload: () => {
	    gAudioMap[name].loaded = true;
	},
	html5: false,
	// only 1 allowed per name.
	onend: () => OnSfxStop(name),
    });
    gAudioMap[name] = /*meta*/ {
	...gAudioMap[name],
	filebasename,
	howl,
	isMusic,
	modify_fn,
	last: 0,
	loaded: false,
    };
}

function LoadAudio() {
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

    Assert(Object.keys(gAudioMap).filter((k)=>k.includes("music")).length == kMusicSfxCount);
    Assert(Object.keys(gAudioMap).filter((k)=>k.includes("explosion")).length == kExplosionSfxCount);
    Assert(Object.keys(gAudioMap).filter((k)=>k.includes("blip")).length == kBlipSfxCount);
    Assert(Object.keys(gAudioMap).filter((k)=>k.includes("powerupboom")).length == kPowerupSfxCount);
}

function OnSfxStop(name) {
    var meta = gAudioMap[name];
    if (meta != undefined) {
	delete meta.id;
	!!meta.isMusic && BeginMusic();
    }
}

const kMusicSfxCount = 22;
function BeginMusic() {
    EndMusic();
    if (!gUserMuted) {
	var unplayed_all = Array(kMusicSfxCount).fill().map((_,i) => {return i+1;});
	// refresh to full list if empty.
	var unplayed_str = localStorage.getItem(kMusicStorageKey);
	if (unplayed_str == null) {
	    unplayed = unplayed_all;
	}
	else {
	    var unplayed = JsonStringToArrayWorkaround(unplayed_str);
	    if (unplayed.length == 0) {
		var json_str = JSON.stringify(unplayed_all);
		localStorage.setItem(kMusicStorageKey, json_str);
	    }
	    // get the updated valid list.
	    unplayed_str = localStorage.getItem(kMusicStorageKey);
	    unplayed = JsonStringToArrayWorkaround(unplayed_str);
	}
	Assert(unplayed != null);
	// choose random entry.
	var index = RandomRangeInt(0, unplayed.length-1);
	var num = unplayed[index];
	// save the smaller remaining items list.
	unplayed.splice(index, 1);
	localStorage.setItem(kMusicStorageKey, JSON.stringify(unplayed));	
	var name = `music${num}`;
	gMusicID = PlaySound(name, true);
    }
}

function EndMusic() {
    if (gMusicID != undefined) {
	var name = gAudioMap[gMusicID];
	var meta = gAudioMap[name];
	if (meta != undefined) {
	    meta.howl.stop();
	    delete meta.id;
	    delete gAudioMap[gMusicID];
	}
    }
    gMusicID = undefined;
}

function PlaySound(name, ignore_muted=false) {
    var sid;
    if (ignore_muted || (!gStateMuted && !gUserMuted)) {
	var meta = gAudioMap[name];
	Assert(meta != undefined, name);
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
		gAudioMap[sid] = name;
	    }
	}
    }
    return sid;
}

function PlaySoundDebounced(name) {
    var sid;
    if (!gStateMuted && !gUserMuted) {
	var meta = gAudioMap[name];
	Assert(meta != undefined, name);
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
    Assert(count >= 0, count);
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

// note: not linear, aesthetically on purpose!
function GameTime01(period, start) {
    var diff = gGameTime - (start == undefined ? gStartTime : start);
    return Clip01(
	Math.pow(
	    diff / ((period > 0) ? period : 1000),
	    3
	)
    );
}
