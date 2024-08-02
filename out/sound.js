"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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
  id2name: {}
};
var gMusicID;
var kMusicStorageKey = "pn0g_music";

/* muting implementation is... tricky? i am 
 * using gStateMuted to prevent the attract
 * mode from playing game blip and explosion sfx,
 * but we still want the music to play.
 */
var gStateMuted = true;
var gMusicMuted = false;
var gSfxMuted = false;
function RegisterMusic(name, basename, props) {
  RegisterSound(name, basename, props, true);
}
function RegisterSfx(name, basename, props) {
  RegisterSound(name, basename, props, false);
}
function RegisterSound(name, basename, props, isMusic) {
  if (isU(gAudio.name2meta[name])) {
    var files = ["ogg", "aac", "mp3"].map(function (e) {
      return "sounds/".concat(basename, ".").concat(e);
    });
    var howl = new Howl(_objectSpread(_objectSpread({}, props), {}, {
      src: files,
      onload: function onload() {
        gAudio.name2meta[name].loaded = true;
        LoadNextSound();
      },
      onloaderror: function onloaderror() {
        // well, poop.
        console.error("onloaderror", name);
        LoadNextSound();
      },
      html5: false,
      preload: false,
      // only 1 concurrent playback per name.
      onend: function onend() {
        return OnSfxStop(name);
      }
    }));
    Assert(!gAudio.names.includes(name), "RegisterSound ".concat(name));
    gAudio.names.push(name);
    gAudio.name2meta[name] = /*meta*/_objectSpread(_objectSpread({}, gAudio[name]), {}, {
      basename: basename,
      howl: howl,
      isMusic: isMusic,
      last: 0,
      loaded: false
    });
  }
}
function LoadNextSound() {
  // cute for debugging.
  // var report = gAudio.names.map((n) => {
  //  return gAudio.name2meta[n].loaded ? "1" : "0";
  // }).join('');
  // console.log(report);

  var next = Object.values(gAudio.name2meta).find(function (m) {
    return !m.loaded;
  });
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
var kMusicSfxCount = 24;
function BeginMusic() {
  StopAudio(true);
  if (!gMusicMuted) {
    // max list of music numbers in order (javascript sucks?).
    var unplayedAll = Array(kMusicSfxCount).fill().map(function (_, i) {
      return i + 1;
    });
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
    Assert(unplayed != null, "BeginMusic: null");
    Assert(unplayed.length > 0, "BeginMusic: 0");
    // not random, always play musicN in order since we 'load' them in order.
    var num = unplayed.shift();
    // save the now-smaller remaining-items list.
    localStorage.setItem(kMusicStorageKey, JSON.stringify(unplayed));
    var name = "music".concat(num);
    gMusicID = PlayMusic(name);
  }
}
function StopAudio() {
  var onlyMusic = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  Object.values(gAudio.name2meta).forEach(function (meta) {
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
    return PlaySound(name);
  }
  return undefined;
}
function PlaySfx(name) {
  var ignoreMuted = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!gSfxMuted || ignoreMuted) {
    return PlaySound(name);
  }
  return undefined;
}
function PlaySfxDebounced(name) {
  var sid;
  if (!gStateMuted && !gSfxMuted) {
    var meta = gAudio.name2meta[name];
    Assert(meta != undefined, name, "PlaySfxDebounced ".concat(name));
    if (meta != undefined) {
      var last = meta.last || 0;
      if (Date.now() - last > gR.RandomCentered(25, 10) /*msec*/) {
        sid = PlaySound(name);
      }
    }
  }
  return sid;
}
function PlaySound(name) {
  var sid = undefined;
  var meta = gAudio.name2meta[name];
  Assert(meta != undefined, "PlaySound ".concat(name));
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
  return sid;
}
function MakePlayFn(count, basename, playfn) {
  Assert(count >= 0, count, "MakePlayFn ".concat(basename));
  var gNames = Array(count).fill().map(function (e, i) {
    return "".concat(basename).concat(i + 1);
  });
  return function () {
    var index = gR.RandomRangeInt(0, count - 1);
    var name = gNames[index];
    return playfn(name);
  };
}
var PlayStart = MakePlayFn(1, "start", PlaySfx);
var PlayGameOver = MakePlayFn(1, "gameover", PlaySfx);
var kExplosionSfxCount = 3;
var PlayExplosion = MakePlayFn(kExplosionSfxCount, "explosion", PlaySfxDebounced);
var kBlipSfxCount = 3;
var PlayBlip = MakePlayFn(kBlipSfxCount, "blip", PlaySfxDebounced);
var kPowerupSfxCount = 1;
var PlayPowerupBoom = MakePlayFn(kPowerupSfxCount, "powerupboom", PlaySfxDebounced);
function LoadAudio() {
  // these will load in order 1 by 1 via onload().
  RegisterSfx("explosion1", "explosionA", {
    volume: 0.5
  });
  RegisterSfx("explosion2", "explosionB", {
    volume: 0.5
  });
  RegisterSfx("explosion3", "explosionC", {
    volume: 0.5
  });
  RegisterSfx("blip1", "blipSelectA", {
    volume: 0.3
  });
  RegisterSfx("blip2", "blipSelectB", {
    volume: 0.3
  });
  RegisterSfx("blip3", "blipSelectC", {
    volume: 0.3
  });
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
  Assert(Object.keys(gAudio.name2meta).filter(function (k) {
    return k.includes("music");
  }).length == kMusicSfxCount, "music count");
  Assert(Object.keys(gAudio.name2meta).filter(function (k) {
    return k.includes("explosion");
  }).length == kExplosionSfxCount, "explosion count");
  Assert(Object.keys(gAudio.name2meta).filter(function (k) {
    return k.includes("blip");
  }).length == kBlipSfxCount, "blip count");
  Assert(Object.keys(gAudio.name2meta).filter(function (k) {
    return k.includes("powerupboom");
  }).length == kPowerupSfxCount, "powerupboom count");

  // kick off loading chain.
  gAudio.name2meta[gAudio.names[0]].howl.load();
}