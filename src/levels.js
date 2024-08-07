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
        maxVX: sxi(14),
        isP1Player: false,
        isP2Player: false,
        pills: [],
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
}

function MakeZen(paddleP1, paddleP2) {
    const pills = ChoosePillIDs(kGameModeZen, kZenLevelIndex).map(pid => gPillInfo[pid].maker);
    return new Level({
        index: kZenLevelIndex,
        isSpawning: true,
        maxVX: sxi(15),
        speedupFactor: 0.00001,
        isP1Player: true,
        isP2Player: !gSinglePlayer,
        pills,
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
}

// level is one-based.
// zen mode means only one level!
function MakeLevel(gGameMode, index, paddleP1, paddleP2) {
    Assert(index !== 0, "index is 1-based");
    Assert(gGameMode !== kGameModeZen, "MakeLevel is not MakeZen");
    const splitsCount = MakeSplitsCount(index);
    const pills = ChoosePillIDs(gGameMode, index).map(pid => gPillInfo[pid].maker);
    const level = new Level({
        index,
        isSpawning: true,
        // maxVX is allowed to grow after there are no more splits.
        maxVX: sxi(15 + index),
        speedupFactor: 0.0001,
        splitsCount,
        isP1Player: true,
        isP2Player: !gSinglePlayer,
        pills,
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
    return level;
}

function MakeSplitsCount(gameMode, index) {
    Assert(index !== 0, "index is 1-based");
    // note: this is just a big bad random swag.
    var count = 400 + index * 50;
    // zen has one level, and it is without a zero-energy based ending.
    return ForGameMode(count, count, undefined);
}

let gChosenPillIDsCache;
function ChoosePillIDs(gameMode, index) {
    Assert(index != kAttractLevelIndex);
    if (gameMode === kGameModeZen) {
        return [...gPillIDs];
    }
    else {
	const i0 = index - 1;
	if (gChosenPillIDsCache?.index === index) {
            return gChosenPillIDsCache?.pids;
	}
	else {
	    const pids = ChoosePillIDsUncached(index);
	    console.log("Pids", index, pids);
	    gChosenPillIDsCache = { index, pids };
	    return pids;
	}
    }
    Assert(false);
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
