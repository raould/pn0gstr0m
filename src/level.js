/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

const kEnglishStep = 0.002;

/*class*/ function Level(props) {

    var self = this;

    self.Init = function() {
        self.index = props.index;

        // note: some of these are allowed to be undefined,
        // ie for attract mode level. although it is sort of ugly
        // and dangerous that way, vs. an explicit isAttract bool?
        // coding is hard please let me just go online shopping.
        self.maxVX0 = props.maxVX;
        self.maxVX = self.maxVX0;

        self.speedupTimeout = props.speedupTimeout;
        self.speedupFactor = props.speedupFactor;
        self.englishFactor = 1;

        self.puckCount = props.puckCount;
        self.spawning = exists(self.puckCount);

        self.pills = props.pills;
        self.p1Powerups = new Powerups({
            isPlayer: props.isP1Player,
            paddle: props.paddleP1,
            side: ForSide(gP1Side, "left", "right"),
            specs: self.pills
        });
        self.p1Pill = undefined;

        self.p2Powerups = new Powerups({
            isPlayer: props.isP2Player,
            paddle: props.paddleP2,
            side: ForSide(gP1Side, "right", "left"),
            specs: self.pills
        });
        self.p2Pill = undefined;
    };

    self.OnPuckSplit = function(count) {
        if (self.spawning && count > 0) {
            Assert(exists(self.puckCount));
            self.puckCount = Math.max(0, self.puckCount - count);
            self.spawning = self.puckCount > 0;
            console.log(self.puckCount, self.spawning);

            // speed up toward the (inevitable?) end!
            if (!self.spawning) {
                self.speedupTimeout = 0;
            }
        }
    };

    self.Step = function( dt ) {
        if (exists(self.speedupTimeout)) {
            Assert(exists(self.speedupFactor));
            Assert(exists(self.englishFactor));
            self.speedupTimeout = Math.max(0, self.speedupTimeout-dt);
            if (self.speedupTimeout === 0) {
                self.maxVX = MinSigned(
                    self.maxVX + self.speedupFactor * dt / kTimeStep,
                    kMaxVX
                );
                self.englishFactor += dt / kTimeStep * kEnglishStep;
                logOnDelta("maxVX", F(self.maxVX), 1);
                logOnDelta("englishFactor", F(self.englishFactor), 0.1);
            }
        }
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
        // todo: not actually sure how best to represent this to players in the ui. :-\
        if (self.IsSuddenDeath()) {
            Cxdo(() => {
                gCx.fillStyle = backgroundColorStr;
                var cx = gw(0.5);
                var cy = gh(0.9);
                var ox = sx(65);
                var oy = sy(13);
                gCx.fillRect(cx-ox, cy-oy*1.45, ox*2, oy*2);
                gCx.fillStyle = RandomGreen(0.8);
                DrawText("NO NEW PUCKS",
                         "center",
                         cx, cy,
                         gReducedFontSizePt);
            });
        }
    };

    self.DrawPill = function( alpha, pill, side, color ) {
        pill.Draw( alpha );
        Cxdo(() => {
            gCx.fillStyle = color;
            var msg = `${pill.name.toUpperCase()} ${ii(pill.lifespan/1000)}`;
            var x = ForSide(side, gw(0.25), gw(0.75));
            DrawText(msg, "center", x, gPillTextY, gSmallestFontSizePt);
        });
    };

    self.Init();
}
