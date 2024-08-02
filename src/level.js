/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// see also: english in puck.js
const kEnglishStep = 0.004;

/*class*/ function Level(props) {

    var self = this;

    self.Init = function() {
        self.isAttract = props.isAttract;
        self.startTime = gGameTime;

        // could be kAttractLevelIndex.
        self.index = props.index;

        // note: some of these are allowed to be undefined,
        // ie for attract mode level. although it is sort of ugly
        // and dangerous that way, vs. an explicit isAttract bool?
        // coding is hard please let me just go online shopping.

        self.maxVX = props.maxVX;

        self.speedupFactor = props.speedupFactor;
        self.englishFactorPlayer = 1;
        self.englishFactorCPU = 1;

        self.initPuckCount = props.puckCount;
        self.puckCount = props.puckCount;
        self.isSpawning = exists(self.puckCount);

        // todo: maybe GameState shouldn't own the paddles.
        self.paddleP1 = props.paddleP1;
        self.paddleP2 = props.paddleP2;

        self.pills = props.pills;
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

    self.OnPuckSplit = function(count) {
        if (self.isSpawning && count > 0) {
            Assert(exists(self.puckCount));
            self.puckCount = Math.max(0, self.puckCount - count);
            self.isSpawning = self.puckCount > 0;
        }
    };

    self.Step = function( dt ) {
        if (!self.isSpawning && exists(self.speedupFactor)) {
            // allow pucks to go faster, up to a hard limit.
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

            logOnDelta("+maxVX", F(self.maxVX), 1, F(kMaxVX));
            logOnDelta("+englishFactorPlayer", F(self.englishFactorPlayer), 0.1);
            logOnDelta("+englishFactorCPU", F(self.englishFactorCPU), 0.1);
        }
    };

    self.IsLastOfThePucks = function() {
        return exists(self.initPuckCount) &&
            exists(self.puckCount) &&
            self.puckCount <= 201;
    };

    self.IsSuddenDeath = function() {
        return exists(self.puckCount) && self.puckCount <= 0;
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
            msg = `${self.puckCount} SPLITS REMAIN`;
        }            
        if (self.IsSuddenDeath()) {
            msg = "EL FIN";
        }
        if (exists(msg)) {
            Cxdo(() => {
                gCx.fillStyle = backgroundColorStr;
                var cx = gw(0.5);
                var cy = gh(0.9);
                var ox = sx(65);
                var oy = sy(13);
                gCx.fillRect(cx-ox, cy-oy*1.45, ox*2, oy*2);
                gCx.fillStyle = RandomGreen(0.8);
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
