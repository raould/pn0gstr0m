/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

const kDarkMatterDim = 30;
const kDarkMatterForce = 0.003;
const kDarkMatterAnimMsec = 16;

// true if any part of the rect is in bounds.
function InGameBounds(xywh) {
    const left = xywh.x;
    const right = xywh.x + xywh.width;
    const top = xywh.y;
    const bottom = xywh.y + xywh.height;

    const bad_left = left > gw();
    const bad_right = right < 0;
    const bad_top = top > gh();
    const bad_bottom = bottom < 0;

    return !(bad_left || bad_right || bad_bottom || bad_top);
};

/*class*/ function DarkMatterGenerator( props /*timeout*/ ) {
    var self = this;

    self.Init = function() {
	self.id = gNextID++;
	self.Reset();
	self.timeout = props.timeout;
    };

    self.Reset = function() {
	self.triggered = false; // latches when true.
	self.timeout = props.timeout * 2; // wait longer after the first time.
	Assert(self.timeout > 0);
    };

    self.Step = function( dt ) {
	if (!self.triggered && self.ShouldStep()) {
	    self.timeout = self.timeout - dt;
	    self.triggered = self.timeout <= 0;
	}
    };

    self.ShouldStep = function() {
	return gPucks.A.length > kDarkMatterCountThreshold;
    };

    self.Generate = function() {
	var dim = sx1(kDarkMatterDim);
	// must satisfy InGameBounds().
	var x = gR.RandomChoice(gw(0.2), gw(0.8));
	var y = gPuckYAvg < gh(0.5) ? gh(0.9) : gh(0.1);
	var vx = (x < gw(0.5) ? 1 : -1) * sx(0.015);
	var vy = y < gh(0.5) ? sy(0.02) : -sy(0.02);
	return new DarkMatter({
	    x, y,
	    dim,
	    vx, vy
	});
    }

    self.DrawDebug = function() {
	Cxdo(() => {
	    gCx.fillStyle = "yellow";
	    DrawText( `DM:${self.timeout} ${String(self.triggered).toUpperCase()}`,
		      "center",
		      gw(0.6), gh(0.8),
		      gSmallerFontSizePt );
	});
    };

    self.Init();
}

/*class*/ function DarkMatter( props /*x, y, dim, vx, vy*/) {
    var self = this;

    self.Init = function() {
        self.id = gNextID++;
        self.x = props.x;
        self.y = props.y;
	self.dim = props.dim;
	// w, h to satisfy InGameBounds().
	self.width = props.dim;
	self.height = props.dim;
	self.vx = props.vx;
	self.vy = props.vy;
	self.range = gh(0.3);
	self.imgs = [
	    gImageCache["dm1"],
	    gImageCache["dm2"],
	    gImageCache["dm3"],
	    gImageCache["dm4"],
	];
	self.frame = 0;
	self.lastTime = Date.now();
    };

    self.Step = function( dt ) {
        self.alive = InGameBounds(self);
	if (self.alive) {
	    self.x += (self.vx * dt);
	    self.y += (self.vy * dt);
	}
    };

    self.StepPuck = function( dt, p ) {
	if (self.alive) {
	    // it is 'funny' how much programming languages
	    // desperately suck when it comes to DSLs. i can't
	    // even think straight when it is this fugly.
	    // "i only tested this looks right empirically,
	    // i did not prove it correct."
	    var {x, y} = FromTo(p.x, p.y, self.x, self.y);
	    var m = Magnitude(x, y);
	    var {x, y} = Norm(x, y, m);
	    var g = kDarkMatterForce * m * T10nl(m, self.range, 4);
	    p.vx += g * x;
	    p.vy += g * y;
	}
    };

    self.Draw = function( alpha ) {
        Cxdo(() => {
            var wx = WX(self.x);
            var wy = WY(self.y);
            var mx = wx + self.dim/2;
            var my = wy + self.dim/2;

	    // outer constricting.
	    // todo: this is badly tied to fps.
	    const df = 30;
	    const or = T10(gFrameCount % df, df) * sx1(100);
	    const a = T01(gFrameCount % df, df);
	    // outermost.
            gCx.beginPath();
            gCx.arc(mx, my, or, 0, k2Pi);
            gCx.closePath();
	    gCx.strokeStyle = RandomYellow(a);
            gCx.lineWidth = sx1(1);
            gCx.stroke();
	    // innermost.
            gCx.beginPath();
            gCx.arc(mx, my, or/2, 0, k2Pi);
            gCx.closePath();
	    gCx.strokeStyle = RandomRed(a);
            gCx.lineWidth = sx1(1);
            gCx.stroke();

	    // inner.
	    var now = Date.now();
	    var dt = now - self.lastTime;
	    if (dt > kDarkMatterAnimMsec) {
		self.frame = (self.frame + 1) % self.imgs.length;
		self.lastTime = now;
	    }
	    var img = self.imgs[self.frame];
	    gCx.drawImage(img, wx, wy, self.dim, self.dim);

	    if (gDebug) {
		// range.
		gCx.beginPath();
		gCx.arc(mx, my, self.dim/2 + self.range, 0, k2Pi);
		gCx.closePath();
		gCx.strokeStyle = gCx.fillStyle = "rgba(255,255,0,0.1)";
		gCx.lineWidth = sx1(1);
		gCx.stroke();
	    }
	});
    };
	     
    self.Init();
}
