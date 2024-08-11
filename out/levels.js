"use strict";

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// yes this is really hard to playtest.

function MakeAttract(paddleP1, paddleP2) {
  return new Level({
    index: kAttractLevelIndex,
    isAttract: true,
    isSpawning: false,
    vx0: sxi(3),
    maxVX: sxi(14),
    isP1Player: false,
    isP2Player: false,
    pills: [],
    paddleP1: paddleP1,
    paddleP2: paddleP2
  });
}
function MakeZen(paddleP1, paddleP2) {
  var pills = ChoosePillIDs(kZenLevelIndex).map(function (pid) {
    return gPillInfo[pid].maker;
  });
  return new Level({
    index: kZenLevelIndex,
    isSpawning: true,
    vx0: sxi(3),
    maxVX: sxi(18),
    isP1Player: true,
    isP2Player: !gSinglePlayer,
    pills: pills,
    paddleP1: paddleP1,
    paddleP2: paddleP2
  });
}

// level is one-based.
// zen mode means only one level!
function MakeLevel(index, paddleP1, paddleP2) {
  Assert(index !== 0, "index is 1-based");
  var splitsCount = MakeSplitsCount(index);
  var pills = ChoosePillIDs(index).map(function (pid) {
    return gPillInfo[pid].maker;
  });
  var level = new Level({
    index: index,
    isSpawning: true,
    vx0: sxi(3),
    // maxVX is allowed to grow after there are no more splits.
    maxVX: sxi(12 + index),
    speedupFactor: 0.0001,
    splitsCount: splitsCount,
    isP1Player: true,
    isP2Player: !gSinglePlayer,
    pills: pills,
    paddleP1: paddleP1,
    paddleP2: paddleP2
  });
  return level;
}
function MakeSplitsCount(index) {
  Assert(index !== 0, "index is 1-based");
  if (index === kAttractLevelIndex) {
    return 0;
  } else if (index === kZenLevelIndex) {
    return undefined;
  } else if (index === 1) {
    return 100;
  } else {
    // level 2 is 200.
    // note: this is just a big bad random swag.
    var extra = Math.max(0, index - 2) * 50;
    return 200 + extra;
  }
}
var gChosenPillIDsCache;
function ChoosePillIDs(index) {
  var _gChosenPillIDsCache;
  Assert(index != kAttractLevelIndex);
  if (index === kZenLevelIndex) {
    return _toConsumableArray(gPillIDs);
  }
  var i0 = index - 1;
  if (((_gChosenPillIDsCache = gChosenPillIDsCache) == null ? void 0 : _gChosenPillIDsCache.index) === index) {
    var _gChosenPillIDsCache2;
    return (_gChosenPillIDsCache2 = gChosenPillIDsCache) == null ? void 0 : _gChosenPillIDsCache2.pids;
  }
  var pids = ChoosePillIDsUncached(index);
  console.log("Pids", index, pids);
  gChosenPillIDsCache = {
    index: index,
    pids: pids
  };
  return pids;
}
function ChoosePillIDsUncached(index) {
  var pids = [];
  var i0 = index - 1;

  // attract and first level have no pills.
  if (i0 > 0) {
    // the first n levels get 2 pills in order.
    if (i0 <= gPillIDs.length / 2) {
      Assert(i0 > 0, "attract and level 1 should not have pills", index);
      var i = (i0 - 1) * 2;
      pids = gPillIDs.slice(i, i + 2);
      console.log("ChoosePillIDsUncached by 2", index, pids, pids.map(function (i) {
        var _gPillInfo$i;
        return (_gPillInfo$i = gPillInfo[i]) == null ? void 0 : _gPillInfo$i.name;
      }));
      Assert(pids.length === 2);
    }

    // after those first n levels, 4 random pills per level.
    // todo: make the 4 feel more random level to level,
    // they seem to repeat too easily.
    else {
      var r = new Random(index);
      var p = _toConsumableArray(gPillIDs);
      pids = [p.splice(r.RandomRangeInt(0, p.length - 1), 1)[0], p.splice(r.RandomRangeInt(0, p.length - 1), 1)[0], p.splice(r.RandomRangeInt(0, p.length - 1), 1)[0], p.splice(r.RandomRangeInt(0, p.length - 1), 1)[0]];
      console.log("ChoosePillIDsUncached random 4", index, pids, pids.map(function (i) {
        var _gPillInfo$i2;
        return (_gPillInfo$i2 = gPillInfo[i]) == null ? void 0 : _gPillInfo$i2.name;
      }));
      Assert(pids.length === 4);
    }
    Assert(pids.length > 0);
  }
  return pids;
}