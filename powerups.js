/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// note: each powerup must have a unique pill,
// and the actual "powerup" is usually
// done via (ideally a unique) animation.

kPillLifespan = 1000 * 10;

var gPowerupLocks = {};

var gPowerupSpecs = {
    forcepush: MakeForcePushSpec,
    decimate: MakeDecimateSpec,
    engorge: MakeEngorgeSpec,
    split: MakeSplitSpec,
    defend: MakeDefendSpec,
    option: MakeOptionSpec,
    neo: MakeNeoSpec,
    density: MakeDensitySpec,
};

// all specs' x,y should be top,left (not mid points).

function MakeRandomPill(gameState) {
    var keys = Object.keys(gPowerupSpecs);
    var index = RandomRangeInt(0, keys.length-1);
    var name = keys[index];
    var specBase = gPowerupSpecs[name]();
    var y = RandomChoice(gh(0.1), gh(0.9)-specBase.height);
    if (specBase.testFn(gameState)) {
	// allow some pills to last a differnet amount of time.
	Assert(notU(specBase.lifespan), "lifespan");
	var spec = {
	    ...specBase,
	    name: name,
	    x: ForSide(gw(0.35), gw(0.65)),
	    y,
	    vx: ForSide(-1,1) * sx(3),
	    vy: RandomCentered(0, 4, 1)
	};
	return new Pill(spec);
    }
    return undefined;
}

function MakeForcePushSpec() {
    var label = ForSide(">", "<");
    return {
	width: sx(18), height: sy(18),
	lifespan: kPillLifespan,
	label,
	ylb: sy(17),
	fontSize: gReducedFontSizePt,
	testFn: (gameState) => {
	    // don't bother pushing into neo, i guess.
	    return gPucks.A.length > 5 && isU(gNeo);
	},
	boomFn: (gameState) => {
	    PlayPowerupBoom();
	    var targetSign = ForSide(-1, 1);
	    gPucks.A.forEach((p) => {
		if (Sign(p.vx) == targetSign) {
		    p.vx *= -1;
		}
		else {
		    p.vx = MinSigned(p.vx*1.4, gMaxVX);
		}
	    });
	    gameState.AddAnimation(MakeWaveAnimation({
		lifespan: 250,
		gameState
	    }));
	},
	drawFn: (self, alpha) => {
	    Cxdo(() => {
		var wx = WX(self.x);
		var wy = WY(self.y);
		var r = 20;

		gCx.beginPath();
		gCx.roundRect( WX(wx), WY(wy), self.width, self.height, r );
		gCx.fillStyle = backgroundColor;
		gCx.fill();

		gCx.beginPath();
		gCx.roundRect( WX(wx), WY(wy), self.width, self.height, r );
		gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
		gCx.lineWidth = sx1(2);
		gCx.stroke();

		DrawText( self.label, "center", wx+ii(self.width/2), wy+self.ylb, self.fontSize );
	    });
	},
    };
}

function MakeDecimateSpec() {
    var name = 'decimate';
    return {
	width: sx(18), height: sy(18),
	lifespan: kPillLifespan,
	label: "*",
	ylb: sy(18),
	fontSize: gSmallFontSizePt,
	testFn: (gameState) => {
	    // looks unfun if there aren't enough puck to destroy.
	    return gDebug || gPucks.A.length > 20;
	},
	boomFn: (gameState) => {
	    // try to destroy at least 1, but leave at least 1 still alive.
	    // prefer destroying the ones closest to the player.
	    var count = Math.max(1, Math.floor(gPucks.A.length*0.6)); // technically not "deci"mate, i know.
	    if (count < gPucks.A.length-1) {
		PlayPowerupBoom();
		var byd = gPucks.A.
		    map((p) => { return {d:Math.abs(p.x-gameState.playerPaddle.x), p:p}; }).
		    sort((a,b) => { return a.d - b.d; });
		var targets = byd.slice(0, count).map((e) => { return e.p; });
		Assert(targets.length < gPucks.A.length);
		targets.forEach((p) => {
		    p.alive = false;
		    AddSparks(p.x, p.y, p.vx, p.vy);
		});
		gameState.AddAnimation(MakeTargetsLightningAnimation({
		    lifespan: 100,
		    targets,
		}));
	    }
	},
	drawFn: (self, alpha) => {
	    Cxdo(() => {
		var wx = WX(self.x);
		var wy = WY(self.y);
		var mx = wx + ii(self.width/2);
		var my = wy + ii(self.height/2);

		gCx.beginPath();
		gCx.moveTo(mx, wy);
		gCx.lineTo(wx + self.width, my);
		gCx.lineTo(mx, wy + self.height);
		gCx.lineTo(wx, my);
		gCx.closePath();
		gCx.fillStyle = backgroundColor;
		gCx.fill();

		gCx.beginPath();
		gCx.moveTo(mx, wy);
		gCx.lineTo(wx + self.width, my);
		gCx.lineTo(mx, wy + self.height);
		gCx.lineTo(wx, my);
		gCx.closePath();
		gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
		gCx.lineWidth = sx1(2);
		gCx.stroke();

		DrawText( self.label, "center", wx+ii(self.width/2), wy+self.ylb, self.fontSize );
	    });
	},
    };
}

function MakeEngorgeSpec() {
    var name = 'engorge';
    return {
	width: sx(22), height: sy(22),
	lifespan: kPillLifespan,
	label: "+",
	ylb: sy(32),
	fontSize: gBigFontSizePt,
	testFn: (gameState) => {
	    return !gameState.playerPaddle.engorged;
	},
	boomFn: (gameState) => {
	    PlayPowerupBoom();
	    gameState.AddAnimation(MakeEngorgeAnimation({
		lifespan: 1000 * 12,
		gameState,
	    }));
	},
	drawFn: (self, alpha) => {
	    Cxdo(() => {
		var wx = WX(self.x);
		var wy = WY(self.y);

		gCx.fillStyle = backgroundColor;
		gCx.fillRect( WX(wx), WY(wy), self.width, self.height );

		gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
		gCx.lineWidth = sx1(2);
		gCx.strokeRect( WX(wx), WY(wy), self.width, self.height );

		DrawText( self.label, "center", wx+ii(self.width/2), wy+self.ylb, self.fontSize );
	    });
	},
    };
}

function MakeSplitSpec() {
    return {
	width: sx(30), height: sy(24),
	lifespan: kPillLifespan,
	label: "//",
	ylb: sy(18),
	fontSize: gSmallFontSizePt,
	testFn: (gameState) => {
	    return true;
	},
	boomFn: (gameState) => {
	    var r = 10/gPucks.A.length;
	    var targets = gPucks.A.filter((p, i) => {
		return i < 1 ? true : RandomBool(r);
	    });
	    Assert(targets.length > 0, "split.boomFn");
	    targets.forEach((p) => {
		gPucks.A.push(p.SplitPuck(true));
	    });
	    gameState.AddAnimation(MakeSplitAnimation({
		lifespan: 250,
		targets,
	    }));
	},
	drawFn: (self, alpha) => {
	    Cxdo(() => {
		var wx = WX(self.x);
		var wy = WY(self.y);
		var mx = wx + ii(self.width/2);
		var my = wy + ii(self.height/2);

		gCx.beginPath();
		gCx.roundRect(wx, wy, self.width, self.height, 20);
		gCx.fillStyle = backgroundColor;
		gCx.fill();

		gCx.beginPath();
		gCx.roundRect(wx, wy, self.width, self.height, 20);
		gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
		gCx.lineWidth = sx1(2);
		gCx.stroke();

		DrawText( self.label, "center", wx+ii(self.width/2), wy+self.ylb, self.fontSize );
	    });
	},
    };
}

function MakeDefendSpec() {
    return {
	width: sx(20), height: sy(30),
	lifespan: kPillLifespan,
	label: "#",
	ylb: sy(20),
	fontSize: gSmallFontSizePt,
	testFn: (gameState) => {
	    return gBarriers.A.length == 0 && (gDebug || gPucks.A.length > 25);
	},
	boomFn: (gameState) => {
	    PlayPowerupBoom();
	    var n = 4; // match: kBarriersArrayInitialSize.
	    var hp = 60;
	    var width = sx1(hp/3);
	    var height = (gHeight-gYInset*2) / n;
	    var x = gw(ForSide(0.1, 0.9));
	    var targets = [];
	    for (var i = 0; i < n; ++i) {
		var y = gYInset + i * height;
		gameState.AddBarrier({
		    x, y,
		    width, height,
		    hp,
		});
		targets.push({x: x+width/2, y: y+height/2});
	    }
	    gameState.AddAnimation(MakeTargetsLightningAnimation({
		lifespan: 150,
		targets,
	    }));
	},
	drawFn: (self, alpha) => {
	    Cxdo(() => {
		var wx = WX(self.x);
		var wy = WY(self.y);
		var r = 2;

		gCx.beginPath();
		gCx.roundRect( WX(wx), WY(wy), self.width, self.height, r );
		gCx.fillStyle = backgroundColor;
		gCx.fill();

		gCx.beginPath();
		gCx.roundRect( WX(wx), WY(wy), self.width, self.height, r );
		gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
		gCx.lineWidth = sx1(2);
		gCx.stroke();

		DrawText( self.label, "center", wx+ii(self.width/2), wy+self.ylb, self.fontSize );
	    });
	},
    };
}

function MakeOptionSpec() {
    return {
	width: sx(22), height: sy(22),
	lifespan: kPillLifespan,
	label: "!!",
	ylb: sy(16),
	fontSize: gSmallFontSizePt,
	testFn: (gameState) => {
	    return gOptions.A.length == 0 && (gDebug || gPucks.A.length > 20);
	},
	boomFn: (gameState) => {
	    PlayPowerupBoom();
	    var n = 6; // match: kOptionsArrayInitialSize.
	    var yy = (gHeight-gYInset*2)/n; // todo: center.
	    var width = gPaddleWidth*2/3;
	    var height = Math.min(gPaddleHeight/2, yy/2);
	    var hp = 30;
	    ForCount(n, (i) => {
		var x = ForSide(gw(0.15), gw(0.85));
		var xoff = isEven(i) ? 0 : gw(0.02);
		var y = gYInset+yy*i;
		var yMin = y;
		var yMax = y+yy;
		gameState.AddOption({
		    x: x+xoff, y,
		    yMin, yMax,
		    width, height,
		    hp,
		    isSplitter: false,
		    stepSize: Math.max(1,(yMax-yMin)/10),
		    normalX: ForSide(1, -1),
		});
	    });
	},
	drawFn: (self, alpha) => {
	    Cxdo(() => {
		var wx = WX(self.x);
		var wy = WY(self.y);
		var r = 6;

		gCx.beginPath();
		gCx.roundRect( WX(wx), WY(wy), self.width, self.height, r );
		gCx.fillStyle = backgroundColor;
		gCx.fill();

		gCx.beginPath();
		gCx.roundRect( WX(wx), WY(wy), self.width, self.height, r );
		gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
		gCx.lineWidth = sx1(2);
		gCx.stroke();

		DrawText( self.label, "center", wx+ii(self.width/2), wy+self.ylb, self.fontSize );
	    });
	},
    };
}

function MakeNeoSpec() {
    var name = 'neo';
    var lifespan = 1000 * 7;
    var x = ForSide(gw(0.4), gw(0.6));
    return {
	width: sx(22), height: sy(22),
	lifespan: kPillLifespan,
	label: "#",
	ylb: sy(15),
	fontSize: gSmallestFontSizePt,
	testFn: (gameState) => {
	    return (gDebug || gPucks.A.length > 20) && isU(gNeo);
	},
	boomFn: (gameState) => {
	    PlayPowerupBoom();
	    gameState.AddNeo({
		x, lifespan
	    });
	},
	drawFn: (self, alpha) => {
	    Cxdo(() => {
		var wx = WX(self.x);
		var wy = WY(self.y);
		var mx = wx + ii(self.width/2);
		var my = wy + ii(self.height/2);
		var o = sy1(5);

		gCx.beginPath();
		gCx.moveTo(mx, wy-o);
		gCx.lineTo(wx+self.width+o, my);
		gCx.lineTo(mx, wy+self.height+o);
		gCx.lineTo(wx-o, my);
		gCx.closePath();
		gCx.fillStyle = backgroundColor;
		gCx.fill();

		gCx.beginPath();
		gCx.moveTo(mx, wy);
		gCx.lineTo(wx + self.width, my);
		gCx.lineTo(mx, wy + self.height);
		gCx.lineTo(wx, my);
		gCx.closePath();
		gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
		gCx.lineWidth = sx1(1);
		gCx.stroke();

		gCx.beginPath();
		gCx.moveTo(mx, wy-o);
		gCx.lineTo(wx+self.width+o, my);
		gCx.lineTo(mx, wy+self.height+o);
		gCx.lineTo(wx-o, my);
		gCx.closePath();
		gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
		gCx.lineWidth = sx1(1);
		gCx.stroke();

		DrawText( self.label, "center", wx+ii(self.width/2), wy+self.ylb, self.fontSize );
	    });
	},
    };
}

function MakeDensitySpec() {
    var name = 'density';
    var x = ForSide(gw(0.4), gw(0.6));
    return {
	width: sx(32), height: sy(22),
	lifespan: kPillLifespan,
	label: "(())",
	ylb: sy(15),
	fontSize: gSmallestFontSizePt,
	testFn: (gameState) => {
	    return (gDebug || gPucks.A.length > 20) && !gPowerupLocks[name];
	},
	boomFn: (gameState) => {
	    PlayPowerupBoom();
	    gPowerupLocks[name] = true;
	    gameState.AddAnimation(MakeDensityAnimation({}));
	},
	endFn: () => {
	    delete gPowerupLocks[name];
	},
	drawFn: (self, alpha) => {
	    Cxdo(() => {
		var wx = WX(self.x);
		var wy = WY(self.y);
		gCx.beginPath();
		gCx.roundRect( WX(wx), WY(wy), self.width, self.height, 3 );
		gCx.fillStyle = backgroundColor;
		gCx.fill();
		gCx.beginPath();
		gCx.roundRect( WX(wx), WY(wy), self.width, self.height, 3 );
		gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
		gCx.lineWidth = sx1(2);
		gCx.stroke();
		DrawText( self.label, "center", wx+ii(self.width/2), wy+self.ylb, self.fontSize );
	    });
	},
    };
}

function MakeTargetsLightningAnimation(props) {
    var { lifespan, targets, endFn } = props;
    return new Animation({
	lifespan,
	animFn: (anim, dt, gameState) => {
	    targets.forEach((xy) => {
		AddLightningPath({
		    color: RandomColor(),
		    x0: gameState.playerPaddle.GetMidX(),
		    y0: gameState.playerPaddle.GetMidY(),
		    x1: xy.x,
		    y1: xy.y,
		    range: 20
		});
	    });
	},
	endFn
    });
}

function MakeSplitAnimation(props) {
    var { lifespan, targets, endFn } = props;
    // start chain at nearest puck, assumes rhs default.
    targets.sort((a,b) => b.x-a.x);
    ForSide(() => targets.reverse, () => {})();
    return new Animation({
	lifespan,
	animFn: (anim, dt, gameState) => {
	    var p0 = { x: gameState.playerPaddle.GetMidX(),
		       y: gameState.playerPaddle.GetMidY() };
	    targets.forEach((p1, i) => {
		AddLightningPath({
		    color: RandomColor(),
		    x0: p0.x, y0: p0.y,
		    x1: p1.x, y1: p1.y,
		    range: 10
		});
		p0 = p1;
	    });
	},
	endFn
    });
}

function MakeWaveAnimation(props) {
    var { lifespan, gameState, endFn } = props;
    var t0 = gGameTime;
    var x0 = gameState.playerPaddle.GetMidX();
    var y0 = gameState.playerPaddle.GetMidY();
    var offset = ForSide(-Math.PI*1/2, Math.PI*1/2);
    var a0 = offset;
    var a1 = offset + Math.PI;
    return new Animation({
	lifespan,
	animFn: (anim, dt, gameState) => {
	    Cxdo(() => {
		var t = GameTime01(lifespan, t0);
		gCx.lineWidth = sx1(2);
		gCx.strokeStyle = "magenta";
		for (var ri = 1; ri <= 3; ++ri) {
		    gCx.beginPath();
		    gCx.arc( x0, y0,
			     gw(t) + sx(5*ri),
			     a0,
			     a1 );
		    gCx.stroke();
		}
	    });
	},
	endFn
    });
}

function MakeEngorgeAnimation(props) {
    var { lifespan, gameState, endFn } = props;
    var ph0 = gameState.playerPaddle.height;
    return new Animation({
	lifespan,
	animFn: (anim, dt, gameState, startMs, endMs) => {
	    var pp = gameState.playerPaddle;
	    var t01 = GameTime01(endMs-startMs, startMs);
	    var t10 = 1 - t01;
	    AddLightningPath({
		color: RandomColor(),
                x0: pp.GetMidX(), y0: pp.y,
                x1: pp.GetMidX(), y1: pp.y + pp.height,
                range: Math.max(0.5, pp.width * 2 * t10)
	    });
	},
	startFn: (gameState) => {
	    gameState.playerPaddle.BeginEngorged();
	},
	endFn: (gameState) => {
	    gameState.playerPaddle.EndEngorged();
	    if (notU(endFn)) { endFn(gameState); }
	}
    });
}

function MakeDensityAnimation(props) {
    var { endFn } = props;
    return new Animation({
	lifespan: 1000 * 60,
	animFn: (anim, dt, gameState) => {
	    gCx.fillStyle = "rgba(128, 128, 128, 0.05)";
	    Cxdo(() => {
		gPucks.A.forEach((p) => {
		    if (Sign(p.vx) == ForSide(-1,1)) {
			gCx.fillRect(
			    0, p.y - p.height,
			    gw(1), p.height*2
			);
		    }
		});
	    });
	},
	endFn
    });
}
