"use strict";

/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// yes this is really hard to playtest.

function MakeAttract() {
  return new Level({
    index: kAttractLevelIndex,
    isAttract: true,
    isSpawning: false,
    maxVX: sxi(14),
    isP1Player: false,
    isP2Player: false
  });
}
function MakeZen() {
  return new Level({
    index: kZenLevelIndex,
    isSpawning: true,
    maxVX: sxi(15),
    speedupFactor: 0.00001,
    isP1Player: true,
    isP2Player: !gSinglePlayer
  });
}
function MakeLevel(gGameMode, index, paddleP1, paddleP2) {
  Assert(index !== 0, "index is 1-based");
  Assert(gGameMode !== kGameModeZen, "MakeLevel is not MakeZen");
  var level = new Level({
    index: index,
    isSpawning: true,
    // maxVX is allowed to grow after there are no more splits.
    maxVX: sxi(15 + index),
    speedupFactor: 0.0001,
    isP1Player: true,
    isP2Player: !gSinglePlayer
  });
  return level;
}