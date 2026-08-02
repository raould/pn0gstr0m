/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
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
const kPillLifespan = 1000 * 20;

// just am enum, not array indices.
const kForcePushPill = 0;
const kDecimatePill = 1;
const kEngorgePill = 2;
const kSplitPill = 3;
const kBarrierPill = 4;
const kXtraPill = 5;
const kNeoPill = 6;
const kWildPill = 7;
const kYarsPill = 8;
const kWallPill = 9;

// note: order matters, this is the
// canonical progression through the pills.
// match: gPillInfo length.
const gPillIDs = [
    kForcePushPill,
    kDecimatePill,
    kSplitPill,
    kWildPill,
    kEngorgePill,
    kWallPill,
    kYarsPill,
    kBarrierPill,
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
// match: gPillIDs length.
const gPillInfo = {
    [kForcePushPill]: {
        name: "PUSH",
        maker: MakeForcePushProps,
        drawer: DrawForcePushPill,
        wfn: () => sxi(20), hfn: () => sxi(20),
    },
    [kDecimatePill]: {
        name: "ZAP",
	maker: MakeDecimateProps,
        drawer: DrawDecimatePill,
        wfn: () => sxi(20), hfn: () => sxi(20),
    },
    [kEngorgePill]: {
        name: "PHAT",
	maker: MakeEngorgeProps,
        drawer: DrawEngorgePill,
        wfn: () => sxi(20), hfn: () => syi(35),
    },
    [kWildPill]: {
        name: "WILD",
	maker: MakeWildProps,
        drawer: DrawWildPill,
        wfn: () => sxi(22), hfn: () => sxi(22),
    },
    [kBarrierPill]: {
        name: "SHLD",
	maker: MakeBarrierProps,
        drawer: DrawBarrierPill,
        wfn: () => sxi(20), hfn: () => syi(40),
    },
    [kSplitPill]: {
        name: "ZPLT",
	maker: MakeSplitProps,
        drawer: DrawSplitPill,
        wfn: () => sxi(20), hfn: () => sxi(20),
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
        wfn: () => sxi(20), hfn: () => sxi(20),
    },
    [kYarsPill]: {
	name: "YARS",
	maker: MakeYarsProps,
	drawer: DrawYarsPill,
	wfn: () => sx1(20), hfn: () => sx1(20),
    },
    [kWallPill]: {
	name: "WALL",
	maker: MakeWallProps,
	drawer: DrawWallPill,
	wfn: () => sx1(15), hfn: () => sy1(30),
    },
};
Assert(gPillInfo);
Assert(Object.keys(gPillInfo).length === gPillIDs.length);

// cycle through the powerups in order
// so we have some control over when they
// are presented in the course of the game.
// one per paddle.
/*class*/ function Powerups( props ) {

    const self = this;

    self.Init = function() {
	self.level = props.level;
        self.isPlayer = props.isPlayer;
        self.side = props.side;
        self.paddle = props.paddle;
	Assert(self.side === self.paddle.side);
        self.pillState = props.pillState;
    };

    self.MakeRandomPill = function(gameState) {
        const propsBase = self.NextPropsBase(gameState);
        if (exists(propsBase)) {
            // todo: meh, pills can have different lifespans, but currently they are all the same.
            Assert(exists(propsBase.lifespan), "lifespan");
	    // spawn on the vertically opposite side from the player, to make it more noticeable.
            const yTop = gh(0.1);
	    const yBottom = gh(0.9) - propsBase.height;
	    const y = self.paddle.GetMidY() > gh(0.5) ? yTop : yBottom;
            const props = {
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

	// if one player already has any defense, then try to give the other player the same chance.
	// todo: also barrier? xtras?
	let pid = self.pillState.deck.shift();
	let otherPaddle = self.paddle === gameState.paddleP1 ? gameState.paddleP2 : gameState.paddleP1;
	if (exists(otherPaddle.blocks) &&
	    isU(self.paddle.blocks) &&
	    self.pillState.deck.includes(kYarsPill) &&
	    gPillInfo[kYarsPill].maker(self).testFn(gameState)) {
	    self.pillState.deck.push(pid);
	    pid = kYarsPill;
	}
	Assert(exists(pid));
        const info = gPillInfo[pid];
        const maker = info.maker;
        Assert(exists(maker));
        Assert(typeof maker == "function", `maker()? ${info.name} ${self.pillState} ${typeof maker}`);
        let spec = maker(self);
        Assert(exists(spec), `wtf maker? ${info.name}`);
        if (!spec.testFn(gameState)) {
	    spec = undefined;
	    if (gDebug) {
		// loop through them all.
		self.pillState.deck.push(pid);
	    }
	    else {
		// try the failed powerup again after the next one
		// in order to attempt to spawn the new ones soon even
		// if they were skipped i.e. at the start of the level when
		// there aren't many pucks.
		self.pillState.deck.splice(1, 0, pid);
	    }
        }
	else {
            // keep looping through the pills. also keeps the 
            // state across levels so you aren't retreading.
            self.pillState.deck.push(pid);
	}

        return spec;
    };

    self.Init();
};

// ----------------------------------------

function DrawForcePushPill(side, xywh, alpha) {
    const img = gImageCache[ForSide(side, "forcepushL", "forcepushR")];
    Cxdo(() => {
        const wx = WX(xywh.x);
        const wy = WY(xywh.y);
        gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
        const mx = wx + xywh.width/2;
        const my = wy + xywh.height/2;
        gCx.beginPath();
        gCx.arc(mx, my, xywh.width/2 + sx1(1), 0, k2Pi);
        gCx.closePath();
        gCx.strokeStyle = RandomColor( alpha );
        gCx.lineWidth = sx1(1);
        gCx.stroke();
    });
}

function DrawDecimatePill(side, xywh, alpha) {
    const img = gImageCache["decimate"];
    Cxdo(() => {
        const wx = WX(xywh.x);
        const wy = WY(xywh.y);
        gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
        const mx = wx + ii(xywh.width/2);
        const my = wy + ii(xywh.height/2);
        gCx.beginPath();
        gCx.moveTo(mx, wy);
        gCx.lineTo(wx + xywh.width, my);
        gCx.lineTo(mx, wy + xywh.height);
        gCx.lineTo(wx, my);
        gCx.closePath();
        gCx.strokeStyle = RandomColor( alpha );
        gCx.lineWidth = sx1(1);
        gCx.stroke();
    });
}

function DrawEngorgePill(side, xywh, alpha) {
    const img = gImageCache["engorge"];
    Cxdo(() => {
        const wx = WX(xywh.x);
        const wy = WY(xywh.y);
        gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
        gCx.beginPath();
        gCx.rect( wx, wy, xywh.width, xywh.height );
        gCx.lineWidth = sx1(1);
        gCx.strokeStyle = RandomColor( alpha );
        gCx.stroke();
    });
}

function DrawSplitPill(side, xywh, alpha) {
    const img = gImageCache["split"];
    Cxdo(() => {
        const wx = WX(xywh.x);
        const wy = WY(xywh.y);
        gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
        gCx.beginPath();
        gCx.RoundRect(wx, wy, xywh.width, xywh.height, 10);
        gCx.strokeStyle = RandomColor( alpha );
        gCx.lineWidth = sx1(1);
        gCx.stroke();
    });
}

function DrawBarrierPill(side, xywh, alpha) {
    const img = gImageCache["barrier"];
    Cxdo(() => {
        const wx = WX(xywh.x);
        const wy = WY(xywh.y);
        gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
        gCx.beginPath();
        gCx.RoundRect(wx, wy, xywh.width, xywh.height, 14);
        gCx.strokeStyle = RandomColor( alpha );
        gCx.lineWidth = sx1(1);
        gCx.stroke();
    });
}

function DrawXtraPill(side, xywh, alpha) {
    const img = gImageCache["xtra"];
    Cxdo(() => {
        const wx = WX(xywh.x);
        const wy = WY(xywh.y);
        gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
        gCx.beginPath();
        gCx.RoundRect(wx, wy, xywh.width, xywh.height, 14);
        gCx.strokeStyle = RandomColor( alpha );
        gCx.lineWidth = sx1(1);
        gCx.stroke();
    });
}

function DrawNeoPill(side, xywh, alpha) {
    const img = gImageCache["neo"];
    Cxdo(() => {
        const wx = WX(xywh.x);
        const wy = WY(xywh.y);
        const mx = wx + ii(xywh.width/2);
        const my = wy + ii(xywh.height/2);
        gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
        gCx.beginPath();
        gCx.moveTo(mx, wy);
        gCx.lineTo(wx + xywh.width, my);
        gCx.lineTo(mx, wy + xywh.height);
        gCx.lineTo(wx, my);
        gCx.closePath();
        gCx.strokeStyle = RandomColor( alpha );
        gCx.lineWidth = sx1(1);
        gCx.stroke();
    });
}

function DrawWildPill(side, xywh, alpha) {
    const img = gImageCache["wild"];
    Cxdo(() => {
        // make it randomly resizing to look more chaotic.
        const o = gR.RandomRange(1, sx1(4));
        const wx = WX(xywh.x)-o;
        const wy = WY(xywh.y)-o;
        const ww = xywh.width + o*2;
        const wh = xywh.height + o*2;
        gCx.drawImage(img, wx, wy, ww, wh);
        const mx = wx + ww/2;
        const my = wy + wh/2;
        gCx.beginPath();
        gCx.arc(mx, my, ww/2, 0, k2Pi);
        gCx.closePath();
        gCx.strokeStyle = RandomColor( alpha );
        gCx.lineWidth = sx1(1);
        gCx.stroke();
    });
}

function DrawYarsPill(side, xywh, alpha) {
    const img = gImageCache[ForSide(side, "yarsL", "yarsR")];
    Cxdo(() => {
        const wx = WX(xywh.x);
        const wy = WY(xywh.y);
        gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
        const mx = wx + xywh.width/2;
        const my = wy + xywh.height/2;
        gCx.beginPath();
        gCx.arc(mx, my, xywh.width/2 + sx1(4), 0, k2Pi);
        gCx.closePath();
        gCx.strokeStyle = RandomColor( alpha );
        gCx.lineWidth = sx1(2);
        gCx.stroke();
    });
}

function DrawWallPill(side, xywh, alpha) {
    Cxdo(() => {
        const wx = WX(xywh.x);
        const wy = WY(xywh.y);
	gCx.beginPath();
        gCx.rect(wx, wy, xywh.width, xywh.height);
	gCx.lineWidth = sx1(2);
	gCx.strokeStyle = RandomColor( alpha );
	gCx.stroke();
        gCx.beginPath();
        gCx.rect(wx, wy, xywh.width, xywh.height);
        gCx.fillStyle = RandomCyan( alpha * 0.5 );
        gCx.fill();
    });
}

// ----------------------------------------

function MakeForcePushProps(context) {
    const { name, wfn, hfn } = gPillInfo[kForcePushPill];
    const width = wfn();
    const height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        testFn: (gameState) => {
            const can = gPucks.A.length > 5 && isU(context.paddle.neo);
	    //console.log("push?", can);
	    return can;
        },
        drawFn: (self, alpha=1) => DrawForcePushPill(context.side, self, alpha),
        boomFn: (gameState) => {
            PlayPowerupBoom();
            const targetSign = ForSide(context.side, -1, 1);
            gPucks.A.forEach(p => {
                if (Sign(p.vx) == targetSign) {
                    p.vx *= -1.15;
                }
		else {
		    p.vx = MinSigned(p.vx*1.15, gameState.maxVX);
		}
		p.vy *= ForGameMode({
		    regular: 1.1,
		    hard: 1.2,
		    zen: 1,
		    pp: 2,
		});
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
    const { name, wfn, hfn } = gPillInfo[kDecimatePill];
    const width = wfn();
    const height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        testFn: (gameState) => {
            // looks unfun if there aren't enough pucks to destroy.
	    // by the time the powerup is activated there might be even less.
	    // e.g. consider that the other player might also be doing their decimate.
            const can = gPucks.A.length > 30;
	    //console.log("decimate?", can);
	    return can;
        },
        drawFn: (self, alpha=1) => DrawDecimatePill(context.side, self, alpha),
        boomFn: (gameState) => {
            // try to destroy at least 1, but leave at least enough alive to avoid(ish) game over.
	    const minSaved = 3;
	    const pcount = gPucks.A.length;
	    if (pcount > minSaved) {
		const clipMax = kAppMode ? 20 : pcount * 0.6;
		const count = Clip(pcount - minSaved, 0, clipMax);
		//console.log("decimate", pcount, clipMax, count);
		if (count > 0) {
                    PlayPowerupBoom();
                    const targets = gPucks.A
			.map((p) => { return {d:Math.abs(p.x - context.paddle.x), p}; })
			.filter((e) => { return e.d > gPaddleWidth * 3; })
			.sort((a,b) => { return a.d - b.d; })
			.slice(0, count)
			.map((e) => { return e.p; });
                    Assert(targets.length < pcount);
		    if (targets.length === 0 && pcount > 1) {
			targets = gPucks.A.slice(0, 1);
		    }
                    targets.forEach(p => {
			p.alive = "gone"; // special hard-coded case, yay.
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
    const { name, wfn, hfn } = gPillInfo[kEngorgePill];
    const width = wfn();
    const height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        isUrgent: true,
        testFn: (gameState) => {
            const can = !context.paddle.engorged;
	    //console.log("engorce?", can);
	    return can;
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
    const { name, wfn, hfn } = gPillInfo[kSplitPill];
    const width = wfn();
    const height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        testFn: (gameState) => {
	    const can = gPucks.A.length < kPuckPoolSize / 3;
	    //console.log("split?", can);
	    return can;
        },
        drawFn: (self, alpha=1) => DrawSplitPill(context.side, self, alpha),
        boomFn: (gameState) => {
	    let needone = true;
	    const targets = [];
            gPucks.A.forEach(p => {
		let pick = needone;
		needone = false;
		if (!pick) {
		    if (gPucks.A.length <= 10) { pick = true; }
		    else { pick = gR.RandomBool(10/gPucks.A.length); }
		}
		if (pick) {
		    targets.push(p);
		}
            });
	    targets.forEach(t => {
		const maxVX = gameState.level.maxVX;
                const split = t.MaybeSplitPuck({ forced: true, maxVX });
                gameState.level.OnPuckSplits(1);
                const p = gPuckPool.Alloc();
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

function MakeBarrierProps(context) {
    const { name, wfn, hfn } = gPillInfo[kBarrierPill];
    const width = wfn();
    const height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        isUrgent: true,
        testFn: (gameState) => {
            // todo: there was a bug i saw once that let one paddle
            // have 2 barrier powerups active at the same time wtf.
            const can_end = gameState.level.IsBeforeEndingGame();
            const p_count = gPucks.A.length > kPuckPoolSize/5;
	    const can_paddles = context.paddle.barriers.A.length === 0;
            const can_blocks = isU(context.level.blocks);
	    const can_yars = isU(context.paddle.yars);
	    const can = can_end && p_count && can_paddles && can_blocks && can_yars;
	    console.log("barrier?", can_end, p_count, can_paddles, can_blocks, can_yars, can);
	    return can;
        },
        drawFn: (self, alpha=1) => DrawBarrierPill(context.side, self, alpha),
        boomFn: (gameState) => {
            PlayPowerupBoom();
	    // if the other player has any barriers, we should match their hp0.
	    // else the hp should be related to the number of pucks.
	    // and we don't want barriers to be less than some useful absolute amount.
	    const minHp = 50;
	    let otherPaddle = self.paddle === gameState.paddleP1 ? gameState.paddleP2 : gameState.paddleP1;
	    const other_hp0 = otherPaddle.barriers.A.reduce((m,b) => Math.max(m,b.hp0), 0);
	    const hpf = ForGameMode({
		regular: 1,
		hard: 1.5,
		zen: 2,
		pp: 1.5
	    });
	    const pf = gPucks.A.length / (kPuckPoolSize/5);
	    const hpp = hpf * Math.max( minHp, minHp * pf );
	    const hp = other_hp0 === 0 ? hpp : other_hp0;
            console.log(`barrier minHp=${minHp} ohp0=${other_hp0} hpf=${hpf} pf=${pf} hpp=${hpp} hp=${F(hp)}`);
	    const drawScale = ForGameMode({ regular: 1, zen: 0.5 });
            const width = sx1(10); // no matter what the hp.
            const height = (gHeight-gYInset*2)/kBarriersCount;
            const x = gw(ForSide(context.side, 0.1, 0.9));
            const targets = [];
            for (let i = 0; i < kBarriersCount; ++i) {
                const y = gYInset + i * height;
                const xoff = xyNudge(y, height, 10, context.side);
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
    const { name, wfn, hfn } = gPillInfo[kXtraPill];
    const width = wfn();
    const height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        isUrgent: true,
        testFn: (gameState) => {
            const can_end = gameState.level.IsBeforeEndingGame();
            const p_count = gPucks.A.length > kPuckPoolSize/2;
            const can_paddles = context.paddle.xtras.A.length === 0;
            const can_blocks = isU(context.level.blocks);
	    const can_yars = isU(context.paddle.yars);
	    const can = can_end && p_count && can_paddles && can_blocks && can_yars;
	    console.log("xtras?", can_end, p_count, can_paddles, can_blocks, can_yars, can);
	    return can;
        },
        drawFn: (self, alpha=1) => DrawXtraPill(context.side, self, alpha),
        boomFn: (gameState) => {
            PlayPowerupBoom();
            const yy = (gHeight-gYInset*2)/kXtrasCount;
            const width = gPaddleWidth*2/3;
            const height = Math.min(gPaddleHeight/2, yy/2);
	    const hp = ForGameMode({
		regular: 30,
		hard: 50,
		zen: 100,
		pp: 50,
	    });
            //console.log(`xtra pc=${pc} hp=${F(hp)}`);
            for (let i = 0; i < kXtrasCount; ++i) {
                const x = ForSide(context.side, gw(0.15), gw(0.85));
                const xoff = isEven(i) ? 0 : gw(0.02);
                const y = gYInset+yy*i;
                const yMin = y;
                const yMax = y+yy;
                context.paddle.AddXtra({
                    x: x+xoff, y,
                    yMin, yMax,
                    width, height,
                    hp,
                    stepSize: Math.max(1,(yMax-yMin)/10),
                });
	    }
        },
    };
}

function MakeNeoProps(context) {
    const { name, wfn, hfn } = gPillInfo[kNeoPill];
    const width = wfn();
    const height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        isUrgent: true,
        testFn: (gameState) => {
            const can = gameState.level.IsBeforeEndingGame() &&
                  gPucks.A.length > 20 &&
                  isU(context.paddle.neo);
	    //console.log("neo?", can);
	    return can;
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

function MakeWildProps(context) {
    const { name, wfn, hfn } = gPillInfo[kWildPill];
    const width = wfn();
    const height = hfn();
    return {
        name,
        width, height,
	// try to force more wild in arcade mode
	// to break up streaming-for-too-long?!
	// see also: dark matter.
        lifespan: kPillLifespan * (kAppMode ? 1 : 2),
        testFn: (gameState) => {
	    const can = gPucks.A.length > 10 &&
		  isU(context.paddle.neo);
	    //console.log("wild?", can);
	    return can;
        },
        drawFn: (self, alpha=1) => DrawWildPill(context.side, self, alpha),
        boomFn: (gameState) => {
            PlayPowerupBoom();
	    const vs = ForSide(context.paddle.side, 1, -1);
            const targets = [];
            gPucks.A.forEach(p => {
		const ps = Math.sign(p.vx);
                if (vs === ps) {
		    // repeated applications in a level gets crazy.
                    p.vy *= gR.RandomCentered(3, 1);
                    targets.push(p);
                }
            });
            gameState.AddAnimation(MakeWildAnimation({
                targets
            }));
        },
    };
}

function IsWeakBlocks(blocks, fraction) {
    if (exists(blocks)) {
	return (blocks.hp / blocks.maxHp) < fraction;
    }
    return true;
}

function MakeYarsProps(context) {
    const { name, wfn, hfn } = gPillInfo[kYarsPill];
    const width = wfn();
    const height = hfn();
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        isUrgent: true,
        testFn: (gameState) => {
	    const p_count = gPucks.A.length > (kPuckPoolSize*1/2);
	    const can_yars = IsWeakBlocks(context.paddle.blocks, 1/4);
            const can_wall = IsWeakBlocks(context.level.blocks, 1/4);
	    const can_barriers = context.paddle.barriers.A.length === 0;
	    const can_xtras = context.paddle.xtras.A.length === 0;
	    const can = p_count && can_yars && can_wall && can_barriers && can_xtras;
	    console.log("yars?", p_count, can_yars, can_wall, can_barriers, can_xtras, can);
	    return can;
        },
        drawFn: (self, alpha=1) => DrawYarsPill(context.side, self, alpha),
        boomFn: (gameState) => {
            PlayPowerupBoom();
	    const midX = ForSide(
		context.paddle.side,
		gw(0.15),
		gw(0.85),
	    );
            const pc = T01(gPucks.A.length, kPuckPoolSize);
	    const cols = 3 + Math.min(gPucks.A.length / 150);
	    const rows = 40;
	    context.paddle.AddBlocks({
		isYars: true,
		side: context.side,
		midX,
		cols,
		rows,
		col_width: gw(0.01),
		dy: 1.5,
	    });
        },
    };
}

function MakeWallProps(context) {
    const { name, wfn, hfn } = gPillInfo[kWallPill];
    const width = wfn();
    const height = hfn();
    const cols = 4;
    const rows = 30;
    return {
        name,
        width, height,
        lifespan: kPillLifespan,
        isUrgent: true,
        testFn: (gameState) => {
	    const p_count = gPucks.A.length > (kPuckPoolSize*1/2);
            const can_wall = IsWeakBlocks(context.level.blocks, 1/4);
	    const can_yars = IsWeakBlocks(context.paddle.blocks, 1/4);
	    const can_barriers = context.paddle.barriers.A.length === 0;
	    const can_xtras = context.paddle.xtras.A.length === 0;
	    const can = p_count && can_wall && can_yars && can_barriers && can_xtras;
	    //console.log("wall?", can);
	    return can;
        },
        drawFn: (self, alpha=1) => DrawWallPill(context.side, self, alpha),
        boomFn: (gameState) => {
            PlayPowerupBoom();
            const pc = T01(gPucks.A.length, kPuckPoolSize);
	    const midX = gw(0.5);
	    // there can be only 1.
	    gameState.paddleP1.wall = undefined;
	    gameState.paddleP2.wall = undefined;
	    context.level.AddBlocks({
		isYars: false,
		midX,
		cols,
		rows,
		col_width: gw(0.015),
		dy: 1.5,
	    });
        },
    };
}
