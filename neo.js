/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function Neo( spec ) {
    var self = this;

    self.Init = function() {
	self.id = gNextID++;
	self.x = spec.x;
	self.y = 0;
	self.width = sx1(10);
	self.height = gh(1);
	self.lifespan = spec.lifespan;
	self.alive = spec.lifespan > 0;
	self.locked = [];
    };

    self.Step = function(dt) {
	self.lifespan = Math.max(0, self.lifespan-dt);
	self.alive = self.lifespan > 0;
	if (!self.alive) {
	    self.locked.forEach((p) => {
		p.isLocked = false;
		p.vx = Math.abs(p.vx) * ForSide(1,-1) * RandomRange(1,1.3);
		AddSparks(p.x, p.y, p.vx, p.vy);
	    });
	}
	return self.alive ? self : undefined;
    };

    self.Draw = function( alpha ) {
	var mx = self.x + self.width/2;
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
	    range: 5,
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
