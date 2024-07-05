"use strict";

/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// yes this is really hard to playtest.

// just a proof of concept, we only have 1 level,
// so not actually using the timeouts or count.
// bounty: somebody add (and playtest!) more levels,
// and add nice ui for it all.

// note: it is *hard coded* below that there are
// (zero or) exactly 2 types of powerup per level.

var gLevelRandom = new Random(42);
var gPillMakers = [
// levels are 1-based, and level 1 has no powerups.
MakeForcePushProps,
// level 2
MakeDecimateProps, MakeEngorgeProps,
// level 3
MakeSplitProps, MakeDefendProps,
// level 4
MakeOptionProps, MakeNeoProps,
// level 5
MakeChaosProps];
function MakeAttract(gameState) {
  return new Level({
    index: -1,
    maxVX: sxi(14),
    speedupFactor: 0,
    speedupTimeout: undefined,
    puckCount: undefined,
    isP1Player: false,
    isP2Player: false,
    pills: [],
    paddleP1: gameState.paddleP1,
    paddleP2: gameState.paddleP2
  });
}

// level is one-based.
function MakeLevel(gameState, level) {
  Assert(level > 0, "level is 1-based");
  return new Level({
    index: level,
    maxVX: sxi(14),
    speedupTimeout: 1000 * 60 * 1,
    speedupFactor: 0.01,
    puckCount: MakePuckCount(level),
    isP1Player: !gameState.isAttract,
    isP2Player: !gameState.isAttract && !gSinglePlayer,
    pills: MakePills(level),
    paddleP1: gameState.paddleP1,
    paddleP2: gameState.paddleP2
  });
}
function MakePuckCount(level) {
  Assert(level > 0, "level is 1-based");
  // note: this is just a big swag.
  return 500 + (level - 1) * 300;
}
function MakePills(level) {
  var lv0 = level - 1;
  var pills = [];

  // levels are 1-based, and level 1 has no powerups.
  if (level > 1) {
    // the first n levels get 2 pills in order.
    if (lv0 * 2 < gPillMakers.length - 2) {
      pills = gPillMakers.slice(lv0 * 2, lv0 * 2 + 2);
      console.log("MakePills", level, pills);
      Assert(pills.length == 2);
    }
    // after those first n levels, the pills are random.
    else {
      var a = [].concat(gPillMakers);
      var p0 = a.splice(gLevelRandom.RandomRange(0, a.length - 1), 1);
      var p1 = a.slice(gLevelRandom.RandomRange(0, a.length - 1), 1);
      Assert(exists(p0));
      Assert(exists(p1));
      Assert(p0 != p1);
      Assert(p0.length == 1);
      Assert(p1.length == 1);
      pills = [p0[0], p1[0]];
    }
    Assert(pills.length > 0, "Pills");
  }
  console.log("Pills", level, pills);
  return pills;
}