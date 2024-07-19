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

const gLevelRandom = new Random(42);
const kAttractLevelIndex = -1;

const gPillMakers = [
    // levels are 1-based, and level 1 has no powerups.
    MakeForcePushProps, // level 2
    MakeDecimateProps,
    MakeEngorgeProps, // level 3
    MakeSplitProps,
    MakeDefendProps,// level 4
    MakeOptionProps,
    MakeNeoProps, // level 5
    MakeChaosProps,
];

function MakeAttract(paddleP1, paddleP2) {
    return new Level({
        index: kAttractLevelIndex,
        maxVX: sxi(14),
        speedupFactor: 0,
        speedupTimeout: undefined,
        puckCount: undefined,
        isP1Player: false,
        isP2Player: false,
        pills: [],
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
}

// level is one-based.
function MakeLevel(index, paddleP1, paddleP2) {
    Assert(index > 0, "index is 1-based");
    return new Level({
        index,
        maxVX: MinSigned(sxi(12 + index*2), kMaxVX/2),
        speedupTimeout: 1000 * 60 * 1,
        speedupFactor: 0.01,
        puckCount: MakePuckCount(index),
        isP1Player: true,
        isP2Player: !gSinglePlayer,
        pills: MakePills(index),
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
}

function MakePuckCount(index) {
    Assert(index > 0, "index is 1-based");
    // note: this is just a big swag.
    return 300 + (index-1) * 300;
}

function MakePills(index) {
    Assert(index != kAttractLevelIndex);

    const lv0 = index - 1;
    let pills = [];

    // skip the very first level, it has no powerups.
    if (lv0 > 0) {

        // the first n levels get 2 pills in order.
        if (lv0*2 <= gPillMakers.length-2) {
            let i = (lv0-1)*2;
            pills = gPillMakers.slice(i, i+2);
            console.log("MakePills2x", index, pills);
            Assert(pills.length == 2);
        }

        // after those first n levels, the pills are random.
        else {
            const a = [...gPillMakers];
            var p0 = a.splice(
                gLevelRandom.RandomRange(0, a.length-1),
                1
            );
            const p1 = a.slice(
                gLevelRandom.RandomRange(0, a.length-1),
                1
            );
            Assert(exists(p0));
            Assert(exists(p1));
            Assert(p0 != p1);
            Assert(p0.length == 1);
            Assert(p1.length == 1);
            pills = [p0[0], p1[0]];
            console.log("MakePillsRandom", index, pills);
        }
        Assert(pills.length > 0, "Pills");
    }

    console.log("Pills", index, pills);
    return pills;
}
