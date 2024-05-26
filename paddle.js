/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function Paddle(spec) {
    /* spec is {
       x, y,
       yMin, yMax,
       width, height,
       label,
       hp,
       isSplitter,
       stepSize,
       normalX,
       }
    */
    var self = this;

    self.Init = function(label) {
	self.id = gNextID++;
	self.hp0 = spec.hp;
	self.hp = spec.hp;
	self.x0 = spec.x;
	self.x = spec.x;
	self.y = spec.y;
	self.yMin = aorb(spec.yMin, gYInset);
	self.yMax = aorb(spec.yMax, gHeight-gYInset);
	self.isAtLimit = false;
	self.prevX = self.x;
	self.prevY = self.y;
	self.width = spec.width;
	self.height = spec.height;
	self.blockvx = self.x >= gw(0.5) ? 1 : -1;
	self.isSplitter = aorb(spec.isSpliter, true);
	self.alive = isU(self.hp) || self.hp > 0;
	self.engorgedHeight = gPaddleHeight * 2;
	self.engorgedWidth = gPaddleWidth * 0.8;
	self.aiTarget = undefined;
	self.label = spec.label;
	self.engorged = false;
	self.stepSize = aorb(spec.stepSize, gPaddleStepSize);
	self.normalX = spec.normalX;
	self.scanIndex = 0;
	self.scanCount = 10;
	self.nudgeX();
    };

    self.CollisionTest = function( puck ) {
	var hit = puck.CollisionTest( self, self.blockvx );
	if (hit && isntU(self.hp)) {
	    self.hp--;
	    self.alive = self.hp > 0;
	}
	return hit;
    };

    self.BeginEngorged = function() {
	self.width = self.engorgedWidth;
	var h2 = self.engorgedHeight;
	var yd = (h2 - self.height)/2;
	self.height = h2;
	// re-center.
        self.y = Math.max(0, self.y - yd);
	self.engorged = true;
    };

    self.EndEngorged = function() {
	self.width = gPaddleWidth;
	self.height = gPaddleHeight;
	// re-center.
	self.y += Math.abs(self.engorgedHeight - self.height)/2;
	self.engorged = false;
    };

    self.GetMidX = function() {
	return self.x + self.width/2;
    };

    self.GetMidY = function() {
	return self.y + self.height/2;
    };

    self.nudgeX = function() {
	// nudging horizontally to emulate crt curvature.
	var ypos = self.y + self.height/2;
	var mid = gh(0.5);
	var factor = Clip01(Math.abs(mid - ypos)/mid);
	var off = (10 * factor) * ((self.x < gw(0.5)) ? 1 : -1);
	self.x = self.x0 + off;
    };

    self.getVX = function() {
	return (self.x - self.prevX) / kTimeStep;
    };

    self.getVY = function() {
	return (self.y - self.prevY) / kTimeStep;
    };

    self.Draw = function( alpha ) {
	Cxdo(() => {
	    gCx.fillStyle = RandomGreen(0.7 * alpha);
	    var hpw = isU(self.hp) ?
		self.width :
		Math.max(sx1(2), ii(self.width * self.hp/self.hp0));
	    var wx = WX(self.x + (self.width-hpw)/2);
	    var wy = WY(self.y);
	    gCx.fillRect( wx, wy, hpw, self.height );
	    if (isntU(self.label) && gRandom() > GameTime01(kFadeInMsec)) {
		gCx.fillStyle = RandomGreen(0.5 * alpha);
		DrawText( self.label, "center", self.GetMidX(), self.y-20, gSmallFontSizePt );
	    }
	    if (false) {//gDebug) {
		gCx.strokeStyle = "red";
		gCx.strokeRect( self.x, self.y, self.width, self.height );
		gCx.strokeStyle = "white";
		gCx.strokeRect( self.x+1, self.yMin, self.width-2, self.yMax-self.yMin );
	    }
	});
    };

    self.MoveDown = function( dt, scale=1 ) {
	self.prevY = self.y;
	self.y += self.stepSize * scale * (dt/kTimeStep);
	self.isAtLimit = false;
	if( self.y+self.height > self.yMax ) {
	    self.y = self.yMax-self.height;
	    self.isAtLimit = true;
	}
	self.nudgeX();
    };

    self.MoveUp = function( dt, scale=1 ) {
	self.prevY = self.y;
	self.y -= self.stepSize * scale * (dt/kTimeStep);
	self.isAtLimit = false;
	if( self.y < self.yMin ) {
	    self.y = self.yMin;
	    self.isAtLimit = true;
	}
	self.nudgeX();
    };

    // ........................................ AI

    self.aiCountdownToUpdate = kAIPeriod;
    self.shouldUpdate = function() {
	self.aiCountdownToUpdate--;
	var should = isU(self.aiTarget);
	if( ! should ) {
	    should = self.aiCountdownToUpdate <= 0;
	}
	if( ! should ) {
	    should = self.IsPuckAttacking( self.aiTarget );
	}
	if( should ) {
	    self.aiCountdownToUpdate = kAIPeriod;
	}
	return should;
    };

    self.AIMove = function( dt ) {
	Cxdo(() => {
	    gCx.fillStyle = "blue";
	    if( self.shouldUpdate() ) {
		self.UpdatePuckTarget();
		if( isntU(self.aiTarget) ) {
		    if (gDebug) { DrawTextFaint("TRACK", "center", gw(0.8), gh(0.1), gRegularFontSizePt); }
		    var targetMid = self.aiTarget.GetMidY() + self.aiTarget.vy;
		    var deadzone = (self.height*0.2);
		    if( targetMid <= self.GetMidY() - deadzone) {
			self.MoveUp( dt, kAIMoveScale );
		    }
		    else if( targetMid >= self.GetMidY() + deadzone) {
			self.MoveDown( dt, kAIMoveScale );
		    }
		}
		else {
		    if (gDebug) { DrawTextFaint("NONE", "center", gw(0.8), gh(0.1), gRegularFontSizePt); }
		}
	    }
	    else {
		if (gDebug) { DrawTextFaint("SLEEP", "center", gw(0.8), gh(0.1), gRegularFontSizePt); }
	    }
	});
    };

    self.IsPuckAttacking = function( puck ) {
	var is = false;
	if(isntU(puck)) {
	    var vel = Math.abs(puck.x-self.x) < Math.abs(puck.prevX-self.x);
	    var side = Sign(self.x-puck.x) != self.normalX;
	    is = vel && side;
	}
	return is;
    };

    self.UpdatePuckTarget = function() {
	var best = self.aiTarget;
	var istart = Math.min(self.scanIndex, gPucks.A.length-1);
	var iend = Math.min(self.scanIndex+self.scanCount, gPucks.A.length);
	for (var i = istart; i < iend; ++i) {
	    // todo: handle when best isLocked.
	    var p = gPucks.A.read(i);
	    if (isU(best)) {
		Assert(isntU(p), "bad puck");
		best = p;
	    }
	    else if (best != p && self.IsPuckAttacking(p)) {
		var dPuck = Distance2(self.x, self.y, p.x, p.y);
		var dBest = Distance2(self.x, self.y, best.x, best.y);
		if (!self.IsPuckAttacking(best)) {
		    best = p;
		}
		else if (dPuck < dBest) {
		    best = p;
		}
		else if (Math.abs(p.vx) > Math.abs(best.vx*2)) {
		    best = p;
		}
	    }
	}
	if (isntU(best)) {
	    self.aiTarget = best;
	}
	self.scanIndex += self.scanCount;
	if (self.scanIndex > gPucks.A.length-1) {
	    self.scanIndex = 0;
	}
    };

    self.Init(spec.label);
}
