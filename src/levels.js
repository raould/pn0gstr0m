/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// yes this is really hard to playtest.

// no, i am not proud of all the globals.
var gP1Pills;
var gP2Pills;
function ResetLevelsPills() {
    gP1Pills = { deck: [], remaining: [...gPillIDs] };
    gP2Pills = { deck: [], remaining: [...gPillIDs] };
}
ResetLevelsPills();
function PillIDsToMakers(pids) {
    return pids.map(pid => gPillInfo[pid].maker);
}

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
    return new Level({
        index: kZenLevelIndex,
        isSpawning: true, // but no limit on how many.
	vx0: sxi(2.5),
        maxVX: sxi(ForGameMode({zen: 18, z2p: 22})),
        isP1Player: true,
        isP2Player: !is1P(),
        p1Pills: PillIDsToMakers([...gPillIDs]),
        p2Pills: PillIDsToMakers([...gPillIDs]),
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
}

function MakeZ2P(paddleP1, paddleP2) {
    return new Level({
        index: kZenLevelIndex,
        isSpawning: true, // but no limit on how many.
	vx0: sxi(2.5),
        maxVX: sxi(ForGameMode({zen: 18, z2p: 22})),
        isP1Player: true,
        isP2Player: !is1P(),
        p1Pills: PillIDsToMakers([...gPillIDs]),
        p2Pills: PillIDsToMakers([...gPillIDs]),
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
}

// level is one-based.
// zen mode means only one level!
function MakeLevel(index, paddleP1, paddleP2) {
    Assert(index > 0, "index is 1-based");
    const splitsCount = MakeSplitsCount(index);
    const level = new Level({
        index,
        isSpawning: true,
	vx0: sxi(ForGameMode({regular: 2.5, hard: 3.5})),
        // maxVX is allowed to grow after there are no more splits.
        maxVX: sxi(12 + index),
        speedupFactor: 0.0001,
        splitsCount,
        isP1Player: true,
        isP2Player: !is1P(),
        p1Pills: PillIDsToMakers(gP1Pills.deck),
        p2Pills: PillIDsToMakers(gP2Pills.deck),
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

function ChooseRewards(state) {
    var rewards = state.remaining.splice(0, Math.min(2, state.remaining.length));
    console.log("ChooseRewards", rewards);
    return rewards;
}
