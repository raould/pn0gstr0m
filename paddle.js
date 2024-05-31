/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function Paddle(props) {
    /* props is {
       isPlayer,
       side,
       x, y,
       yMin, yMax,
       width, height,
       label,
       hp,
       isSplitter,
       stepSize,
       }
    */
    var self = this;

    self.Init = function(label) {
	self.isPlayer = props.isPlayer;
	self.side = props.side;
	// barriers are { x, y, width, height,
	//   prevX, prevY,
	//   CollisionTest()
	self.barriers = {
	    A: new ReuseArray(kBarriersArrayInitialSize),
	    B: new ReuseArray(kBarriersArrayInitialSize)
	};
	// options are mini paddles.
	self.options = {
	    A: new ReuseArray(kOptionsArrayInitialSize),
	    B: new ReuseArray(kOptionsArrayInitialSize)
	};
	// neos are sticky fly traps.
	self.neo = undefined;

	self.id = gNextID++;
	self.hp0 = props.hp;
	self.hp = props.hp;
	self.x0 = props.x;
	self.x = props.x;
	self.y = props.y;
	self.yMin = aorb(props.yMin, gYInset);
	self.yMax = aorb(props.yMax, gHeight-gYInset);
	self.isAtLimit = false;
	self.prevX = self.x;
	self.prevY = self.y;
	self.width = props.width;
	self.height = props.height;
	self.blockvx = self.x >= gw(0.5) ? 1 : -1;
	self.isSplitter = aorb(props.isSplitter, false);
	self.alive = isU(self.hp) || self.hp > 0;
	self.engorgedHeight = gPaddleHeight * 2;
	self.engorgedWidth = gPaddleWidth * 0.8;
	// admitedly these names are too visually similar. :-(
	self.aiPuck = undefined;
	self.aiPill = undefined;
	self.aiCountdownToUpdate = kAIPeriod;
	self.label = props.label;
	self.engorged = false;
	self.stepSize = aorb(props.stepSize, gPaddleStepSize);
	self.normalX = ForSide(self.side, 1, -1);
	self.scanIndex = 0;
	self.scanCount = 10;
	self.attackingNearCount = 0;
	self.nudgeX();
    };

    self.AddBarrier = function( props ) {
	var b = new Barrier(props);
	self.barriers.A.push(b);
    };

    self.AddOption = function( props ) {
	var o = new Paddle(props);
	self.options.A.push(o);
    };

    self.AddNeo = function( props ) {
	self.neo = new Neo(props);
    };

    self.StepPowerups = function( dt, gameState ) {
	self.StepBarriers( dt );
	self.StepOptions( dt, gameState );
	self.StepNeo( dt, gameState );
    };

    self.StepBarriers = function( dt ) {
	self.barriers.B.clear();
	self.barriers.A.forEach(s => {
	    s.Step( dt );
	    s.alive && self.barriers.B.push( s );
	} );
	SwapBuffers(self.barriers);
    };

    self.StepOptions = function( dt, gameState ) {
	self.options.B.clear();
	self.options.A.forEach(o => {
	    o.Step( dt, gameState );
	    o.alive && self.options.B.push( o );
	} );
	SwapBuffers(self.options);
    };

    self.StepNeo = function( dt, gameState ) {
	if (exists(self.neo)) {
	    self.neo = self.neo.Step( dt, gameState );
	}
    };

    self.CollisionTest = function( puck ) {
	var hit = puck.CollisionTest( self, self.blockvx );
	if (hit && exists(self.hp)) {
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
	var xoff = xyNudge(self.y, self.height, 10, self.side);
	self.x = self.x0 + xoff;
    };

    self.getVX = function() {
	return (self.x - self.prevX) / kTimeStep;
    };

    self.getVY = function() {
	return (self.y - self.prevY) / kTimeStep;
    };

    self.Draw = function( alpha, gameState ) {
	self.barriers.A.forEach(b => {
	    b.Draw( alpha );
	});
	self.options.A.forEach(o => {
	    o.Draw( alpha, gameState );
	});
	if (exists(self.neo)) {
	    self.neo.Draw( alpha, gameState );
	}
	Cxdo(() => {
	    gCx.fillStyle = RandomGreen(0.7 * alpha);

	    var hpw = isU(self.hp) ?
		self.width :
		Math.max(sx1(2), ii(self.width * self.hp/self.hp0));
	    var wx = WX(self.x + (self.width-hpw)/2);
	    var wy = WY(self.y);
	    gCx.fillRect( wx, wy, hpw, self.height );

	    if (exists(self.label)) {
		// label lives longer so newbies can notice it.
		var fadeInMsec = kFadeInMsec * 3;
		var gt01 = GameTime01(fadeInMsec);
		if (gt01 >= 1) {
		    self.label = undefined;
		}
		else {
		    var ly = self.y-20;
		    var bright = gRandom() > gt01;
		    // alpha flicker progressing toward fully faded then gone.
		    var bm = bright ? 1 : 0.5;
		    // a hack: also use alpha to "clip" the label before it renders out of crt bounds.
		    var am = T10( Math.abs(ly - gh(0.5)), gh(0.4) );
		    var a = bm * am * alpha;
		    gCx.fillStyle = RandomGreen(a);
		    DrawText( self.label, "center", self.GetMidX(), ly, gSmallFontSizePt );
		}
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

    self.Step = function( dt, gameState ) {
	if (self.isPlayer) {
	    self.StepPlayer( dt );
	}
	else {
	    self.StepAI( dt, gameState );
	}
	self.StepPowerups( dt, gameState );
    };

    //---------------------------------------- player.

    self.StepPlayer = function( dt ) {
	console.log("paddle", gStickUp, gStickDown);
	if( gUpPressed || gStickUp ) {
	    self.MoveUp( dt );
	}
	if( gDownPressed || gStickDown ) {
	    self.MoveDown( dt );
	}
	if( exists(gMoveTargetY) ) {
	    var limit = gYInset + gPaddleHeight/2;
	    gMoveTargetY = Clip(
		gMoveTargetY + gMoveTargetStepY,
		limit,
		gHeight - limit
	    );
	    if( gMoveTargetY < self.GetMidY() ) {
		self.MoveUp( dt );
	    }
	    if( gMoveTargetY > self.GetMidY() ) {
		self.MoveDown( dt );
	    }
	    // if the player isn't touching and the
	    // paddle is close enough then don't
	    // potentially wiggle steppming up & down
	    // around gMoveTargetY.
	    if( !isPointerDown() ) {
		if( Math.abs(self.GetMidY() - gMoveTargetY) < gPaddleStepSize ) {
		    gMoveTargetY = undefined;
		}
		if( self.isAtLimit ) {
		    gMoveTargetY = undefined;
		}
	    }
	}
    };


    // ........................................ AI (hacky junk).

    self.OnPuck = function( p, i ) {
	if (i == 0) {
	    self.attackingNearCount = 0;
	}
	if (Sign(p.vx) != self.normalX &&
	    Math.abs(p.x-self.x) < Math.abs(gw(0.5)-self.x)) {
	    self.attackingNearCount++;
	}
    };

    self.StepAI = function( dt, gameState ) {
	if (isU(self.aiPuck) || !self.aiPuck.alive) { self.aiPuck = undefined; }
	if (isU(self.aiPill) || !self.aiPill.alive) { self.aiPill = undefined; }
	self.AISeek( dt );
	if (self.shouldUpdate()) {
	    self.UpdatePuckTarget();
	    self.UpdatePillTarget(gameState);
	}
    };

    self.AISeek = function( dt ) {
	if (self.attackingNearCount == 0 && exists(self.aiPill)) {
	    self.AISeekTargetMidY( dt, self.aiPill.y + self.aiPill.height/2, 1.2 );
	    return;
	}

	if (exists(self.aiPuck) && self.isPuckAttacking(self.aiPuck)) {
	    self.AISeekTargetMidY( dt, self.aiPuck.GetMidY(), 1 );
	    return;
	}

	if (exists(self.aiPill)) {
	    self.AISeekTargetMidY( dt, self.aiPill.y + self.aiPill.height/2, 1.2 );
	    return;
	}
    };

    self.shouldUpdate = function() {
	self.aiCountdownToUpdate--;
	var hasPuck = self.aiPuck?.alive ?? false;
	var hasPill = self.aiPill?.alive ?? false;
	var should = !hasPuck && !hasPill;
	if( !should ) {
	    should = self.aiCountdownToUpdate <= 0;
	}
	if( !should && hasPuck ) {
	    should = !self.isPuckAttacking( self.aiPuck );
	}

	if( should ) {
	    self.aiCountdownToUpdate = kAIPeriod;
	}
	return should;
    };

    self.AISeekTargetMidY = function( dt, tmy, scale ) {
	var deadzone = (self.height*0.2);
	if( tmy <= self.GetMidY() - deadzone) {
	    self.MoveUp( dt, kAIMoveScale * scale );
	}
	else if( tmy >= self.GetMidY() + deadzone) {
	    self.MoveDown( dt, kAIMoveScale * scale );
	}
    };

    self.isPuckAttacking = function( puck ) {
	var is = false;
	if(exists(puck)) {
	    var vel = Math.abs(puck.x-self.x) < Math.abs(puck.prevX-self.x);
	    var side = Sign(self.x-puck.x) != self.normalX;
	    is = vel && side;
	}
	return is;
    };

    self.UpdatePuckTarget = function() {
	var best = self.aiPuck;
	var istart = Math.min(self.scanIndex, gPucks.A.length-1);
	var iend = Math.min(self.scanIndex+self.scanCount, gPucks.A.length);
	for (var i = istart; i < iend; ++i) {
	    // todo: handle when best isLocked.
	    var p = gPucks.A.read(i);
	    if (isU(best)) {
		Assert(exists(p), "bad puck");
		best = p;
	    }
	    else if (best != p && self.isPuckAttacking(p)) {
		var dPuck = Distance2(self.x, self.y, p.x, p.y);
		var dBest = Distance2(self.x, self.y, best.x, best.y);
		if (!self.isPuckAttacking(best)) {
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
	if (exists(best)) {
	    self.aiPuck = best;
	}
	self.scanIndex += self.scanCount;
	if (self.scanIndex > gPucks.A.length-1) {
	    self.scanIndex = 0;
	}
    };

    self.UpdatePillTarget = function(gameState) {
	self.aiPill = gameState.cpuPill;
    };

    self.Init(props.label);
}
