/* Copyright (C) 2025 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

const kDarkMatterForce = 0.005;
const kDarkMatterAnimMsec = 16;

/*class*/ function DarkMatterGenerator( props /*firstTimeout, timeout*/ ) {
    var self = this;

    self.Init = function() {
	self.id = gNextID++;
	self.Reset();
	// but, wait longer for the first spawn.
	self.timeout = props.firstTimeout;
    };

    self.Reset = function() {
	self.triggered = false; // latches when true.
	self.timeout = props.timeout;
	Assert(self.timeout > 0);
    };

    self.Step = function( dt ) {
	if (!self.triggered && gPucks.A.length > kStreamingCountThreshold) {
	    self.timeout = self.timeout - dt;
	    self.triggered = self.timeout <= 0;
	}
    };

    self.Generate = function() {
	var x = gR.RandomChoice(gw(0.2), gw(0.8));
	var vx = (x < gw(0.5) ? 1 : -1) * sx(0.015);
	var width = sx1(20);
	var height = sx1(20);
	return new DarkMatter({
	    x: x, y: gh(0.05) - height/2,
	    width, height,
	    vx, vy: sy(0.02),
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

/*class*/ function DarkMatter( props /*x, y, width, height, vx, vy*/) {
    var self = this;

    self.Init = function() {
        self.id = gNextID++;
        self.x = props.x;
        self.y = props.y;
	self.width = props.width;
	self.height = props.height;
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
	    gPucks.A.forEach(p => {
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
	    });
	}
    };

    self.Draw = function( alpha ) {
        Cxdo(() => {
            var wx = WX(self.x);
            var wy = WY(self.y);
            var mx = wx + self.width/2;
            var my = wy + self.height/2;

	    // outer.
            gCx.beginPath();
            gCx.arc(mx, my, gR.RandomCentered(self.width/2 + sx1(5), 3), 0, k2Pi);
            gCx.closePath();
            gCx.strokeStyle = gCx.fillStyle = "yellow";
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
	    gCx.drawImage(img, wx, wy, self.width, self.height);

	    if (gDebug) {
		// range.
		gCx.beginPath();
		gCx.arc(mx, my, self.width/2 + self.range, 0, k2Pi);
		gCx.closePath();
		gCx.strokeStyle = gCx.fillStyle = "rgba(255,255,0,0.1)";
		gCx.lineWidth = sx1(1);
		gCx.stroke();
	    }
	});
    };
	     
    self.Init();
}
