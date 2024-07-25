/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// yes this is really hard to playtest.
// note: it is *hard coded* below that there are
// (0 or) exactly 2 types of powerup per level.

const gLevelRandom = new Random(42);
const kAttractLevelIndex = -1;

function MakeAttract(paddleP1, paddleP2) {
    return new Level({
        index: kAttractLevelIndex,
        maxVX: sxi(14),
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
    const pillMakers = ChoosePillIDs(index).map(pid => gPillInfo[pid].maker);
    const level = new Level({
        index,
        // maxVX is allowed to grow after there are no more splits.
        maxVX: sxi(12 + index),
        speedupFactor: 0.0001,
        puckCount: MakePuckCount(index),
        isP1Player: true,
        isP2Player: !gSinglePlayer,
        pills: pillMakers,
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
    console.log("level", index, level);
    return level;
}

function MakePuckCount(index) {
    Assert(index > 0, "index is 1-based");
    // note: this is just a big swag.
    return 250 + (index-1) * 300;
}

function ChoosePillIDs(index) {
    Assert(index != kAttractLevelIndex);
    const lv0 = index - 1;
    let pids = [];

    // skip the very first level, it has no powerups.
    if (lv0 > 0) {

        // the first n levels get 2 pills in order.
        if (lv0*2 <= gPillIDs.length-2) {
            const i = (lv0-1)*2;
            pids = gPillIDs.slice(i, i+2);
            console.log("ChoosePillIDs by 2", index, pids);
            Assert(pids.length == 2);
        }

        // after those first n levels, the pills are random.
        else {
            const a = [...gPillIDs];
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
            pids = [p0[0], p1[0]];
            console.log("ChoosePillIDs Random", index, pids);
        }
        Assert(pids.length > 0);
    }

    console.log("Pids", index, pids);
    return pids;
}
