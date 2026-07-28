"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* Copyright (C) 2011-2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

var kMusicVolume = 0.7;

// this object contains multiple mappings.
// 0-bsed index to name.
// name to meta.
// actively playing sound id to name.
var gAudio = {
  names: [],
  name2meta: {},
  id2name: {},
  musicTimer: undefined
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
  } else {
    console.log("RegisterSound", name, basename);
    var files = ["ogg", "aac", "mp3"].map(function (e) {
      return "sounds/".concat(basename, ".").concat(e);
    });
    var howl = new Howl(_objectSpread(_objectSpread({}, props), {}, {
      src: files,
      onload: function onload() {
        var meta = gAudio.name2meta[name];
        meta.loaded = true;
        console.log("onload", gAudio.name2meta[name]);
        LoadNextSound();
      },
      onloaderror: function onloaderror() {
        // well, poop.
        console.error("onloaderror", name);
        var meta = gAudio.name2meta[name];
        if (exists(meta)) {
          meta.loaded = "error";
        }
        console.log("onloaderror", gAudio.name2meta[name]);
        LoadNextSound();
      },
      html5: false,
      // this is a never-win parameter.
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
  //     return String(gAudio.name2meta[n].loaded);
  // }).join(',');
  // console.log(report);

  var delay = gDebug ? 500 : 1; // hack to support testing.
  setTimeout(function () {
    var next = Object.values(gAudio.name2meta).find(function (m) {
      return m.loaded === false;
    }); // not 'error'.
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
  var music = Object.values(gAudio.name2meta).filter(function (v) {
    return v.isMusic;
  });
  var loading = music.filter(function (m) {
    return m.loaded === false;
  }); // not 'error'.
  return loading.length === 0;
}
function BeginMusic() {
  StopMusic();
  gAudio.musicTimer = setTimeout(function () {
    console.log("BeginMusic: polling");
    gAudio.musicTimer = undefined;
    if (IsMusicReady()) {
      BeginMusicPlaying();
    } else {
      BeginMusic();
    }
  }, 1000);
  console.log("BeginMusic, timer", gAudio.musicTimer);
}
function BeginMusicPlaying() {
  console.log("BeginMusicPlaying");
  if (!gMusicMuted) {
    var unplayedAll = Object.entries(gAudio.name2meta).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];
      if (value.isMusic && value.loaded === true) {
        // not 'error'.
        return key;
      }
      return undefined;
    }).filter(Boolean);
    var unplayed = LoadLocal(LocalStorageKeys.unplayed, unplayedAll);
    if (unplayed.length == 0) {
      console.log("BeginMusicPlaying: resetting unplayed");
      unplayed = gR.RandomizeArray(unplayedAll);
    }
    Assert(exists(unplayed), "BeginMusicPlaying: null");
    Assert(unplayed.length > 0, "BeginMusicPlaying: 0");
    var name = unplayed.shift();

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
  Object.values(gAudio.name2meta).forEach(function (meta) {
    if (meta != null && meta.isMusic) {
      // '?' shouldn't be necessary, old bug?
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
    var _gAudio$name2meta$nam;
    console.log("PlayMusic", (_gAudio$name2meta$nam = gAudio.name2meta[name]) == null ? void 0 : _gAudio$name2meta$nam.basename);
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
  var debounceMsec = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 110;
  var sid;
  if (!gStateMuted && !gSfxMuted) {
    var meta = gAudio.name2meta[name];
    Assert(exists(meta), name, "PlaySfxDebounced ".concat(name));
    if (exists(meta)) {
      var last = meta.last || 0;
      if (Date.now() - last > debounceMsec) {
        sid = PlaySound(name);
      }
    }
  }
  return sid;
}
function PlaySound(name) {
  var sid = undefined;
  var meta = gAudio.name2meta[name];
  Assert(exists(meta), "PlaySound ".concat(name));
  if (exists(meta)) {
    var howl = meta.howl;
    var play = false;
    // the web is a lie.
    if (kIsSafari && howl == undefined) {
      play = true;
    } else if (exists(howl)) {
      var id = meta.id;
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
  Assert(count >= 0, count, "MakePlayFn ".concat(basename));
  var gNames = Array(count).fill().map(function (e, i) {
    return "".concat(basename).concat(i + 1);
  });
  return function (index) {
    // index is unused these days, oh well.
    var name = gNames[index != null ? index : gR.RandomRangeInt(0, count - 1)];
    return playfn(name);
  };
}

// this is a mess because i've been trying to work around various
// browser differences, all to no real winning answer, so it all sucks.
var PlayStart = MakePlayFn(1, "start", PlaySfx);
var PlayGameOver = MakePlayFn(1, "gameover", PlaySfx);
var PlayChargeup = MakePlayFn(1, "chargeup", PlaySfx);
var PlayPowerupBoom = MakePlayFn(1, "powerupboom", function (name) {
  return PlaySfxDebounced(name, 250);
});
var PlayBlip = MakePlayFn(1, "blip", function (name) {
  return PlaySfxDebounced(name, 55);
});
var PlayChosen = MakePlayFn(1, "chosen", PlaySfx);
var PlayPaddleHit = MakePlayFn(2, "explosion", function (name) {
  return PlaySfxDebounced(name, 55);
});
function LoadAudio() {
  SaveLocal(LocalStorageKeys.unplayed, []);

  // these will load in order 1 by 1 via onload().

  // todo: not enough audible difference between the explosion sfx.
  RegisterSfx("explosion1", "explosionB2", {
    volume: 0.35
  }); // puck hits paddle.
  RegisterSfx("explosion2", "explosionA2", {
    volume: 0.35
  }); // puck hits paddle.

  RegisterSfx("blip1", "blipSelectC", {
    volume: 0.2
  }); // puck hits wall etc.

  RegisterSfx("start1", "start");
  RegisterSfx("chargeup1", "chargeup", {
    volume: 0.3
  });
  RegisterSfx("powerupboom1", "powerUp");
  RegisterSfx("gameover1", "gameover");
  RegisterSfx("chosen1", "chosen");
  RegisterMusic("music1", "nervouslynx", {
    volume: kMusicVolume
  });
  RegisterMusic("music2", "candiddonkey", {
    volume: kMusicVolume
  });
  RegisterMusic("music3", "devotedhyena", {
    volume: kMusicVolume
  });
  RegisterMusic("music4", "sweetgorilla", {
    volume: kMusicVolume
  });
  RegisterMusic("music5", "sweettapir", {
    volume: kMusicVolume
  });
  RegisterMusic("music6", "uglyshrimp", {
    volume: kMusicVolume
  });
  RegisterMusic("music7", "vulgarhamster", {
    volume: kMusicVolume
  });
  RegisterMusic("music8", "cynicalsheep2", {
    volume: kMusicVolume
  });
  RegisterMusic("music9", "cynicaltermite2", {
    volume: kMusicVolume
  });
  RegisterMusic("music10", "grumpywolverine", {
    volume: kMusicVolume
  });
  RegisterMusic("music11", "lazymouse", {
    volume: kMusicVolume
  });
  RegisterMusic("music12", "lonelymouse", {
    volume: kMusicVolume
  });
  RegisterMusic("music13", "modestcamel", {
    volume: kMusicVolume
  });
  RegisterMusic("music14", "nastywalrus", {
    volume: kMusicVolume
  });
  RegisterMusic("music15", "oldpenguin", {
    volume: kMusicVolume
  });
  RegisterMusic("music16", "rudeantelope", {
    volume: kMusicVolume
  });
  RegisterMusic("music17", "skinnykoala", {
    volume: kMusicVolume
  });
  RegisterMusic("music18", "sneakylabradoodle", {
    volume: kMusicVolume
  });
  RegisterMusic("music19", "wickedguppy", {
    volume: kMusicVolume
  });
  RegisterMusic("music20", "wickedmoose", {
    volume: kMusicVolume
  });
  RegisterMusic("music21", "youngchipmunk", {
    volume: kMusicVolume
  });
  RegisterMusic("music22", "youngprawn", {
    volume: kMusicVolume
  });
  RegisterMusic("music23", "politetortoise", {
    volume: kMusicVolume
  });
  RegisterMusic("music24", "poorhamster", {
    volume: kMusicVolume
  });

  // kick off loading chain.
  gAudio.name2meta[gAudio.names[0]].howl.load();
}