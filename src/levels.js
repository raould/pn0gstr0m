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
        paddleP2: paddleP2,
    });
}

function MakeZen(paddleP1, paddleP2) {
    const pills = ChoosePillIDs(kZenLevelIndex).map(pid => gPillInfo[pid].maker);
    return new Level({
        index: kZenLevelIndex,
        isSpawning: true, // but no limit on how many.
	vx0: sxi(2.5),
        maxVX: sxi(18),
        isP1Player: true,
        isP2Player: !gSinglePlayer,
        pills,
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
}

// level is one-based.
// zen mode means only one level!
function MakeLevel(index, paddleP1, paddleP2) {
    Assert(index > 0, "index is 1-based");
    const splitsCount = MakeSplitsCount(index);
    const pills = ChoosePillIDs(index).map(pid => gPillInfo[pid].maker);
    const level = new Level({
        index,
        isSpawning: true,
	vx0: sxi(ForGameMode(gSinglePlayer, gGameMode, {regular: 2.5, hard: 3.5})),
        // maxVX is allowed to grow after there are no more splits.
        maxVX: sxi(12 + index),
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

function MakeSplitsCount(index) {
    Assert(index !== 0, "index is 1-based");
    if (index === kAttractLevelIndex) {
	return 0;
    }
    else if (index === kZenLevelIndex) {
        return undefined;
    }
    else if (index === 1) {
	return 100;
    }
    else {
	// level 2 is 200.
	// note: this is just a big bad random swag.
	var extra = Math.max(0, index-2) * 50;
	return 200 + extra;
    }
}

let gChosenPillIDsCache;
function ChoosePillIDs(index) {
    return [    kDefendPill,
                kSplitPill,
           ];
    Assert(index != kAttractLevelIndex);

    if (index === kZenLevelIndex) {
        return [...gPillIDs];
    }

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
        // after those first n levels, for another n levels, 4 random pills per level.
        else if (i0 <= gPillIDs.length) {
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
	// after all that, dump in all powerups!
	else {
	    pids = [...gPillIDs];
	}
        Assert(pids.length > 0);
    }

    return pids;
}
