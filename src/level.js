/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// see also: english in puck.js
const kEnglishStep = 0.004;

function MakeAttract() {
    return new Level({
        index: kAttractLevelIndex,
        isSpawning: false,
        maxVX: sxi(14),
        isP1Player: false,
        isP2Player: false,
    });
}

function MakeZen() {
    return new Level({
        index: kZenLevelIndex,
        isSpawning: true,
        maxVX: sxi(15),
        speedupFactor: 0.00001,
        isP1Player: true,
        isP2Player: !gSinglePlayer,
    });
}

function MakeLevel(gameMode, index, paddleP1, paddleP2) {
    Assert(index !== 0, "index is 1-based");
    Assert(gameMode !== kGameModeZen, "MakeLevel is not MakeZen, duh");
    const level = new Level({
        index,
        isSpawning: true,
        // maxVX is allowed to grow with speedupFactor
	// after there are no more splits.
        maxVX: sxi(15 + index),
        speedupFactor: 0.0001,
        isP1Player: true,
        isP2Player: !gSinglePlayer,
    });
    return level;
}

function MakeSplitsCount(index) {
    Assert(index !== 0, "index is 1-based");
    // note: this is just a big bad random swag.
    var count = 400 + index * 50;
    // zen has one level, and it is without any zero-energy-based ending.
    return ForGameMode(count, count, undefined);
}

function ChoosePillIDs(index) {
    let pids = [];
    const i0 = index-1;
    // only levels 2+ have pills.
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

/*class*/ function Level(props) {

    var self = this;

    self.Init = function() {
        self.startTime = gGameTime;

        self.index = props.index;
	self.isAttract = self.index === kAttractLevelIndex;
	self.isZen = self.index === kZenLevelIndex;

        // note: some of these are allowed to be undefined,
        // ie for attract mode level. although it is sort of ugly
        // and dangerous that way, vs. an explicit isAttract bool?
        // coding is hard please let me just go online shopping.

        self.maxVX = props.maxVX;
	Assert(!isBadNumber(self.maxVX));

        self.speedupFactor = props.speedupFactor;
        self.englishFactorPlayer = 1;
        self.englishFactorCPU = 1;

        self.splitsCount = MakeSplitsCount(self.index);
        self.isSpawning = props.isSpawning;

        // I think the ensuing code indicates the Paddle should perhaps
        // at least be split up into human & ai variants. :-\ ...so confused.
        // warning: this setup is easily confusing wrt left vs. right.
        var lp = { x: gXInset, y: gh(0.5) };
        var rp = { x: gWidth-gXInset-gPaddleWidth, y: gh(0.5) };

        // only show paddle labels for zen and level 1.
        var [p1label, p2label] = (self.isZen || self.index === 1) ? ["P1", "P2"] : [undefined, undefined];

        ForSide(gP1Side,
                () => {
                    // p1 is always a human player.
                    // p2 is either cpu or human.
                    self.paddleP1 = new Paddle({
                        isPlayer: !self.isAttract,
                        side: "left",
                        x: lp.x, y: lp.y,
                        width: gPaddleWidth, height: gPaddleHeight,
                        label: p1label,
                        isSplitter: !self.isAttract,
                        keyStates: gSinglePlayer ? [gP1Keys, gP2Keys] : [gP1Keys],
                        buttonState: gGamepad1Buttons,
                        stickState: gGamepad1Sticks,
                        target: gP1Target,
                    });
                    self.paddleP2 = new Paddle({
                        isPlayer: !self.isAttract && !gSinglePlayer,
                        side: "right",
                        x: rp.x, y: rp.y,
                        width: gPaddleWidth, height: gPaddleHeight,
                        label: p2label,
                        isSplitter: !self.isAttract,
                        isPillSeeker: true,
                        keyStates: gSinglePlayer ? [gPNoneKeys] : [gP2Keys],
                        buttonState: gGamepad2Buttons,
                        stickState: gGamepad2Sticks,
                        target: gP2Target,
                    });
                },
                () => {
                    self.paddleP1 = new Paddle({
                        isPlayer: !self.isAttract,
                        side: "right",
                        x: rp.x, y: rp.y,
                        width: gPaddleWidth, height: gPaddleHeight,
                        label: p1label,
                        isSplitter: !self.isAttract,
                        keyStates: gSinglePlayer ? [gP1Keys, gP2Keys] : [gP1Keys],
                        buttonState: gGamepad1Buttons,
                        stickState: gGamepad1Sticks,
                        target: gP1Target,
                    });
                    self.paddleP2 = new Paddle({
                        isPlayer: !self.isAttract && !gSinglePlayer,
                        side: "left",
                        x: lp.x, y: lp.y,
                        width: gPaddleWidth, height: gPaddleHeight,
                        label: p2label,
                        isSplitter: !self.isAttract,
                        isPillSeeker: true,
                        keyStates: gSinglePlayer ? [gPNoneKeys] : [gP2Keys],
                        buttonState: gGamepad2Buttons,
                        stickState: gGamepad2Sticks,
                        target: gP2Target,
                    });
                }
               )();

        self.pills = ChoosePillIDs(self.index),
        self.p1Powerups = new Powerups({
            isPlayer: props.isP1Player,
            paddle: self.paddleP1,
            side: ForSide(gP1Side, "left", "right"),
            specs: self.pills
        });
        self.p1Pill = undefined;

        self.p2Powerups = new Powerups({
            isPlayer: props.isP2Player,
            paddle: self.paddleP2,
            side: ForSide(gP1Side, "right", "left"),
            specs: self.pills
        });
        self.p2Pill = undefined;
    };

    self.OnPuckSplits = function(splits) {
	var count = splits?.length ?? 0;
        if (self.isSpawning) {
            Assert(count <= 1, count);
            if (count > 0 && exists(self.splitsCount)) {
                self.splitsCount = Math.max(0, self.splitsCount - count);
                self.isSpawning = self.splitsCount > 0;
            }
        }
    };

    self.Step = function( dt ) {
        self.paddleP1.Step( dt, self );
        self.paddleP2.Step( dt, self );

        if (!self.isSpawning && exists(self.speedupFactor)) {
            // allow future spawned pucks to go faster, up to a hard limit.
            self.maxVX = MinSigned(
                self.maxVX + self.speedupFactor * dt / kTimeStep,
                kMaxVX
            );

            // heuristic: go even more crazy on the english at the very end of the level.
            var englishBoost = (gPucks.A.length < 5) ? 10 : 1;
            // english gets more crazy over time, even more so for the player.
            self.englishFactorPlayer += (dt / kTimeStep) * kEnglishStep * englishBoost;
            // the cpu doesn't get as much english because if they are the
            // first one to hit a puck with a lot of english it looks like cheating.
            self.englishFactorCPU += (dt / kTimeStep) * kEnglishStep;
            
            self.paddleP1.englishFactor = self.paddleP1.isPlayer ? self.englishFactorPlayer : self.englishFactorCPU;
            self.paddleP2.englishFactor = self.paddleP2.isPlayer ? self.englishFactorPlayer : self.englishFactorCPU;

            // logOnDelta("+maxVX", F(self.maxVX), 1, F(kMaxVX));
            // logOnDelta("+englishFactorPlayer", F(self.englishFactorPlayer), 0.1);
            // logOnDelta("+englishFactorCPU", F(self.englishFactorCPU), 0.1);
        }
    };

    self.IsLastOfThePucks = function() {
        return exists(self.splitsCount) && self.splitsCount <= 200;
    };

    self.IsSuddenDeath = function() {
        return exists(self.splitsCount) && self.splitsCount <= 0;
    };

    self.Draw = function({ alpha, isEndScreenshot }) {
        if (!isEndScreenshot) {
            self.DrawPills( alpha );
            self.DrawNoMorePucks();
            // todo: you'd maybe kind of expect lots of
            // other things like paddles and pucks to be
            // drawn by the level too, huh? ...
        }
    };

    self.DrawPills = function( alpha ) {
        if (exists(self.p1Pill)) {
            self.DrawPill(alpha, self.p1Pill, gP1Side, RandomMagenta(alpha));
        }
        if (exists(self.p2Pill)) {
            self.DrawPill(alpha, self.p2Pill, OtherSide(gP1Side), RandomGrey(alpha));
        }
    };

    self.DrawNoMorePucks = function() {
        if (self.isAttract) {
            return;
        }

        // todo: not actually sure how best to represent this to players in the ui. :-\
        var msg = undefined;
        if (self.IsLastOfThePucks()) {
            msg = `ZERO POINT ENERGY: ${self.splitsCount}`;
        }            
        if (self.IsSuddenDeath()) {
            msg = "EL FIN";
        }
        if (exists(msg)) {
            Cxdo(() => {
                // remove dotted center line.
                gCx.fillStyle = backgroundColorStr;
                var cx = gw(0.5);
                var cy = gh(0.9);
                var ox = sx(65);
                var oy = sy(13);
                gCx.fillRect(cx-ox, cy-oy*1.45, ox*2, oy*2);

                gCx.fillStyle = RandomCyan(0.8);
                DrawText(msg,
                         "center",
                         cx, cy,
                         gSmallFontSizePt);
            });
        }
    };

    self.DrawPill = function( alpha, pill, side, color ) {
        pill.Draw( alpha );
        Cxdo(() => {
            gCx.fillStyle = color;
            var msg = `${pill.name.toUpperCase()} ${ii(pill.lifespan/1000)}`;
            var x = ForSide(side, gw(0.25), gw(0.75));
            DrawText(msg, "center", x, gPillTextY, gSmallFontSizePt);
        });
    };

    self.Init();
}
