/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// note: each powerup must have a unique pill,
// and the actual "powerup" is usually
// done via (ideally a unique) animation.

// note: look at the Make*Props() functions below
// to see what-all fields need to be defined i.e.
// (the business about ForSide and paddle references is wugly.)
/* {
   name,
   width, height,
   lifespan,
   isUrgent,
   testFn: (gameState) => {},
   drawFn: (self, alpha) => {},
   boomFn: (gameState) => {},
   endFn: () => {},
   }
*/

/* misc ideas:
   see the future
   xtra
   slowmo
   suction-blow
   magnasave
   bigger bar
   smaller bar
   swap sides
   autoplay
   cute animal catching
   bombs
*/

// needs to be longish so the cpu has any chance of getting it.
var kPillLifespan = 1000 * 20;

// just am enum, not array indices.
const kForcePushPill = 0;
const kDecimatePill = 1;
const kEngorgePill = 2;
const kSplitPill = 3;
const kDefendPill = 4;
const kXtraPill = 5;
const kNeoPill = 6;
const kChaosPill = 7;

// note: order matters.
const gPillIDs = [
    kForcePushPill,
    kDecimatePill,
    kEngorgePill,
    kChaosPill,
    kDefendPill,
    kSplitPill,
    kXtraPill,
    kNeoPill,
];

// note:
// 1) width and height are functions
// because they need to be evaluated after
// all the display resizing is done.
// see: width and height in GetReadyState.DrawPills().
// 2) keep the names short, to avoid overlapping
// on the Get Ready screen.
var gPillInfo = {
    [kForcePushPill]: {
        name: "PUSH",
        maker: MakeForcePushProps,
        drawer: DrawForcePushPill,
        wfn: () => sxi(20), hfn: () => syi(20),
    },
    [kDecimatePill]: {
        name: "KILL",
	maker: MakeDecimateProps,
        drawer: DrawDecimatePill,
        wfn: () => sxi(20), hfn: () => syi(20),
    },
    [kEngorgePill]: {
        name: "PHAT",
	maker: MakeEngorgeProps,
        drawer: DrawEngorgePill,
        wfn: () => sxi(20), hfn: () => syi(35),
    },
    [kSplitPill]: {
        name: "ZPLT",
	maker: MakeSplitProps,
        drawer: DrawSplitPill,
        wfn: () => sxi(20), hfn: () => syi(20),
    },
    [kDefendPill]: {
        name: "SHLD",
	maker: MakeDefendProps,
        drawer: DrawDefendPill,
        wfn: () => sxi(20), hfn: () => syi(40),
    },
    [kXtraPill]: {
        name: "XTRA",
	maker: MakeXtraProps,
        drawer: DrawXtraPill,
        wfn: () => sxi(15), hfn: () => syi(40),
    },
    [kNeoPill]: {
        name: "NEO",
	maker: MakeNeoProps,
        drawer: DrawNeoPill,
        wfn: () => sxi(20), hfn: () => syi(20),
    },
    [kChaosPill]: {
        name: "WILD",
	maker: MakeChaosProps,
        drawer: DrawChaosPill,
        wfn: () => sxi(20), hfn: () => syi(20),
    },
};
Assert(gPillInfo);

// cycle through the powerups in order
// so we have some control over when they
// are presented in the course of the game.
/*class*/ function Powerups( props ) {

    var self = this;

    self.Init = function() {
        self.isPlayer = props.isPlayer;
        self.side = props.side;
        self.paddle = props.paddle;
        self.pillState = props.pillState;
    };

    self.MakeRandomPill = function(gameState) {
        var propsBase = self.NextPropsBase(gameState);
        if (exists(propsBase)) {
            // todo: meh, pills can have different lifespans, but currently they are all the same.
            Assert(exists(propsBase.lifespan), "lifespan");
	    // spawn on the vertically opposite side from the player, to make it more noticeable.
            var yTop = gh(0.1);
	    var yBottom = gh(0.9) - propsBase.height;
	    var y = self.paddle.GetMidY() > gh(0.5) ? yTop : yBottom;
            var props = {
                ...propsBase,
                name: propsBase.name,
                x: ForSide(self.side, gw(0.35), gw(0.65)),
                y,
                vx: ForSide(self.side, -1,1) * sx(3),
                vy: gR.RandomCentered(0, 2, 0.5),
            };
            return new Pill(props);
        }
        return undefined;
    };

    self.NextPropsBase = function(gameState) {
        if (self.pillState.deck.length === 0) {
            return undefined;
        }

        // keep looping through the pills. also keeps the 
        // state across levels so you aren't retreading.
        var pid = self.pillState.deck.shift();
        self.pillState.deck.push(pid);

        var info = gPillInfo[pid];
        var maker = info.maker;
        Assert(exists(maker));
        Assert(typeof maker == "function", `maker()? ${info.name} ${self.pillState} ${typeof maker}`);

        var spec = maker(self);
        Assert(exists(spec), `wtf maker? ${info.name}`);

        if (!spec.testFn(gameState)) {
	    spec = undefined;
        }

        return spec;
    };

    self.Init();
};

// ----------------------------------------

function DrawForcePushPill(side, xywh, alpha) {
    var img = gImageCache[ForSide(side, "forcepushL", "forcepushR")];
    Cxdo(() => {
        var wx = WX(xywh.x);
        var wy = WY(xywh.y);
        gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
        var mx = wx + xywh.width/2;
        var my = wy + xywh.height/2;
        gCx.beginPath();
        gCx.arc(mx, my, xywh.width/2 + sx1(1), 0, k2Pi);
        gCx.closePath();
        gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
        gCx.lineWidth = sx1(1);
        gCx.stroke();
    });
}

function DrawDecimatePill(side, xywh, alpha) {
    var img = gImageCache["decimate"];
    Cxdo(() => {
        var wx = WX(xywh.x);
        var wy = WY(xywh.y);
        gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
        var mx = wx + ii(xywh.width/2);
        var my = wy + ii(xywh.height/2);
        gCx.beginPath();
        gCx.moveTo(mx, wy);
        gCx.lineTo(wx + xywh.width, my);
        gCx.lineTo(mx, wy + xywh.height);
        gCx.lineTo(wx, my);
        gCx.closePath();
        gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
        gCx.lineWidth = sx1(1);
        gCx.stroke();
    });
}

function DrawEngorgePill(side, xywh, alpha) {
    var img = gImageCache["engorge"];
    Cxdo(() => {
        var wx = WX(xywh.x);
        var wy = WY(xywh.y);
        gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
        gCx.beginPath();
        gCx.rect( wx, wy, xywh.width, xywh.height );
        gCx.lineWidth = sx1(1);
        gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
        gCx.stroke();
    });
}

function DrawSplitPill(side, xywh, alpha) {
    var img = gImageCache["split"];
    Cxdo(() => {
        var wx = WX(xywh.x);
        var wy = WY(xywh.y);
        gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
        gCx.beginPath();
        gCx.RoundRect(wx, wy, xywh.width, xywh.height, 10);
        gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
        gCx.lineWidth = sx1(1);
        gCx.stroke();
    });
}

function DrawDefendPill(side, xywh, alpha) {
    var img = gImageCache["defend"];
    Cxdo(() => {
        var wx = WX(xywh.x);
        var wy = WY(xywh.y);
        gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
        gCx.beginPath();
        gCx.RoundRect(wx, wy, xywh.width, xywh.height, 14);
        gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
        gCx.lineWidth = sx1(1);
        gCx.stroke();
    });
}

function DrawXtraPill(side, xywh, alpha) {
    var img = gImageCache["xtra"];
    Cxdo(() => {
        var wx = WX(xywh.x);
        var wy = WY(xywh.y);
        gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
        gCx.beginPath();
        gCx.RoundRect(wx, wy, xywh.width, xywh.height, 14);
        gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
        gCx.lineWidth = sx1(1);
        gCx.stroke();
    });
}

function DrawNeoPill(side, xywh, alpha) {
    var img = gImageCache["neo"];
    Cxdo(() => {
        var wx = WX(xywh.x);
        var wy = WY(xywh.y);
        var mx = wx + ii(xywh.width/2);
        var my = wy + ii(xywh.height/2);
        gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
        gCx.beginPath();
        gCx.moveTo(mx, wy);
        gCx.lineTo(wx + xywh.width, my);
        gCx.lineTo(mx, wy + xywh.height);
        gCx.lineTo(wx, my);
        gCx.closePath();
        gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
        gCx.lineWidth = sx1(1);
        gCx.stroke();
    });
}

function DrawChaosPill(side, xywh, alpha) {
    var img = gImageCache["chaos"];
    Cxdo(() => {
        // make it randomly resizing to look more chaotic.
        var o = gR.RandomRange(1, sx1(4));
        var wx = WX(xywh.x)-o;
        var wy = WY(xywh.y)-o;
        var ww = xywh.width + o*2;
        var wh = xywh.height + o*2;
        gCx.drawImage(img, wx, wy, ww, wh);
        var mx = wx + ww/2;
        var my = wy + wh/2;
        gCx.beginPath();
        gCx.arc(mx, my, ww/2, 0, k2Pi);
        gCx.closePath();
        gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
        gCx.lineWidth = sx1(1);
        gCx.stroke();
    });
}

// ----------------------------------------

function MakeForcePushProps(context) {
    var { name, wfn, hfn } = gPillInfo[kForcePushPill];
    var width = wfn();
    var height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        testFn: (gameState) => {
            return (gDebug || gPucks.A.length > 5) &&
		isU(context.paddle.neo);
        },
        drawFn: (self, alpha=1) => DrawForcePushPill(context.side, self, alpha),
        boomFn: (gameState) => {
            PlayPowerupBoom();
            var targetSign = ForSide(context.side, -1, 1);
            gPucks.A.forEach(p => {
                if (Sign(p.vx) == targetSign) {
                    p.vx *= -1;
                }
		else {
		    p.vx = MinSigned(p.vx*1.15, gameState.maxVX);
		}
            });
            gameState.AddAnimation(MakeWaveAnimation({
                lifespan: 250,
                side: context.side,
                paddle: context.paddle,
            }));
        },
    };
}

function MakeDecimateProps(context) {
    var { name, wfn, hfn } = gPillInfo[kDecimatePill];
    var width = wfn();
    var height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        testFn: (gameState) => {
            // looks unfun if there aren't enough pucks to destroy.
	    // by the time the powerup is activated there might be even less.
	    // e.g. consider that the other player might also be doing their decimate.
            return gDebug || gPucks.A.length > 30;
        },
        drawFn: (self, alpha=1) => DrawDecimatePill(context.side, self, alpha),
        boomFn: (gameState) => {
            // try to destroy at least 1, but leave at least enough alive to avoid(ish) game over.
	    var minSaved = 3;
	    if (gPucks.A.length > minSaved) {
		var count = Clip(gPucks.A.length - minSaved, 0, 20);
		if (count > 0) {
                    PlayPowerupBoom();
                    var targets = gPucks.A
			.map((p) => { return {d:Math.abs(p.x - context.paddle.x), p}; })
			.filter((e) => { return e.d > gPaddleWidth * 3; })
			.sort((a,b) => { return a.d - b.d; })
			.slice(0, count)
			.map((e) => { return e.p; });
                    Assert(targets.length < gPucks.A.length);
		    console.log("targets", targets.length);
		    if (targets.length === 0 && gPucks.A.length > 1) {
			targets = gPucks.A.slice(0, 1);
			console.log("targets'", targets.length);
		    }
                    targets.forEach(p => {
			p.alive = false;
			AddSparks({
			    x:p.x, y:p.y,
			    vx:p.vx/3, vy:p.vy*3,
			    count:10,
			    rx:sx(1), ry:sy(1),
			    colorSpec: whiteSpec
			});
                    });
                    gameState.AddAnimation(MakeTargetsLightningAnimation({
			lifespan: 200,
			targets,
			paddle: context.paddle,
                    }));
		}
            }
        },
    };
}

function MakeEngorgeProps(context) {
    var { name, wfn, hfn } = gPillInfo[kEngorgePill];
    var width = wfn();
    var height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        isUrgent: true,
        testFn: (gameState) => {
            return !context.paddle.engorged;
        },
        drawFn: (self, alpha=1) => DrawEngorgePill(context.side, self, alpha),
        boomFn: (gameState) => {
            PlayPowerupBoom();
            gameState.AddAnimation(MakeEngorgeAnimation({
                lifespan: 1000 * 12,
                paddle: context.paddle,
            }));
        },
    };
};

function MakeSplitProps(context) {
    var { name, wfn, hfn } = gPillInfo[kSplitPill];
    var width = wfn();
    var height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        testFn: (gameState) => {
            return true;
        },
        drawFn: (self, alpha=1) => DrawSplitPill(context.side, self, alpha),
        boomFn: (gameState) => {
            var r = 10/gPucks.A.length;
            var targets = gPucks.A.filter((p, i) => {
                return i < 1 ? true : gR.RandomBool(r);
            });
            targets.forEach(t => {
                var maxVX = gameState.level.maxVX;
                var split = t.MaybeSplitPuck({ forced: true, maxVX });
                gameState.level.OnPuckSplits(1);
                var p = gPuckPool.Alloc();
		if (exists(p)) {
                    p.PlacementInit(split);
                    gPucks.A.push(p);
		}
            });
            gameState.AddAnimation(MakeSplitAnimation({
                lifespan: 250,
                targets,
                side: context.side,
                paddle: context.paddle,
            }));
        },
    };
}

function MakeDefendProps(context) {
    var { name, wfn, hfn } = gPillInfo[kDefendPill];
    var width = wfn();
    var height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        isUrgent: true,
        testFn: (gameState) => {
            // todo: there is a bug here that let one paddle
            // have 2 defend powerups active at the same time wtf.
            return (gDebug || gameState.level.IsMidGame()) &&
                (gDebug || gPucks.A.length > 10) &&
                context.paddle.barriers.A.length == 0;
        },
        drawFn: (self, alpha=1) => DrawDefendPill(context.side, self, alpha),
        boomFn: (gameState) => {
            PlayPowerupBoom();
            var n = 4; // match: kBarriersArrayInitialSize.
            // zen is more crazy so upping the hp and thus also scaling drawing so they aren't too wide.
            var pc = T01(gPucks.A.length, kPuckPoolSize);
            var hp = ForGameMode({
                regular: 50,
                hard: 70,
                zen: 50 + (pc*100),
                z2p: 50,
            });
            console.log(`defend pc=${pc} hp=${F(hp)}`);
	    var drawScale = ForGameMode({ regular: 1, zen: 0.5 });
            var width = sx1(hp/3);
            var height = (gHeight-gYInset*2) / n;
            var x = gw(ForSide(context.side, 0.1, 0.9));
            var targets = [];
            for (var i = 0; i < n; ++i) {
                var y = gYInset + i * height;
                var xoff = xyNudge(y, height, 10, context.side);
                context.paddle.AddBarrier({
                    x: x+xoff, y,
                    width, height,
                    hp,
		    drawScale,
                    side: context.side,
                });
                targets.push({x: x+width/2, y: y+height/2});
            }
            gameState.AddAnimation(MakeTargetsLightningAnimation({
                lifespan: 150,
                targets,
                paddle: context.paddle,
		range: sx1(5),
            }));
        },
    };
}

function MakeXtraProps(context) {
    var { name, wfn, hfn } = gPillInfo[kXtraPill];
    var width = wfn();
    var height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        isUrgent: true,
        testFn: (gameState) => {
            return (gDebug || gameState.level.IsMidGame()) &&
                (gDebug || gPucks.A.length > 20) &&
                context.paddle.xtras.A.length == 0;
        },
        drawFn: (self, alpha=1) => DrawXtraPill(context.side, self, alpha),
        boomFn: (gameState) => {
            PlayPowerupBoom();
            var n = 6; // match: kXtrasArrayInitialSize.
            var yy = (gHeight-gYInset*2)/n;
            var width = gPaddleWidth*2/3;
            var height = Math.min(gPaddleHeight/2, yy/2);
            var pc = T01(gPucks.A.length, kPuckPoolSize);
            var hp = ForGameMode({
                regular: 30,
                hard: 50,
                zen: 50 + (pc*100),
                z2p: 50,
            });
            console.log(`xtra pc=${pc} hp=${F(hp)}`);
            ForCount(n, (i) => {
                var x = ForSide(context.side, gw(0.15), gw(0.85));
                var xoff = isEven(i) ? 0 : gw(0.02);
                var y = gYInset+yy*i;
                var yMin = y;
                var yMax = y+yy;
                context.paddle.AddXtra({
                    x: x+xoff, y,
                    yMin, yMax,
                    width, height,
                    hp,
                    stepSize: Math.max(1,(yMax-yMin)/10),
                });
            });
        },
    };
}

function MakeNeoProps(context) {
    var { name, wfn, hfn } = gPillInfo[kNeoPill];
    var width = wfn();
    var height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        isUrgent: true,
        testFn: (gameState) => {
            return (gDebug || gameState.level.IsMidGame()) &&
                (gDebug || gPucks.A.length > 20) &&
                isU(context.paddle.neo);
        },
        drawFn: (self, alpha=1) => DrawNeoPill(context.side, self, alpha),
        boomFn: (gameState) => {
            PlayPowerupBoom();
            context.paddle.AddNeo({
                x: ForSide(context.side, gw(0.4), gw(0.6)),
                normalX: ForSide(context.side, 1, -1),
                lifespan: 1000 * 4,
                side: context.side,
            });
        },
    };
}

function MakeChaosProps(context) {
    var { name, wfn, hfn } = gPillInfo[kChaosPill];
    var width = wfn();
    var height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        testFn: (gameState) => {
            return (gDebug || gPucks.A.length > 10) &&
		isU(context.paddle.neo);
        },
        drawFn: (self, alpha=1) => DrawChaosPill(context.side, self, alpha),
        boomFn: (gameState) => {
            PlayPowerupBoom();
            var targets = [];
            gPucks.A.forEach((p,i) => {
                if (isMultiple(i, 3)) {
                    p.vy *= -gR.RandomCentered(4, 2);
                    targets.push(p);
                }
            });
            gameState.AddAnimation(MakeChaosAnimation({
                targets
            }));
        },
    };
}
