/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// note: Animations are hardcoded to only work in GameState.

function Animation( props ) {
    var { lifespan, animFn, startFn, endFn } = props;
    var self = this;
    self.id = gNextID++;
    self.lifespan0 = lifespan;
    self.lifespan = lifespan;
    self.startMs = gGameTime;
    self.endMs = self.startMs + self.lifespan;
    self.Step = function(dt, gameState) {
	// start.
	if (isntU(startFn)) { startFn( gameState ); }
	startFn = undefined;
	// anim.
	if (gGameTime <= self.endMs) {
	    self.lifespan -= dt;
	    animFn( self, dt, gameState, self.startMs, self.endMs );
	    return false;
	}
	// end.
	if (isntU(endFn)) { endFn( gameState ); }
	return true;
    };
}

function AddLightningPath(spec) {
    // spec = { color, x0, y0, x1, y1, range, steps=5 }
    var { color, x0, y0, x1, y1, range, steps=5 } = spec;
    var sx = (x1 - x0)/steps;
    var sy = (y1 - y0)/steps;
    var points = [];
    for (var t = 1; t <= steps-1; ++t) {
	var x = RandomCentered(x0 + (sx*t), range);
	var y = RandomCentered(y0 + (sy*t), range);
	points.push({x, y});
    }
    Cxdo(() => {
	gCx.beginPath();
	gCx.strokeStyle = color;

	gCx.moveTo(x0, y0);
	points.forEach(p => gCx.lineTo(p.x, p.y));
	gCx.lineTo(x1, y1);
	gCx.lineWidth = sx1(3);
	gCx.globalAlpha = 0.3;
	gCx.stroke();

	gCx.beginPath();
	gCx.moveTo(x0, y0);
	points.forEach(p => gCx.lineTo(p.x, p.y));
	gCx.lineTo(x1, y1);
	gCx.lineWidth = sx1(1);
	gCx.globalAlpha = 1;
	gCx.stroke();
    });
}

function MakePoofAnimation(x, y, radius) {
    var lifespan = 2000;
    var r = radius;
    return new Animation({
	lifespan,
	animFn: (anim, dt, gameState) => {
	    var alpha = T01(anim.lifespan, anim.lifespan0);
	    Cxdo(() => {
		gCx.strokeStyle = RandomForColor(red, alpha);
		gCx.lineWidth = sx1(2);
		gCx.beginPath();
		gCx.arc( WX(x), WY(y),
			 r * RandomRange(1,1.05),
			 0, k2Pi );
		gCx.stroke();
		gCx.beginPath();
		gCx.arc( WX(x), WY(y),
			 r/2 * RandomRange(1,1.05),
			 0, k2Pi );
		gCx.stroke();
		gCx.beginPath();
		gCx.arc( WX(x), WY(y),
			 r/4 * RandomRange(1,1.05),
			 0, k2Pi );
		gCx.stroke();
	    });
	    r += dt/kTimeStep*1.5;
	}
    });
}

function Make2PtLightningAnimation(props) {
    var { lifespan, x0, y0, x1, y1, range, steps, endFn } = props;
    return new Animation({
	lifespan,
	animFn: (anim, dt, gameState) => {
	    AddLightningPath({
		color: RandomColor(),
		x0, y0,
		x1, y1,
		range, steps
	    });
	},
	endFn
    });
}
