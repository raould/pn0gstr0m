/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// yes this is really hard to playtest.

// no, i am not proud of all the globals.
var gP1PillState;
var gP2PillState;
function ResetLevelsPillStates() {
    gP1PillState = { deck: [], remaining: [...gPillIDs] };
    gP2PillState = { deck: [], remaining: [...gPillIDs] };
//    gP1PillState = { deck: gPillIDs.slice(0,1), remaining: gPillIDs.slice(1) };
//    gP2PillState = { deck: gPillIDs.slice(0,1), remaining: gPillIDs.slice(1) };
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
        index: kAttractLevelIndex,
        isAttract: true,
        isSpawning: false,
        splitsCount: undefined, // no splits.
	vx0: sxi(3),
        maxVX: sxi(14),
        speedupFactor: undefined, // no english progression.
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
        maxVX: sxi(ForGameMode({zen: 18, z2p: 22})),
        speedupFactor: undefined, // no english progression.
        isP1Player: true,
        isP2Player: !is1P(),
        p1PillState: MakeAllPillState(),
        p2PillState: MakeAllPillState(),
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
}

function MakeZ2P(paddleP1, paddleP2) {
    return new Level({
        index: kZenLevelIndex,
        isSpawning: true,
        splitsCount: undefined, // no limit on how many.
	vx0: sxi(2.5),
        maxVX: sxi(ForGameMode({zen: 18, z2p: 22})),
        speedupFactor: undefined, // no english progression.
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
    Assert(index > 0, "index is 1-based");
    const level = new Level({
        index,
        isSpawning: true,
        splitsCount: MakeSplitsCount(index),
	vx0: sxi(ForGameMode({regular: 2.5, hard: 3.5})),
        // fyi maxVX is allowed to grow somewhat when there are no more splits.
        maxVX: sxi(12 + index),
        speedupFactor: 0.0001,
        isP1Player: true,
        isP2Player: !is1P(),
        p1PillState: gP1PillState,
        p2PillState: gP2PillState,
        paddleP1: paddleP1,
        paddleP2: paddleP2,
    });
    return level;
}

function MakeSplitsCount(index) {
    Assert(index !== 0, "index is 1-based");
    // todo: so ugly bad that the index overlaps with the game mode.
    if (index === kAttractLevelIndex) {
	return 0;
    }
    else if (index === kZenLevelIndex) {
        return undefined;
    }
    else if (index === 1) {
        return 150;
    }
    else {
	// note: this is just a big bad random swag.
        // at least need enough splits to let the powerups come out.
	return 150 + (index * 250);
    }
}

function ChooseRewards(state) {
    var rewards = state.remaining.splice(0, Math.min(2, state.remaining.length));
    console.log("ChooseRewards: rewards", rewards?.toString());
    return rewards;
}
