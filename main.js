/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// Welcome to The Land of Global Varibles, And Inconsistent Naming.
//
// sorry: velocities are kinda hacky guesstimates;
// the naming is horrible just about everywhere;
// this code is probably like 85.2% bugs or bad taste.
//
// note: my use of
// "left" is -x in canvas coordinates;
// "up" is -y in canvas coordinates;
// ideally (x,y) of objects consistenly means (left,top).
//
// note: the noyb2 font only has upper case letters,
// with a few icons in the lower case.

var gDebug = false;
var gShowToasts = gDebug;

var kCanvasName = "canvas"; // match: index.html
var gLifecycle;

// the game was designed based on this default aspect & resolution kindasorta.
var kAspectRatio = 16/9;
var kHtmlWidth = 512; // match: index.html
var kHtmlHeight = 288; // match: index.html
Assert(Math.abs(kHtmlWidth/kHtmlHeight - kAspectRatio) < 0.1, "unexpected html aspect ratio");
var gWidth = kHtmlWidth;
var gHeight = kHtmlHeight;
Assert(Math.abs(gWidth/gHeight - kAspectRatio) < 0.1, "unexpected g aspect ratio");
function getBorderFactor() {
    // giving portrait more buffer on left and right for thumbs also
    // because the overall playfield is visually smaller, has fewer pixels
    // than landscape does.
    return getWindowAspect() > 1 ? 0.8 : 0.7;
}
function getWindowAspect() {
    return window.innerWidth / window.innerHeight;
}

// ----------------------------------------

// slightly useful for testing collisions when enabled
// but carries some hacky tech debt
// and can mislead about regular behaviour?!
var kDrawAIPuckTarget = true;

// i.e. attract mode.
var gMonochrome;
var kFadeInMsec = gDebug ? 1000 : 7000;

var kHighScoreKey = 'pn0g_high';
var gHighScore;

// note that all the timing and stepping stuff is maybe fragile vs. frame rate?!
// although i did try to compensate in the run loop.
var kFPS = 30;
var kTimeStep = 1000/kFPS;
var kMaybeWasPausedInTheDangedDebuggerMsec = 1000 * 1; // whatevez!
var gStartTime = 0;
var gGameTime = 0;
var gLastFrameTime = gStartTime;
var gFrameCount = 0;
var kMoveStep = 1; // i don't really know what the units are here at all.
var kAIPeriod = 5;
var kAIMoveScale = 1.2;

var gDashedLineCount;
var gDashedLineWidth;
var gXInset;
var gYInset;
var gPaddleHeight;
var gPaddleWidth;
var gPaddleStepSize;
var gPuckHeight;
var gPuckWidth;
var gPauseCenterX;
var gPauseCenterY;
var gPauseRadius;
// this is the lower of 2 mute buttons.
var gUserMutedCenterX;
var gUserMutedCenterY;
var gUserMutedWidth;
var gUserMutedHeight;
var gSparkWidth;
var gSparkHeight;
var gBigFontSize;
var gRegularFontSize;
var gSmallFontSize;
var gSmallestFontSize;
var gBigFontSizePt;
var gRegularFontSizePt;
var gSmallFontSizePt;
var gSmallestFontSizePt;
var gMinVX;
var gMaxVX;
function ii(v) { return Math.floor(0.5 + v); }
// "absolute" casling helpers to scale values based on actual canvas resolution.
// arbiraryily trying to consistently use sx() for symmetrics e.g. lineWidth.
function sxi(x) { return ii(sx(x)); }
function syi(y) { return ii(sy(y)); }
function sx(x) { return x * gWidth/kHtmlWidth; }
function sy(y) { return y * gHeight/kHtmlHeight; }
// some scaled values have more change of ever becoming zero than others,
// so these helpers can be used to avoid that if needed e.g. pixel widths.
function sx1(x) { return Math.max(1, sxi(x)); }
function sy1(y) { return Math.max(1, syi(y)); }
// "percent" scaling helpers.
function gw(x=1) { return x == 1 ? gWidth : ii(x * gWidth); }
function gh(y=1) { return y == 1 ? gHeight : ii(y * gHeight); }
function RecalculateConstants() {
    gDashedLineCount = syi(15);
    gDashedLineWidth = sx1(2);
    gXInset = sxi(15);
    gYInset = sxi(15);
    gPaddleHeight = gh(0.11);
    gPaddleWidth = sxi(6);
    gPaddleStepSize = gPaddleHeight * 0.2;
    gPuckHeight = gPuckWidth = gh(0.015);
    gPauseCenterX = gw(0.54);
    gPauseCenterY = gh(0.08);
    gPauseRadius = sxi(10);
    gUserMutedCenterX = gw(0.9);
    gUserMutedCenterY = gh(0.85);
    gUserMutedWidth = sxi(40);
    gUserMutedHeight = syi(30);
    gSparkWidth = sxi(2);
    gSparkHeight = syi(2);
    gBigFontSize = NearestEven(gw(0.088));
    gRegularFontSize = NearestEven(gw(0.047));
    gReducedFontSize = NearestEven(gw(0.037));
    gSmallFontSize = NearestEven(gw(0.027));
    gSmallestFontSize = NearestEven(gw(0.018));
    gBigFontSizePt = gBigFontSize + "pt";
    gRegularFontSizePt = gRegularFontSize + "pt";
    gReducedFontSizePt = gReducedFontSize + "pt";
    gSmallFontSizePt = gSmallFontSize + "pt";
    gSmallestFontSizePt = gSmallestFontSize + "pt";
    gMinVX = Math.max(0.5, sxi(1));
    gMaxVX = sxi(14);
}

// anything here below that ends up depending on
// gWidth or gHeight must got up into RecalculateConstants().

var kFontName = "noyb2Regular";
var kStartPuckCount = 1;
var kMaxSparkFrame = 10;
var kEjectCountThreshold = 100;
var kEjectSpeedCountThreshold = 90;
var kPuckArrayInitialSize = 300;
var kSparkArrayInitialSize = 200;
var kBarriersArrayInitialSize = 4;
var kOptionsArrayInitialSize = 6;
var kSpawnPillFactor = 0.004;
var kPillSpawnCooldown = 1000 * 10;
var gPillSpawnCountdown = kPillSpawnCooldown;

var gNextID = 0;

// gosh what if we had an actual button api?

// fyi pausing is a feature only of GameState, no other states.
var gDownKeys = {};
function clearKeysPressed() { gDownKeys = {}; }
// "any" is a misnomer in that it is only valid game keys.
function anyKeyPressed() {
    var downs = Object.keys(gDownKeys);
    var any = downs.length > 0;
    return any;
}

// these must match ResetInput.
var gPauseButtonEnabled = false; // really only for GameState.
var gPausePressed = false;
var gUserMutedButtonEnabled = false;
var gUserMutedPressed = false;
var gUpPressed = false;
var gDownPressed = false;
var gStickUp = false;
var gStickDown = false;
var gAddPuckPressed = false;
var gGameOverPressed = false;
var gSpawnPillPressed = false;
var gNextMusicPressed = false;
function ResetInput() { // abomination.
    gPausePressed = false;
    gUserMutePressed = false;
    gUpPressed = false;
    gDownPressed = false;
    gStickUp = false;
    gStickDown = false;
    gMoveTargetY = undefined;
    gAddPuckPressed = false;
    gGameOverPressed = false;
    gSpawnPillPressed = false;
    gNextMusicPressed = false;
}
var gPointerSide = undefined;

var gEventQueue = [];
var kEventKeyDown = "key_down";
var kEventKeyUp = "key_up";
var kEventTouchStart = "touch_start";
var kEventTouchMove = "touch_move";
var kEventTouchEnd = "touch_end";
var kEventMouseDown = "mouse_down";
var kEventMouseMove = "mouse_move";
var kEventMouseUp = "mouse_up";
var kEventStickUp = "stick_up";
var kEventStickDown = "stick_down";

// due to history
// "touch" also kinda
// subsumes mouse pointer.
var gPointerTapTimeout = 350;
var gPointerTimestamps = { start: undefined, end: undefined };
var gPointerX = -1;
var gPointerY = -1;
var gPointerScaleX = 1;
var gPointerScaleY = 1;
var gMoveTargetY = undefined;
var gMoveTargetStepY = 0;
function isPointerEnabled() {
    var is = notU(gPointerTimestamps.start);
    return is;
}
function isPointerDown() {
    var is = isPointerEnabled() && isU(gPointerTimestamps.end);
    return is;
}
function cancelTouch() {
    gPointerTimestamps.end = gGameTime;
}

var kScoreIncrement = 1;
var gPlayerScore = 0;
var gCPUScore = 0;

// todo: move all these into GameState.
// todo: use typescript.
var gPucks; // { A:[], B:[] }
var gSparks; // { A:[], B:[] }
var gPill; // there can be (at most) only 1 (at a time).
// barriers are { x, y, width, height,
//   prevX, prevY,
//   CollisionTest()
var gBarriers; // ( A:[], B:[] }
// options are mini paddles.
var gOptions; // ( A:[], B:[] }
// neos are sticky fly traps.
var gNeo; // [].

var kNoop = -1;
var kSplash = 0; // audio permission via user interaction effing eff.
var kMenu = 1;
var kGame = 2;
var kGameOver = 3;
var kDebug = 4;

var gCanvas;
var gCx;
var gToasts = [];
var gGamepad = undefined;
var kJoystickDeadZone = 0.5;
var gRandom = MakeRandom(0xDEADBEEF);

// ----------------------------------------

// note: not linear, aesthetically on purpose!
function GameTime01(period, start) {
    var diff = gGameTime - aorb(start, gStartTime);
    var t = T01(diff, (period > 0) ? period : 1000);
    return t;
}

// (all) this really needs to go into GameState.
function ForSide(left, right) {
    // due to history, undefined means right.
    if (gPointerSide == "left") {
	return left;
    }
    return right;
}

function SwapBuffers(buffers) {
    var tmp = buffers.A;
    buffers.A = buffers.B;
    buffers.B = tmp;
}

function Cxdo(fn) {
    gCx.save();
    fn();
    gCx.restore();
}

function WX( v ) {
    return v + RandomCentered(0,0.4);
}
function WY( v ) {
    return v + RandomCentered(0,0.4);
}

function DrawText( data, align, x, y, size, wiggle, font ) {
    if (wiggle != false) {
	x = WX(x);
	y = WY(y);
    }
    gCx.font = size + " " + (font ?? kFontName);
    gCx.textAlign = align;
    gCx.fillText( data.toString(), x, y );
}

function DrawTextFaint( data, align, x, y, size ) {
    gCx.globalAlpha = 0.5;
    DrawText( data, align, x, y, size, false );
}

function AddSparks(x, y, vx, vy) {
    for( var s = 0; s < 2; s++ )
    {
	var svx = vx * RandomCentered( 0, 0.5 );
	var svy = vy * RandomCentered( 0, 10 );
	gSparks.A.push( new Spark( x, y, svx, svy ) );
    }
}

function StepToasts() {
    if (gToasts.length > 0) {
	var now = Date.now();
	gToasts = gToasts.filter((t) => { return t.end > now; });
	if (gToasts.length > 0) {
	    var y = gh(0.1);
	    Cxdo(() => {
		gCx.fillStyle = "magenta";
		gToasts.forEach((t) => {
		    console.log(t.msg, gw(0.5), y);
		    DrawText(t.msg, "center", gw(0.5), y, gSmallestFontSizePt, false, "monospace");
		    y += gSmallestFontSize * 1.1;
		    if (y > gh(0.8)) { y = gh(0.1); }
		});
	    });
	}
    }
}

function PushToast(msg, lifespan=1000) {
    console.log("PushToast", msg);
    gToasts.push({
	msg: msg.toUpperCase(),
	end: Date.now() + lifespan
    });
}


function ClearScreen() {
    Cxdo(() => {
	gCx.clearRect( 0, 0, gWidth, gHeight );
    });
}

function DrawResizing() {
    Cxdo(() => {
	gCx.fillStyle = RandomColor();
	DrawText( "R E S I Z I N G", "center", gw(0.5), gh(0.3), gSmallestFontSizePt );
	DrawText( "R E S I Z I N G", "center", gw(0.5), gh(0.7), gSmallestFontSizePt );
    });
}

function DrawTitle(flicker=true) {
    Cxdo(() => {
	gCx.fillStyle = flicker ?
	    RandomForColor(cyan, RandomCentered(0.8,0.2)) :
	    rgb255s(cyan.regular);
	DrawText( "P N 0 G S T R 0 M", "center", gw(0.5), gh(0.4), gBigFontSizePt, flicker );
	DrawText( "ETERNAL BETA", "right", gw(0.92), gh(0.46), gSmallFontSizePt, flicker );
    });
}

function DrawBounds( alpha=0.5 ) {
    if (!gDebug) { return; }
    Cxdo(() => {
	gCx.beginPath();
	gCx.moveTo(WX(0), WY(0));
	gCx.lineTo(WX(gWidth), WY(gHeight));
	gCx.moveTo(WX(gWidth), WY(0));
	gCx.lineTo(WX(0), WY(gHeight));
	gCx.strokeStyle = rgb255s(white, alpha/2);
	gCx.lineWidth = 10;
	gCx.stroke();
	gCx.strokeRect(5, 5, gWidth-10, gHeight-10);
    });
    Cxdo(() => {
	gCx.beginPath();
	gCx.moveTo(WX(0), WY(0));
	gCx.lineTo(WX(gCanvas.width), WY(gCanvas.height));
	gCx.moveTo(WX(gCanvas.width), WY(0));
	gCx.lineTo(WX(0), WY(gCanvas.height));
	gCx.strokeStyle = rgb255s(magenta.regular, alpha);
	gCx.lineWidth = 2;
	gCx.stroke();
	gCx.strokeRect(5, 5, gWidth-10, gHeight-10);
    });
}

//........................................

/*class*/ function Lifecycle( handlerMap ) {

    var self = this;
    self.handlerMap = handlerMap;
    self.state = kNoop;
    self.stop = false;
    self.transitioned = false;
    self.lastTime = Date.now();

    self.Quit = function() {
	self.stop = true;
    };

    self.Pause = function() {
	var handler = self.handlerMap[self.state];
	notU(handler.Pause) && handler.Pause();
    };

    self.RunLoop = function() {
	if (self.stop) {
	    return;
	}
	// note: pausing game time is only handled/supported in GameState.
	var tt = kTimeStep;
	var now = Date.now();
	var clockDiff = now - self.lastTime;

	// oy veh oh brother sheesh barf, trying to not progress time
	// if we were stopped in the debugger.
	if (clockDiff >= kMaybeWasPausedInTheDangedDebuggerMsec) {
	    self.lastTime = now;
	}
	else {
	    self.lastTime = now;
	    gGameTime += clockDiff;
	    var dt = gGameTime - gLastFrameTime;
	    if (dt < kTimeStep) {
		tt = kTimeStep - dt;
	    }
	    else {
		var handler = self.handlerMap[self.state];
		Assert(notU(handler), self.state, "RunLoop");
		if (self.transitioned) {
		    handler.Reset();
		    self.transitioned = false;
		}
		var next = handler.Step( dt );
		if( notU(next) && next !== self.state ) {
		    console.log(`transitioned from ${self.state} to ${next}`);
		    self.transitioned = true;
		    self.state = next;
		    cancelTouch();
		}
		gLastFrameTime = gGameTime;
		++gFrameCount;
		if (gShowToasts) { StepToasts(); }
		tt = kTimeStep-(dt-kTimeStep);
	    }
	}
	setTimeout( self.RunLoop, Math.max(1, tt) );
    };
}

/*class*/ function GameState( attract=false ) {

    var self = this;
    self.attract = attract;

    self.Reset = function() {
	// this reset business is kind of a mess...
	RecalculateConstants();
	ResetGlobalStorage();
	ResetInput();
	gPowerupLocks = {};

	gPlayerScore = 0;
	gCPUScore = 0;
	gStateMuted = gMonochrome = self.attract;
	gPauseButtonEnabled = false;
	gStartTime = gGameTime;
	self.paused = false;
	self.animations = {};

	var lp = { x: gXInset, y: gh(0.5) };
	var rp = { x: gWidth-gXInset-gPaddleWidth, y: gh(0.5) };
	var p1label = attract ? undefined : "P1";

	ForSide(
	    () => {
		self.playerPaddle = new Paddle({
		    x: lp.x, y: lp.y,
		    width: gPaddleWidth, height: gPaddleHeight,
		    label: p1label,
		    isSplitter: true,
		    normalX: 1,
		});
		self.cpuPaddle = new Paddle({
		    x: rp.x, y: rp.y,
		    width: gPaddleWidth, height: gPaddleHeight,
		    normalX: -1,
		});
		ForCount(gDebug ? 3 : 1, () => { 
		    gPucks.A.push( self.CreateStartingPuck(1) );
		});
	    },
	    () => {
		self.playerPaddle = new Paddle({
		    x: rp.x, y: rp.y,
		    width: gPaddleWidth, height: gPaddleHeight,
		    label: p1label,
		    isSplitter: true,
		    normalX: -1,
		});
		self.cpuPaddle = new Paddle({
		    x: lp.x, y: lp.y,
		    width: gPaddleWidth, height: gPaddleHeight,
		    normalX: 1,
		});
		ForCount(gDebug ? 3 : 1, () => { 
		    gPucks.A.push( self.CreateStartingPuck(-1) );
		});
	    }
	)();

	PlayStart();
    };

    self.Pause = function() {
	self.paused = true;
    };

    self.Step = function( dt ) {
	if (!self.attract) { ClearScreen(); }
	self.MaybeSpawnPill( dt );
	self.ProcessInput();
	self.StepPlayer( dt );
	self.StepMoveables( dt );
	self.StepAnimations( dt );
	self.Draw();
	if (self.paused && gGameOverPressed) {
	    gGameOverPressed = false;
	    return kGameOver;
	}
	if (self.paused && gSpawnPillPressed) {
	    gSpawnPillPressed = false;
	    gPill = MakeRandomPill(self);
	}
	var nextState = self.CheckNoPucks();
	if (notU(nextState)) {
	    gPauseButtonEnabled = false;
	}
	return nextState;
    };

    self.MaybeSpawnPill = function( dt ) {
	if (!self.paused && !self.attract) {
	    gPillSpawnCountdown = Math.max(0, gPillSpawnCountdown-dt);
	    if (gPillSpawnCountdown <= 0 &&
		RandomBool(gDebug ? 0.1 : kSpawnPillFactor) &&
		isU(gPill)) {
		gPill = MakeRandomPill(self);
		if (notU(gPill)) {
		    gPillSpawnCountdown = kPillSpawnCooldown;
		}
	    }
	}
    };

    self.CheckNoPucks = function() {
	var empty = gPucks.A.length == 0;
	if (!self.attract) {
	    return empty ? kGameOver : undefined;
	}
	else {
	    if (empty) {
		gPucks.A.push(
		    self.CreateStartingPuck(RandomSign())
		);
	    }
	    return undefined;
	}
	Assert(false, "if/else/fail");
    };

    self.StepAnimations = function( dt ) {
	for (var animId in self.animations) {
	    var done = self.animations[animId].Step( dt, self );
	    if (done) {
		delete self.animations[animId];
	    }
	}
    };

    self.CreateStartingPuck = function(sign) {
	var p = new Puck({ x: gw(RandomRange(0.45, 0.48)),
			   y: gh(RandomRange(0.45, 0.5)),
			   vx: sign * gMaxVX/5,
			   vy: RandomCentered(1, 0.2),
			   ur: true });
	return p;
    };

    self.CreateRandomPuck = function() {
	var p = new Puck({ x: gw(RandomRange(3/8, 4/8)),
			   y: gh(RandomRange(3/8, 4/8)),
			   vx: RandomRange(gMaxVX/5, gMaxVX/10),
			   vy: RandomCentered(1, 0.5),
			   ur: true });
	return p;
    };

    self.ProcessInput = function() {
	if( !self.attract ) {
	    gEventQueue.forEach((event,i) => {
		event.updateFn();
		self.ProcessOneInput();
	    });
	    gEventQueue = [];
	}
    };

    self.ProcessOneInput = function() {
	if (gPauseButtonEnabled &&
	    isPointerDown()) {
	    gPausePressed = Distance2(gPointerX, gPointerY, gPauseCenterX, gPauseCenterY) < Pow2(gPauseRadius*2);
	}
	if( gPausePressed ) {
	    self.paused = !self.paused;
	    gPausePressed = false;
	}
	if( self.paused && gAddPuckPressed ) {
	    ForCount(10, () => { gPucks.A.push( self.CreateRandomPuck() ); });
	    gAddPuckPressed = false;
	}
	if (self.paused) {
	    return;
	}
    };

    self.StepPlayer = function( dt ) {
	if (self.paused) {
	    return;
	}
	if( gUpPressed || gStickUp ) {
	    self.playerPaddle.MoveUp( dt );
	}
	if( gDownPressed || gStickDown ) {
	    self.playerPaddle.MoveDown( dt );
	}
	if( notU(gMoveTargetY) ) {
	    var limit = gYInset + gPaddleHeight/2;
	    gMoveTargetY = Clip(
		gMoveTargetY + gMoveTargetStepY,
		limit,
		gHeight - limit
	    );
	    if( gMoveTargetY < self.playerPaddle.GetMidY() ) {
		self.playerPaddle.MoveUp( dt );
	    }
	    if( gMoveTargetY > self.playerPaddle.GetMidY() ) {
		self.playerPaddle.MoveDown( dt );
	    }
	    // if the player isn't touching and the
	    // paddle is close enough then don't
	    // potentially wiggle steppming up & down
	    // around gMoveTargetY.
	    if( !isPointerDown() ) {
		if( Math.abs(self.playerPaddle.GetMidY() - gMoveTargetY) < gPaddleStepSize ) {
		    gMoveTargetY = undefined;
		}
		if( self.playerPaddle.isAtLimit ) {
		    gMoveTargetY = undefined;
		}
	    }
	}
    };

    self.AddAnimation = function( a ) {
	self.animations[gNextID++] = a;
    };

    self.AddBarrier = function( spec ) {
	var b = new Barrier(spec);
	gBarriers.A.push(b);
    };

    self.AddOption = function( spec ) {
	var o = new Paddle(spec);
	gOptions.A.push(o);
    };

    self.AddNeo = function( spec ) {
	gNeo = new Neo(spec);
    };

    self.StepMoveables = function( dt ) {
	if (!self.paused) {
	    if (self.attract) {
		self.playerPaddle.AIMove( dt );
	    }
	    self.cpuPaddle.AIMove( dt );
	    self.MovePucks( dt );
	    self.MoveSparks( dt );
	    self.MovePill( dt );
	    self.MoveBarriers( dt );
	    self.MoveOptions( dt );
	    self.MoveNeo( dt );
	}
    };

    self.MovePucks = function( dt ) {
	gPucks.B.clear();
	gPucks.A.forEach((p) => {
	    p.Step( dt );
	    if (!self.attract) {
		p.UpdateScore();
	    }
	    if (p.alive) {
		var splits = p.AllPaddlesCollision( [ self.playerPaddle, self.cpuPaddle ] );
		splits.push.apply( splits, p.AllPaddlesCollision( gOptions.A ) );
		p.WallsCollision();
		p.BarriersCollision();
		p.NeoCollision();
		gPucks.B.push( p );
		if( !self.attract ) {
		    gPucks.B.pushAll(splits);
		}
	    }
	});
	SwapBuffers(gPucks);
    };

    self.MoveSparks = function( dt ) {
	gSparks.B.clear();
	gSparks.A.forEach((s) => {
	    s.Step( dt );
	    s.alive && gSparks.B.push( s );
	} );
	SwapBuffers(gSparks);
    };

    self.MovePill = function( dt ) {
	if (notU(gPill)) {
	    gPill = gPill.Step( dt, self );
	}
	if (notU(gPill)) {
	    // could in theory give pills to the cpu side as well some day? :-)
	    gPill = gPill.AllPaddlesCollision( self, [ self.playerPaddle ] );
	}
    };

    self.MoveBarriers = function( dt ) {
	gBarriers.B.clear();
	gBarriers.A.forEach((s) => {
	    s.Step( dt );
	    s.alive && gBarriers.B.push( s );
	} );
	SwapBuffers(gBarriers);
    };

    self.MoveOptions = function( dt ) {
	gOptions.B.clear();
	gOptions.A.forEach((o) => {
	    o.AIMove( dt );
	    o.alive && gOptions.B.push( o );
	} );
	SwapBuffers(gOptions);
    };

    self.MoveNeo = function( dt ) {
	if (notU(gNeo)) {
	    gNeo = gNeo.Step( dt, self );
	}
    };

    self.Alpha = function( alpha ) {
	if (alpha == undefined) { alpha = 1; }
	return alpha * (self.attract ? 0.3 : 1);
    };

    self.DrawMidLine = function() {
	if (!self.attract) {
	    Cxdo(() => {
		gCx.fillStyle = RandomGreen(self.Alpha(RandomRange(0.4, 0.6)));
		var dashStep = (gHeight - 2*gYInset)/(gDashedLineCount*2);
		var x = gw(0.5) - ii(gDashedLineWidth/2);
		for( var y = gYInset; y < gHeight-gYInset; y += dashStep*2 ) {
		    var ox = RandomCentered(0, 1);
		    gCx.fillRect( x+ox, y, gDashedLineWidth, dashStep );
		}
	    });
	}
    };

    self.DrawCRTOutline = function() {
	var inset = 2;
	var wx = WX(inset);
	var wy = WY(inset);
	Cxdo(() => {
	    gCx.beginPath();
	    gCx.roundRect(wx, wy, gWidth-wx*2, gHeight-wy*2, 20);
	    gCx.lineWidth = sx1(2);
	    gCx.strokeStyle = RandomForColor(grey, self.Alpha(0.3));
	    gCx.stroke();
	});
    };

    self.DrawScoreHeader = function() {
	Cxdo(() => {
	    gCx.fillStyle = RandomMagenta(self.Alpha(0.5));
	    ForSide(
		() => {
		    if (notU(gHighScore)) {
			DrawText( "HI: " + gHighScore, "left", gw(0.2), gh(0.1), gSmallFontSizePt );
		    }
		    if (!self.attract) {
			DrawText( "GPT: " + gCPUScore, "right", gw(0.8), gh(0.19), gRegularFontSizePt );
			DrawText( "P1: " + gPlayerScore, "left", gw(0.2), gh(0.19), gRegularFontSizePt );
		    }
		},
		() => {
		    if (notU(gHighScore)) {
			DrawText( "HI: " + gHighScore, "right", gw(0.8), gh(0.1), gSmallFontSizePt );
		    }
		    if (!self.attract) {
			DrawText( "GPT: " + gCPUScore, "left", gw(0.2), gh(0.19), gRegularFontSizePt );
			DrawText( "P1: " + gPlayerScore, "right", gw(0.8), gh(0.19), gRegularFontSizePt );
		    }
		}
	    )();
	});
    };

    self.DrawTouchTarget = function() {
	if (notU(gMoveTargetY) && !self.attract) {
	    var size = syi(7);
	    var xoff = sxi((Clip01(Math.abs(gMoveTargetY - gh(0.5))/gh(0.5)))*5);
	    ForSide(
		() => {
		    var left = WX(gXInset*0.2) + xoff;
		    var right = left + size;
		    var y = WY(gMoveTargetY);
		    Cxdo(() => {
			gCx.beginPath();
			gCx.moveTo( left, y-size );
			gCx.lineTo( left, y+size );
			gCx.lineTo( right, y );
			gCx.fillStyle = RandomGreen(0.5);
			gCx.fill();
		    });
		},
		() => {
		    var right = WX(gWidth - gXInset*0.2) - xoff;
		    var left = right - size;
		    var y = WY(gMoveTargetY);
		    Cxdo(() => {
			gCx.beginPath();
			gCx.moveTo( right, y-size );
			gCx.lineTo( right, y+size );
			gCx.lineTo( left, y );
			gCx.fillStyle = RandomGreen(0.5);
			gCx.fill();
		    });
		}
	    )();
	}
    };

    self.DrawPauseButton = function() {
	if (!self.attract && isPointerEnabled()) {
	    gPauseButtonEnabled = true;
	    var cx = WX(gPauseCenterX);
	    var cy = WY(gPauseCenterY);
	    if (!self.paused) {
		Cxdo(() => {
		    gCx.beginPath();
		    gCx.arc( cx, cy,
			     gPauseRadius,
			     0, k2Pi,
			     true );
		    var o = gPauseRadius * 0.3;
		    gCx.moveTo( cx - o, cy - o*2 );
		    gCx.lineTo( cx - o, cy + o*2 );
		    gCx.moveTo( cx + o, cy - o*2 );
		    gCx.lineTo( cx + o, cy + o*2 );
		    gCx.lineWidth = 2;
		    gCx.strokeStyle = RandomGreen(0.25);
		    gCx.stroke();
		});
	    } else {
		Cxdo(() => {
		    gCx.beginPath();
		    gCx.arc( cx, cy,
			     gPauseRadius,
			     0, k2Pi,
			     true );
		    var o = gPauseRadius * 0.4;
		    gCx.moveTo( cx - o, cy - o );
		    gCx.lineTo( cx + o, cy );
		    gCx.lineTo( cx - o, cy + o );
		    gCx.lineTo( cx - o, cy - o );
		    gCx.strokeStyle = RandomGreenSolid();
		    gCx.stroke();
		});
	    }
	}
    };

    self.DrawPill = function() {
	if (notU(gPill)) {
	    gPill.Draw( self.Alpha() );
	    Cxdo(() => {
		gCx.fillStyle = "magenta";
		msg = `${gPill.name.toUpperCase()} ${ii(gPill.lifespan/1000)}`;
		DrawText(msg, "center", gw(0.5), gh(0.9), gSmallFontSizePt);
	    });
	}
    };

    self.DrawNeo = function() {
	if (notU(gNeo)) {
	    gNeo.Draw( self.Alpha() );
	}
    };

    self.Draw = function() {
	if (!gResizing) {
	    // painter's z-algorithm here below, keep important things last.
	    self.DrawCRTOutline();
	    self.DrawMidLine();
	    self.DrawScoreHeader();
	    // z order pucks rendering overkill nuance. :-)
	    gPucks.A.forEach((p) => {
		if (Sign(p.vx) == ForSide(1,-1)) {
		    p.Draw( self.Alpha() );
		}
	    });
	    gPucks.A.forEach((p) => {
		if (Sign(p.vx) == ForSide(-1,1)) {
		    p.Draw( self.Alpha() );
		}
	    });
	    gSparks.A.forEach((s) => {
		s.Draw( self.Alpha() );
	    });
	    gBarriers.A.forEach((b) => {
		b.Draw( self.Alpha() );
	    });
	    gOptions.A.forEach((o) => {
		o.Draw( self.Alpha() );
	    });
	    self.DrawNeo();
	    self.playerPaddle.Draw( self.Alpha() );
	    self.cpuPaddle.Draw( self.Alpha() );
	    self.DrawPill();
	    self.DrawPauseButton();
	    self.DrawTouchTarget();
	}
	if (self.paused) {
	    gCx.fillStyle = "darkblue";
	    DrawText("P A U S E D", "center", WX(gw(0.5)), WY(gh(0.55)), gBigFontSizePt);
	}
	self.DrawDebug();
    };

    self.DrawDebug = function() {
	if( ! gDebug ) { return; }

	DrawBounds(0.2);

	Cxdo(() => {
	    gCx.fillStyle = RandomColor();
	    gCx.fillRect(gPointerX-5, gPointerY-5, 10, 10);
	});

	Cxdo(() => {
	    gCx.fillStyle = "blue";
	    DrawTextFaint( gPucks.A.length, "center", gw(0.6), gh(0.9), gRegularFontSizePt );
	});

	var cpuAIPuckTarget = self.cpuPaddle.aiTarget;
	if( notU(cpuAIPuckTarget) ) {
	    Cxdo(() => {
	    gCx.strokeStyle = "red";
	    gCx.beginPath();
	    gCx.arc( cpuAIPuckTarget.GetMidX(), cpuAIPuckTarget.GetMidY(),
		     cpuAIPuckTarget.width * 1.5,
		     0, k2Pi,
		     true );
	    gCx.stroke();
	    });
	}
	var playerAIPuckTarget = self.playerPaddle.aiTarget;
	if( notU(playerAIPuckTarget) ) {
	    Cxdo(() => {
		gCx.strokeStyle = "magenta";
		gCx.strokeRect(
		    playerAIPuckTarget.x - 5, playerAIPuckTarget.y - 5,
		    playerAIPuckTarget.width + 10, playerAIPuckTarget.height + 10 );
	    });
	}

	Cxdo(() => {
	    gCx.fillStyle = "blue";
	    DrawTextFaint( "DEBUG MODE", "center", gw(0.5), gh(0.8), gSmallFontSizePt );
	});
    };
}

/*class*/ function NoopState(nextState) {
    var self = this;
    self.nextState = nextState;
    self.Reset = function() {};
    self.Step = function() { 
	return self.nextState;
    };
}

/*class*/ function SplashState() {
    var self = this;

    self.Reset = function() {
	ResetInput();
	LoadAudio(); 
    };

    self.Step = function() {
	ClearScreen();
	var nextState = undefined;
	if (gResizing) {
	    DrawResizing();
	}
	else {
	    DrawTitle(false);
	    self.DrawWarning();
	    if (getWindowAspect() <= 1) {
		Cxdo(() => {
		    gCx.fillStyle = rgb255s(cyan.regular);
		    DrawText("HINT: PLAYS BETTER IN LANDSCAPE MODE", "center", gw(0.5), gh(0.9), gSmallFontSizePt, false);
		});
	    }
	    nextState = self.ProcessInput();		
	}
	return nextState;
    };

    self.DrawWarning = function() {
	gCx.fillStyle = warningColor;
	var lineFactor = 1.5;
	var y0 = gh(0.55);
	Cxdo(() => {
	    gWarning.forEach((t, i) => {
		DrawText(t, "center", gw(0.5), y0 + i*(gSmallestFontSize * lineFactor), gSmallestFontSizePt, false, "monospace");
	    });
	});
    };

    self.ProcessInput = function() {
	var nextState = undefined;
	gEventQueue.forEach((event,i) => {
	    event.updateFn();
	    if (isU(nextState)) {
		nextState = self.ProcessOneInput();
	    }
	});
	gEventQueue = [];
	return nextState;
    };

    self.ProcessOneInput = function() {
	if (anyKeyPressed() ||  gStickUp || gStickDown || isPointerDown()) {
	    return kMenu;
	}
	return undefined;
    };
}

/*class*/ function MenuState() {
    var self = this;

    self.Reset = function() {
	ResetInput();
	gUserMutedButtonEnabled = true;
	self.attract = new GameState( true );
	self.attract.Reset();
	self.timeout = 1000 * 1.5;
	self.started = gGameTime;
	BeginMusic();
    };

    self.Step = function( dt ) {
	var nextState = undefined;
	ClearScreen();
	self.attract.Step( dt );
	nextState = self.ProcessInput();
	self.Draw();
	if (notU(nextState)) {
	    EndMusic();
	    gUserMutedButtonEnabled = false;
	}
	return nextState;
    };

    self.ProcessInput = function() {
	var nextState = undefined;
	var hasEvents = gEventQueue.length > 0;
	if (hasEvents) {
	    gEventQueue.forEach((event,i) => {
		event.updateFn();
		if (isU(nextState) &&
		    event.eventType != kEventTouchMove &&
		    event.eventType != kEventMouseMove) {
		    nextState = self.ProcessOneInput();
		}
	    });
	    gEventQueue = [];
	}
	return nextState;
    };

    self.ProcessOneInput = function() {
	var nextState = undefined;
	if (gUserMutedButtonEnabled &&
	    isPointerDown() &&
	    (Math.abs(gUserMutedCenterX-gPointerX) < gUserMutedWidth*0.8 &&
	     Math.abs(gUserMutedCenterY-gPointerY) < gUserMutedHeight*0.8)) {
	    gUserMutedPressed = true;
	}
	if (gUserMutedPressed) {
	    gUserMuted = !gUserMuted;
	    gUserMuted ? EndMusic() : BeginMusic();
	    gUserMutedPressed = false;
	}
	else if (gNextMusicPressed) {
	    BeginMusic();
	}
	else if ((gGameTime - self.started) > self.timeout &&
		(anyKeyPressed() || gStickUp || gStickDown || isPointerDown())) {
	    nextState = kGame;
	}
	return nextState;
    };

    self.Draw = function(advance) {
	if (gResizing) {
	    self.started = gGameTime;
	    DrawResizing();
	}
	else {
	    Cxdo(() => {
		DrawTitle();
		self.DrawAudio();
		gCx.fillStyle = RandomGreen();
		var msg = "CONTROLS: TAP / W S / ARROWS / GAMEPAD";
		if ((gGameTime - self.started) <= self.timeout) {
		    var msg = "LOADING...";
		    // the "start game" tap decides left vs. right for P1.
		    gPointerSide = undefined;
		}
		DrawText( msg, "center", gw(0.5), gh(0.5)+80, gSmallFontSizePt );
	    });
	}
    };

    self.DrawAudio = function() {
	self.DrawMusicName();
	self.DrawMuteMusicButton();
    };

    self.DrawMusicName = function() {
	if (!gUserMuted) {
	    var msg = "fetching music";
	    if (notU(gMusicID)) {
		var name = gAudio.id2name[gMusicID];
		var meta = gAudio.name2meta[name];
		if (notU(meta?.basename) && !!(meta?.loaded)) {
		    var msg = `norcalledmvsic ${meta.basename}`;
		}
	    }
	    Cxdo(() => {
		gCx.fillStyle = rgb255s(grey.strong, 0.5);
		DrawText(msg.toUpperCase(),
			 "right",
			 gw(0.95),
			 gh(0.95),
			 gSmallestFontSizePt,
			 false);
	    });
	}
    };

    self.DrawMuteMusicButton = function() {
	// todo: this is just about the absolute worst kid of button ux.
	var cx = gUserMutedCenterX;
	var cy = gUserMutedCenterY;
	var ox = gUserMutedWidth/2;
	var oy = gUserMutedHeight/2;
	var label = gUserMuted ? "m" : "m";
	Cxdo(() => {
	    gCx.beginPath();
	    gCx.roundRect(cx-ox, cy-oy, gUserMutedWidth, gUserMutedHeight, 10);
	    gCx.fillStyle = backgroundColor;
	    gCx.fill();
	    gCx.roundRect(cx-ox, cy-oy, gUserMutedWidth, gUserMutedHeight, 10);
	    if (gUserMuted) {
		gCx.moveTo(cx-ox+2, cy-oy+2);
		gCx.lineTo(cx+ox-2, cy+oy-2);
	    }
	    gCx.fillStyle = gCx.strokeStyle = RandomGreen(0.3);
	    gCx.lineWidth = sx1(2);
	    gCx.stroke();
	    DrawText(label, "center", cx, cy+(gUserMutedHeight*0.32), gRegularFontSizePt);
	});
    };
}

/*class*/ function GameOverState() {
    var self = this;

    self.Reset = function() {
	ResetInput();
	self.timeoutMsg = 1000 * 2;
	self.timeoutEnd = 1000 * 10;
	self.started = gGameTime;
	self.finalScore = gPlayerScore - gCPUScore;
	PlayGameOver();

	// ok, yes, i'm a terrible coder.
	gPill = undefined;
	gPointerSide = undefined;
    };

    self.Step = function() {
	var nextState = undefined;
	var gotoMenu = (gGameTime - self.started) > self.timeoutMsg;
	ClearScreen();
	nextState = self.ProcessInput(gotoMenu);
	self.Draw(gotoMenu);
	return nextState;
    };

    self.ProcessInput = function(gotoMenu) {
	var nextState = undefined;
	var hasEvents = gEventQueue.length > 0;
	if (hasEvents) {
	    gEventQueue.forEach((event,i) => {
		event.updateFn();
		nextState = self.ProcessOneInput(gotoMenu);
	    });
	    gEventQueue = [];
	}
	if (notU(nextState)) {
	    gHighScore = Math.max(self.finalScore, (aorb(gHighScore,self.finalScore)));
	    localStorage.setItem(kHighScoreKey, gHighScore);
	}
	return nextState;
    };

    self.ProcessOneInput = function(gotoMenu) {
	var nextState = undefined;
	if (gotoMenu && (anyKeyPressed() || gStickUp || gStickDown || isPointerDown())) {
            nextState = kMenu;
        }
	else if (isU(nextState) && (gGameTime - self.started) > self.timeoutMsg+self.timeoutEnd) {
	    nextState = kMenu;
	}
	return nextState;
    };
    
    self.Draw = function(gotoMenu) {
	ClearScreen();
	var x = gw(0.5);
	var y = gh(0.5) - 20;
	var nextState = undefined;
	Cxdo(() => {
	    gCx.fillStyle = RandomMagentaSolid();
	    if (isU(gHighScore) || self.finalScore > gHighScore) {
		DrawText( "NEW HIGH SCORE", "center", x, y - 80, gRegularFontSizePt );
	    }
	    var msg = `FINAL SCORE: ${gPlayerScore} - ${gCPUScore} = ${self.finalScore}`;
	    DrawText( msg, "center", x, y, gRegularFontSizePt );

	    if (gotoMenu) {
		gCx.fillStyle = RandomYellowSolid();
		DrawText( "GO TO MENU", "center", x, y+120, gReducedFontSizePt );
	    }
	});

	return nextState;
    };
}

/*class*/ function DebugState() {
    var self = this;

    self.Reset = function() {
    };

    self.Step = function() {
	gCx.clearRect( 0, 0, gCanvas.width, gHeight );
    };
}

//........................................

function JoystickMove(e) {
    if (e.verticalValue < 0) {
	gStickUp = false;
	gStickDopn = false;
	if (e.verticalValue < -kJoystickDeadZone) {
	    gEventQueue.push({
		eventType: kEventStickUp,
		updateFn: () => {
		    gStickUp = true;
		    gStickDopn = false;
		    gMoveTargetY = undefined;
		}
	    });
	}
    }
    if (e.verticalValue > 0) {
	gStickUp = false;
	gStickDopn = false;
	if (e.verticalValue > kJoystickDeadZone) {
	    gEventQueue.push({
		eventType: kEventStickDown,
		updateFn: () => {
		    gStickUp = false;
		    gStickDown = true;
		    gMoveTargetY = undefined;
		}
	    });
	}
    }
}

function RegisterGamepad(e) {
    RemoveGamepad(e);
    gGamepad = e.gamepad.gamepad;
    e.gamepad.addEventListener("joystickmove", JoystickMove, StandardMapping.Axis.JOYSTICK_LEFT);
    e.gamepad.addEventListener("joystickmove", JoystickMove, StandardMapping.Axis.JOYSTICK_RIGHT);
}

function RemoveGamepad() {
    if (notU(gGamepad)) {
	gGamepad.removeEventListener("joystickmove", StandardMapping.Axis.JOYSTICK_LEFT);
	gGamepad.removeEventListener("joystickmove", StandardMapping.Axis.JOYSTICK_RIGHT);
	gGamepad = undefined;
    }
}

function PointerProcess(t, updateFn) {
    var cvrect = gCanvas.getBoundingClientRect();
    var cvx = cvrect.x + window.scrollX;
    var cvy = cvrect.y + window.scrollY;
    // "regular" non-game-transformed screen pixel coordinates.
    // todo: handle window.devicePixelRatio.
    var tx = (t.clientX - cvx);
    var ty = (t.clientY - cvy);
    Assert(notU(updateFn), "PointerProcess");
    updateFn(tx, ty);
}

function SetPointerTarget(tx, ty, eventType) {
    gEventQueue.push({
	eventType,
	updateFn: () => {
	    gPointerX = tx;
	    gPointerY = ty;
	    gMoveTargetY = ty;
	},
    });
}

function TouchStart(e) {
    e.preventDefault();
    PointerProcess(
	e.touches[0],
	(tx, ty) => {
	    if (isU(gPointerSide)) {
		gPointerSide = tx < gw(0.5) ? "left" : "right";
	    }
	    SetPointerTarget(tx, ty, kEventTouchStart);
	    gPointerTimestamps = { start: gGameTime, end: undefined };
	}
    );
}

function TouchMove(e) {
    e.preventDefault();
    if (isU(gPointerTimestamps.end)) {
	PointerProcess(
	    e.touches[0],
	    (tx, ty) => {
		SetPointerTarget(tx, ty, kEventTouchMove);
	    }
	);
    }
}

function TouchEnd(e) {
    e.preventDefault();
    var startTime = gPointerTimestamps.start;
    var endTime = gGameTime;
    gEventQueue.push({
	eventType: kEventTouchEnd,
	updateFn: () => {
	    gMoveTargetStepY = 0;
	    gPointerTimestamps.end = endTime;
	}
    });
}

function MouseDown(e) {
    e.preventDefault();
    PointerProcess(
	e,
	(tx, ty) => {
	    if (isU(gPointerSide)) {
		gPointerSide = tx < gw(0.5) ? "left" : "right";
	    }
	    SetPointerTarget(tx, ty, kEventMouseDown);
	    gPointerTimestamps = { start: gGameTime, end: undefined };
	}
    );
}

function MouseMove(e) {
    if (isU(gPointerTimestamps.end)) {
	PointerProcess(
	    e,
	    (tx, ty) => {
		SetPointerTarget(tx, ty, kEventMouseMove);
	    }
	);
    }
}

function MouseUp(e) {
    e.preventDefault();
    var startTime = gPointerTimestamps.start;
    var endTime = gGameTime;
    gEventQueue.push({
	eventType: kEventMouseUp,
	updateFn: () => {
	    gMoveTargetStepY = 0;
	    gPointerTimestamps.end = endTime;
	}
    });
}

function ResetGlobalStorage() {
    gPucks = {
	A: new ReuseArray(kPuckArrayInitialSize),
	B: new ReuseArray(kPuckArrayInitialSize)
    };
    gSparks = {
	A: new ReuseArray(kSparkArrayInitialSize),
	B: new ReuseArray(kSparkArrayInitialSize)
    };
    gBarriers = {
	A: new ReuseArray(kBarriersArrayInitialSize),
	B: new ReuseArray(kBarriersArrayInitialSize)
    };
    gOptions = {
	A: new ReuseArray(kOptionsArrayInitialSize),
	B: new ReuseArray(kOptionsArrayInitialSize)
    };
}

function OnOrientationChange() {
    OnResize();
}

// the web is a pi(l)e of feces.

var gResizing = false;
var gLastArea = 0;
var gMatchedAreaCount = 0;
var kMatchedAreaRequirement = 10;
function OnResize() {
    if (notU(gLifecycle)) {
	if (gLifecycle.state == kGame) {
	    gLifecycle.Pause();
	}
	else if (!gResizing) {
	    gResizing = true;
	    gLastArea = 0;
	    gMatchedAreaCount = 0;
	    ResizePoll();
	}	    
    }
}

function ResizePoll() {
    if (gMatchedAreaCount < kMatchedAreaRequirement) {
	DoResize();
	CheckResizeMatch();
	setTimeout(ResizePoll, 100);
    }
}

function DoResize() {
    // todo: handle window.devicePixelRatio.
    var borderFactor = getBorderFactor();
    var w = window.innerWidth * borderFactor;
    var h = window.innerHeight * borderFactor;
    var wa = w / h;
    if (wa >= kAspectRatio) {
	w = h * kAspectRatio;
    } else {
	h = w * 1/kAspectRatio;
    }
    gCanvas.width = gWidth = w;
    gCanvas.height = gHeight = h;
}

function CheckResizeMatch() {
    var area = gWidth * gHeight;
    if (area == gLastArea) {
	if (++gMatchedAreaCount == kMatchedAreaRequirement) {
	    gResizing = false;
	    Start(); // yes, just a full reboot. :-(
	}
    } else {
	gMatchedAreaCount = 0;
	gLastArea = area;
    }	
}

function Start() {
    var hs = localStorage.getItem(kHighScoreKey);
    if (notU(hs)) {
	gHighScore = parseInt(hs);
    }

    gCanvas = document.getElementById( kCanvasName );
    gCx = gCanvas.getContext( '2d' );
    DoResize();
    RecalculateConstants();

    var handlerMap = {};
    // ugh the splash is just so we can get
    // user input so we can actually play sounds.
    handlerMap[kNoop] = new NoopState(kSplash);
    handlerMap[kSplash] = new SplashState();
    handlerMap[kMenu] = new MenuState();
    handlerMap[kGame] = new GameState();
    handlerMap[kGameOver] = new GameOverState();
    if (notU(gLifecycle)) { gLifecycle.Quit(); }
    gLifecycle = new Lifecycle( handlerMap );
    gLifecycle.RunLoop();
}

// er, i'm lazy and never un-register so be sure this only gets called once.
var initEventsRun = false;
function InitEvents() {
    Assert(!initEventsRun, "initEventsRun");
    initEventsRun = true;
    
    Gamepads.start();
    Gamepads.addEventListener('connect', RegisterGamepad);
    Gamepads.addEventListener('disconnect', RemoveGamepad);

    window.addEventListener('touchstart', TouchStart);
    window.addEventListener('touchmove', TouchMove);
    window.addEventListener('touchend', TouchEnd);
    window.addEventListener('mousedown', MouseDown);
    window.addEventListener('mousemove', MouseMove);
    window.addEventListener('mouseup', MouseUp);
    // trying to stop swipe/scrolling by fingers.
    document.addEventListener('touchstart', (e) => {e.preventDefault();});
    document.addEventListener('touchmove', (e) => {e.preventDefault();});
    document.addEventListener('touchend', (e) => {e.preventDefault();});

    window.addEventListener('keydown', (e) => {
	if (e.repeat) { return; }

	// keyCodes do not respect e.g. QWERTZ vs. QWERTY, they assume QWEbbRTY.
	// that sort of works for WASD pattern, but maybe not for all debug commands.
	if( e.keyCode == 38 || e.keyCode == 87 ) { // arrow up, w
	    e.preventDefault();
	    gEventQueue.push({
		eventType: kEventKeyDown,
		updateFn: () => {
		    gUpPressed = true;
		    gMoveTargetY = undefined;
		    gDownKeys[e.keyCode] = true;
		}
	    });
	}
	if( e.keyCode == 40 || e.keyCode == 83 ) { // arrow down, s
	    e.preventDefault();
	    gEventQueue.push({
		eventType: kEventKeyDown,
		updateFn: () => {
		    gDownPressed = true;
		    gMoveTargetY = undefined;
		    gDownKeys[e.keyCode] = true;
		}
	    });
	}
	if( e.keyCode == 80 || e.keyCode == 19 ) { // 'p', 'pause'
	    gEventQueue.push({
		eventType: kEventKeyDown,
		updateFn: () => {
		    gPausePressed = true;
		    gDownKeys[e.keyCode] = true;
		}
	    });
	}
	if( e.keyCode == 32 ) { // ' '
	    gEventQueue.push({
		eventType: kEventKeyDown,
		updateFn: () => {
		    gDownKeys[e.keyCode] = true;
		}
	    });
	}
	if( e.keyCode == 65 ) { // 'a'
	    gEventQueue.push({
		eventType: kEventKeyDown,
		updateFn: () => {
		    if (gDebug) { gAddPuckPressed = true; }
		}
	    });
	}
	if( e.keyCode == 81 ) { // 'q'
	    gEventQueue.push({
		eventType: kEventKeyDown,
		updateFn: () => {
		    if (gDebug) { gGameOverPressed = true; }
		}
	    });
	}
	if( e.keyCode == 66 ) { // 'b'
	    gEventQueue.push({
		eventType: kEventKeyDown,
		updateFn: () => {
		    if (gDebug) { gSpawnPillPressed = true; }
		}
	    });
	}
	if( e.keyCode == 69 ) { // 'e'
	    gEventQueue.push({
		eventType: kEventKeyDown,
		updateFn: () => {
		    if (gDebug) { gNextMusicPressed = true; }
		}
	    });
	}
	if (e.keyCode == 46) { // delete.
	    gEventQueue.push({
		eventType: kEventKeyDown,
		updateFn: () => {
		    if (gDebug) {
			gHighScore = undefined;
			localStorage.removeItem(kHighScoreKey);
		    }
		}
	    });
	}
    });

    window.addEventListener('keyup', (e) => {
	if( e.keyCode == 38 || e.keyCode == 87 ) { // arrow up, w
	    e.preventDefault();
	    gEventQueue.push({
		eventType: kEventKeyUp,
		updateFn: () => {
		    gUpPressed = false;
		    delete gDownKeys[e.keyCode];
		}
	    });
	}
	if( e.keyCode == 40 || e.keyCode == 83 ) { // arrow down, s
	    e.preventDefault();
	    gEventQueue.push({
		eventType: kEventKeyUp,
		updateFn: () => {
		    gDownPressed = false;
		    delete gDownKeys[e.keyCode];
		}
	    });
	}
	if( e.keyCode == 80 || e.keyCode == 19 ) { // 'p', 'pause'
	    gEventQueue.push({
		eventType: kEventKeyUp,
		updateFn: () => {
		    gPausePressed = false;
		    delete gDownKeys[e.keyCode];
		}
	    });
	}
	if( e.keyCode == 32 ) { // ' '
	    gEventQueue.push({
		eventType: kEventKeyUp,
		updateFn: () => {
		    delete gDownKeys[e.keyCode];
		}
	    });
	}
	if( e.keyCode == 65 ) { // 'a'
	    gEventQueue.push({
		eventType: kEventKeyUp,
		updateFn: () => {
		    gAddPuckPressed = false;
		}
	    });
	}
	if( e.keyCode == 81 ) { // 'q'
	    gEventQueue.push({
		eventType: kEventKeyUp,
		updateFn: () => {
		    gGameOverPressed = false;
		}
	    });
	}
	if( e.keyCode == 66 ) { // 'b'
	    gEventQueue.push({
		eventType: kEventKeyUp,
		updateFn: () => {
		    gSpawnPillPressed = false;
		}
	    });
	}
	if( e.keyCode == 69 ) { // 'e'
	    gEventQueue.push({
		eventType: kEventKeyUp,
		updateFn: () => {
		}
	    });
	}
	if (e.keyCode == 46) { // delete.
	    gEventQueue.push({
		eventType: kEventKeyUp,
		updateFn: () => {
		}
	    });
	}
    });

    window.addEventListener( 'orientationChange', OnOrientationChange, false );
    window.addEventListener( 'resize', OnResize, false );
}

window.addEventListener( 'load', () => { Start(); InitEvents(); }, false );
