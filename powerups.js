/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

var gPowerupSpecs = {
    reverse: MakeReverseSpec,
    decimate: MakeDecimateSpec,
    engorge: MakeEngorgeSpec,
// todo: option: MakeOptionSpec,
};

// note: any powerup that lasts a long time
// should prevent being created again until the
// live one expires, because the ending time
// is not properly extended.
var gPowerupsInUse = {};

function MakeReverseSpec() {
    var xoff = ForSide(-50, 50);
    var label = ForSide(">", "<");
    return {
	w: sx(18), h: sy(18),
	label,
	ylb: sy(17),
	fontSize: gReducedFontSizePt,
	test_fn: (gameState) => {
	    return gPucks.A.length > 5;
	},
	boom_fn: (gameState) => {
	    PlayPowerupBoom();
	    var target_sign = ForSide(-1, 1);
	    gPucks.A.forEach((p) => {
		if (Sign(p.vx) == target_sign) {
		    p.vx *= -1;
		}
		else {
		    p.vx = MinSigned(p.vx*1.4, gMaxVX);
		}
	    });
	    gameState.animations[gNextID++] = MakeWaveAnimation({
		lifespan: 250,
		gameState
	    });
	},
	draw_fn: (self, alpha) => {
	    Cxdo(() => {
		var wx = WX(self.x);
		var wy = WY(self.y);
		var r = 20;

		gCx.beginPath();
		gCx.roundRect( WX(wx), WY(wy), self.w, self.h, r );
		gCx.fillStyle = backgroundColor;
		gCx.fill();

		gCx.beginPath();
		gCx.roundRect( WX(wx), WY(wy), self.w, self.h, r );
		gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
		gCx.lineWidth = sx1(2);
		gCx.stroke();

		DrawText( self.label, "center", wx+ii(self.w/2), wy+self.ylb, self.fontSize );
	    });
	},
    };
}

function MakeDecimateSpec() {
    var xoff = ForSide(-50, 50);
    return {
	w: sx(18), h: sy(18),
	label: "*",
	ylb: sy(18),
	fontSize: gSmallFontSizePt,
	test_fn: (gameState) => {
	    // looks unfun if there aren't enough puck to destroy.
	    return gPucks.A.length > 8 && !gPowerupsInUse['decimate'];
	},
	boom_fn: (gameState) => {
	    // test_fn passed, so we must have at least 8 pucks.
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
		gameState.animations[gNextID++] = MakeLightningAnimation({
		    lifespan: 100,
		    targets,
		    end_fn: () => { delete gPowerupsInUse['decimate']; }
		});
		gPowerupsInUse['decimate'] = true;
	    }
	},
	draw_fn: (self, alpha) => {
	    Cxdo(() => {
		var wx = WX(self.x);
		var wy = WY(self.y);
		var mx = wx + ii(self.w/2);
		var my = wy + ii(self.h/2);

		gCx.beginPath();
		gCx.moveTo(mx, wy);
		gCx.lineTo(wx + self.w, my);
		gCx.lineTo(mx, wy + self.h);
		gCx.lineTo(wx, my);
		gCx.closePath();
		gCx.fillStyle = backgroundColor;
		gCx.fill();

		gCx.beginPath();
		gCx.moveTo(mx, wy);
		gCx.lineTo(wx + self.w, my);
		gCx.lineTo(mx, wy + self.h);
		gCx.lineTo(wx, my);
		gCx.closePath();
		gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
		gCx.lineWidth = sx1(2);
		gCx.stroke();

		DrawText( self.label, "center", wx+ii(self.w/2), wy+self.ylb, self.fontSize );
	    });
	},
    };
}

function MakeEngorgeSpec() {
    var xoff = ForSide(-50, 50);
    return {
	w: sx(18), h: sy(18),
	label: "+",
	ylb: sy(30),
	fontSize: gBigFontSizePt,
	test_fn: (gameState) => {
	    return !gameState.playerPaddle.engorged && !gPowerupsInUse['engorge'];
	},
	boom_fn: (gameState) => {
	    gameState.animations[gNextID++] = MakeEngorgeAnimation({
		lifespan: 1000 * 10,
		gameState,
		end_fn: () => { delete gPowerupsInUse['engorge']; }
	    });
	    gPowerupsInUse['engorge'] = true;
	},
	draw_fn: (self, alpha) => {
	    Cxdo(() => {
		var wx = WX(self.x);
		var wy = WY(self.y);

		gCx.fillStyle = backgroundColor;
		gCx.fillRect( WX(wx), WY(wy), self.w, self.h );

		gCx.strokeStyle = gCx.fillStyle = RandomColor( alpha );
		gCx.lineWidth = sx1(2);
		gCx.strokeRect( WX(wx), WY(wy), self.w, self.h );

		DrawText( self.label, "center", wx+ii(self.w/2), wy+self.ylb, self.fontSize );
	    });
	},
    };
}

// TODO: all of this.
function MakeOptionSpec() {
    return {
	w: sx(18), h: sy(18),
	label: "?",
	ylb: sy(30),
	fontSize: gBigFontSizePt,
	test_fn: (gameState) => {
	    // note that any powerup that lasts a long time
	    // should prevent being created again until the
	    // live one expires, because the ending time
	    // is not properly extended.
	},
	boom_fn: (gameState) => {
	    console.log("TODO");
	},
	draw_fn: (self, alpha) => {
	},
    };
}

function MakeRandomPowerup(gameState) {
    var keys = Object.keys(gPowerupSpecs);
    var index = RandomRangeInt(0, keys.length-1);
    var spec_base = gPowerupSpecs[keys[index]]();
    if (spec_base.test_fn(gameState)) {
	var spec = {
	    ...spec_base,
	    x: ForSide(gw(0.35), gw(0.65)),
	    y: gHeight * (RandomBool() ? 0.1 : 0.9),
	    vx: ForSide(1,-1) * sx(4),
	    vy: RandomCentered(0, 4, 1)
	};
	return new Powerup(spec);
    }
    return undefined;
}

function MakeLightningAnimation(props) {
    var { lifespan, targets, end_fn } = props;
    return new Animation({
	lifespan,
	anim_fn: (dt, gameState) => {
	    Cxdo(() => {
		targets.forEach((puck) => {
		    gCx.beginPath();
		    AddLightningPath(
			gameState.playerPaddle.x - 5,
			gameState.playerPaddle.GetMidY(),
			puck.x,
			puck.y,
			20
		    );
		    gCx.strokeStyle = RandomColor();
		    gCx.lineWidth = sx1(2);
		    gCx.stroke();
		});
	    });
	},
	end_fn
    });
}

function MakeWaveAnimation(props) {
    var { lifespan, gameState } = props;
    var t0 = gGameTime;
    var x0 = gameState.playerPaddle.GetMidX();
    var y0 = gameState.playerPaddle.GetMidY();
    var offset = ForSide(-Math.PI*1/2, Math.PI*1/2);
    var a0 = offset;
    var a1 = offset + Math.PI;
    return new Animation({
	lifespan,
	anim_fn: (dt, gameState) => {
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
	}
    });
}

function MakeEngorgeAnimation(props) {
    var { lifespan, gameState, end_fn } = props;
    var ph0 = gameState.playerPaddle.height;
    return new Animation({
	lifespan,
	anim_fn: (dt, gameState, start_ms, end_ms) => {
	    var pp = gameState.playerPaddle;
	    var t01 = GameTime01(end_ms-start_ms, start_ms);
	    var t10 = 1 - t01;
	    Cxdo(() => {
		gCx.beginPath();
		AddLightningPath(
		    pp.GetMidX(), pp.y,
		    pp.GetMidX(), pp.y + pp.height,
		    Math.max(0.5, pp.width * 2 * t10)
		);
		gCx.strokeStyle = RandomColor();
		gCx.lineWidth = sx1(2);
		gCx.stroke();
	    });
	},
	start_fn: (gameState) => {
	    gameState.playerPaddle.BeginEngorged();
	},
	end_fn: (gameState) => {
	    gameState.playerPaddle.EndEngorged();
	    end_fn && end_fn(gameState);
	}
    });
}

function AddLightningPath( x0, y0, x1, y1, range ) {
    var steps = 5;
    var sx = (x1 - x0)/steps;
    var sy = (y1 - y0)/steps;
    gCx.moveTo(x0, y0);
    for (var t = 1; t <= steps-1; ++t) {
	gCx.lineTo(
	    RandomCentered(x0 + (sx*t), range),
	    RandomCentered(y0 + (sy*t), range)
	);
    }
    gCx.lineTo(x1, y1);
}
