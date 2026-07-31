/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// yes this is really hard to playtest.

// no, i am not proud of all the globals.
var gP1PillState;
var gP2PillState;
function ResetLevelsPillStates() {
    // production values:
    gP1PillState = { deck: [], remaining: [...gPillIDs] };
    gP2PillState = { deck: [], remaining: [...gPillIDs] };
    // testing values:
    //    gP1PillState = { deck: gPillIDs.slice(0,count), remaining: gPillIDs.slice(count,count+1) };
    //    gP2PillState = { deck: gPillIDs.slice(0,count), remaining: gPillIDs.slice(count,count+1) };
    //    gP1PillState = { deck: [...gPillIDs].reverse(), remaining: [] };
    //    gP2PillState = { deck: [...gPillIDs].reverse(), remaining: [] };
    console.log("gP1PillState", gP1PillState);
    console.log("gP2PillState", gP2PillState);
}
ResetLevelsPillStates();
function PillIDsToMakers(pids) {
    return pids.map(pid => gPillInfo[pid].maker);
}
function MakeAllPillState() {
    return { deck: [...gPillIDs], remaining: [] };
}
function MakeNoPillState() {
    return { deck: [], remaining: [] };
}

function MakeAttract(paddleP1, paddleP2) {
    return new Level({
        index: 0,
        isAttract: true,
        isSpawning: false,
        splitsCount: undefined, // no splits.
	vx0: sxi(3),
        maxVX: sxi(14),
        speedupFactor: undefined,
        isP1Player: false,
        isP2Player: false,
        p1PillState: MakeNoPillState(),
        p2PillState: MakeNoPillState(),
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
}

function MakeZen(paddleP1, paddleP2) {
    return new Level({
        index: kZenLevelIndex,
        isSpawning: true,
        splitsCount: undefined, // no limit on how many.
	vx0: sxi(2.5),
        maxVX: sxi(ForGameMode({zen: 18, pp: 22})),
        speedupFactor: undefined,
        isP1Player: true,
        isP2Player: !is1P(),
        p1PillState: MakeAllPillState(),
        p2PillState: MakeAllPillState(),
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
}

function MakePP(paddleP1, paddleP2) {
    return new Level({
        index: kZenLevelIndex,
        isSpawning: true,
        splitsCount: undefined, // no limit on how many.
	vx0: sxi(2.5),
        maxVX: sxi(ForGameMode({zen: 18, pp: 22})),
        speedupFactor: undefined,
        isP1Player: true,
        isP2Player: !is1P(),
        p1PillState: MakeAllPillState(),
        p2PillState: MakeAllPillState(),
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
}

// level is one-based.
// zen mode means only one level!
function MakeLevel(index, paddleP1, paddleP2) {
    Assert(index !== 0, "index is 1-based");
    const level = new Level({
        index,
        isSpawning: true,
        splitsCount: MakeSplitsCount(index),
	vx0: sx(
	    Clip(index*0.1, 0.1, 1) +
		ForGameMode({regular: 2.5, hard: 3.5})
	),
        // fyi maxVX is allowed to grow somewhat later when there are no more splits.
        maxVX: Math.min(sxi(12 + index), kMaxVX),
        speedupFactor: 0.0001,
	// should be less than what is in paddle. :-(
        englishFactorPlayer: 0.01,
        englishFactorCPU: 0.01,
        isP1Player: true,
        isP2Player: !is1P(),
        p1PillState: gP1PillState,
        p2PillState: gP2PillState,
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
    return level;
}

function MakeSplitsCount(index) { // see also: animations
    if (index === kZenLevelIndex) {
	return undefined;
    }
    else if (index === 1) {
	return kAppMode ? 150 : 100; // shorter in arcade mode.
    }
    else if (index > 1) {
	// note: this is just a big bad random swag.
	// at least need enough splits to let the powerups come out?!
	return 150 + (index * 150);
    }
    else {
	Assert(false, "splitsCount " + index);
	return 150;
    }
}

function ChooseRewards(state) {
    var rewards = state.remaining.splice(0, Math.min(2, state.remaining.length));
    console.log("ChooseRewards: rewards", rewards?.toString());
    return rewards;
}
