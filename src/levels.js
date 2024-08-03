/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// yes this is really hard to playtest.

const kAttractLevelIndex = -1;

function MakeAttract(paddleP1, paddleP2) {
    return new Level({
        index: kAttractLevelIndex,
        isAttract: true,
        maxVX: sxi(14),
        splitsCount: undefined,
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
        isAttract: false,
        // maxVX is allowed to grow after there are no more splits.
        maxVX: sxi(12 + index),
        speedupFactor: 0.0001,
        splitsCount: MakeSplitsCount(index),
        isP1Player: true,
        isP2Player: !gSinglePlayer,
        pills: pillMakers,
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
    return level;
}

function MakeSplitsCount(index) {
    Assert(index > 0, "index is 1-based");
    // note: this is just a big bad random swag.
    return 400 + index * 50;
}

let gChosenPillIDsCache;
function ChoosePillIDs(index) {
    Assert(index != kAttractLevelIndex);
    const i0 = index - 1;

    if (gChosenPillIDsCache?.index === index) {
        return gChosenPillIDsCache?.pids;
    }

    const pids = ChoosePillIDsUncached(index);

    console.log("Pids", index, pids);
    gChosenPillIDsCache = { index, pids };
    return pids;
}

function ChoosePillIDsUncached(index) {
    let pids = [];
    const i0 = index-1;

    // attract and first level have no pills.
    if (i0 > 0) {

        // the first n levels get 2 pills in order.
        if (i0 <= gPillIDs.length/2) {
            Assert(i0 > 0, "attract and level 1 should not have pills", index);
            const i = (i0-1)*2;
            pids = gPillIDs.slice(i, i+2);
            console.log("ChoosePillIDsUncached by 2", index, pids, pids.map(i => gPillInfo[i]?.name));
            Assert(pids.length === 2);
        }

        // after those first n levels, 4 random pills per level.
        // todo: make the 4 feel more random level to level,
        // they seem to repeat too easily.
        else {
            const r = new Random(index);
            const p = [...gPillIDs];
            pids = [
                p.splice(r.RandomRangeInt(0, p.length-1), 1)[0],
                p.splice(r.RandomRangeInt(0, p.length-1), 1)[0],
                p.splice(r.RandomRangeInt(0, p.length-1), 1)[0],
                p.splice(r.RandomRangeInt(0, p.length-1), 1)[0],
            ];
            console.log("ChoosePillIDsUncached random 4", index, pids, pids.map(i => gPillInfo[i]?.name));
            Assert(pids.length === 4);
        }
        Assert(pids.length > 0);
    }

    return pids;
}
