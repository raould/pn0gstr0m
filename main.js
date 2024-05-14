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

// ugh for some reason enabling this on
// firefox kills the frame rate, but it
// is ok on edge and webkit. :eyeroll:
var /*const*/ gDebug = false;

var /*const*/ gCanvasName = "canvas";
var gLifecycle;

// ----------------------------------------
// lots of dunsel things wrt scaling. :-(
// the game was designed based on this default aspect & resolution.

var /*const*/ gAspectRatio = 16/9;

// these should be able to vary independently
// as long as they keep the aspect ratio,
// and everything should still draw 'correctly'.
// (e.g. fonts scaled to fit in same relative area.)
var /*const*/ kHtmlWidth = 512;
var /*const*/ kHtmlHeight = 288;
Assert(Math.abs(kHtmlWidth/kHtmlHeight - gAspectRatio) < 0.1, "unexpected html aspect ratio");
var gWidth = kHtmlWidth;
var gHeight = kHtmlHeight;
Assert(Math.abs(gWidth/gHeight - gAspectRatio) < 0.1, "unexpected g aspect ratio");
function getBorderFactor() {
    return getWindowAspect() > 1 ? 0.8 : 0.7;
}
function getWindowAspect() {
    return window.innerWidth / window.innerHeight;
}

// ----------------------------------------

var /*const*/ black = [0x0, 0x0, 0x0];

var /*const*/ grey = { regular: [0xA0, 0xA0, 0xA0], strong: [0xA0, 0xA0, 0xA0] };
var /*const*/ green = { regular: [0x89, 0xCE, 0x00], strong: [0x00, 0xFF, 0x00] };
var /*const*/ blue = { regular: [0x05, 0x71, 0xB0], strong: [0x00, 0x00, 0xFF] };
var /*const*/ red = { regular: [0xB5, 0x19, 0x19], strong: [0xFF, 0x00, 0x00] };
var /*const*/ cyan = { regular: [0x57, 0xC4, 0xAD], strong: [0x00, 0xFF, 0xFF] };
var /*const*/ yellow = { regular: [0xED, 0xA2, 0x47], strong: [0xFF, 0xFF, 0x00] };
var /*const*/ magenta = { regular: [0xFF, 0x00, 0xFF], strong: [0xFF, 0x00, 0xFF] };

var /*const*/ backgroundColor = "black"; // match: index.html background color.
var /*const*/ scanlineColor = "rgba(0,0,8,0.5)";

var /*const*/ k2Pi = Math.PI*2;

// slightly useful for testing collisions when on, but carries debt, and can mislead about regular behaviour.
var /*const*/ kDrawAIPuckTarget = true;

// note that all the timing and stepping stuff is fragile vs. frame rate.
var gMonochrome;
var /*const*/ kFadeInMsec = 7000;

var /*const*/ kHighKey = 'pn0g_high';
var gHighScore;

// todo: fix step() to take deltas.
// todo: make gStartTime not be a global.
var gStartTime = 0;
var gGameTime = 0;
var gLastFrameTime = gStartTime;
var gFrameCount = 0;
var /*const*/ kFPS = 30;
var /*const*/ kTimeStep = 1000/kFPS;
var /*const*/ kMoveStep = 1;
var /*const*/ kAIPeriod = 5;
var /*const*/ kAIMoveScale = 1.2;

var gDashedLineCount;
var gDashedLineWidth;
var gPaddleInset;
var gPaddleHeight;
var gPaddleWidth;
var gPaddleStepSize;
var gPaddleMidYLimit;
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
function sx(x) { return ii(x * gWidth/kHtmlWidth); }
function sy(y) { return ii(y * gHeight/kHtmlHeight); }
// some scaled values have more change of ever becoming zero than others,
// so these helpers can be used to avoid that if needed e.g. pixel widths.
function sx1(x) { return Math.max(1, sx(x)); }
function sy1(y) { return Math.max(1, sy(y)); }
// "percent" scaling helpers.
function gw(x=1) { return x == 1 ? gWidth : ii(x * gWidth); }
function gh(y=1) { return y == 1 ? gHeight : ii(y * gHeight); }
function RecalculateConstants() {
    gDashedLineCount = sy(15);
    gDashedLineWidth = sx1(2);
    gPaddleInset = sx(15);
    gPaddleHeight = gh(0.11);
    gPaddleWidth = sx(6);
    gPaddleStepSize = gPaddleHeight * 0.2;
    gPaddleMidYLimit = gPaddleInset + gPaddleHeight/2;
    gPuckHeight = gPuckWidth = gh(0.015);
    gPauseCenterX = gw(0.54);
    gPauseCenterY = gh(0.08);
    gPauseRadius = sx(10);
    gUserMutedCenterX = gw(0.9);
    gUserMutedCenterY = gh(0.85);
    gUserMutedWidth = sx(40);
    gUserMutedHeight = sy(30);
    gSparkWidth = sx(2);
    gSparkHeight = sy(2);
    gBigFontSize = gw(0.088);
    gRegularFontSize = gw(0.047);
    gReducedFontSize = gw(0.037);
    gSmallFontSize = gw(0.027);
    gSmallestFontSize = gw(0.018);
    gBigFontSizePt = gBigFontSize + "pt";
    gRegularFontSizePt = gRegularFontSize + "pt";
    gReducedFontSizePt = gReducedFontSize + "pt";
    gSmallFontSizePt = gSmallFontSize + "pt";
    gSmallestFontSizePt = gSmallestFontSize + "pt";
    gMinVX = Math.max(0.5, sx(1));
    gMaxVX = sx(19);
}

// anything here below that ends up depending on
// gWidth or gHeight must got up into RecalculateConstants().

var kFontName = "noyb2Regular";
var /*const*/ gStartPuckCount = 1;
var /*const*/ gMaxSparkFrame = 10;
var /*const*/ kEjectCountThreshold = 100;
var /*const*/ kEjectSpeedCountThreshold = 90;
var /*const*/ gPuckArrayInitialSize = 300;
var /*const*/ gSparkArrayInitialSize = 200;

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
var gAnyClick = false;
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
    return gTouchingTime.start != undefined;
}
function touching() {
    var is = touchEnabled() && gTouchingTime.end == undefined;
    return is;
}
function cancelTouch() {
    gTouchingTime.end = gGameTime;
}

var /*const*/ kScoreIncrement = 1;
var gPlayerScore = 0;
var gCPUScore = 0;

var gPucks; // { A:[], B:[] };
var gSparks; // { A:[], B:[] };
var gPowerup; // there can be (at most) only 1 (at a time).

var /*const*/ kNoop = -1;
var /*const*/ kSplash = 0; // audio permission via user interaction effing eff.
var /*const*/ kMenu = 1;
var /*const*/ kGame = 2;
var /*const*/ kGameOver = 3;
var /*const*/ kDebug = 4;

var gCanvas;
var gCx;
var gToasts = [];
var gGamepad = undefined;
var /*const*/ kJoystickDeadZone = 0.5;
var gRandom = MakeRandom(0xDEADBEEF);

// ----------------------------------------

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
    var str = ((array.length == 4 || alpha != undefined) ? "rgba(" : "rgb(") + joined + ")";
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

function DrawCRTScanLines() {
    /*
    Cxdo(() => {
	// not scaled on purpose.
	var step = 2;
	gCx.fillStyle = scanlineColor;
	gCx.liheWidth = 0.5;
	for( var y = 0; y < gHeight; y += step ) {
	    gCx.fillRect( 0, y, gWidth, 1 );
	}
    });
    */
}

function WX( v ) {
    return v + RandomCentered(0,1);
}
function WY( v ) {
    return v + RandomCentered(0,0.5);
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

var haha = 0;
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
	var clock_diff = now - self.lastTime;
	self.lastTime = now;
	gGameTime += clock_diff;

	var delta = gGameTime - gLastFrameTime;
	if (delta >= kTimeStep) {
	    var handler = self.handlerMap[self.state];
	    Assert(handler != undefined, self.state);
	    if (self.transitioned) {
		handler.Reset();
		self.transitioned = false;
	    }
	    var next = handler.Step(delta);
	    if( next != undefined && next !== self.state ) {
		console.log(`transitioned from ${self.state} to ${next}`);
		self.transitioned = true;
		self.state = next;
		cancelTouch();
	    }
	    gLastFrameTime = gGameTime;
	    ++gFrameCount;
	    //if (gDebug) { DrawBounds(); }
	    if (gDebug) { StepToasts(); }
	    setTimeout( self.RunLoop, Math.max(1, kTimeStep-(delta-kTimeStep)) );
	}
	else {
	    setTimeout( self.RunLoop, Math.max(1, kTimeStep - delta));
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
		DrawText(t.msg, "center", gw(0.5), y, gSmallFontSizePt);
		y += gSmallFontSize;
	    });
	});
    }
}

function PushToast(msg, lifespan=1000) {
    gToasts.push({
	msg: msg.toUpperCase(),
	end: Date.now() + lifespan
    });
}

/*class*/ function Paddle( x0, y0, label ) {

    var self = this;

    self.Init = function(label) {
	self.id = gNextID++;
	self.x = x0;
	self.y = y0;
	self.isAtLimit = false;
	self.prev_x = self.x;
	self.prev_y = self.y;
	self.width = gPaddleWidth;
	self.height = gPaddleHeight;
	self.engorged_height = gPaddleHeight * 2;
	self.targetAIPuck = undefined;
	self.label = label;
	self.engorged = false;
    };

    self.BeginEngorged = function() {
	var h2 = self.engorged_height;
	var yd = (h2 - self.height)/2;
	self.height = h2;
	// re-center.
        self.y = Math.max(0, self.y - yd);
	self.engorged = true;
    };

    self.EndEngorged = function() {
	self.height = gPaddleHeight;
	// re-center.
	self.y += Math.abs(self.engorged_height - self.height)/2;
	self.engorged = false;
    };

    self.GetMidX = function() {
	return self.X() + self.width/2;
    };

    self.GetMidY = function() {
	return self.Y() + self.height/2;
    };

    self.X = function() {
	// nudging horizontally to emulate crt curvature.
	var ypos = self.y + self.height/2;
	var mid = gh(0.5);
	var factor = Clip01(Math.abs(mid - ypos)/mid);
	var off = (10 * factor) * ((self.x < gw(0.5)) ? 1 : -1);
	return self.x + off;
    };

    self.Y = function() {
	return self.y;
    };

    self.getVX = function() {
	return (self.x - self.prev_x) / kTimeStep;
    };

    self.getVY = function() {
	return (self.y - self.prev_y) / kTimeStep;
    };

    self.Draw = function( alpha ) {
	Cxdo(() => {
	    gCx.fillStyle = RandomGreen(0.7 * alpha);
	    var wx = WX(self.X());
	    var wy = WY(self.Y());
	    gCx.fillRect( wx, wy, self.width, self.height );
	    if (!!label && gRandom() > GameTime01(kFadeInMsec)) {
		gCx.fillStyle = RandomGreen(0.5 * alpha);
		DrawText( label, "center", self.GetMidX(), self.Y()-20, gSmallFontSizePt );
	    }
	});
    };

    self.MoveDown = function(scale) {
	self.prev_y = self.y;
	self.y += gPaddleStepSize * ((scale==undefined)?1.0:scale);
	self.isAtLimit = false;
	if( self.GetMidY() > gHeight-gPaddleMidYLimit ) {
	    self.y = gHeight-gPaddleMidYLimit-gPaddleHeight/2;
	    self.isAtLimit = true;
	}
    };

    self.MoveUp = function(scale) {
	self.prev_y = self.y;
	self.y -= gPaddleStepSize * ((scale==undefined)?1.0:scale);
	self.isAtLimit = false;
	if( self.GetMidY() < gPaddleMidYLimit ) {
	    self.y = gPaddleMidYLimit-gPaddleHeight/2;
	    self.isAtLimit = true;
	}
    };

    // ........................................ AI

    self.aiCountdownToUpdate = kAIPeriod;
    self.shouldUpdate = function() {
	self.aiCountdownToUpdate--;
	var should = self.targetAIPuck == undefined;
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

    self.AIMove = function() {
	Cxdo(() => {
	    gCx.fillStyle = "blue";
	    if( self.shouldUpdate() ) {
		self.UpdatePuckTarget();
		if( self.targetAIPuck != undefined ) {
		    if (gDebug) { DrawTextFaint("TRACK", "center", gw(0.8), gh(0.1), gRegularFontSizePt); }
		    var targetMid = self.targetAIPuck.GetMidY() + self.targetAIPuck.vy;
		    var deadzone = (self.height*0.2);
		    if( targetMid <= self.GetMidY() - deadzone) {
			self.MoveUp(kAIMoveScale);
		    }
		    else if( targetMid >= self.GetMidY() + deadzone) {
			self.MoveDown(kAIMoveScale);
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
	if( puck !== undefined ) {
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
	    if (bp == undefined && p != undefined) {
		bp = p;
		return;
	    }
	    if (!self.IsPuckMovingAway(p)) {
		if (self.IsPuckMovingAway(bp)) {
		    bp = p;
		}
		var d_puck = Math.abs( self.x - p.x );
		var d_bp = Math.abs( self.x - bp.x );
		if (d_puck < d_bp && !self.IsPuckMovingAway(p)) {
		    bp = p;
		}
		if (p.vx > bp.vx) {
		    bp = p;
		}
	    }
	});
	return bp;
    };

    self.Init(label);
}

/*class*/ function Spark( x0, y0, vx, vy ) {
    var self = this;

    self.Init = function() {
	self.id = gNextID++;
	self.x = x0;
	self.y = y0;
	self.prev_x = self.x;
	self.prev_y = self.y;
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
	    self.prev_x = self.x;
	    self.prev_y = self.y;
	    self.x += (self.vx * dt);
	    self.y += (self.vy * dt);
	    self.alive = self.frameCount < gMaxSparkFrame;
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

/*class*/ function Puck( x0, y0, vx, vy, ur ) {

    var self = this;

    self.Init = function() {
	self.id = gNextID++;
	self.x = x0;
	self.y = y0;
	self.prev_x = self.x;
	self.prev_y = self.y;
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
	var wx = WX(self.x);
	var wy = WY(self.y);
	Cxdo(() => {
	    // splits render white briefly.
	    var dt = GameTime01(
		(1-Clip01(Math.abs(self.vx)/gMaxVX)) * 1000,
		self.startTime
	    );
	    gCx.fillStyle = (!self.ur && gRandom() > dt) ? "white" : RandomCyan( alpha );
	    gCx.fillRect( wx, wy, self.width, self.height );
	    gCx.lineWidth = sx1(1);
	    gCx.strokeStyle = "black";
	    gCx.strokeRect( wx-1, wy-1, self.width+2, self.height+2 );
	});
    };

    self.Step = function( dt ) {
	if( self.alive ) {
	    self.prev_x = self.x;
	    self.prev_y = self.y;
	    self.x += (self.vx * dt);
	    self.y += (self.vy * dt);
	    self.alive = 
		!(self.x+self.width < 0 || self.x > gWidth ||
		  self.y+self.height < 0 || self.y > gHeight);
	}
    };

    self.SplitPuck = function() {
	var np = undefined;
	var count = gPucks.A.length;
	var dosplit = count < ii(kEjectCountThreshold*0.7) || (count < kEjectCountThreshold && RandomBool(1.05-Clip01(Math.abs(self.vx/gMaxVX))));
	if (!dosplit) { PushToast(`no split ${self.id}`, 250); }

	// sometimes force ejection to avoid too many pucks.
	// if there are already too many pucks to allow for a split-spawned-puck,
	// then we also want to sometimes eject the existing 'self' puck
 	// to avoid ending up with just a linear stream of pucks.
	var r = gRandom();
 	var countFactor = Clip01(count/kEjectSpeedCountThreshold);
	var eject_countFactor = Math.pow(countFactor, 3);
	var doeject_count = (count > kEjectCountThreshold) && (r < 0.1);
	var doeject_speed = (self.vx > gMaxVX*0.9) && (r < eject_countFactor);
	var doeject = doeject_count || doeject_speed;

	if (!dosplit) {
	    if (doeject) {
		self.vy *= 1.1;
	    }
	}
	else {
	    // i'm sure this set of heuristics is clearly genius.
	    var slow_countFactor = Math.pow(countFactor, 1.5);
	    var slow = !doeject_speed && (self.vx > gMaxVX*0.7) && (gRandom() < slow_countFactor);
	    var nvx = self.vx * (slow ? RandomRange(0.8, 0.9) : RandomRange(1.01, 1.1));
	    var nvy = self.vy;
	    nvy = self.vy * (AvoidZero(0.5, 0.1) + 0.3);
	    np = new Puck( self.x, self.y, nvx, nvy );
	    PlayExplosion();

	    // !? can't win, spark is a global update
	    // whereas we're returning the new puck :-(
	    AddSparks(self.x, self.y, self.vx, self.vy);
	}

	return np;
    };

    self.PaddleCollision = function( paddle ) {
	var newPuck = undefined;
	if( self.alive ) {
	    // !? assuming small enough simulation stepping !?
	    // current step overlap?
	    var xRight = self.x >= paddle.x+paddle.width;
	    var xLeft = self.x+self.width < paddle.x;
	    var xOverlaps = ! ( xRight || xLeft );
	    var yTop = self.y >= paddle.y+paddle.height;
	    var yBottom = self.y+self.height < paddle.y;
	    var yOverlaps = ! ( yTop || yBottom );

	    // did previous step overlap?
	    // also trying to see which direction?
	    var pxRight = self.prev_x >= paddle.prev_x+paddle.width;
	    var pxLeft = self.prev_x+self.width < paddle.prev_x;
	    var pxOverlaps = ! ( pxRight || pxLeft );

	    // did it pass over the paddle? (paranoid check.)
	    var dxOverlaps = Sign(self.prev_x - paddle.prev_x) != Sign(self.x - paddle.x);

	    if( (dxOverlaps || xOverlaps) && yOverlaps ) {
		// bounce horizontally.
		if( self.vx > 0 ) {
		    self.x = paddle.x-self.width;
		}
		else {
		    self.x = paddle.x+paddle.width;
		}
		self.vx *= -1;

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

		newPuck = self.SplitPuck();
	    }
	}

	return newPuck;
    };

    self.AllPaddlesCollision = function( paddles ) {
	var spawned = [];
	paddles.forEach( function(paddle) {
	    var np = self.PaddleCollision(paddle);
	    if( np !== undefined ) {
		spawned.push( np );
	    }
	} );
	return spawned;
    };
    
    self.WallCollision = function() {
	if (self.alive) {
	    if( self.y < gPaddleInset ) {
		if( self.vy < 0 ) {
		    self.vy *= -1;
		    PlayBlip();
		}
		self.y = gPaddleInset;
	    }
	    if( self.y+self.height > gHeight - gPaddleInset ) {
		if( self.vy > 0 ) {
		    self.vy *= -1;
		    PlayBlip();
		}
		self.y = gHeight - gPaddleInset - self.height;
	    }
	}
    };

    self.UpdateScore = function() {
	if (!self.alive) {
	    var was_left = self.x < gw(0.5);
	    if (was_left) {
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

// the spec is { x, y, w, h, vx, vy, label, ylb, test_fn, boom_fn, draw_fn }
// don't you wish this was all in typescript now?
/*class*/ function Powerup( spec ) {
    var self = this;

    self.Init = function() {
	Assert(spec != undefined);
	self.id = gNextID++;
	self.x = spec.x;
	self.y = spec.y;
	self.prev_x = self.x;
	self.prev_y = self.y;
	self.w = spec.w;
	self.h = spec.h;
	self.vx = spec.vx;
	self.vy = spec.vy;
	self.label = spec.label;
	self.ylb = spec.ylb;
	self.fontSize = spec.fontSize;
	self.boom_fn = spec.boom_fn;
	self.draw_fn = spec.draw_fn;
    };

    self.Draw = function( alpha ) {
	self.draw_fn( self, alpha );
    };

    self.Step = function( dt ) {
	self.prev_x = self.x;
	self.prev_y = self.y;
	self.x += (self.vx * dt);
	self.y += (self.vy * dt);
	var left_bound, right_bound;
	var top_bound = 0;
	var bottom_bound = gHeight;
	if (self.x < gw(0.5)) {
	    left_bound = 0;
	    right_bound = gw(0.5);
	}
	else {
	    left_bound = gw(0.5);
	    right_bound = gw(1);
	}
	if (self.x <= left_bound) {
	    self.vx = -self.vx;
	}
	else if (self.x + self.w >= right_bound) {
	    self.vx = -self.vx;
	}
	if (self.y <= top_bound) {
	    self.vy = -self.vy;
	}
	else if (self.y + self.h >= bottom_bound) {
	    self.vy = -self.vy;
	}
    };

    self.PaddleCollision = function( paddle ) {
	// !? assuming small enough simulation stepping !?
	// current step overlap?
	var xRight = self.x >= paddle.x+paddle.width;
	var xLeft = self.x+self.w < paddle.x ;
	var xOverlaps = ! ( xRight || xLeft );
	var yTop = self.y >= paddle.y+paddle.height;
	var yBottom = self.y+self.h < paddle.y;
	var yOverlaps = ! ( yTop || yBottom );

	// did previous step overlap?
	// also trying to see which direction?
	var pxRight = self.prev_x >= paddle.prev_x+paddle.width;
	var pxLeft = self.prev_x+self.w < paddle.prev_x;
	var pxOverlaps = ! ( pxRight || pxLeft );

	// did it pass over the paddle? (paranoid check.)
	var dxOverlaps = Sign(self.prev_x - paddle.prev_x) != Sign(self.x - paddle.x);

	return (dxOverlaps || xOverlaps) && yOverlaps;
    };
    
    self.AllPaddlesCollision = function( gameState, paddles ) {
	var nextSelf = self;
	paddles.forEach( function(paddle) {
	    var hit = self.PaddleCollision(paddle);
	    if( hit ) {
		self.boom_fn(gameState);
		nextSelf = undefined;
	    }
	} );
	return nextSelf;
    };

    self.Init();
}

/*class*/ function Animation(props) {
    var { lifespan, anim_fn, start_fn, end_fn } = props;
    var self = this;
    self.start_ms = gGameTime;
    self.end_ms = self.start_ms + lifespan;
    self.Step = function(gameState) {
	start_fn && start_fn(gameState);
	start_fn = undefined;
	if (gGameTime <= self.end_ms) {
	    anim_fn(gameState, self.start_ms, self.end_ms);
	    return false;
	}
	end_fn && end_fn(gameState);
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
	var lp = { x: gPaddleInset, y: gh(0.5) };
	var rp = { x: gWidth-gPaddleInset-gPaddleWidth, y: gh(0.5) };
	var p1label = attract ? undefined : "P1";
	ForSide(
	    () => {
		self.playerPaddle = new Paddle(lp.x, lp.y, p1label);
		self.cpuPaddle = new Paddle(rp.x, rp.y);
		gPucks.A.push( self.CreateStartingPuck(1) );
		if (gDebug) {
		    gPucks.A.push( self.CreateStartingPuck(1) );
		    gPucks.A.push( self.CreateStartingPuck(1) );
		}
	    },
	    () => {
		self.playerPaddle = new Paddle(rp.x, rp.y, p1label);
		self.cpuPaddle = new Paddle(lp.x, lp.y);
		gPucks.A.push( self.CreateStartingPuck(-1) );
		if (gDebug) {
		    gPucks.A.push( self.CreateStartingPuck(-1) );
		    gPucks.A.push( self.CreateStartingPuck(-1) );
		}
	    }
	)();

	PlayBlip();
    };

    self.Step = function(delta) {
	if (!self.attract) { ClearScreen(); }
	self.MaybeSpawnPowerup(delta);
	self.ProcessInput();
	self.StepPlayer();
	self.StepMoveables();
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
	gPauseButtonEnabled = (nextState == undefined);
	return nextState;
    };

    self.MaybeSpawnPowerup = function(delta) {
	if (!self.paused) {
	    self.powerupWait = Math.max(self.powerupWait-delta, 0);
	    if (!self.attract &&
		self.powerupWait == 0 &&
		RandomBool(gDebug ? 0.1 : 0.01) &&
		gPowerup == undefined) {
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

    self.StepAnimations = function() {
	for (var anim_id in self.animations) {
	    var done = self.animations[anim_id].Step(self);
	    if (done) {
		delete self.animations[anim_id];
	    }
	}
    };

    self.CreateStartingPuck = function(sign) {
	var p = new Puck( gw(RandomRange(0.45, 0.48)),
			  gh(RandomRange(0.45, 0.5)),
			  sign * gMaxVX/3,
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
		event.update_fn();
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

    self.StepPlayer = function() {
	if( gUpPressed || gStickUp ) {
	    self.playerPaddle.MoveUp();
	}
	if( gDownPressed || gStickDown ) {
	    self.playerPaddle.MoveDown();
	}
	if( gMoveTargetY != undefined ) {
	    var limit = gPaddleInset + gPaddleHeight/2;
	    gMoveTargetY = Clip(
		gMoveTargetY + gMoveTargetStepY,
		limit,
		gHeight - limit
	    );
	    if( gMoveTargetY < self.playerPaddle.GetMidY() ) {
		self.playerPaddle.MoveUp();
	    }
	    if( gMoveTargetY > self.playerPaddle.GetMidY() ) {
		self.playerPaddle.MoveDown();
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

    self.StepMoveables = function() {
	if (!self.paused) {
	    if (self.attract) {
		self.playerPaddle.AIMove();
	    }
	    self.cpuPaddle.AIMove();
	    self.MovePucks();
	    self.MoveSparks();
	    self.MovePowerup();
	}
    };

    self.MovePucks = function() {
	gPucks.B.clear();
	gPucks.A.forEach((p) => {
	    p.Step( kMoveStep );
	    if (!self.attract) {
		p.UpdateScore();
	    }
	    if (p.alive) {
		var splits = p.AllPaddlesCollision( [ self.playerPaddle, self.cpuPaddle ] );
		p.WallCollision();
		gPucks.B.push( p );
		if( !self.attract ) {
		    gPucks.B.pushAll(splits);
		}
	    }
	});
	SwapBuffers(gPucks);
    };

    self.MoveSparks = function() {
	gSparks.B.clear();
	gSparks.A.forEach((s) => {
	    s.Step( kMoveStep );
	    s.alive && gSparks.B.push( s );
	} );
	SwapBuffers(gSparks);
    };

    self.MovePowerup = function() {
	if (gPowerup != undefined) {
	    gPowerup.Step( kMoveStep );
	    gPowerup = gPowerup.AllPaddlesCollision( self, [ self.playerPaddle, self.cpuPaddle ] );
	}
    };

    self.Alpha = function( alpha ) {
	if (alpha == undefined) { alpha = 1; }
	return alpha * (self.attract ? 0.3 : 1);
    };

    self.DrawMidLine = function() {
	Cxdo(() => {
	    gCx.fillStyle = RandomGreen(self.Alpha(RandomRange(0.4, 0.6)));
	    var dashStep = (gHeight - 2*gPaddleInset)/(gDashedLineCount*2);
	    var x = gw(0.5) - ii(gDashedLineWidth/2);
	    for( var y = gPaddleInset; y < gHeight-gPaddleInset; y += dashStep*2 ) {
		var ox = RandomCentered(0, 1);
		gCx.fillRect( x+ox, y, gDashedLineWidth, dashStep );
	    }
	});
    };

    self.DrawCRTOutline = function() {
	var inset = 10;
	var wx = WX(inset);
	var wy = WY(inset);
	Cxdo(() => {
	    gCx.beginPath();
	    // ok i am going a bit crazy here?!?! the corner radius
	    // empirically renders incorrectly on firefox (too small)
	    // vs. edge and webkit showing the same (correct) curvature.
	    gCx.roundRect(wx, wy, gWidth-wx*2, gHeight-wy*2, [20]);
	    gCx.lineWidth = sx1(2);
	    gCx.strokeStyle = RandomCyan(self.Alpha(0.3));
	    gCx.stroke();
	});
    };

    self.DrawHeader = function() {
	Cxdo(() => {
	    gCx.fillStyle = RandomMagenta(self.Alpha(0.7));
	    ForSide(
		() => {
		    if (gHighScore != undefined) {
			DrawText( "HI: " + gHighScore, "left", gw(0.1), gh(1/12), gSmallFontSizePt );
		    }
		    if (!self.attract) {
			DrawText( "GPT: " + gCPUScore, "right", gw(0.9), gh(2/12), gRegularFontSizePt );
			DrawText( "P1: " + gPlayerScore, "left", gw(0.1), gh(2/12), gRegularFontSizePt );
		    }
		},
		() => {
		    if (gHighScore != undefined) {
			DrawText( "HI: " + gHighScore, "right", gw(0.9), gh(1/12), gSmallFontSizePt );
		    }
		    if (!self.attract) {
			DrawText( "GPT: " + gCPUScore, "left", gw(0.1), gh(2/12), gRegularFontSizePt );
			DrawText( "P1: " + gPlayerScore, "right", gw(0.9), gh(2/12), gRegularFontSizePt );
		    }
		}
	    )();
	});
    };

    self.DrawTouchTarget = function() {
	if (gMoveTargetY != undefined && !self.attract) {
	    var size = sy(7);
	    var xoff = sx((Clip01(Math.abs(gMoveTargetY - gh(0.5))/gh(0.5)))*5);
	    ForSide(
		() => {
		    var left = WX(gPaddleInset*0.2) + xoff;
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
		    var right = WX(gWidth - gPaddleInset*0.2) - xoff;
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
	if (gTouchSide != undefined && !self.attract) {
	    gPauseButtonEnabled = true;
	    var cx = gPauseCenterX;
	    var cy = gPauseCenterY;
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
		    gCx.strokeStyle = RandomGreen(0.5);
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

    self.Draw = function() {
	if (!gResizing) {
	    self.StepAnimations();
	    self.DrawMidLine();
	    self.DrawHeader();
	    gPucks.A.forEach((p) => {
		Assert(!!p);
		p.Draw( self.Alpha() );
	    } );
	    gSparks.A.forEach((s) => {
		Assert(!!s);
		s.Draw( self.Alpha() );
	    } );
	    // keep some things visible on z top.
	    self.playerPaddle.Draw( self.Alpha() );
	    self.cpuPaddle.Draw( self.Alpha() );
	    self.DrawPauseButton();
	    self.DrawTouchTarget();
	    self.DrawCRTOutline();
	    gPowerup && gPowerup.Draw( self.Alpha() );
	    DrawCRTScanLines();
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
	if( cpuAIPuckTarget !== undefined ) {
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
	if( playerAIPuckTarget !== undefined ) {
	    Cxdo(() => {
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
	gCx.strokeStyle = "rgba(255,255,255,0.3)";
	gCx.lineWidth = 25;
	gCx.stroke();
	gCx.strokeRect(5, 5, gWidth-10, gHeight-10);
    });
    Cxdo(() => {
	gCx.beginPath();
	gCx.moveTo(WX(0), WY(0));
	gCx.lineTo(WX(gCanvas.width), WY(gCanvas.height));
	gCx.moveTo(WX(gCanvas.width), WY(0));
	gCx.lineTo(WX(0), WY(gCanvas.height));
	gCx.strokeStyle = "rgba(255,0,255,0.7)";
	gCx.lineWidth = 3;
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

function DrawTitle() {
    Cxdo(() => {
    	gCx.fillStyle = RandomForColor(cyan, RandomCentered(0.8,0.2));
	DrawText( "P N 0 G S T R 0 M", "center", gw(0.5), gh(0.4), gBigFontSizePt );
	DrawText( "ETERNAL BETA", "right", gw(0.92), gh(0.45), gSmallFontSizePt );
    });
}

/*class*/ function SplashState() {
    var self = this;

    self.Reset = function() {
	ResetInput();
    };

    self.Step = function() {
	ClearScreen();
	var nextState = undefined;
	if (gResizing) {
	    DrawResizing();
	}
	else {
	    DrawTitle();
	    if (getWindowAspect() <= 1) {
		Cxdo(() => {
		    gCx.fillStyle = RandomForColor(yellow);
		    DrawText("HINT: SWITCH TO LANDSCAPE MODE", "center", gw(0.5), gh(0.8), gReducedFontSizePt);
		});
	    }
	    nextState = self.ProcessInput();		
	}
	DrawCRTScanLines();
	return nextState;
    };

    self.ProcessInput = function() {
	var nextState = undefined;
	gEventQueue.forEach((event,i) => {
	    event.update_fn();
	    if (nextState == undefined) {
		nextState = self.ProcessOneInput();
	    }
	});
	gEventQueue = [];
	return nextState;
    };

    self.ProcessOneInput = function() {
	if (anyKeyPressed() || gAnyClick || gStickUp || gStickDown || touching()) {
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

    self.Step = function() {
	var nextState = undefined;
	ClearScreen();
	self.attract.Step();
	nextState = self.ProcessInput();
	self.Draw();
	if (nextState != undefined) {
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
		event.update_fn();
		if (nextState == undefined &&
		    event.event_type != kEventTouchMove &&
		    event.event_type != kEventMouseMove) {
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
	    BeginMusic();
	    gUserMutedPressed = false;
	}
	else if (gNextMusicPressed) {
	    BeginMusic();
	}
	// explicitly not including gAnyClick because
	// the game play itself doesn't support mouse yet.
	else if (anyKeyPressed() || gStickUp || gStickDown || touching()) {
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
		DrawText( "CONTROLS: TAP / W S / ARROWS / GAMEPAD", "center", gw(0.5), gh(0.5)+50, gReducedFontSizePt );
		if ((gGameTime - self.started) <= self.timeout) {
		    var msg = "LOADING...";
		    DrawText( msg, "center", gw(0.5), gh(0.9), gReducedFontSizePt );
		}
	    });
	}
	DrawCRTScanLines();
    };

    self.DrawAudio = function() {
	self.DrawMusicName();
	self.DrawMuteMusicButton();
    }

    self.DrawMusicName = function() {
	if (!gUserMuted && gMusicID != undefined) {
	    var name = gAudioMap[gMusicID];
	    var meta = gAudioMap[name];
	    if (meta?.filebasename != undefined) {
		Cxdo(() => {
		    gCx.fillStyle = "grey";
		    DrawText(`norcalledmvsic ${meta.filebasename}`.toUpperCase(),
			     "right",
			     gw(0.95),
			     gh(0.95),
			     gSmallestFontSizePt,
			     false);
		});
	    }
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
	    gCx.fillStyle = gCx.strokeStyle = RandomForColor(yellow, 0.5);
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
    };

    self.Step = function() {
	var nextState = undefined;
	var goto_menu = (gGameTime - self.started) > self.timeoutMsg;
	ClearScreen();
	nextState = self.ProcessInput(goto_menu);
	self.Draw(goto_menu);
	return nextState;
    };

    self.ProcessInput = function(goto_menu) {
	var nextState = undefined;
	var hasEvents = gEventQueue.length > 0;
	if (hasEvents) {
	    gEventQueue.forEach((event,i) => {
		event.update_fn();
		nextState = self.ProcessOneInput(goto_menu);
	    });
	    gEventQueue = [];
	}
	if (nextState != undefined) {
	    gHighScore = Math.max(self.finalScore, (gHighScore||self.finalScore));
	    localStorage.setItem(kHighKey, gHighScore);
	}
	return nextState;
    };

    self.ProcessOneInput = function(goto_menu) {
	var nextState = undefined;
	if (goto_menu && (anyKeyPressed() || gAnyClick || gStickUp || gStickDown || touching())) {
            nextState = kMenu;
        }
	else if (nextState == undefined && (gGameTime - self.started) > self.timeoutMsg+self.timeoutEnd) {
	    nextState = kMenu;
	}
	return nextState;
    };
    
    self.Draw = function(goto_menu) {
	ClearScreen();
	var x = gw(0.5);
	var y = gh(0.5) - 20;
	var nextState = undefined;
	Cxdo(() => {
	    gCx.fillStyle = RandomMagentaSolid();
	    if (gHighScore == undefined || self.finalScore > gHighScore) {
		DrawText( "NEW HIGH SCORE", "center", x, y - 80, gRegularFontSizePt );
	    }
	    var msg = `FINAL SCORE: ${gPlayerScore} - ${gCPUScore} = ${self.finalScore}`;
	    DrawText( msg, "center", x, y, gRegularFontSizePt );

	    if (goto_menu) {
		gCx.fillStyle = RandomYellowSolid();
		DrawText( "GO TO MENU", "center", x, y+120, gReducedFontSizePt );
	    }
	});

	DrawCRTScanLines();

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
		event_type: kEventStickUp,
		update_fn: () => {
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
		event_type: kEventStickDown,
		update_fn: () => {
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
    if (gGamepad != undefined) {
	gGamepad.removeEventListener("joystickmove", StandardMapping.Axis.JOYSTICK_LEFT);
	gGamepad.removeEventListener("joystickmove", StandardMapping.Axis.JOYSTICK_RIGHT);
	gGamepad = undefined;
    }
}

function PointerProcess(t, update_fn) {
    var cvrect = gCanvas.getBoundingClientRect();
    var cvx = cvrect.x + window.scrollX;
    var cvy = cvrect.y + window.scrollY;
    // "regular" non-game-transformed screen pixel coordinates.
    // todo: handle window.devicePixelRatio.
    var tx = (t.clientX - cvx);
    var ty = (t.clientY - cvy);
    if (gTouchSide == undefined) {
	gTouchSide = tx < gw(0.5) ? "left" : "right";
    }
    Assert(update_fn != undefined);
    update_fn(tx, ty);
}

function SetPointerTarget(tx, ty, event_type) {
    gEventQueue.push({
	event_type,
	update_fn: () => {
	    gTouchX = tx;
	    gTouchY = ty;
	    gMoveTargetY = ty;
	    console.log(tx, ty, gMoveTargetY);
	},
    });
}

function TouchStart(e) {
    e.preventDefault();
    PointerProcess(
	e.touches[0],
	(tx, ty) => {
	    SetPointerTarget(tx, ty, kEventTouchStart);
	    gTouchingTime = { start: gGameTime, end: undefined };
	}
    );
}

function TouchMove(e) {
    e.preventDefault();
    if (gTouchingTime.end == undefined) {
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
    var start_time = gTouchingTime.start;
    var end_time = gGameTime;
    gEventQueue.push({
	event_type: kEventTouchEnd,
	update_fn: () => {
	    gMoveTargetStepY = 0;
	    gTouchingTime.end = end_time;
	}
    });
}

function MouseDown(e) {
    e.preventDefault();
    PointerProcess(
	e,
	(tx, ty) => {
	    SetPointerTarget(tx, ty, kEventMouseDown)
	    gTouchingTime = { start: gGameTime, end: undefined };
	}
    );
}

function MouseMove(e) {
    if (gTouchingTime.end == undefined) {
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
    var start_time = gTouchingTime.start;
    var end_time = gGameTime;
    gEventQueue.push({
	event_type: kEventMouseUp,
	update_fn: () => {
	    gMoveTargetStepY = 0;
	    gTouchingTime.end = end_time;
	}
    });
}

function ResetInput() {
    gAnyClick = false;
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
	A: new ReuseArray(gPuckArrayInitialSize),
	B: new ReuseArray(gPuckArrayInitialSize)
    };
    gSparks = {
	A: new ReuseArray(gSparkArrayInitialSize),
	B: new ReuseArray(gSparkArrayInitialSize)
    };
}

function OnOrientationChange() {
    if (gLifecycle != undefined && gLifecycle.state == kMenu) {
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
    if (wa >= gAspectRatio) {
	w = h * gAspectRatio;
    } else {
	h = w * 1/gAspectRatio;
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
    var hs = localStorage.getItem(kHighKey);
    if (hs != undefined) {
	gHighScore = parseInt(hs);
    }

    gCanvas = document.getElementById( gCanvasName );
    gCx = gCanvas.getContext( '2d' );
    DoResize();
    RecalculateConstants();

    var handlerMap = {};
    handlerMap[kNoop] = new NoopState(kSplash);
    handlerMap[kSplash] = new SplashState();
    handlerMap[kMenu] = new MenuState();
    handlerMap[kGame] = new GameState();
    handlerMap[kGameOver] = new GameOverState();
    gLifecycle && gLifecycle.Quit();
    gLifecycle = new Lifecycle( handlerMap );
    gLifecycle.RunLoop();
}

function InitEvents() {
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
		event_type: kEventKeyDown,
		update_fn: () => {
		    gUpPressed = true;
		    gMoveTargetY = undefined;
		    gDownKeys[e.keyCode] = true;
		}
	    });
	}
	if( e.keyCode == 40 || e.keyCode == 83 ) { // arrow down, s
	    e.preventDefault();
	    gEventQueue.push({
		event_type: kEventKeyDown,
		update_fn: () => {
		    gDownPressed = true;
		    gMoveTargetY = undefined;
		    gDownKeys[e.keyCode] = true;
		}
	    });
	}
	if( e.keyCode == 80 || e.keyCode == 19 ) { // 'p', 'pause'
	    gEventQueue.push({
		event_type: kEventKeyDown,
		update_fn: () => {
		    gPausePressed = true;
		    gDownKeys[e.keyCode] = true;
		}
	    });
	}
	if( e.keyCode == 65 ) { // 'a'
	    gEventQueue.push({
		event_type: kEventKeyDown,
		update_fn: () => {
		    if (gDebug) { gAddPuckPressed = true; }
		    gDownKeys[e.keyCode] = true;
		}
	    });
	}
	if( e.keyCode == 81 ) { // 'q'
	    gEventQueue.push({
		event_type: kEventKeyDown,
		update_fn: () => {
		    if (gDebug) { gGameOverPressed = true; }
		    gDownKeys[e.keyCode] = true;
		}
	    });
	}
	if( e.keyCode == 66 ) { // 'b'
	    gEventQueue.push({
		event_type: kEventKeyDown,
		update_fn: () => {
		    console.log("++ gSpawnPowerupPressed");
		    if (gDebug) { gSpawnPowerupPressed = true; }
		    gDownKeys[e.keyCode] = true;
		}
	    });
	}
	if( e.keyCode == 69 ) { // 'e'
	    gEventQueue.push({
		event_type: kEventKeyDown,
		update_fn: () => {
		    if (gDebug) { gNextMusicPressed = true; }
		    gDownKeys[e.keyCode] = true;
		}
	    });
	}
	if (e.keyCode == 46) { // delete.
	    gEventQueue.push({
		event_type: kEventKeyDown,
		update_fn: () => {
		    if (gDebug) {
			gHighScore = undefined;
			localStorage.removeItem(kHighKey);
		    }
		    gDownKeys[e.keyCode] = true;
		}
	    });
	}
    });

    window.addEventListener('keyup', (e) => {
	if( e.keyCode == 38 || e.keyCode == 87 ) { // arrow up, w
	    e.preventDefault();
	    gEventQueue.push({
		event_type: kEventKeyUp,
		update_fn: () => {
		    gUpPressed = false;
		    delete gDownKeys[e.keyCode];
		}
	    });
	}
	if( e.keyCode == 40 || e.keyCode == 83 ) { // arrow down, s
	    e.preventDefault();
	    gEventQueue.push({
		event_type: kEventKeyUp,
		update_fn: () => {
		    gDownPressed = false;
		    delete gDownKeys[e.keyCode];
		}
	    });
	}
	if( e.keyCode == 80 || e.keyCode == 19 ) { // 'p', 'pause'
	    gEventQueue.push({
		event_type: kEventKeyUp,
		update_fn: () => {
		    gPausePressed = false;
		    delete gDownKeys[e.keyCode];
		}
	    });
	}
	if( e.keyCode == 65 ) { // 'a'
	    gEventQueue.push({
		event_type: kEventKeyUp,
		update_fn: () => {
		    gAddPuckPressed = false;
		    delete gDownKeys[e.keyCode];
		}
	    });
	}
	if( e.keyCode == 81 ) { // 'q'
	    gEventQueue.push({
		event_type: kEventKeyUp,
		update_fn: () => {
		    gGameOverPressed = false;
		    delete gDownKeys[e.keyCode];
		}
	    });
	}
	if( e.keyCode == 66 ) { // 'b'
	    gEventQueue.push({
		event_type: kEventKeyUp,
		update_fn: () => {
		    console.log("-- gSpawnPowerupPressed");
		    gSpawnPowerupPressed = false;
		    delete gDownKeys[e.keyCode];
		}
	    });
	}
	if( e.keyCode == 69 ) { // 'e'
	    gEventQueue.push({
		event_type: kEventKeyUp,
		update_fn: () => {
		    delete gDownKeys[e.keyCode];
		}
	    });
	}
	if (e.keyCode == 46) { // delete.
	    gEventQueue.push({
		event_type: kEventKeyUp,
		update_fn: () => {
		    delete gDownKeys[e.keyCode];
		}
	    });
	}
    });

    window.addEventListener( 'orientationChange', OnOrientationChange, false );
    window.addEventListener( 'resize', OnResize, false );
}

window.addEventListener( 'load', () => { LoadAudio(); Start(); InitEvents(); }, false );
