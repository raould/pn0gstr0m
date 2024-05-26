/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function Puck(spec) {
    /* spec = { x, y, vx, vy, ur=true, forced=false } */

    var self = this;

    self.Init = function() {
	self.id = gNextID++;
	self.x = spec.x;
	self.y = spec.y;
	self.prevX = self.x;
	self.prevY = self.y;
	self.width = gPuckWidth;
	self.height = gPuckHeight;
	// tweak max vx to avoid everything being too visually lock-step.
	self.vx = Sign(spec.vx) * Math.min(RandomCentered(gMaxVX, 1), Math.abs(spec.vx));
	self.vy = AvoidZero(spec.vy, 0.8);
	self.alive = true;
	self.startTime = gGameTime;
	self.splitColor = aorb(spec.forced, false) ? "yellow" : "white";
	self.ur = aorb(spec.ur, true);
	self.isLocked = false;
    };

    self.GetMidX = function() {
	return self.x + self.width/2;
    };

    self.GetMidY = function() {
	return self.y + self.height/2;
    };

    self.Draw = function( alpha ) {
	var wx = self.x;
	var wy = self.y;
	// make things coming toward you be slightly easier to see.
	var amod = alpha * ForSide(-1,1) == Sign(self.vx) ? 1 : 0.8;
	Cxdo(() => {
	    // young pucks (mainly splits) render another color briefly.
	    var dt = GameTime01(1000, self.startTime);
	    gCx.globalAlpha = amod;
	    gCx.fillStyle = (!self.ur && gRandom() > dt) ? self.splitColor : RandomCyan();
	    gCx.fillRect( wx, wy, self.width, self.height );
	    // a thin outline keeps things crisp when there are lots of pucks.
	    gCx.lineWidth = sx1(1);
	    gCx.globalAlpha = 1;
	    gCx.strokeStyle = "black";
	    gCx.strokeRect( wx-1, wy-1, self.width+2, self.height+2 );
	});
    };

    self.Step = function( dt ) {
	if( self.alive && !self.isLocked ) {
	    dt = kMoveStep * (dt/kTimeStep);
	    self.prevX = self.x;
	    self.prevY = self.y;
	    self.x += (self.vx * dt);
	    self.y += (self.vy * dt);
	    var xout = self.x < 0 || self.x+self.width >= gWidth;
	    var yout = self.y < 0 || self.y+self.height >= gHeight;
	    self.alive = !(xout || yout);
	}
    };

    self.SplitPuck = function(forced=false) {
	var np = undefined;
	var count = gPucks.A.length;
	dosplit = forced || (count < ii(kEjectCountThreshold*0.7) || (count < kEjectCountThreshold && RandomBool(1.05-Clip01(Math.abs(self.vx/gMaxVX)))));

	// sometimes force ejection to avoid too many pucks.
	// if there are already too many pucks to allow for a split-spawned-puck,
	// then we also want to sometimes eject the existing 'self' puck
 	// to avoid ending up with just a linear stream of pucks.
	var r = gRandom();
 	var countFactor = Clip01(count/kEjectSpeedCountThreshold);
	var ejectCountFactor = Math.pow(countFactor, 3);
	var doejectCount = (count > kEjectCountThreshold) && (r < 0.1);
	var doejectSpeed = (self.vx > gMaxVX*0.9) && (r < ejectCountFactor);
	var doeject = doejectCount || doejectSpeed;

	if (!forced && !dosplit) { // i cry here.
	    if (doeject) {
		self.vy *= 1.1;
	    }
	}
	else {
	    // i'm sure this set of heuristics is clearly genius.
	    var slowCountFactor = Math.pow(countFactor, 1.5);
	    var slow = !doejectSpeed && (self.vx > gMaxVX*0.7) && (gRandom() < slowCountFactor);
	    var nvx = self.vx * (slow ? RandomRange(0.8, 0.9) : RandomRange(1.01, 1.1));
	    var nvy = self.vy;
	    nvy = self.vy * (AvoidZero(0.5, 0.1) + 0.3);
	    np = new Puck({ x: self.x, y: self.y, vx: nvx, vy: nvy, ur: false, forced });
	    PlayExplosion();

	    // fyi because SplitPuck is called during MovePucks,
	    // we return the new puck to go onto the B list, whereas
	    // MoveSparks happens after so it goes onto the A list.
	    AddSparks(self.x, self.y, self.vx, self.vy);
	}

	return np;
    };

    self.CollisionTest = function( xywh, blockvx ) {
	if( self.alive && !self.isLocked ) {
	    if (isU(blockvx) || Sign(self.vx) == blockvx) {
		// !? assuming small enough simulation stepping !?

		// currently overlapping?
		var xRight = self.x >= xywh.x+xywh.width;
		var xLeft = self.x+self.width < xywh.x;
		var xSafe = xRight || xLeft;
		var xOverlaps = !xSafe;
		var yTop = self.y >= xywh.y+xywh.height;
		var yBottom = self.y+self.height < xywh.y;
		var ySafe = yTop || yBottom;
		var yOverlaps = !ySafe;

		// check if we seemed to have passed over xywh.
		// not going to require prevx from xywh so just use x
		// on the assumption they don't move at all, or not too fast anyway.
		var dxOverlaps = Sign(self.prevX - xywh.x) != Sign(self.x - xywh.x);
		return yOverlaps && (xOverlaps || dxOverlaps);
	    }
	}
	return false;
    };

    self.BounceCollidableX = function( xywh ) {
	var did = false;
	if( self.vx > 0 ) {
	    did = true;
	    self.x = xywh.x - self.width;
	}
	else {
	    did = true;
	    self.x = xywh.x + xywh.width;
	}
	self.vx *= -1;
	return did;
    };

    self.PaddleCollision = function( paddle ) {
	var newPuck = undefined;
	var hit = paddle.CollisionTest( self );
	if ( hit ) {
	    // todo: bounce Y.
	    self.BounceCollidableX( paddle );

	    // smallest bit of vertical english.
	    // too much means you never get to 'streaming'.
	    // too little means you maybe crash the machine :-)
	    var dy = self.GetMidY() - paddle.GetMidY();
	    var mody = gRandom() * 0.055 * Math.abs(dy);
	    if( self.GetMidY() < paddle.GetMidY() ) {
		self.vy -= mody;
	    }
	    else if( self.GetMidY() > paddle.GetMidY() ) {
		self.vy += mody;
	    }

	    if (paddle.isSplitter) {
		newPuck = self.SplitPuck();
	    }
	}
	return newPuck;
    };

    self.AllPaddlesCollision = function( paddles ) {
	var spawned = [];
	if (self.alive && !self.isLocked) {
	    paddles.forEach( function(paddle) {
		var np = self.PaddleCollision(paddle);
		if( isntU(np) ) {
		    spawned.push( np );
		}
	    } );
	}
	return spawned;
    };

    self.BarriersCollision = function() {
	if (self.alive && !self.isLocked) {
	    gBarriers.A.forEach( function(barrier) {
		var hit = barrier.CollisionTest( self );
		if (hit) {
		    PlayBlip();
		    // todo: bounds adjustment.
		    self.vx *= -1;
		}
	    } );
	}
    };
    
    self.OptionsCollision = function() {
	if (self.alive && !self.isLocked) {
	    gOptions.A.forEach( function(option) {
		var hit = option.CollisionTest( self, ForSide(-1,1) );
		if (hit) {
		    PlayBlip();
		    // todo: bounds adjustment.
		    self.vx *= -1;
		}
	    } );
	}
    };

    self.NeoCollision = function() {
	if (self.alive && !self.isLocked && isntU(gNeo)) {
	    var hit = gNeo.CollisionTest( self );
	    if (hit) {
		PlayBlip();
		self.isLocked = true;
	    }
	}
    };

    self.WallsCollision = function() {
	if (self.alive && !self.isLocked) {
	    var did = false;
	    if( self.y < gYInset ) {
		did = true;
		self.y = gYInset;
	    }
	    if( self.y+self.height > gHeight - gYInset ) {
		did = true;
		self.y = gHeight - gYInset - self.height;
	    }
	    if (did) {
		self.vy *= -1;
		PlayBlip();
	    }
	}
    };

    self.UpdateScore = function() {
	if (!self.alive) { // oh, well, i hope this never gets called twice, ya know?
	    var wasLeft = self.x < gw(0.5);
	    if (wasLeft) {
		ForSide(
		    () => { gCPUScore += kScoreIncrement; },
		    () => { gPlayerScore += kScoreIncrement; }
		)();
	    }
	    else {
		ForSide(
		    () => { gPlayerScore += kScoreIncrement; },
		    () => { gCPUScore += kScoreIncrement; }
		)();
	    }
	}
    };

    self.Init();
}
