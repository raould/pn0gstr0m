/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// Welcome to The Land of Global Varibles, And Inconsistent Naming.
//
// note: velocities are kinda only work for 960x480.
// sorry, the naming is horrible just about everywhere.
// this code is probably like 85.2% bugs.
//
// note: "up" or "top" in the code means toward the top of the screen
// whereas in canvas +y is toward the bottom.
//
// note: er, well, the meaning of (x,y,w,h) for game objects
// has ended up being arbitrary over time. sometimes it means
// a corner, sometimes it means a center. also? the naming
// is super inconsistent.
//
// the noyb2 font only has upper case letters mostly by the way.
//
// i guess mostly things have a (top,left) origin?
// where "top" means "up" on the screen which
// means -y in canvas coordinates.

var gDebug = false;
var gShowToasts = gDebug;

var kCanvasName = "canvas";
var gLifecycle;

// ----------------------------------------
// lots of dunsel things wrt scaling. :-(
// the game was designed based on this default aspect & resolution.

var kAspectRatio = 16/9;

// these should be able to vary independently
// as long as they keep the aspect ratio,
// and everything should still draw 'correctly'.
// (e.g. fonts scaled to fit in same relative area.)
var kHtmlWidth = 512;
var kHtmlHeight = 288;
Assert(Math.abs(kHtmlWidth/kHtmlHeight - kAspectRatio) < 0.1, "unexpected html aspect ratio");
var gWidth = kHtmlWidth;
var gHeight = kHtmlHeight;
Assert(Math.abs(gWidth/gHeight - kAspectRatio) < 0.1, "unexpected g aspect ratio");
function getBorderFactor() {
    return getWindowAspect() > 1 ? 0.8 : 0.7;
}
function getWindowAspect() {
    return window.innerWidth / window.innerHeight;
}

// ----------------------------------------

var black = [0x0, 0x0, 0x0];

var grey = { regular: [0xA0, 0xA0, 0xA0], strong: [0xA0, 0xA0, 0xA0] };
var green = { regular: [0x89, 0xCE, 0x00], strong: [0x00, 0xFF, 0x00] };
var blue = { regular: [0x05, 0x71, 0xB0], strong: [0x00, 0x00, 0xFF] };
var red = { regular: [0xB5, 0x19, 0x19], strong: [0xFF, 0x00, 0x00] };
var cyan = { regular: [0x57, 0xC4, 0xAD], strong: [0x00, 0xFF, 0xFF] };
var yellow = { regular: [0xED, 0xA2, 0x47], strong: [0xFF, 0xFF, 0x00] };
var magenta = { regular: [0xFF, 0x00, 0xFF], strong: [0xFF, 0x00, 0xFF] };

var backgroundColor = "black"; // match: index.html background color.
var scanlineColor = "rgba(0,0,8,0.5)";
var warningColor = "grey";

var k2Pi = Math.PI*2;

// slightly useful for testing collisions when on, but carries debt, and can mislead about regular behaviour.
var kDrawAIPuckTarget = true;

// note that all the timing and stepping stuff is fragile vs. frame rate.
var gMonochrome;
var kFadeInMsec = 7000;

var kHighKey = 'pn0g_high';
var gHighScore;

var gStartTime = 0;
var gGameTime = 0;
var gLastFrameTime = gStartTime;
var gFrameCount = 0;
var kFPS = 30;
var kTimeStep = 1000/kFPS;
var kMoveStep = 1;
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
var kSpawnPowerupFactor = 0.001;

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
var gPauseButtonEnabled = false;
var gPausePressed = false;
var gUserMutedButtonEnabled = false;
var gUserMutedPressed = false;
var gUpPressed = false;
var gDownPressed = false;
var gStickUp = false;
var gStickDown = false;
var gAddPuckPressed = false;
var gGameOverPressed = false;
var gSpawnPowerupPressed = false;
var gNextMusicPressed = false;

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
var gTouchTapTimeout = 350;
var gTouchingTime = { start: undefined, end: undefined };
var gTouchX = -1;
var gTouchY = -1;
var gTouchScaleX = 1;
var gTouchScaleY = 1;
var gMoveTargetY = undefined;
var gMoveTargetStepY = 0;
// this value is either undefined, or "left", or "right".
// undefined means no taps seen, and means "right" due to history.
var gTouchSide;
function touchEnabled() {
    return isntU(gTouchingTime.start);
}
function touching() {
    var is = touchEnabled() && isU(gTouchingTime.end);
    return is;
}
function cancelTouch() {
    gTouchingTime.end = gGameTime;
}

var kScoreIncrement = 1;
var gPlayerScore = 0;
var gCPUScore = 0;

// todo: move all these into GameState.
// todo: use typescript.
var gPucks; // { A:[], B:[] }
var gSparks; // { A:[], B:[] }
var gPowerup; // there can be (at most) only 1 (at a time).
// these are a bit complicated.
// { x, y, width, height,
//   prevX, prevY,
//   CollisionTest( paddle (todo: xywh) ) }
var gBarriers; // ( A:[], B:[] }
var gOptions; // ( A:[], B:[] }

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
    return Clip01(
	Math.pow(
	    diff / ((period > 0) ? period : 1000),
	    3
	)
    );
}

function ForSide(left, right) {
    if (gTouchSide == "left") {
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

// array channels are 0-255, alpha is 0-1, like html/css.
var _tc = Array(4);
function rgb255s(array, alpha) {
    // detect any old style code that called this function.
    Assert(Array.isArray(array), "expected array as first parameter");
    _tc[0] = array[0];
    _tc[1] = array[1];
    _tc[2] = array[2];
    _tc[3] = alpha ?? 1;
    if (array.length == 4) {
	_tc[3] = array[3];
    }
    var joined = _tc.map((ch,i) => ((i < 3) ? Clip255(ch) : ch)).join(",");
    var str = ((array.length == 4 || isntU(alpha)) ? "rgba(" : "rgb(") + joined + ")";
    return  str;
}

function RandomColor(alpha) {
    return rgb255s(
	[
	    RandomRange(0, 255),
	    RandomRange(0, 255),
	    RandomRange(0, 255),
	    alpha ?? 1
	]
    );
}

function RandomForColor(color, alpha) {
    if (alpha == undefined) { alpha = 1; }
    if (RandomBool(0.8)) {
	// some aesthetic flickers of strong color.
	return rgb255s(color.strong, alpha);
    }
    else {
	// slightly varied color.
	return rgb255s(
	    color.regular.map(ch => RandomCentered(ch, 20)),
	    alpha
	);
    }
}

function RandomForColorFadein(color, alpha) {
    if (alpha == undefined) { alpha = 1; }
    if (gMonochrome) {
	// i.e. attract mode.
	return rgb255s(green.strong, alpha);
    }
    else if (gRandom() > GameTime01(kFadeInMsec)) {
	// gradully go from green to color at game start.
	return rgb255s(green.strong, alpha);
    }
    else {
	return RandomForColor(color, alpha);
    }
}

function RandomGreySolid() {
    return RandomForColorFadein(grey, 1);
}
function RandomGrey(alpha) {
    return RandomForColorFadein(grey, alpha);
}

function RandomGreenSolid() {
    return RandomForColorFadein(green, 1);
}
function RandomGreen(alpha) {
    return RandomForColorFadein(green, alpha);
}

function RandomRedSolid() {
    return RandomForColorFadein(red, 1);
}
function RandomRed(alpha) {
    return RandomForColorFadein(red, alpha);
}

function RandomBlueSolid() {
    return RandomForColorFadein(blue, 1);
}
function RandomBlue(alpha) {
    return RandomForColorFadein(blue, alpha);
}

function RandomCyanSolid() {
    return RandomForColorFadein(cyan, 1);
}
function RandomCyan(alpha) {
    return RandomForColorFadein(cyan, alpha);
}

function RandomYellowSolid() {
    return RandomForColorFadein(yellow, 1);
}
function RandomYellow(alpha) {
    return RandomForColorFadein(yellow, alpha);
}

function RandomMagentaSolid() {
    return RandomForColorFadein(magenta, 1);
}
function RandomMagenta(alpha) {
    return RandomForColorFadein(magenta, alpha);
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

    self.RunLoop = function() {
	if (self.stop) {
	    return;
	}

	// note that pausing time is handled in GameState.
	var now = Date.now();
	var clockDiff = now - self.lastTime;
	self.lastTime = now;
	gGameTime += clockDiff;

	var dt = gGameTime - gLastFrameTime;
	if (dt >= kTimeStep) {
	    var handler = self.handlerMap[self.state];
	    Assert(isntU(handler), self.state, "RunLoop");
	    if (self.transitioned) {
		handler.Reset();
		self.transitioned = false;
	    }
	    var next = handler.Step( dt );
	    if( isntU(next) && next !== self.state ) {
		console.log(`transitioned from ${self.state} to ${next}`);
		self.transitioned = true;
		self.state = next;
		cancelTouch();
	    }
	    gLastFrameTime = gGameTime;
	    ++gFrameCount;
	    //if (gDebug) { DrawBounds(); }
	    if (gShowToasts) { StepToasts(); }
	    setTimeout( self.RunLoop, Math.max(1, kTimeStep-(dt-kTimeStep)) );
	}
	else {
	    setTimeout( self.RunLoop, Math.max(1, kTimeStep - dt));
	}
    };
}

function StepToasts() {
    if (gToasts.length > 0) {
	var now = Date.now();
	gToasts = gToasts.filter((t) => { return t.end > now; });
	var y = gh(0.5) - (gToasts.length * gSmallFontSize*1.2);
	Cxdo(() => {
	    gCx.fillStyle = "magenta";
	    gToasts.forEach((t) => {
		DrawText(t.msg, "center", gw(0.5), y, gSmallestFontSizePt, false, "monospace");
		y += gSmallestFontSize;
	    });
	});
    }
}

function PushToast(msg, lifespan=1000) {
    console.log(msg);
    gToasts.push({
	msg: msg.toUpperCase(),
	end: Date.now() + lifespan
    });
}

/*class*/ function Paddle(spec) {
    /* spec is {
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
	self.isSplitter = aorb(spec.isSpliter, true);
	self.alive = isU(self.hp) || self.hp > 0;
	self.engorgedHeight = gPaddleHeight * 2;
	self.engorgedWidth = gPaddleWidth * 0.8;
	self.targetAIPuck = undefined;
	self.label = spec.label;
	self.engorged = false;
	self.stepSize = aorb(spec.stepSize, gPaddleStepSize);
	self.nudgeX();
    };

    self.Hit = function() {
	if (isntU(self.hp)) {
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
	var should = isU(self.targetAIPuck);
	if( ! should ) {
	    should = self.aiCountdownToUpdate <= 0;
	}
	if( ! should ) {
	    // track incoming puck.
	    should = ! self.IsPuckMovingAway( self.targetAIPuck );
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
		if( isntU(self.targetAIPuck) ) {
		    if (gDebug) { DrawTextFaint("TRACK", "center", gw(0.8), gh(0.1), gRegularFontSizePt); }
		    var targetMid = self.targetAIPuck.GetMidY() + self.targetAIPuck.vy;
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

    self.UpdatePuckTarget = function() {
	self.targetAIPuck = self.MaybeChoosePuck();
    };

    self.IsPuckMovingAway = function( puck ) {
	var away = false;
	if( isntU(puck)) {
	    var pnx = puck.x + puck.vx * 0.1;
	    var d1 = Math.abs( puck.x - self.x );
	    var d2 = Math.abs( pnx - self.x );
	    away = d2 > d1;
	}
	return away;
    };

    self.MaybeChoosePuck = function() {
	var bp = undefined;
	gPucks.A.forEach((p) => {
	    if (isU(bp) && isntU(p)) {
		bp = p;
		return;
	    }
	    if (!self.IsPuckMovingAway(p)) {
		if (self.IsPuckMovingAway(bp)) {
		    bp = p;
		}
		var dPuck = Math.abs( self.x - p.x );
		var dBp = Math.abs( self.x - bp.x );
		if (dPuck < dBp && !self.IsPuckMovingAway(p)) {
		    bp = p;
		}
		if (p.vx > bp.vx) {
		    bp = p;
		}
	    }
	});
	return bp;
    };

    self.Init(spec.label);
}

/*class*/ function Spark( x0, y0, vx, vy ) {
    var self = this;

    self.Init = function() {
	self.id = gNextID++;
	self.x = x0;
	self.y = y0;
	self.prevX = self.x;
	self.prevY = self.y;
	self.width = gSparkWidth * gRandom()*2;
	self.height = gSparkHeight * gRandom()*2;
	self.vx = vx;
	self.vy = vy;
	// randomize lifespan a little for visual variety.
	self.frameCount = RandomRange(0, 5);
	self.alive = true;
    };

    self.Draw = function( alpha ) {
	Cxdo(() => {
	    gCx.fillStyle = RandomRed( alpha );
	    gCx.fillRect( self.x, self.y, self.width, self.height );
	});
	self.frameCount++;
    };

    self.Step = function( dt ) {
	if (self.alive) {
	    self.prevX = self.x;
	    self.prevY = self.y;
	    self.x += (self.vx * dt);
	    self.y += (self.vy * dt);
	    self.alive = self.frameCount < kMaxSparkFrame;
	}
    };

    self.Init();
}

function AddSparks(x, y, vx, vy) {
    for( var s = 0; s < 2; s++ )
    {
	var svx = vx * RandomCentered( 0, 0.5 );
	var svy = vy * RandomCentered( 0, 10 );
	gSparks.A.push( new Spark( x, y, svx, svy ) );
    }
}

/*class*/ function Puck( x0, y0, vx, vy, ur=true, forced=false ) {

    var self = this;

    self.Init = function() {
	self.id = gNextID++;
	self.x = x0;
	self.y = y0;
	self.prevX = self.x;
	self.prevY = self.y;
	self.width = gPuckWidth;
	self.height = gPuckHeight;
	// tweak max vx to avoid everything being too visually lock-step.
	self.vx = Sign(vx) * Math.min(RandomCentered(gMaxVX, 1), Math.abs(vx));
	self.vy = AvoidZero(vy, 0.8);
	self.alive = true;
	self.startTime = gGameTime;
	self.ur = ur;
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
	    gCx.fillStyle = (!self.ur && gRandom() > dt) ? RandomYellow(amod) : RandomCyan(amod);
	    gCx.fillRect( wx, wy, self.width, self.height );
	    gCx.lineWidth = sx1(1);
	    gCx.strokeStyle = "black";
	    gCx.strokeRect( wx-1, wy-1, self.width+2, self.height+2 );
	});
    };

    self.Step = function( dt ) {
	if( self.alive ) {
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
	    np = new Puck( self.x, self.y, nvx, nvy, false, forced );
	    PlayExplosion();

	    // fyi because SplitPuck is called during MovePucks,
	    // we return the new puck to go onto the B list, whereas
	    // MoveSparks happens after so it goes onto the A list.
	    AddSparks(self.x, self.y, self.vx, self.vy);
	}

	return np;
    };

    self.CollisionTest = function( xywh ) {
	if( self.alive ) {
	    var blockvx = xywh.x >= gw(0.5) ? 1 : -1;
	    if (Sign(self.vx) == blockvx) {
		// !? assuming small enough simulation stepping !?
		// current step overlap?
		var xRight = self.x >= xywh.x+xywh.width;
		var xLeft = self.x+self.width < xywh.x;
		var xOverlaps = ! ( xRight || xLeft );
		var yTop = self.y >= xywh.y+xywh.height;
		var yBottom = self.y+self.height < xywh.y;
		var yOverlaps = ! ( yTop || yBottom );
		// did previous step overlap?
		// also trying to see which direction?
		var pxRight = self.prevX >= xywh.prevX+xywh.width;
		var pxLeft = self.prevX+self.width < xywh.prevX;
		var pxOverlaps = ! ( pxRight || pxLeft );
		// did it pass over the xywh? (paranoid check.)
		var dxOverlaps = Sign(self.prevX - xywh.prevX) != Sign(self.x - xywh.x);
		return (dxOverlaps || xOverlaps) && yOverlaps;
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
	var hit = self.CollisionTest( paddle );
	if ( hit ) {
	    paddle.Hit( self );
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
	if (self.alive) {
	    paddles.forEach( function(paddle) {
		var np = self.PaddleCollision(paddle);
		if( isntU(np) ) {
		    spawned.push( np );
		}
	    } );
	}
	return spawned;
    };

    self.BarriersCollision = function( barriers ) {
	if (self.alive) {
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
    
    self.OptionsCollision = function( options ) {
	if (self.alive) {
	    gOptions.A.forEach( function(option) {
		var hit = option.CollisionTest( self );
		if (hit) {
		    PlayBlip();
		    // todo: bounds adjustment.
		    self.vx *= -1;
		}
	    } );
	}
    };

    self.WallsCollision = function() {
	if (self.alive) {
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
	if (!self.alive) {
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

/*class*/ function Barrier( spec ) {
    var self = this;

    self.Init = function() {
	self.id = gNextID++;
	self.x = spec.x;
	self.y = spec.y;
	self.prevX = self.x;
	self.prevY = self.y;

	self.height = spec.height;
	self.width = spec.width;

	self.hp0 = spec.hp;
	self.hp = self.hp0;
	self.alive = spec.hp > 0;
    };

    self.Step = function( dt ) {
	self.alive = self.hp > 0;
    };

    self.Draw = function( alpha ) {
	Cxdo(() => {
	    // front-side wedge cuts.
	    var edge = sx1(5);
	    // max() prevent getting too thin for wedge shape.
	    var hpw = Math.max(edge, ii(self.width * self.hp/self.hp0)+edge);
	    var r = WX(ForSide(self.x+hpw, self.x+self.width));
	    var l = WX(ForSide(self.x, r-hpw));
	    var t = WY(self.y+sy1(1));
	    var b = WY(self.y+self.height-sy1(1));
	    ForSide(
		() => {
		    gCx.beginPath();
		    gCx.moveTo(l, t);
		    gCx.lineTo(r-edge, t);
		    gCx.lineTo(r, t+edge);
		    gCx.lineTo(r, b-edge);
		    gCx.lineTo(r-edge, b);
		    gCx.lineTo(l, b);
		    gCx.closePath();
		},
		() => {
		    gCx.beginPath();
		    gCx.moveTo(r, t);
		    gCx.lineTo(l+edge, t);
		    gCx.lineTo(l, t+edge);
		    gCx.lineTo(l, b-edge);
		    gCx.lineTo(l+edge, b);
		    gCx.lineTo(r, b);
		    gCx.closePath();
		}
	    )();
	    gCx.fillStyle = RandomBlue( alpha * 0.5 );
	    gCx.fill();
	});
    };

    self.CollisionTest = function( puck ) {
	var okvx = ForSide(1, -1);
	if (Sign(puck.vx) != okvx) {
	    var hit = puck.CollisionTest( self );
	    if (hit) {
		self.hp--;
	    }
	    return hit;
	}
	return false;
    };

    self.Init();
}

// the spec is { name, x, y, w, h, vx, vy, label, ylb, testFn, boomFn, drawFn }
// don't you wish this was all in typescript now?
/*class*/ function Powerup( spec ) {
    var self = this;

    self.Init = function() {
	Assert(isntU(spec), "no spec");
	self.id = gNextID++;
	self.name = spec.name;
	self.x = spec.x;
	self.y = spec.y;
	self.prevX = self.x;
	self.prevY = self.y;
	self.width = spec.width;
	self.height = spec.height;
	self.vx = spec.vx;
	self.vy = spec.vy;
	self.label = spec.label;
	self.ylb = spec.ylb;
	self.fontSize = spec.fontSize;
	self.boomFn = spec.boomFn;
	self.drawFn = spec.drawFn;
	if (self.x >= gw(0.5)) {
	    self.leftBound = gw(0.5);
	    self.rightBound = gw(1);
	}
	else {
	    self.leftBound = 0;
	    self.rightBound = gw(0.5);
	}
	self.topBound = 0;
	self.bottomBound = gHeight;
    };

    self.Draw = function( alpha ) {
	self.drawFn( self, alpha );
    };

    self.Step = function( dt ) {
	self.prevX = self.x;
	self.prevY = self.y;
	self.x += (self.vx * dt);
	self.y += (self.vy * dt);
	if (self.x <= self.leftBound) {
	    self.vx = Math.abs(self.vx);
	    self.x = self.leftBound + 1;
	}
	else if (self.x + self.width >= self.rightBound) {
	    self.vx = -1 * Math.abs(self.vx);
	    self.x = self.rightBound - self.width - 1;
	}
	if (self.y <= self.topBound) {
	    self.vy = Math.abs(self.vy);
	    self.y = self.topBound + 1;
	}
	else if (self.y + self.height >= self.bottomBound) {
	    self.vy = -1 * Math.abs(self.vy);
	    self.y = self.bottomBound - self.height - 1;
	}
    };

    // todo: reuse collision xywh code.
    self.PaddleCollision = function( paddle ) {
	// !? assuming small enough simulation stepping !?
	// current step overlap?
	var xRight = self.x >= paddle.x+paddle.width;
	var xLeft = self.x+self.width < paddle.x ;
	var xOverlaps = ! ( xRight || xLeft );
	var yTop = self.y >= paddle.y+paddle.height;
	var yBottom = self.y+self.height < paddle.y;
	var yOverlaps = ! ( yTop || yBottom );

	// did previous step overlap?
	// also trying to see which direction?
	var pxRight = self.prevX >= paddle.prevX+paddle.width;
	var pxLeft = self.prevX+self.width < paddle.prevX;
	var pxOverlaps = ! ( pxRight || pxLeft );

	// did it pass over the paddle? (paranoid check.)
	var dxOverlaps = Sign(self.prevX - paddle.prevX) != Sign(self.x - paddle.x);

	return (dxOverlaps || xOverlaps) && yOverlaps;
    };
    
    self.AllPaddlesCollision = function( gameState, paddles ) {
	var nextSelf = self;
	paddles.forEach( function(paddle) {
	    var hit = self.PaddleCollision(paddle);
	    if( hit ) {
		self.boomFn(gameState);
		nextSelf = undefined;
	    }
	} );
	return nextSelf;
    };

    self.Init();
}

/*class*/ function Animation( props ) {
    var { lifespan, animFn, startFn, endFn } = props;
    var self = this;
    self.id = gNextID++;
    self.startMs = gGameTime;
    self.endMs = self.startMs + lifespan;
    self.Step = function( dt, gameState ) {
	if (isntU(startFn)) { startFn( gameState ); }
	startFn = undefined;
	if (gGameTime <= self.endMs) {
	    animFn( dt, gameState, self.startMs, self.endMs );
	    return false;
	}
	if (isntU(endFn)) { endFn( gameState ); }
	return true;
    };
}

/*class*/ function GameState( attract=false ) {

    var self = this;
    self.attract = attract;

    self.Reset = function() {
	// this reset business is kind of a mess.
	RecalculateConstants();
	ResetGlobalStorage();
	gPlayerScore = 0;
	gCPUScore = 0;
	gStateMuted = gMonochrome = self.attract;
	gPauseButtonEnabled = !self.attract && touchEnabled();
	gStartTime = gGameTime;
	self.powerupWait = 1000*(gDebug?3:20);
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
		    isSplitter: true
		});
		self.cpuPaddle = new Paddle({
		    x: rp.x, y: rp.y,
		    width: gPaddleWidth, height: gPaddleHeight
		});
		ForCount(gDebug ? 50 : 1, () => { 
		    gPucks.A.push( self.CreateStartingPuck(1) );
		});
	    },
	    () => {
		self.playerPaddle = new Paddle({
		    x: rp.x, y: rp.y,
		    width: gPaddleWidth, height: gPaddleHeight,
		    label: p1label,
		    isSplitter: true
		});
		self.cpuPaddle = new Paddle({
		    x: lp.x, y: lp.y,
		    width: gPaddleWidth, height: gPaddleHeight
		});
		ForCount(gDebug ? 50 : 1, () => { 
		    gPucks.A.push( self.CreateStartingPuck(-1) );
		});
	    }
	)();

	PlayStart();
    };

    self.Step = function( dt ) {
	if (!self.attract) { ClearScreen(); }
	self.MaybeSpawnPowerup( dt );
	self.ProcessInput();
	self.StepPlayer( dt );
	self.StepMoveables( dt );
	self.StepAnimations( dt );
	self.Draw();
	if (self.paused && gGameOverPressed) {
	    gGameOverPressed = false;
	    return kGameOver;
	}
	if (self.paused && gSpawnPowerupPressed) {
	    gSpawnPowerupPressed = false;
	    gPowerup = MakeRandomPowerup(self);
	}
	var nextState = self.CheckNoPucks();
	gPauseButtonEnabled = isU(nextState);
	return nextState;
    };

    self.MaybeSpawnPowerup = function( dt ) {
	if (!self.paused && !self.attract) {
	    self.powerupWait = Math.max(self.powerupWait-dt, 0);
	    if (self.powerupWait <= 0 &&
		RandomBool(gDebug ? 0.1 : kSpawnPowerupFactor) &&
		isU(gPowerup)) {
		gPowerup = MakeRandomPowerup(self);
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
	var p = new Puck( gw(RandomRange(0.45, 0.48)),
			  gh(RandomRange(0.45, 0.5)),
			  sign * gMaxVX/5,
			  RandomCentered(1, 0.2),
			  true );
	return p;
    };

    self.CreateRandomPuck = function() {
	var p = new Puck( gw(RandomRange(3/8, 4/8)),
			  gh(RandomRange(3/8, 4/8)),
			  RandomRange(gMaxVX/5, gMaxVX/10),
			  RandomCentered(1, 0.5),
			  true );
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
	    touching() &&
	    Distance(gTouchX, gTouchY, gPauseCenterX, gPauseCenterY) < gPauseRadius*2) {
	    gPausePressed = true;
	}
	if( gPausePressed ) {
	    self.paused = !self.paused;
	    gPausePressed = false;
	}
	if( self.paused && gAddPuckPressed ) {
	    gPucks.A.push( self.CreateRandomPuck() );
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
	if( isntU(gMoveTargetY) ) {
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
	    if( !touching() ) {
		if( Math.abs(self.playerPaddle.GetMidY() - gMoveTargetY) < gPaddleStepSize ) {
		    gMoveTargetY = undefined;
		}
		if( self.playerPaddle.isAtLimit ) {
		    gMoveTargetY = undefined;
		}
	    }
	}
    };

    self.AddBarrier = function( spec ) {
	var b = new Barrier(spec);
	gBarriers.A.push(b);
    };

    self.AddOption = function( spec ) {
	var o = new Paddle(spec);
	gOptions.A.push(o);
    };
    
    self.StepMoveables = function( dt ) {
	if (!self.paused) {
	    if (self.attract) {
		self.playerPaddle.AIMove( dt );
	    }
	    self.cpuPaddle.AIMove( dt );
	    self.MovePucks( dt );
	    self.MoveSparks( dt );
	    self.MovePowerup( dt );
	    self.MoveBarriers( dt );
	    self.MoveOptions( dt );
	}
    };

    self.MovePucks = function( dt ) {
	gPucks.B.clear();
	gPucks.A.forEach((p) => {
	    p.Step( kMoveStep * (dt/kTimeStep) );
	    if (!self.attract) {
		p.UpdateScore();
	    }
	    if (p.alive) {
		var splits = p.AllPaddlesCollision( [ self.playerPaddle, self.cpuPaddle ] );
		splits.push.apply( splits, p.AllPaddlesCollision( gOptions.A ) );
		p.WallsCollision();
		p.BarriersCollision();
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
	    s.Step( kMoveStep * (dt/kTimeStep) );
	    s.alive && gSparks.B.push( s );
	} );
	SwapBuffers(gSparks);
    };

    self.MovePowerup = function( dt ) {
	if (isntU(gPowerup)) {
	    gPowerup.Step( kMoveStep * (dt/kTimeStep) );
	    // could in theory give powerups to the cpu side as well :-)
	    gPowerup = gPowerup.AllPaddlesCollision( self, [ self.playerPaddle ] );
	}
    };

    self.MoveBarriers = function( dt ) {
	gBarriers.B.clear();
	gBarriers.A.forEach((s) => {
	    s.Step( kMoveStep * (dt/kTimeStep) );
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
	    gCx.strokeStyle = RandomCyan(self.Alpha(0.3));
	    gCx.stroke();
	});
    };

    self.DrawScoreHeader = function() {
	Cxdo(() => {
	    gCx.fillStyle = RandomMagenta(self.Alpha(0.7));
	    ForSide(
		() => {
		    if (isntU(gHighScore)) {
			DrawText( "HI: " + gHighScore, "left", gw(0.2), gh(0.1), gSmallFontSizePt );
		    }
		    if (!self.attract) {
			DrawText( "GPT: " + gCPUScore, "right", gw(0.8), gh(0.19), gRegularFontSizePt );
			DrawText( "P1: " + gPlayerScore, "left", gw(0.2), gh(0.19), gRegularFontSizePt );
		    }
		},
		() => {
		    if (isntU(gHighScore)) {
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
	if (isntU(gMoveTargetY) && !self.attract) {
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
	// user might start using touch only after beginning the game.
	if (isntU(gTouchSide) && !self.attract) {
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
		    gCx.strokeStyle = RandomGreen(0.4);
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

    self.DrawPowerup = function() {
	if (isntU(gPowerup)) {
	    gPowerup.Draw( self.Alpha() );
	    Cxdo(() => {
		gCx.fillStyle = "magenta";
		DrawText(gPowerup.name, "center", gw(0.5), gh(0.9), gSmallFontSizePt);
	    });
	}
    };

    self.Draw = function() {
	if (!gResizing) {
	    self.DrawMidLine();
	    self.DrawScoreHeader();
	    // z order pucks rendering overkill nuance.
	    gPucks.A.forEach((p) => {
		Assert(!!p, "broken pucks");
		if (Sign(p.vx) == ForSide(1,-1)) {
		    p.Draw( self.Alpha() );
		}
	    });
	    gPucks.A.forEach((p) => {
		Assert(!!p, "broken pucks");
		if (Sign(p.vx) == ForSide(-1,1)) {
		    p.Draw( self.Alpha() );
		}
	    });
	    gSparks.A.forEach((s) => {
		Assert(!!s, "broken spark");
		s.Draw( self.Alpha() );
	    });
	    gBarriers.A.forEach((b) => {
		Assert(!!b, "broken barrier");
		b.Draw( self.Alpha() );
	    });
	    gOptions.A.forEach((o) => {
		Assert(!!o, "broken option");
		o.Draw( self.Alpha() );
	    });
	    // keep some things visible on z top.
	    self.playerPaddle.Draw( self.Alpha() );
	    self.cpuPaddle.Draw( self.Alpha() );
	    self.DrawPowerup();
	    self.DrawPauseButton();
	    self.DrawTouchTarget();
	    self.DrawCRTOutline();
	}
	self.DrawDebug();
    };

    self.DrawDebug = function() {
	if( ! gDebug ) { return; }

	DrawBounds();

	Cxdo(() => {
	    gCx.fillStyle = RandomColor();
	    gCx.fillRect(gTouchX-5, gTouchY-5, 10, 10);
	});

	Cxdo(() => {
	    gCx.fillStyle = "blue";
	    DrawTextFaint( gPucks.A.length, "center", gw(0.6), gh(0.9), gRegularFontSizePt );
	});

	var cpuAIPuckTarget = self.cpuPaddle.targetAIPuck;
	if( isntU(cpuAIPuckTarget) ) {
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
	var playerAIPuckTarget = self.playerPaddle.targetAIPuck;
	if( isntU(playerAIPuckTarget) ) {
	    Cxdo(() => {
		gCx.strokeStyle = "magenta";
		gCx.strokeRect(
		    playerAIPuckTarget.x - 5, playerAIPuckTarget.y - 5,
		    playerAIPuckTarget.width + 10, playerAIPuckTarget.height + 10 );
	    });
	}
    };
}

function DrawBounds() {
    if (!gDebug) { return; }
    Cxdo(() => {
	gCx.beginPath();
	gCx.moveTo(WX(0), WY(0));
	gCx.lineTo(WX(gWidth), WY(gHeight));
	gCx.moveTo(WX(gWidth), WY(0));
	gCx.lineTo(WX(0), WY(gHeight));
	gCx.strokeStyle = "rgba(255,255,255,0.25)";
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
	gCx.strokeStyle = "rgba(255,0,255,0.5)";
	gCx.lineWidth = 2;
	gCx.stroke();
	gCx.strokeRect(5, 5, gWidth-10, gHeight-10);
    });
}

/*class*/ function NoopState(nextState) {
    var self = this;
    self.nextState = nextState;
    self.Reset = function() {};
    self.Step = function() { 
	return self.nextState;
    };
}

function ClearScreen() {
    Cxdo(() => {
	gCx.clearRect( 0, 0, gWidth, gHeight );
    });
}

function DrawResizing() {
    Cxdo(() => {
	gCx.fillStyle = RandomColor();
	for (var i = 0; i < 3; ++i) {
	    var y = gh(0.4) + gh(0.1) * i;
	    DrawText( "R E S I Z I N G", "center", gw(0.5), y, gSmallestFontSizePt );
	}
    });
}

function DrawTitle(flicker=true) {
    Cxdo(() => {
	gCx.fillStyle = flicker ?
	    RandomForColor(cyan, RandomCentered(0.8,0.2)) :
	    rgb255s(cyan.regular);
	DrawText( "P N 0 G S T R 0 M", "center", gw(0.5), gh(0.4), gBigFontSizePt, flicker );
	DrawText( "ETERNAL BETA", "right", gw(0.92), gh(0.45), gSmallFontSizePt, flicker );
    });
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
	Cxdo(() => {
	    gWarning.forEach((t, i) => {
		DrawText(t, "center", gw(0.5), gh(0.5) + i*(gSmallestFontSize*1.2), gSmallestFontSizePt, false, "monospace");
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
	if (anyKeyPressed() ||  gStickUp || gStickDown || touching()) {
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
	if (isntU(nextState)) {
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
	    touching() &&
	    (Math.abs(gUserMutedCenterX-gTouchX) < gUserMutedHeight ||
	     Math.abs(gUserMutedCenterX-gTouchY) < gUserMutedWidth)) {
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
		(anyKeyPressed() || gStickUp || gStickDown || touching())) {
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
	    if (isntU(gMusicID)) {
		var name = gAudio.id2name[gMusicID];
		var meta = gAudio.name2meta[name];
		if (isntU(meta?.basename) && !!(meta?.loaded)) {
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
	gPowerup = undefined;
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
	if (isntU(nextState)) {
	    gHighScore = Math.max(self.finalScore, (aorb(gHighScore,self.finalScore)));
	    localStorage.setItem(kHighKey, gHighScore);
	}
	return nextState;
    };

    self.ProcessOneInput = function(gotoMenu) {
	var nextState = undefined;
	if (gotoMenu && (anyKeyPressed() || gStickUp || gStickDown || touching())) {
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
    if (isntU(gGamepad)) {
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
    Assert(isntU(updateFn), "PointerProcess");
    updateFn(tx, ty);
}

function SetPointerTarget(tx, ty, eventType) {
    gEventQueue.push({
	eventType,
	updateFn: () => {
	    gTouchX = tx;
	    gTouchY = ty;
	    gMoveTargetY = ty;
	},
    });
}

function TouchStart(e) {
    e.preventDefault();
    PointerProcess(
	e.touches[0],
	(tx, ty) => {
	    if (isU(gTouchSide)) {
		gTouchSide = tx < gw(0.5) ? "left" : "right";
	    }
	    SetPointerTarget(tx, ty, kEventTouchStart);
	    gTouchingTime = { start: gGameTime, end: undefined };
	}
    );
}

function TouchMove(e) {
    e.preventDefault();
    if (isU(gTouchingTime.end)) {
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
    var startTime = gTouchingTime.start;
    var endTime = gGameTime;
    gEventQueue.push({
	eventType: kEventTouchEnd,
	updateFn: () => {
	    gMoveTargetStepY = 0;
	    gTouchingTime.end = endTime;
	}
    });
}

function MouseDown(e) {
    e.preventDefault();
    PointerProcess(
	e,
	(tx, ty) => {
	    SetPointerTarget(tx, ty, kEventMouseDown);
	    gTouchingTime = { start: gGameTime, end: undefined };
	}
    );
}

function MouseMove(e) {
    if (isU(gTouchingTime.end)) {
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
    var startTime = gTouchingTime.start;
    var endTime = gGameTime;
    gEventQueue.push({
	eventType: kEventMouseUp,
	updateFn: () => {
	    gMoveTargetStepY = 0;
	    gTouchingTime.end = endTime;
	}
    });
}

function ResetInput() {
    gPausePressed = false;
    gUpPressed = false;
    gDownPressed = false;
    gStickUp = false;
    gStickDown = false;
    gMoveTargetY = undefined;
    gAddPuckPressed = false;
    gGameOverPressed = false;
    gTouchSide = undefined;
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
    if (isntU(gLifecycle) && gLifecycle.state == kMenu) {
	Start(); // yes, just a full reboot. :-(
    }
}

// the web is a pi(l)e of feces.

var gResizing = false;
var gLastArea = 0;
var gMatchedAreaCount = 0;
var kMatchedAreaRequirement = 10;
function OnResize() {
    gResizing = true;
    gLastArea = 0;
    gMatchedAreaCount = 0;
    ResizePoll();
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
    console.log("Start");
    Assert(Object.keys(gPowerupsInUse).length == 0, "Start");

    var hs = localStorage.getItem(kHighKey);
    if (isntU(hs)) {
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
    if (isntU(gLifecycle)) { gLifecycle.Quit(); }
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
		    if (gDebug) { gSpawnPowerupPressed = true; }
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
			localStorage.removeItem(kHighKey);
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
		    gSpawnPowerupPressed = false;
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
