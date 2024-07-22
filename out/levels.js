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
// note: it is *hard coded* below that there are
// (0 or) exactly 2 types of powerup per level.

var gLevelRandom = new Random(42);
var kAttractLevelIndex = -1;
function MakeAttract(paddleP1, paddleP2) {
  return new Level({
    index: kAttractLevelIndex,
    maxVX: sxi(14),
    puckCount: undefined,
    isP1Player: false,
    isP2Player: false,
    pills: [],
    paddleP1: paddleP1,
    paddleP2: paddleP2
  });
}

// level is one-based.
function MakeLevel(index, paddleP1, paddleP2) {
  Assert(index > 0, "index is 1-based");
  var pillMakers = ChoosePillIDs(index).map(function (pid) {
    return gPillMakers[pid];
  });
  var level = new Level({
    index: index,
    // maxVX is allowed to grow after there are no more splits.
    maxVX: sxi(12 + index),
    speedupFactor: 0.0001,
    puckCount: MakePuckCount(index),
    isP1Player: true,
    isP2Player: !gSinglePlayer,
    pills: pillMakers,
    paddleP1: paddleP1,
    paddleP2: paddleP2
  });
  console.log("level", index, level);
  return level;
}
function MakePuckCount(index) {
  Assert(index > 0, "index is 1-based");
  // note: this is just a big swag.
  return 250 + (index - 1) * 300;
}
function ChoosePillIDs(index) {
  Assert(index != kAttractLevelIndex);
  var lv0 = index - 1;
  var pids = [];

  // skip the very first level, it has no powerups.
  if (lv0 > 0) {
    // the first n levels get 2 pills in order.
    if (lv0 * 2 <= gPillIDs.length - 2) {
      var i = (lv0 - 1) * 2;
      pids = gPillIDs.slice(i, i + 2);
      console.log("ChoosePillIDs by 2", index, pids);
      Assert(pids.length == 2);
    }

    // after those first n levels, the pills are random.
    else {
      var a = _toConsumableArray(gPillIDs);
      var p0 = a.splice(gLevelRandom.RandomRange(0, a.length - 1), 1);
      var p1 = a.slice(gLevelRandom.RandomRange(0, a.length - 1), 1);
      Assert(exists(p0));
      Assert(exists(p1));
      Assert(p0 != p1);
      Assert(p0.length == 1);
      Assert(p1.length == 1);
      pids = [p0[0], p1[0]];
      console.log("ChoosePillIDs Random", index, pids);
    }
    Assert(pids.length > 0);
  }
  console.log("Pids", index, pids);
  return pids;
}