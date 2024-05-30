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
   label,
   ylb,
   fontSize,
   testFn: (gameState) => {},
   skip, // don't get stuck waiting on this one's testFn to pass.
   drawFn: (self, alpha) => {},
   boomFn: (gameState) => {},
   endFn: () => {},
   }
*/

// needs to be longish so the cpu has any chance of getting it.
kPillLifespan = 1000 * 20;

/* props = {
   isPlayer,
   side,
   paddle,
   }
*/
/*class*/ function Powerups( props ) {

    var self = this;

    self.Init = function() {
	self.isPlayer = props.isPlayer;
	self.side = props.side;
	self.paddle = props.paddle;
	
	// defines the powerup pills and their spawn order.
	self.powerupProps = [];
	self.powerupProps.push(MakeForcePushProps);
	self.powerupProps.push(MakeDecimateProps);
	self.powerupProps.push(MakeEngorgeProps);
	self.powerupProps.push(MakeSplitProps);
	self.powerupProps.push(MakeDefendProps);
	self.powerupProps.push(MakeOptionProps);
	self.powerupProps.push(MakeNeoProps);
	self.powerupProps.push(MakeChaosProps);
	self.isPlayer && self.powerupProps.push(MakeDensityProps);

	self.powerupLocks = {};

	// cycle through the powerups in order
	// so we have some control over when they
	// are presented in the course of the game.
	self.powerupDeck = [];
    };

    self.MakeRandomPill = function(gameState) {
	var propsBase = self.NextPropsBase(gameState);
	if (exists(propsBase)) {
	    // fyi allow pills to have different lifespans, tho currently they are all the same.
	    Assert(exists(propsBase.lifespan), "lifespan");
	    var y = RandomChoice(gh(0.1), gh(0.9)-propsBase.height);
	    var props = {
		...propsBase,
		name: propsBase.name,
		x: ForSide(self.side, gw(0.35), gw(0.65)),
		y,
		vx: ForSide(self.side, -1,1) * sx(3),
		vy: RandomCentered(0, 2, 0.5),
	    };
	    return new Pill(props);
	}
	return undefined;
    };

    self.NextPropsBase = function(gameState) {
	if (isU(self.powerupDeck) || self.powerupDeck.length < 1) {
	    self.powerupDeck = [...self.powerupProps].reverse();
	}
	var maybeS = Peek(self.powerupDeck);
	if (isU(maybeS)) {
	    return undefined;
	}
	var s = maybeS(self);
	if (s.testFn(gameState)) {
	    self.powerupDeck.pop();
	    return s;
	}
	else if (!!s.skip) {
	    self.powerupDeck.pop();
	    return undefined;
	}
	return undefined;
    };

    self.Init();
};

function MakeForcePushProps(maker) {
    var label = ForSide(maker.side, ">", "<");
    var name = "forcepush";
    return {
	name,
	width: sx(18), height: sy(18),
	lifespan: kPillLifespan,
	label,
	ylb: sy(17),
	fontSize: gReducedFontSizePt,
	testFn: (gameState) => {
	    // don't bother pushing into neo, i guess.
	    return (gDebug || gPucks.A.length > 5) && isU(maker.paddle.neo);
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
	boomFn: (gameState) => {
	    PlayPowerupBoom();
	    var targetSign = ForSide(maker.side, -1, 1);
	    gPucks.A.forEach(p => {
		if (Sign(p.vx) == targetSign) {
		    p.vx *= -1;
		}
		else {
		    p.vx = MinSigned(p.vx*1.4, gMaxVX);
		}
	    });
	    gameState.AddAnimation(MakeWaveAnimation({
		lifespan: 250,
		side: maker.side,
		paddle: maker.paddle,
	    }));
	},
    };
}

function MakeDecimateProps(maker) {
    var name = 'decimate';
    return {
	name,
	width: sx(18), height: sy(18),
	lifespan: kPillLifespan,
	label: "*",
	ylb: sy(18),
	fontSize: gSmallFontSizePt,
	testFn: (gameState) => {
	    // looks unfun if there aren't enough pucks to destroy.
	    return gDebug || gPucks.A.length > 20;
	},
	skip: true,
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
	boomFn: (gameState) => {
	    // try to destroy at least 1, but leave at least 1 still alive.
	    // prefer destroying the ones closest to the player.
	    var count = Math.max(1, Math.floor(gPucks.A.length*0.6)); // technically not "deci"mate, i know.
	    if (count < gPucks.A.length-1) {
		PlayPowerupBoom();
		var byd = gPucks.A.
		    map((p) => { return {d:Math.abs(p.x-maker.paddle.x), p:p}; }).
		    sort((a,b) => { return a.d - b.d; });
		var targets = byd.slice(0, count).map((e) => { return e.p; });
		Assert(targets.length < gPucks.A.length);
		targets.forEach(p => {
		    p.alive = false;
		    AddSparks(p.x, p.y, p.vx, p.vy);
		});
		gameState.AddAnimation(MakeTargetsLightningAnimation({
		    lifespan: 100,
		    targets,
		    paddle: maker.paddle,
		}));
	    }
	},
    };
}

function MakeEngorgeProps(maker) {
    var name = 'engorge';
    return {
	name,
	width: sx(22), height: sy(22),
	lifespan: kPillLifespan,
	label: "+",
	ylb: sy(32),
	fontSize: gBigFontSizePt,
	testFn: (gameState) => {
	    return !maker.paddle.engorged;
	},
	skip: true,
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
	boomFn: (gameState) => {
	    PlayPowerupBoom();
	    gameState.AddAnimation(MakeEngorgeAnimation({
		lifespan: 1000 * 12,
		paddle: maker.paddle,
	    }));
	},
    };
};

function MakeSplitProps(maker) {
    var name = 'split';
    return {
	name,
	width: sx(30), height: sy(24),
	lifespan: kPillLifespan,
	label: "//",
	ylb: sy(18),
	fontSize: gSmallFontSizePt,
	testFn: (gameState) => {
	    return true;
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
	boomFn: (gameState) => {
	    var r = 10/gPucks.A.length;
	    var targets = gPucks.A.filter((p, i) => {
		return i < 1 ? true : RandomBool(r);
	    });
	    targets.forEach(p => {
		gPucks.A.push(p.SplitPuck(true));
	    });
	    gameState.AddAnimation(MakeSplitAnimation({
		lifespan: 250,
		targets,
		side: maker.side,
		paddle: maker.paddle,
	    }));
	},
    };
}

function MakeDefendProps(maker) {
    var name = 'defend';
    return {
	name,
	width: sx(20), height: sy(30),
	lifespan: kPillLifespan,
	label: "#",
	ylb: sy(20),
	fontSize: gSmallFontSizePt,
	testFn: (gameState) => {
	    return maker.paddle.barriers.A.length == 0 && (gDebug || gPucks.A.length > 25);
	},
	skip: true,
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
	boomFn: (gameState) => {
	    PlayPowerupBoom();
	    var n = 4; // match: kBarriersArrayInitialSize.
	    var hp = 30;
	    var width = sx1(hp/3);
	    var height = (gHeight-gYInset*2) / n;
	    var x = gw(ForSide(maker.side, 0.1, 0.9));
	    var targets = [];
	    for (var i = 0; i < n; ++i) {
		var y = gYInset + i * height;
		maker.paddle.AddBarrier({
		    x, y,
		    width, height,
		    hp,
		    side: maker.side,
		});
		targets.push({x: x+width/2, y: y+height/2});
	    }
	    gameState.AddAnimation(MakeTargetsLightningAnimation({
		lifespan: 150,
		targets,
		paddle: maker.paddle,
	    }));
	},
    };
}

function MakeOptionProps(maker) {
    var name = 'option';
    return {
	name,
	width: sx(22), height: sy(22),
	lifespan: kPillLifespan,
	label: "!!",
	ylb: sy(16),
	fontSize: gSmallFontSizePt,
	testFn: (gameState) => {
	    return maker.paddle.options.A.length == 0 && (gDebug || gPucks.A.length > 20);
	},
	skip: true,
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
	boomFn: (gameState) => {
	    PlayPowerupBoom();
	    var n = 6; // match: kOptionsArrayInitialSize.
	    var yy = (gHeight-gYInset*2)/n;
	    var width = gPaddleWidth*2/3;
	    var height = Math.min(gPaddleHeight/2, yy/2);
	    var hp = 30;
	    ForCount(n, (i) => {
		var x = ForSide(maker.side, gw(0.15), gw(0.85));
		var xoff = isEven(i) ? 0 : gw(0.02);
		var y = gYInset+yy*i;
		var yMin = y;
		var yMax = y+yy;
		maker.paddle.AddOption({
		    isPlayer: false,
		    x: x+xoff, y,
		    yMin, yMax,
		    width, height,
		    hp,
		    isSplitter: true,
		    stepSize: Math.max(1,(yMax-yMin)/10),
		    normalX: ForSide(maker.side, 1, -1),
		});
	    });
	},
    };
}

function MakeNeoProps(maker) {
    var name = 'neo';
    return {
	name,
	width: sx(22), height: sy(22),
	lifespan: kPillLifespan,
	label: "#",
	ylb: sy(15),
	fontSize: gSmallestFontSizePt,
	testFn: (gameState) => {
	    // todo: in some playtesting this was being spawned too often, maybe each props needs a spawn weight too?
	    return (gDebug || gPucks.A.length > kEjectCountThreshold/2) && isU(maker.paddle.neo);
	},
	skip: true,
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
	boomFn: (gameState) => {
	    PlayPowerupBoom();
	    maker.paddle.AddNeo({
		x: ForSide(maker.side, gw(0.4), gw(0.6)),
		normalX: ForSide(maker.side, 1, -1),
		lifespan: 1000 * 4,
		side: maker.side,
	    });
	},
    };
}

function MakeDensityProps(maker) {
    var name = 'density';
    var x = ForSide(maker.side, gw(0.4), gw(0.6));
    return {
	name,
	width: sx(18), height: sy(18),
	lifespan: kPillLifespan,
	label: "?",
	ylb: sy(14),
	fontSize: gSmallestFontSizePt,
	testFn: (gameState) => {
	    // there can be only one per maker, and it lasts for ever.
	    return (gDebug || gPucks.A.length > 20) && !maker.powerupLocks[name];
	},
	skip: true,
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
	boomFn: (gameState) => {
	    PlayPowerupBoom();
	    maker.powerupLocks[name] = true;
	    gameState.AddAnimation(MakeDensityAnimation({
		side: maker.side
	    }));
	},
    };
}

function MakeChaosProps(maker) {
    var name = 'chaos';
    return {
	name,
	width: sx(20), height: sy(20),
	lifespan: kPillLifespan,
	label: ["|", "/", "--", "\\", "|", "/", "--", "\\"],
	ylb: sy(14),
	fontSize: gSmallestFontSizePt,
	testFn: (gameState) => {
	    return (gDebug || gPucks.A.length > 10);
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
		var i = ii(gFrameCount/5) % self.label.length;
		DrawText( self.label[i], "center", wx+ii(self.width/2), wy+self.ylb, self.fontSize );
	    });
	},
	boomFn: (gameState) => {
	    PlayPowerupBoom();
	    var targets = [];
	    gPucks.A.forEach((p,i) => {
		if (isMultiple(i, 3)) {
		    p.vy *= -2;
		    targets.push(p);
		}
	    });
	    gameState.AddAnimation(MakeChaosAnimation({
		targets
	    }));
	},
    };
}
