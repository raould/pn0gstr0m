/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function Neo( spec /*{x, sign, lifespan}*/ ) {
    var self = this;

    self.Init = function() {
	self.id = gNextID++;
	self.x = spec.x;
	self.y = 0;
	self.sign = spec.sign;
	self.width = sx1(10);
	self.height = gh(1);
	self.lifespan0 = spec.lifespan;
	self.lifespan = self.lifespan0;
	self.alive = self.lifespan > 0;
	self.locked = [];
    };

    self.Step = function(dt, gameState) {
	self.alive = self.lifespan > 0;
	if (!self.alive) {
	    gameState.AddAnimation(
		Make2PtLightningAnimation({
		    lifespan: 500,
		    x0: WX(self.x+self.width/2), y0: gYInset,
		    x1: WX(self.x+self.width/2), y1: gh(1)-gYInset,
		    range: self.width,
		    steps: 20,
		})
	    );
	    self.locked.forEach(p => {
		p.isLocked = false;
		p.vx = Math.abs(p.vx) * self.sign * RandomRange(1,1.5);
		// funny how sparks are global but animations aren't because history.
		AddSparks(p.x, p.y, p.vx, p.vy);
	    });
	}
	self.lifespan = Math.max(0, self.lifespan-dt);
	console.log(self.lifespan, self.lifespan0);
	return self.alive ? self : undefined;
    };

    self.Draw = function( alpha ) {
	var mx = self.x + self.width/2;
	// neo blocks from 0 to gh(1),
	// but draws inside the gYInset.
	var y0 = Math.max(self.y, gYInset);
	var y1 = Math.min(self.y+self.height, gh(1)-gYInset);
	Cxdo(() => {
	    gCx.fillStyle = RandomCyan(0.15);
	    for (var i = 0; i < 3; ++i) {
		var hw = i * sx1(5);
		var x = self.x - hw;
		gCx.fillRect(WX(x), y0, self.width+2*hw, y1-y0);
	    }
	});
	var range = 5 + T10(self.lifespan, self.lifespan0) * sx1(10);
	AddLightningPath({
	    color: RandomBlue(alpha),
	    x0: WX(self.x), y0,
	    x1: WX(self.x), y1,
	    range: 5,
	    steps: 20
	});
	AddLightningPath({
	    color: RandomColor(alpha),
	    x0: WX(mx), y0,
	    x1: WX(mx), y1,
	    range: range,
	    steps: 20
	});
	AddLightningPath({
	    color: RandomBlue(alpha),
	    x0: WX(self.x+self.width), y0,
	    x1: WX(self.x+self.width), y1,
	    range: 5,
	    steps: 20
	});
    };

    self.CollisionTest = function( puck ) {
	var hit = puck.CollisionTest( self );
	if (hit) {
	    self.locked.push( puck );
	}
	return hit;
    };

    self.Init();
}
