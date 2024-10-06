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
       isPillSeeker,
       stepSize,
       keyState,
       stickState,
       buttonState,
       }
    */
    var self = this;

    self.Init = function(label) {
        self.id = gNextID++;

        self.isXtra = props.isXtra; // temporary, for debugging.

        self.isPlayer = props.isPlayer;
        self.side = props.side;
        // barriers are { x, y, width, height,
        //   prevX, prevY,
        //   CollisionTest()
        self.barriers = {
            A: new ReuseArray(kBarriersArrayInitialSize),
            B: new ReuseArray(kBarriersArrayInitialSize)
        };
        // xtras are mini paddles.
        self.xtras = {
            A: new ReuseArray(kXtrasArrayInitialSize),
            B: new ReuseArray(kXtrasArrayInitialSize)
        };
        // neos are sticky fly traps.
        self.neo = undefined;

        self.hp0 = props.hp;
        self.hp = props.hp;
        self.x0 = props.x;
        self.x = props.x;
        self.y = props.y;
        self.yMin = aub(props.yMin, gYInset);
        self.yMax = aub(props.yMax, gHeight-gYInset);
        self.isAtLimit = false;
        self.prevX = self.x;
        self.prevY = self.y;
        self.width = props.width;
        self.height = props.height;
        self.isSplitter = aub(props.isSplitter, false);
        self.isPillSeeker = aub(props.isPillSeeker, false);
        self.alive = isU(self.hp) || self.hp > 0;
        self.engorgedHeight = gPaddleHeight * 2;
        self.engorgedWidth = gPaddleWidth * 0.8;
        // admitedly these names are too visually similar. :-(
        self.aiPuck = undefined;
        self.aiPill = undefined;
        self.aiCountdownToUpdate = kAIPeriod;
        self.label = props.label;
        self.engorged = false;
        self.stepSize = aub(props.stepSize, gPaddleStepSize);
        self.keyStates = props.keyStates;
        // todo: fold button & stick states together into a gamepadState wrapper.
        self.buttonStates = props.buttonStates;
        self.stickStates = props.stickStates;
        self.target = props.target;
        self.normalX = ForSide(self.side, 1, -1);
        self.scanIndex = 0;
        self.scanCount = 10;
        self.attackingNearCount = 0;
        self.nudgeX();
        self.englishFactor = 1; // match: level, puck.
    };

    self.GetCollisionBounds = function(isSuddenDeath, maxVX) {
        var bounds;
        // increase bounds when we are at the end of the level.
        if (self.isPlayer &&
            isSuddenDeath &&
            gPucks.A.length <= 3 &&
            gPucks.A.metadata?.pmaxvx > maxVX/2) {
            var yvf = self.height * 0.15;
            bounds = {
                x: self.x,
                y: self.y - yvf,
                width: self.width,
                height: self.height + yvf*2,
            };
        }
        else {
            bounds = self;
        }
        if (gDebug) {
            gDebug_DrawList.push({ fn: () => {
                gCx.strokeStyle = "yellow";
                gCx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            }});
        }
        return bounds;
    };

    self.AddBarrier = function( props ) {
        var b = new Barrier(props);
        self.barriers.A.push(b);
    };

    self.AddXtra = function( props ) {
        // todo: this is complected hard coded ugly stuff
        // because it is merging things.
        var o = new Paddle({
            side: self.side,
            ...props,
            isPlayer: false,
            isSplitter: false,
            isPillSeeker: false,
            isXtra: true,
        });
        self.xtras.A.push(o);
    };

    self.AddNeo = function( props ) {
        self.neo = new Neo(props);
    };

    self.StepPowerups = function( dt, gameState ) {
        self.StepBarriers( dt );
        self.StepXtras( dt, gameState );
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

    self.StepXtras = function( dt, gameState ) {
        self.xtras.B.clear();
        self.xtras.A.forEach(o => {
            o.Step( dt, gameState );
            o.alive && self.xtras.B.push( o );
        } );
        SwapBuffers(self.xtras);
    };

    self.StepNeo = function( dt, gameState ) {
        if (exists(self.neo)) {
            self.neo = self.neo.Step( dt, gameState );
        }
    };

    self.OnPuckHit = function() {
        if (exists(self.hp)) {
            self.hp--;
            self.alive = self.hp > 0;
        }
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

    self.Draw = function( alpha, gameState, s01, isEndScreenshot ) {
	Assert(exists(isEndScreenshot));
        self.barriers.A.forEach(b => {
            b.Draw( alpha );
        });
        self.xtras.A.forEach(x => {
            x.Draw( alpha, gameState, 1, isEndScreenshot );
        });
        if (exists(self.neo)) {
            self.neo.Draw( alpha, gameState );
        }

	if (exists(self.hp)) {
	    self.DrawAsXtra(alpha, (self.hp/self.hp0));
	}
	else {
            self.DrawAsPlayer(alpha, s01, isEndScreenshot);
	}
    };

    self.DrawAsXtra = function( alpha, hp01 ) {
        Cxdo(() => {
	    var hpw = Math.max(sx1(2), ii(self.width * hp01));
            var wx = WX(self.x + (self.width-hpw)/2);
            var wy = WY(self.y);
	    gCx.beginPath();
	    gCx.rect( wx, wy, hpw, self.height );
	    // match: barrier hp inflection point.
	    gCx.fillStyle = RandomForColorFadeIn((hp01 > 0.2) ? greenSpec : yellowSpec, alpha);
	    gCx.fill();
	});
    };
    
    self.DrawAsPlayer = function( alpha, s01, isEndScreenshot ) {
	// todo: way too much complectification here of xtra vs. attract vs. playing paddles.
	// e.g. s01 == undefined implies attract mode player paddle.
	Cxdo(() => {
            var wx = WX(self.x);
            var wy = WY(self.y);

	    if (exists(s01)) {
		// outline. not drawn for attract mode.
		gCx.beginPath();
		gCx.rect( wx, wy, self.width, self.height );
		gCx.lineWidth = sxi(2);
		gCx.strokeStyle = RandomGreen(alpha);
		gCx.stroke();
	    }

	    // insides. gets more empty as the split count s01 goes down.
	    gCx.beginPath();
	    gCx.rect( wx, wy, self.width, self.height );
	    gCx.fillStyle = exists(s01) ?
		RandomForColorFadeIn(cyanSpec, alpha * Math.max(0.1, s01)) :
		RandomGreen(alpha);
	    gCx.fill();

	    if (exists(self.label) && !isEndScreenshot) {
                // label lives longer so newbies can notice it.
                var fadeInMsec = kGreenFadeInMsec * 3;
                var gt01 = GameTime01(fadeInMsec);
                if (gt01 >= 1) {
		    self.label = undefined;
                }
                else {
		    var ly = self.y-20;
		    var bright = gR.RandomFloat() > gt01;
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

    self.DrawDebug = function() {
        self.DrawDebugSinglePaddle(self);
        self.xtras.A.forEach(x => self.DrawDebugSinglePaddle(x));
    };

    self.DrawDebugSinglePaddle = function(paddle) {
        if (gDebug) {
            Cxdo(() => {
                gCx.beginPath();
                gCx.strokeStyle = "red";
                gCx.moveTo(paddle.GetMidX(), paddle.GetMidY());
                gCx.lineTo(paddle.GetMidX() + sx1(10) * paddle.normalX, paddle.GetMidY());
                gCx.lineWidth = 2;
                gCx.stroke();

                if (exists(paddle.debugMsg)) {
                    gCx.fillStyle = "blue";
                    DrawText(
                        paddle.debugMsg,
                        ForSide(paddle.side, "left", "right"),
                        ForSide(paddle.side, gw(0.1), gw(0.9)),
                        gh(0.2),
                        gSmallFontSizePt
                    );
                }
                if( exists(paddle.aiPuck)) {
                    gCx.strokeStyle = "red";
                    gCx.beginPath();
                    gCx.arc( paddle.aiPuck.midX, paddle.aiPuck.midY,
                             paddle.aiPuck.width * 1.5,
                             0, k2Pi,
                             true );
                    gCx.stroke();
                }
            });
        }
    };

    self.MoveDown = function( dt, scale=1 ) {
        self.prevY = self.y;
	var step = self.stepSize * scale * dt * kPhysicsStepScale;
        self.y += step;
        self.isAtLimit = false;
        if( self.y+self.height > self.yMax ) {
            self.y = self.yMax-self.height;
            self.isAtLimit = true;
        }
        self.nudgeX();
    };

    self.MoveUp = function( dt, scale=1 ) {
        self.prevY = self.y;
	var step = self.stepSize * scale * dt * kPhysicsStepScale;
        self.y -= step;
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
        self.StepInput( dt );
        self.StepTarget( dt );
    };
    
    self.StepInput = function( dt ) {
        // todo: ideally the most recent input would win.
        if( self.IsUp() ) {
            self.MoveUp( dt );
        }
        else if( self.IsDown() ) {
            self.MoveDown( dt );
        }
    };

    self.IsUp = function() {
        return self.keyStates.some(ks => ks.$.up) ||
            self.stickStates.reduce((up, state) => up || state.$.up, false) ||
            self.buttonStates.reduce((up, state) => up || state.$.up, false);
    };

    self.IsDown = function() {
        return self.keyStates.some(ks => ks.$.down) ||
            self.stickStates.reduce((up, state) => up || state.$.down, false) ||
            self.buttonStates.reduce((up, state) => up || state.$.down, false);
    };

    self.StepTarget = function( dt ) {
        var targety = self.target.position.y;
        if( exists(targety) ) {
            var limit = gYInset + gPaddleHeight/3;
            targety = Clip(
                targety,
                limit,
                gHeight - limit
            );
            if( targety < self.GetMidY() ) {
                self.MoveUp( dt );
            }
            if( targety > self.GetMidY() ) {
                self.MoveDown( dt );
            }

            // clear the target if not needed.
            if( !self.target.isDown() ) {
                if( Math.abs(self.GetMidY() - targety) < gPaddleStepSize ) {
                    self.target.ClearY();
                }
                if( self.isAtLimit ) {
                    self.target.ClearY();
                }
            }
        }
    };


    // ........................................ AI (hacky junk).

    self.OnPuckMoved = function( p, i ) {
        if (i == 0) {
            self.attackingNearCount = 0;
        }
        if (Sign(p.vx) != self.normalX &&
            Math.abs(p.x-self.x) < Math.abs(gw(0.5)-self.x)) {
            self.attackingNearCount++;
        }
    };

    self.StepAI = function( dt, gameState ) {
	Assert(!self.isPlayer);
        if (isU(self.aiPuck) || !self.aiPuck.alive) { self.aiPuck = undefined; }
        if (isU(self.aiPill) || !self.aiPill.alive) { self.aiPill = undefined; }
        self.AISeek( dt, gameState.level.index );
        if (self.shouldUpdate()) {
            self.UpdatePuckTarget();
            self.UpdatePillTarget(gameState);
        }
    };

    self.AISeek = function( dt, levelIndex ) {
        // heuristics are kind of a nightmare to maintain;
        // the order here does matter. and still isn't great.
        var PS = self.isPillSeeker;

        // ai paddle can turn around vertically more responsively
        // than most any human player, hence < 1 rather than = 1
        // for regular mode. but even in easy mode, ai slowly
        // gets better to make things more interesting.
        var levelScale = (levelIndex-1) * 0.02;

        // only 1p regular has the slower ai paddle.
        var scale = ForGameMode({
            regular: 0.4,
            hard: 1.1,
        }) + levelScale;
        scale = Clip(scale, 0.1, 1.2);

        if (gDebug) {
            gDebug_DrawList.push({ fn: () => {
                gCx.fillStyle = "blue";
                DrawText(F(scale), "center", gw(0.8), gh(0.6), gSmallestFontSizePt);
            }});
        }

        if (PS && exists(self.aiPill) && self.aiPill.isUrgent) {
            self.debugMsg = "PILL_1";
            self.AISeekTargetMidY( dt, self.aiPill.y + self.aiPill.height/2, scale );
            return;
        }

        if (PS && self.attackingNearCount == 0 && exists(self.aiPill)) {
            self.debugMsg = "PILL_2";
            self.AISeekTargetMidY( dt, self.aiPill.y + self.aiPill.height/2, scale );
            return;
        }

        if (exists(self.aiPuck) && self.isPuckAttacking(self.aiPuck)) {
            self.debugMsg = "PUCK";
            self.AISeekTargetMidY( dt, self.aiPuck.midY, scale );
            return;
        }

        if (PS && exists(self.aiPill)) {
            self.debugMsg = "PILL_3";
            self.AISeekTargetMidY( dt, self.aiPill.y + self.aiPill.height/2, scale );
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
        var deadzone = (self.height * scale * 1/3);
        if( tmy <= self.GetMidY() - deadzone) {
            self.MoveUp( dt, scale );
        }
        else if( tmy >= self.GetMidY() + deadzone) {
            self.MoveDown( dt, scale );
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
        if (istart < 0) { return; }
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
        self.aiPill = gameState.level.p2Pill;
    };

    self.Init(props.label);
}
