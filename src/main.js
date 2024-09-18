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
var gDebug_DrawList = [];
var gShowToasts = gDebug;

var kCanvasName = "canvas"; // match: index.html
var gLifecycle;

var gSinglePlayer = LoadLocal(LocalStorageKeys.singlePlayer, true);
var kScoreIncrement = 1;
// note: see GameState.Init().
var gP1Score = 0;
var gP2Score = 0;

// todo: the game mode stuff is a big ball of mud within
// the larger death star of mud that is all of this code;
// {single player, game mode, game level} need refactoring.
// see also: gSinglePlayer usage, oh no.
var kGameModeRegular = "regular";
var kGameModeHard = "hard";
// note: zen is also how 2 player is done, but that's never very explicit.
var kGameModeZen = "zen";
var gGameMode = LoadLocal(LocalStorageKeys.gameMode, kGameModeRegular);
// code smell: sentinel values, -1 is attract, -2 is zen. 
const kAttractLevelIndex = -1;
const kZenLevelIndex = -2;
// levels are 1-based.
// todo: gLevelIndex is an overloaded mess.
var gLevelIndex = (gGameMode === kGameModeZen) ? kZenLevelIndex : 1;
// it is awful how these overlap and interact, so confusing.
// this doesn't even handle attract-mode levels.
function ForGameMode(singlePlayer, gameMode, {regular, hard, zen}) {
    Assert(exists(regular));
    // two player mode is always zen mode.
    if (!singlePlayer) {
        gameMode = kGameModeZen;
    }
    if (gameMode === kGameModeRegular) {
        return regular;
    }
    else if (gameMode === kGameModeHard) {
        return exists(hard) ? hard : regular;
    }
    else if (gameMode === kGameModeZen) {
        return exists(zen) ? zen : regular;
    }
}
// note: calling this with no arguments is a hack
// to try to clean up state as the 1 vs. 2 player etc.
// choices change in the menu.
// todo: clean up all the globals and confusing
// inter-related state of 1 vs. 2 player vs. game mode
// vs. level type and index.
function SetGameMode(mode=gGameMode) {
    Assert(mode === kGameModeRegular ||
           mode === kGameModeHard ||
           mode === kGameModeZen,
           mode);
    gGameMode = mode;
    ForGameMode(gSinglePlayer, gGameMode, {
        regular: () => gLevelIndex = 1,
        zen: () => gLevelIndex = kZenLevelIndex
    })();
    console.log("SetGameMode", mode, gLevelIndex);
}

// ----------------------------------------

// slightly useful for testing collisions when enabled
// but carries some hacky tech debt
// and can mislead about regular behaviour?!
var kDrawAIPuckTarget = true;

// i.e. attract mode.
var gMonochrome = false;

// "fade" from all-green to specified colors. see: GameTime01 and color.js
var kGreenFadeInMsec = gDebug ? 1000 : 7000;
// "fade" in from 0 alpha to specified alphas. match: MakeGameStartAnimation.
var kAlphaFadeInMsec = 700;

// per-game high score doesn't make sense
// now that we have levels that start scores at 0:0.
var gLevelHighScores = LoadLocal(LocalStorageKeys.highScores, {});

// note that all the timing and stepping stuff is maybe fragile vs. frame rate?!
// although i did try to compensate in the run loop.
var kFPS = 50;
var kTimeStep = 1000/kFPS;
var kTimeStepThreshold = kTimeStep * 0.7;
var kMaybeWasPausedInTheDangedDebuggerMsec = 1000 * 1; // whatevez!
var gLevelTime = 0;
var gGameTime = 0;
var gFrameCount = 0;
var kPhysicsStepScale = 0.04;
var kAIPeriod = 5;

var gMidLineDashCount;
var gMidLineDashWidth;
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
var gSparkWidth;
var gSparkHeight;
var gBigFontSize;
var gRegularFontSize;
var gReducedFontSize;
var gSmallFontSize;
var gSmallerFontSize;
var gSmallestFontSize;
var gBigFontSizePt;
var gRegularFontSizePt;
var gReducedFontSizePt;
var gSmallFontSizePt;
var gSmallerFontSizePt;
var gSmallestFontSizePt;
var gPillTextY;

// try to avoid huge visual puck steps jumps per frame.
var kMaxVX = sxi(19);

// bug: if vy gets too big then the pucks escape vertically,
// so hard coding a limit to work around that.
var kMaxVY = syi(30);

function RecalculateConstants() {
    gMidLineDashCount = syi(16);
    gMidLineDashWidth = sx1(2);
    gXInset = sxi(20);
    gYInset = sxi(20);
    gPaddleHeight = gh(0.11);
    gPaddleWidth = sxi(6);
    gPaddleStepSize = gPaddleHeight * 0.15;
    gPuckHeight = gPuckWidth = gh(0.012);
    gPauseCenterX = gw(0.58);
    gPauseCenterY = gh(0.1);
    gPauseRadius = sxi(12);
    gSparkWidth = sxi(3);
    gSparkHeight = syi(3);
    gBigFontSize = NearestEven(gw(0.088));
    gRegularFontSize = NearestEven(gw(0.047));
    gReducedFontSize = NearestEven(gw(0.037));
    gSmallFontSize = NearestEven(gw(0.027));
    gSmallerFontSize = NearestEven(gw(0.021));
    gSmallestFontSize = NearestEven(gw(0.018));
    gBigFontSizePt = gBigFontSize + "pt";
    gRegularFontSizePt = gRegularFontSize + "pt";
    gReducedFontSizePt = gReducedFontSize + "pt";
    gSmallFontSizePt = gSmallFontSize + "pt";
    gSmallerFontSizePt = gSmallerFontSize + "pt";
    gSmallestFontSizePt = gSmallestFontSize + "pt";
    gPillTextY = gh(0.9);
}

// anything here below that ends up depending on
// gWidth or gHeight must got up into RecalculateConstants().

var kFontName = "noyb2Regular";
var kAvgSparkFrame = 20;
var kEjectCountThreshold = 400;
var kEjectSpeedCountThreshold = 300;
var kPuckPoolSize = 500;
var kSparkPoolSize = 300;
var kBarriersArrayInitialSize = 4;
var kXtrasArrayInitialSize = 6;

// prevent pills from showing up too often, or too early - but not too late.
var PillSpawnCooldownFn = () => ForGameMode(gSinglePlayer, gGameMode, {
    regular: () => 1000 * 5,
    hard: () => 1000 * 10,
    zen: () => 1000 * 20,
})();
var kSpawnPlayerPillFactor = 0.003;

// actually useful sometimes when debugging.
var gNextID = 0;

var nokeys = { up: false, down: false };
function noKeysState() { return {...nokeys}; }
var gP1Keys = new WrapState({resetFn: noKeysState});
var gP2Keys = new WrapState({resetFn: noKeysState});
var gPNoneKeys = new WrapState({resetFn: noKeysState});
function isUpOrDownKeyPressed() {
    return gP1Keys.$.up || gP1Keys.$.down ||
        gP2Keys.$.up || gP2Keys.$.down;
}
function LeftKeys() {
    return ForSide(gP1Side, gP1Keys, gP2Keys);
}
function RightKeys() {
    return ForOtherSide(gP1Side, gP1Keys, gP2Keys);
}

var nostick = { up: false, down: false, dz: kJoystickDeadZone };
function noStickState() { return {...nostick}; }
var gGamepad1Sticks = new WrapState({resetFn: noStickState});
var gGamepad2Sticks = new WrapState({resetFn: noStickState});
var nobuttons = { up: false, down: false, menu: false, activate: false };
function noButtonsState() { return {...nobuttons}; }
var gGamepad1Buttons = new WrapState({resetFn: noButtonsState});
var gGamepad2Buttons = new WrapState({resetFn: noButtonsState});

function isGamepad1Up() { return !!gGamepad1Buttons.$.up || !!gGamepad1Sticks.$.up; }
function isGamepad1Down() { return !!gGamepad1Buttons.$.down || !!gGamepad1Sticks.$.down; }
function isGamepad2Up() { return !!gGamepad2Buttons.$.up || !!gGamepad2Sticks.$.up; }
function isGamepad2Down() { return !!gGamepad2Buttons.$.down || !!gGamepad2Sticks.$.down; }
function isGamepadActivatePressed() {
    var is = !!gGamepad1Buttons.$.activate ||
        !!gGamepad2Buttons.$.activate;
    return is;
}

function isAnyUpOrDownPressed() {
    return isUpOrDownKeyPressed() ||
        isGamepad1Up() || isGamepad1Down() ||
        isGamepad2Up() || isGamepad2Down();
};

function isAnyActivatePressed(cmds) {
    return cmds.activate || isGamepadActivatePressed();

}
function clearAnyActivatePressed() {
    gGamepad1Buttons.$.activate = false;
    gGamepad2Buttons.$.activate = false;
}

function isGamepadMenuPressed() {
    var is = !!gGamepad1Buttons.$.menu ||
        !!gGamepad2Buttons.$.menu;
    return is;
}
function isAnyMenuPressed(cmds) {
    return cmds.menu || isGamepadMenuPressed();
}
function clearAnyMenuPressed() {
    gGamepad1Buttons.$.menu = false;
    gGamepad2Buttons.$.menu = false;
}

// note: these are mainly (only) for keyboard input,
// aren't specific to p1 vs. p2 or left vs. right.
/* note: this is a list of what is supported, at runtime i just use {}.
var nocmds = {
    menu: false,
    pause: false,
    activate: false,
    addPuck: false,
    gameOver: false,
    spawnPill: false,
    clearHighScore: false,
    step: false,
    nextMusic: false,
    singlePlayer: false,
    doublePlayer: false,
}
*/

function ResetInput() { // todo: code smell.
    // todo: eventually, i think
    // we don't actually always want to reset
    // the inputs (keys, buttons, sticks, pointers)
    // so that players can move in a direction as soon as the game
    // starts; we aren't polling on every frame.
    gEventQueue = [];
    // any remaining events were just forgotten,
    // so we must clean up state e.g. key-up
    // by resetting states, but see the todo above.
    gP1Keys.Reset();
    gP2Keys.Reset();
    gGamepad1Sticks.Reset();
    gGamepad2Sticks.Reset();
    gGamepad1Buttons.Reset();
    gGamepad2Buttons.Reset();
    // not full resets, keep the 'side' information.
    gP1Target.ClearPointer();
    gP2Target.ClearPointer();
}
var gP1Side;
var gP2Side;
function ResetP1Side() {
    gP1Side = undefined;
    gP2Side = undefined;
    exists(gP1Target) && gP1Target.ClearSide();
    exists(gP2Target) && gP2Target.ClearSide();
}
ResetP1Side();
function SetP1Side(side) {
    if (gP1Side == undefined) {
        // todo: seems risky that 'side' exists in so many places.
        gP1Side = side;
        gP2Side = OtherSide(side);
        gP1Target.SetSide(gP1Side, gSinglePlayer, gw(0.5));
        if (!gSinglePlayer) {
            gP2Target.SetSide(gP2Side, gSinglePlayer, gw(0.5));
        }
    }
}

var gEventQueue = [];
var kEventKeyDown = "key_down";
var kEventKeyUp = "key_up";
var kEventPointerDown = "pointer_down";
var kEventPointerMove = "pointer_move";
var kEventPointerUp = "pointer_up";
var kEventGamepadButtonPressed = "gamepad_button_pressed";
var kEventGamepadButtonReleased = "gamepad_button_released";
var kEventGamepadJoystickMove = "gamepad_joystick_move";

/*
 must track down/up per pointer id
 otherwise we'll be confused?
 how to decide which player a pointer event controls?

 * single player: all for player.

 * two player: based on which half the pointer was down.

 but in both cases, what do we do about multiple competing
 pointers, events? i guess we only allow one at a time.
 so we have to keep track of the pointerId.

 in single player mode, both left and right control the player paddle.
*/

var kMousePointerId = "__mouse";
var gP1Target = new MoveTarget({name: "p1"});
var gP2Target = new MoveTarget({name: "p2"});
function ForPointerId(pid) {
    if (exists(pid)) {
        if (pid == gP1Target.pointerId) {
            return gP1Target;
        }
        if (pid == gP2Target.pointerId) {
            return gP2Target;
        }
    }
    return undefined;
}
function isAnyPointerEnabled() {
    var is = gP1Target.isEnabled() || gP2Target.isEnabled();
    return is;
}
function isAnyPointerDown() {
    var is = gP1Target.isDown() || gP2Target.isDown();
    return is;
}
function cancelPointing() {
    gP1Target.ClearPointer();
    gP2Target.ClearPointer();
}

// todo: move all these into GameState.
// todo: use typescript. (or haxe.)
var gPuckPool;
var gPucks; // { A: reuseArray, B: reuseArray }
var gSparkPool;
var gSparks; // { A: reuseArray, B: reuseArray }

// i just love not having an enum type.
var kDebug = -2;
var kRoot = -1;
var kWarning = 0; // audio permission via user interaction effing eff.
var kTitle = 1;
var kGetReady = 2; // includes 'level splash' for levels 2+.
var kGame = 3;
var kLevelFin = 4;
var kGameOver = 5;
var kGameOverSummary = 6;

var gCanvas;
var gCx;
var gCanvas2;
var gCx2;
var gToasts = [];
var gGamepad1;
var gGamepad2;
var kJoystickDeadZone = 0.5;
var gR = new Random( 0x1BADB002 );

// ----------------------------------------

// return 0 to 1 during the given time period
// from the start of the game.
// return > 1 after the period.
function GameTime01(period, start=gLevelTime) {
    var diff = gGameTime - start;
    period = Math.max(1, period);
    var t = T01nl(diff, period);
    return t;
}

// (all) this really needs to go into GameState???
function ForSide(src, left, right) {
    // due to history, undefined means right.
    if (src === "left") {
        return left;
    }
    return right;
}
function ForOtherSide(src, left, right) {
    return ForSide(src, right, left);
}
function OtherSide(side) {
    return side === "left" ? "right" : "left";
}

function SwapBuffers(buffers) {
    var tmp = buffers.A;
    buffers.A = buffers.B;
    buffers.B = tmp;
}

function Cxdo(fn) { // get it?
    gCx.save();
    fn();
    gCx.restore();
}

function SaveEndScreenshot(state) {
    Cxdo(() => {
        Assert(exists(state.Draw));
        state.Draw({ isEndScreenshot: true });
        gCx2.clearRect(0, 0, gWidth, gHeight);
        gCx2.drawImage(gCanvas, 0, 0);
    });
}

// canvas' line drawing api is... weird.
function O5( v ) {
    return Math.floor(v) + 0.5;
}
function MoveTo( x, y ) {
    gCx.moveTo( O5(x), O5(y) );
}
function LineTo( x, y ) {
    gCx.lineTo( O5(x), O5(y) );
}
function RoundRect( x, y, w, h, r ) {
    // e.g. does not exist in msft edge 92.0.902.67.
    if (exists(gCx.roundRect)) {
        gCx.roundRect(x, y, w, h, r);
    }
    else {
        gCx.rect(x, y, w, h);
    }
}
function RectXYWH( xywh ) {
    gCx.rect( xywh.x, xywh.y, xywh.width, xywh.height );
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

function AddSparks(props) {
    var {x, y, vx, vy, count, rx, ry, colorSpec} = props;
    for( var i = 0; i < count; i++ )
    {
        var sxf = gR.RandomCentered(0, rx, Math.max(sx(1), rx/10));
        var syf = gR.RandomCentered(0, ry, Math.max(sy(1), rx/10));
        var svx = vx * sxf;
        var svy = vy * syf;
        var s = gSparkPool.Alloc();
        if (exists(s)) {
            s.PlacementInit({ x, y, vx: svx, vy: svy, colorSpec });
            gSparks.A.push(s);
        }
        else {
            console.log("AddSparks: no spark available");
        }
    }
}

function StepSparks(dt) {
    gSparks.B.clear();
    gSparks.A.forEach(s => {
        s.Step( dt );
        s.alive && gSparks.B.push( s );
    } );
    SwapBuffers(gSparks);
}

function StepToasts() {
    if (gToasts.length > 0) {
        var now = Date.now();
        gToasts = gToasts.filter((t) => { return t.end > now; });
        if (gToasts.length > 0) {
            var y = gh(0.1);
            Cxdo(() => {
                gCx.fillStyle = "magenta";
                gToasts.forEach(t => {
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
    gCx.clearRect( 0, 0, gWidth, gHeight );
}

function DrawResizing() {
    Cxdo(() => {
        gCx.fillStyle = RandomColor();
        DrawText( "R E S I Z I N G", "center", gw(0.5), gh(0.3), gSmallestFontSizePt );
        DrawText( "R E S I Z I N G", "center", gw(0.5), gh(0.7), gSmallestFontSizePt );
    });
}

var gDrawTitleLatch = new RandomLatch( 0.005, 250 );
function DrawTitle(flicker=true) {
    Cxdo(() => {
        gCx.fillStyle = flicker ?
            ColorCycle() :
            rgba255s(cyanDarkSpec.regular);
        DrawText( "P N 0 G S T R 0 M", "center", gw(0.5), gh(0.4), gBigFontSizePt, flicker );

        gCx.fillStyle = rgba255s(cyanDarkSpec.regular);
        var msg = "ETERNAL BETA";
        if (flicker && gDrawTitleLatch.MaybeLatch(gGameTime)) { msg = "ETERNAL BUGS"; }
        DrawText( msg, "right", gw(0.876), gh(0.45), gSmallestFontSizePt, flicker );

    });
}

function DrawWarning() {
    gCx.fillStyle = warningColorStr;
    var lineFactor = sy1(15);
    var y0 = gh(1) - gYInset - gWarning.length * lineFactor * 1.4;
    Cxdo(() => {
        gWarning.forEach((t, i) => {
            DrawText(t, "center", gw(0.5), y0 + i*lineFactor, gSmallestFontSizePt, false, "monospace");
        });
    });
}

function DrawLandscape() {
    if (getWindowAspect() <= 1) {
        var rots = ["|", "/", "-", "\\", "|", "/", "-", "\\"];
        var i = ii(gFrameCount/10) % rots.length;
        Cxdo(() => {
            gCx.fillStyle = rgba255s(yellowSpec.strong);
            DrawText(`${rots[i]}${rots[i]}${rots[i]}  r TRY LANDSCAPE r  ${rots[i]}${rots[i]}${rots[i]}`, "center", gw(0.5), gh(0.90), gReducedFontSizePt, false);
        });
    }
}

function DrawBounds( alpha=0.5 ) {
    if (!gDebug) { return; }
    Cxdo(() => {
        // the scaled bounds.
        gCx.beginPath();
        gCx.rect(gXInset, gYInset, gWidth-gXInset*2, gHeight-gYInset*2);
        gCx.lineWidth = 1;
        gCx.strokeStyle = "red";
        gCx.stroke();
    });
    Cxdo(() => {
        // the scaled x.
        gCx.beginPath();
        gCx.moveTo(0, 0);
        gCx.lineTo(gWidth, gHeight);
        gCx.moveTo(gWidth, 0);
        gCx.lineTo(0, gHeight);
        gCx.strokeStyle = rgba255s(white, alpha/3);
        gCx.lineWidth = 10;
        gCx.stroke();
        gCx.strokeRect(5, 5, gWidth-10, gHeight-10);
    });
    Cxdo(() => {
        // the full canvas x.
        gCx.beginPath();
        gCx.moveTo(0, 0);
        gCx.lineTo(gCanvas.width, gCanvas.height);
        gCx.moveTo(gCanvas.width, 0);
        gCx.lineTo(0, gCanvas.height);
        gCx.strokeStyle = rgba255s(greenSpec.regular, alpha);
        gCx.lineWidth = 1;
        gCx.stroke();
        gCx.strokeRect(5, 5, gWidth-10, gHeight-10);
    });
    Cxdo(() => {
        // scaled grid.
        gCx.beginPath();
        gCx.moveTo(0, gh(1/3));
        gCx.lineTo(gw(1), gh(1/3));
        gCx.moveTo(0, gh(1/2));
        gCx.lineTo(gw(1), gh(1/2));
        gCx.moveTo(0, gh(2/3));
        gCx.lineTo(gw(1), gh(2/3));
        gCx.moveTo(gw(0.5), 0);
        gCx.lineTo(gw(0.5), gh(1));
        gCx.strokeStyle = rgba255s(greenSpec.regular, alpha);
        gCx.lineWidth = 1;
        gCx.stroke();
    });
}

function CreateCRTOutlinePath() {
    // beware: this is specifically not in Cxdo().
    // yet another bleedin' empirical safari bug?
    // there is a 1 px black line from top left
    // to bottom right no matter what i do?!
    // so try to keep this on bottom most z order
    // when you call it. sheesh.

    var inset = ii(Math.min(gXInset, gYInset)*0.8);
    gCx.beginPath();
    gCx.moveTo(inset, inset);

    gCx.bezierCurveTo(inset, 0,
                      gw(1)-inset, 0,
                      gw(1)-inset, inset);
    gCx.bezierCurveTo(gw(1), inset,
                      gw(1), gh(1)-inset,
                      gw(1)-inset, gh(1)-inset);
    gCx.bezierCurveTo(gw(1)-inset, gh(1),
                      inset, gh(1),
                      inset, gh(1)-inset);
    gCx.bezierCurveTo(0, gh(1)-inset,
                      0, inset,
                      inset, inset);
}


function DrawCRTOutline() {
    Cxdo(() => {
        CreateCRTOutlinePath();
        gCx.lineWidth = sx1(4);
        gCx.strokeStyle = crtOutlineColorStr;
        gCx.stroke();
    });
}    

function ResetClipping() {
    gCx.clearRect(0, 0, gw(), gh());
    self.CreateCRTOutlinePath();
    gCx.clip();
}

function DrawDebugList() {
    if (gDebug) {
        var dl2 = [];
        Cxdo(() => {
            for (let i = 0; i < gDebug_DrawList.length; ++i) {
                var e = gDebug_DrawList[i];
                e.fn();
                if (exists(e.frames) && e.frames > 0) {
                    dl2.push(e);
                    e.frames--;
                }
            }
        });
        gDebug_DrawList = dl2;
    }
}

function UpdateLocalStorage() {
    // todo: ugly that this only works "because globals".
    // note:
    // (1) this doesn't update the level high score dict
    // since that requires deep-equals testing. so that is
    // left to be done hard-coded elsewhere.
    // (2) this doesn't include the unplayed music, see sound.js
    SaveLocal(LocalStorageKeys.singlePlayer, gSinglePlayer);
    SaveLocal(LocalStorageKeys.gameMode, gGameMode);
    SaveLocal(LocalStorageKeys.sfxMuted, gSfxMuted);
    SaveLocal(LocalStorageKeys.musicMuted, gMusicMuted);
}

// ----------------------------------------

/*class*/ function Lifecycle( handlerMap ) {

    var self = this;

    self.Init = function() {
        self.handlerMap = handlerMap;
        self.state = kRoot;
        self.handler = handlerMap[self.state]();
        self.stop = false;
        self.transitioned = false;
        self.lastGameTime = 0; // to Step() and Draw() at desired fps.
    };

    self.Quit = function() {
        self.stop = true;
    };

    self.RunLoop = function() {
        if (self.stop) {
            return;
        }
        // this got complicated quickly, trying to handle time:
        // a) only stepping if enough time has really passed.
        // b) updating the screen even when paused & thus delta time is 0.
        gGameTime = Date.now();
        var dt = gGameTime - self.lastGameTime;
        if (dt >= kTimeStepThreshold) {
            self.StepFrame(dt);
            self.lastGameTime = gGameTime;
            gFrameCount++;
        }
        requestAnimationFrame( self.RunLoop );
    };

    self.StepFrame = function(dt) {
        Gamepads.poll();
        Assert(exists(self.handler), "RunLoop.handler");
        if (self.transitioned) {
            self.handler = self.handlerMap[self.state]();
            self.transitioned = false;
        }
        var paused = aub(self.handler.GetIsPaused?.(), false);
        var rdt = paused ? 0 : dt;
        var next = self.handler.Step(rdt);
        if (isU(next) || next == self.state) {
            self.handler.Draw();
        }
        else {
            console.log(`transitioned from ${self.state} to ${next}`);
            self.transitioned = true;
            self.state = next;
            cancelPointing();
        }
        self.DrawCRTScanlines();
        DrawDebugList();
        if (gDebug) { DrawBounds(0.3); }
        if (gShowToasts) { StepToasts(); }
        UpdateLocalStorage();
    };

    self.DrawCRTScanlines = function() {
        if (self.state != kRoot && self.state != kWarning) {
            gCx.beginPath();
            Cxdo(() => {
                var height = 2;
                var skip = 10;
                var step = ii(skip/height);
                var start = ii(gFrameCount/4) % skip;
                for (var y = gHeight-start; y >= 0; y -= step) {
                    gCx.rect(0, y, gWidth, height);
                }
            });
            gCx.fillStyle = scanlineColorStr;
            gCx.fill();
        }
    };

    self.Init();
}

/*class*/ function RootState(nextState) {
    var self = this;
    self.Init = function() {
        self.nextState = nextState;
    };
    self.Step = function() { 
        return self.nextState;
    };
    self.Draw = function() {
    };
    self.Init();
}

/*class*/ function WarningState() {
    var self = this;

    self.Init = function() {
        ResetInput();
        LoadAudio(); 
        self.done = false;
    };

    self.Step = function() {
        if (gDebug) { // skip it!
            return kTitle;
        }
        else {
            var nextState;
            gEventQueue.forEach((event, i) => {
                var cmds = {};
                event.updateFn(cmds);
                if (isU(nextState)) {
                    nextState = self.ProcessOneInput(cmds);
                }
            });
            gEventQueue = [];
            return nextState;
        }
    };

    self.ProcessOneInput = function(cmds) {
        var ud = isAnyUpOrDownPressed();
        var ap = isAnyActivatePressed(cmds);
        var apd = isAnyPointerDown();
        if (ud || ap || apd) {
            self.done = true;
        }
        return self.done ? kTitle : undefined;
    };

    self.Draw = function() {
        ClearScreen();
        if (gResizing) {
            DrawResizing();
        }
        else {
            DrawCRTOutline();
            DrawTitle(false);
            DrawWarning();
            DrawLandscape();
            DrawBounds();
        }
    };

    self.Init();
}

/*class*/ function TitleState() {
    var self = this;

    self.Init = function() {
        ResetInput();
        ResetP1Side();
        SetGameMode(gGameMode);

        self.attract = new GameState({ isAttract: true });
        self.timeout = gDebug ? 1 : (1000 * 1.5);
        self.started = gGameTime;
        self.done = false;
        // at one point i guess it felt nicer to not start music immediately?
        self.musicTimer = setTimeout( BeginMusic, 1000 );
        self.theMenu = self.MakeMenu();
        console.log("TitleState", gSinglePlayer, gGameMode);
    };

    self.MakeMenu = function() {
        return new Menu({
            isHidden: false,
            OnClose: () => {
                ResetP1Side();
                // forget any extra in-menu state
                // like which button is default selected.
                self.theMenu = self.MakeMenu();
            },
            ...MakeTitleMenuButtons(),
        });
    };

    self.isLoading = function() {
        return (gGameTime - self.started) <= self.timeout;
    };

    self.Step = function( dt ) {
        var nextState = undefined;
        self.attract.Step( dt );
        self.theMenu.Step(); // note: this doesn't process menu input, actually.
        nextState = self.ProcessAllInput();
        if (exists(nextState)) {
            clearTimeout(self.musicTimer);
            StopAudio(true);
        }
        return nextState;
    };

    self.ProcessAllInput = function() {
        var nextState;
        var hasEvents = gEventQueue.length > 0;
        if (hasEvents) {
            gEventQueue.forEach((event, i) => {
                var cmds = {};
                event.updateFn(cmds);
                if (isU(nextState)) {
                    nextState = self.ProcessOneInput(cmds);
                }
            });
            gEventQueue = [];
        }
        return nextState;
    };

    self.ProcessOneInput = function(cmds) {
        if (cmds.singlePlayer) {
            // match: title_menu.bp1.click
            gSinglePlayer = true;
            SetGameMode(kGameModeRegular);
            return undefined;
        }

        if (cmds.doublePlayer) {
            // match: title_menu.bp2.click
            gSinglePlayer = false;
            SetGameMode(kGameModeZen);
            return undefined;
        }

        if (cmds.nextMusic) {
            BeginMusic();
            return undefined;
        }

        if (self.theMenu.ProcessOneInput(cmds)) {
            return undefined;
        }
        if (isAnyMenuPressed(cmds)) {
            self.theMenu.bMenu.Click();
            clearAnyMenuPressed(); // todo: code smell.
            return undefined;
        }

        if ((!self.isLoading() && !self.theMenu.isOpen()) &&
            (isAnyUpOrDownPressed() ||
             isAnyActivatePressed(cmds) ||
             isAnyPointerDown())) {
            self.done = true;
        }
        var nextState;
        if (self.done) {
            // if it was all only gamepad inputs, there's no "side" set.
            if (isU(gP1Side)) {
                SetP1Side("right");
            }
            nextState = kGetReady;
        }
        return nextState;
    };

    self.Draw = function() {
        ClearScreen();
        if (gResizing) {
            self.started = gGameTime;
            DrawResizing();
        }
        else {
            DrawCRTOutline();
            Cxdo(() => {
                self.attract.Draw();
                DrawTitle();
                gCx.fillStyle = RandomGreen();
                var msg = "CONTROLS: TOUCH / MOUSE / GAMEPAD / W,S / I,K / u,v";
                if (self.isLoading()) {
                    var msg = "LOADING...";
                }
                DrawText( msg, "center", gw(0.5), gh(0.6), gSmallFontSizePt );
            });
            self.theMenu.Draw();
            self.DrawMusicName();
        }
    };

    self.DrawMusicName = function() {
        if (!gMusicMuted) {
            var msg = "fetching music";
            if (exists(gMusicID)) {
                var name = gAudio.id2name[gMusicID];
                var meta = gAudio.name2meta[name];
                if (exists(meta?.basename) && !!(meta?.loaded)) {
                    var msg = meta.basename;
                }
            }
            Cxdo(() => {
                gCx.fillStyle = rgba255s(greySpec.strong, 0.5);
                DrawText(msg.toUpperCase(),
                         "center",
                         gw(0.5),
                         gh(0.94),
                         gSmallestFontSizePt,
                         false);
            });
        }
    };

    self.Init();
}

/*class*/ function GetReadyState() {
    var self = this;

    self.Init = function() {
        ResetInput();
        gStateMuted = false;
        var seconds = gDebug ? 1 : ((gLevelIndex >= 1 && ChoosePillIDs(gLevelIndex).length > 0) ? 5 : 3);
        self.timeout = 1000 * seconds - 1;
        self.lastSec = Math.floor((self.timeout+1)/1000);
        self.pillIDs = ChoosePillIDs(gLevelIndex);
        PlayBlip();
        console.log("GetReadyState", gSinglePlayer, gGameMode);
    };

    self.Step = function( dt ) {
        self.timeout -= dt;
        var sec = Math.floor(self.timeout/1000);
        if (sec < self.lastSec) {
            PlayBlip();
            self.lastSec = sec;
        }
        return self.timeout > 0 ? undefined : kGame;
    };

    self.Draw = function() {
        ClearScreen();
        DrawCRTOutline();
        self.DrawText();
        self.DrawPills();
    };

    self.DrawText = function() {
        var t = Math.ceil(self.timeout/1000);
        var zpt = MakeSplitsCount(gLevelIndex);
        Cxdo(() => {
            // match: GameState.DrawScoreHeader() et. al.
            gCx.fillStyle = RandomGreen(0.3);
            DrawText(ForSide(gP1Side,"P1","P2"), "left", gw(0.2), gh(0.22), gRegularFontSizePt);
            DrawText(ForSide(gP1Side,"P2","P1"), "right", gw(0.8), gh(0.22), gRegularFontSizePt);

            ForGameMode(gSinglePlayer, gGameMode, {
                regular: () => {
                    gCx.fillStyle = RandomForColor(cyanSpec);
                    DrawText(`LEVEL ${gLevelIndex}`, "center", gw(0.5), gh(0.3), gSmallFontSizePt);
                },
                zen: () => {},
            })();

            gCx.fillStyle = RandomGreen();
            var y = (self.pillIDs.length === 0) ? gh(0.55) : gh(0.52);
            DrawText(`GET READY! ${t}`, "center", gw(0.5), y, gBigFontSizePt);

            if (exists(zpt)) {
                gCx.fillStyle = RandomForColor(cyanSpec);
                DrawText(`ZERO POINT ENERGY: ${zpt}`, "center", gw(0.5), gh(0.9), gSmallFontSizePt);
            }
        });
    };

    self.DrawPills = function() {
        // 0 pills on attract and level 1;
        // 2 pills in order for the first N levels;
        // 4 random pills thereafter.
        // all pills in zen mode so/but don't bother showing them here.
        var skip = ForGameMode(gSinglePlayer, gGameMode, {
            regular: false,
            zen: true,
        });
        if (skip) {
            return;
        }

        if (self.pillIDs.length > 0) {
            var ty = gh(0.8);
            Cxdo(() => {
                gCx.fillStyle = RandomGreen();
                if (self.pillIDs.length <= 2) {
                    DrawText("POWERUPS", "center", gw(0.5), ty, gReducedFontSizePt);
                }
                var dx = gw() / (self.pillIDs.length+1);
                var x0 = dx;
                var scale = 1;
                for (let i = 0; i < self.pillIDs.length; ++i) {
                    const pid = self.pillIDs[i];
                    const { name, drawer, wfn, hfn } = gPillInfo[pid];
                    const width = wfn() * scale;
                    const height = hfn() * scale;
                    const x = x0 + dx * i;
                    const oy = Math.sin((x*10) + (gGameTime/150)) * (height/2) * 0.2;
                    drawer(gP1Side, // just the least wrong choice for side.
                           {
                               x: x - (width/2),
                               y: ty - (height/2) - sy(40) - oy,
                               width,
                               height
                           },
                           1);
                    DrawText(name, "center", x, ty, gSmallestFontSizePt);
                }
            });
        }
    };

    self.Init();
}

/*class*/ function GameState(props) {

    var self = this;

    self.Init = function() {
        // the order of everything here matters (everything is fragile).

        // todo: i wish i knew a good way to pull this out, it
        // is making the code in this class kind of a headache.
        // also i don't like if(!self.isAttract) style due to "!"
        // but nor would i like e.g. self.isNormal i feel.
        self.isAttract = aub(props?.isAttract, false);

        gStateMuted = self.isAttract;

        // todo: code smell, this 'reset' business is kind of a big confused mess. :-(
        RecalculateConstants();
        ResetGlobalStorage();
        ResetInput();
        gP1Score = 0;
        gP2Score = 0;

        gMonochrome = self.isAttract; // todo: make gMonochrome local instead?
        gLevelTime = gGameTime;

        self.levelHighScore = self.isAttract ? undefined : gLevelHighScores[gLevelIndex];
        self.pauseButtonEnabled = false;
        self.paused = false;
        self.animations = {};
        self.quit = false;
        self.stepping = false;

        if (!self.isAttract) {
            self.theMenu = self.MakeMenu();
        }

        // I think the ensuing code indicates the Paddle should perhaps
        // at least be split up into human & ai variants. :-\ ...so confused.
        // warning: this setup is easily confusing wrt left vs. right.
        var lp = { x: gXInset, y: gh(0.5) };
        var rp = { x: gWidth-gXInset-gPaddleWidth, y: gh(0.5) };

        // show paddle labels for zen or level 1.
        var p1label = (self.isAttract || gLevelIndex > 1) ? undefined : "P1";
        var p2label = (self.isAttract || gLevelIndex > 1) ? undefined : (gSinglePlayer ? "GPT" : "P2");

        ForSide(gP1Side, 
                () => {
                    // p1 is always a human player.
                    // p2 is either cpu or human.
                    self.paddleP1 = new Paddle({
                        isPlayer: !self.isAttract,
                        side: "left",
                        x: lp.x, y: lp.y,
                        width: gPaddleWidth, height: gPaddleHeight,
                        label: p1label,
                        isSplitter: !self.isAttract,
                        keyStates: gSinglePlayer ? [gP1Keys, gP2Keys] : [gP1Keys],
                        buttonState: gGamepad1Buttons,
                        stickState: gGamepad1Sticks,
                        target: gP1Target,
                    });
                    self.paddleP2 = new Paddle({
                        isPlayer: !self.isAttract && !gSinglePlayer,
                        side: "right",
                        x: rp.x, y: rp.y,
                        width: gPaddleWidth, height: gPaddleHeight,
                        label: p2label,
                        isSplitter: !self.isAttract,
                        isPillSeeker: true,
                        keyStates: gSinglePlayer ? [gPNoneKeys] : [gP2Keys],
                        buttonState: gGamepad2Buttons,
                        stickState: gGamepad2Sticks,
                        target: gP2Target,
                    });
                },
                () => {
                    self.paddleP1 = new Paddle({
                        isPlayer: !self.isAttract,
                        side: "right",
                        x: rp.x, y: rp.y,
                        width: gPaddleWidth, height: gPaddleHeight,
                        label: p1label,
                        isSplitter: !self.isAttract,
                        keyStates: gSinglePlayer ? [gP1Keys, gP2Keys] : [gP1Keys],
                        buttonState: gGamepad1Buttons,
                        stickState: gGamepad1Sticks,
                        target: gP1Target,
                    });
                    self.paddleP2 = new Paddle({
                        isPlayer: !self.isAttract && !gSinglePlayer,
                        side: "left",
                        x: lp.x, y: lp.y,
                        width: gPaddleWidth, height: gPaddleHeight,
                        label: p2label,
                        isSplitter: !self.isAttract,
                        isPillSeeker: true,
                        keyStates: gSinglePlayer ? [gPNoneKeys] : [gP2Keys],
                        buttonState: gGamepad2Buttons,
                        stickState: gGamepad2Sticks,
                        target: gP2Target,
                    });
                }
               )();


        self.MakeLevel();

        self.CreateStartingPuck(self.level.vx0);

        // this countdown is a block on both player & cpu ill spawning.
        // first wait is longer before the very first pill.
        // also see the 'must' check later on.
        self.pillP1SpawnCountdown = PillSpawnCooldownFn();
        self.pillP2SpawnCountdown = PillSpawnCooldownFn();
        // make sure the cpu doesn't get one first, that looks too mean/unfair,
        // however, allow a 2nd player to get one first!
        // also, neither side gets too many pills before the other.
        self.isCpuPillAllowed = !gSinglePlayer;
        self.unfairPillCount = 0;

        if (!self.isAttract) {
            self.AddAnimation(MakeGameStartAnimation());
            PlayStart();
        }
    };

    self.MakeMenu = function() {
        return new Menu({
            isHidden: true,
            OnClose: () => {
                self.paused = false;
                // forget any extra in-menu state
                // like which button is default seleted.
                self.theMenu = self.MakeMenu();
            },
            ...MakeGameMenuButtons({
                OnQuit: () => {
                    self.quit = true;
                }
            })
        });
    };

    self.MakeLevel = function() {
        Assert(exists(self.paddleP1));
        Assert(exists(self.paddleP2));
        if (self.isAttract) {
            self.level = MakeAttract(self.paddleP1, self.paddleP2);
        }
        else if (gGameMode === kGameModeZen || !gSinglePlayer) {
            self.level = MakeZen(self.paddleP1, self.paddleP2);
        }
        else {
            Assert(gLevelIndex > 0);
            self.level = MakeLevel(gLevelIndex, self.paddleP1, self.paddleP2);
        }
        self.maxVX = self.level.maxVX;
        Assert(!isBadNumber(self.maxVX));
        //logOnDelta("maxVX", self.maxVX, 1);
    };

    self.Pause = function() {
        // match: ProcessOneInput().
        self.paused = true;
        if (exists(self.theMenu)) {
            if (!self.theMenu?.isOpen()) {
                self.theMenu?.bMenu.Click(); // sure hope this stays in sync.
                clearAnyMenuPressed(); // todo: code smell.
            }
        }
    };

    self.GetIsPaused = function() {
        return self.paused;
    };

    self.Step = function( dt ) {
        self.theMenu?.Step(); // fyi this doesn't process menu inputs, that is below.
        self.level.Step( dt );
        self.maxVX = self.level.maxVX; // todo: code smell global.
        //logOnDelta("maxVX", self.maxVX, 1);
        self.MaybeSpawnPills( dt );

        self.ProcessAllInput();
        if (self.quit) {
            SaveEndScreenshot(self);
            return ForGameMode(gSinglePlayer, gGameMode, {
                regular: gDebug ? kLevelFin : kGameOver,
                zen: kGameOver,
            });
        }
        if (self.stepping) {
            dt = kTimeStep;
        }

        if (!self.paused || self.stepping) {
            self.paddleP1.Step( dt, self );
            self.paddleP2.Step( dt, self );
            self.StepMoveables( dt );
            self.StepAnimations( dt );
        }

        var nextState = self.StepNextState();
        self.stepping = false;
        return nextState;
    };

    self.AddPillSparks = function(x, y) {
        AddSparks({x,
                   y,
                   count: 50,
                   vx: gR.RandomFloat()*0.8,
                   vy: gR.RandomFloat()*0.8,
                   rx: sx1(10),
                   ry: sy1(10),
                   colorSpec: cyanSpec});
    };

    self.MaybeSpawnPills = function( dt, forced=false ) {
        if (self.level.pills.length == 0) {
            return;
        }

        self.pillP1SpawnCountdown -= dt;
        self.pillP2SpawnCountdown -= dt;
        var kDiffMax = 2;

        if (forced ||
            (isU(self.level.p1Pill) &&
             self.pillP1SpawnCountdown <= 0 &&
             self.unfairPillCount < kDiffMax)) {
            var must = forced || (self.pillP1SpawnCooldown < PillSpawnCooldownFn() * 2);
            self.level.p1Pill = self.MaybeSpawnPill(
                must, dt, self.level.p1Pill, kSpawnPlayerPillFactor, self.level.p1Powerups
            );
            if (exists(self.level.p1Pill)) {
                self.pillP1SpawnCountdown = PillSpawnCooldownFn();
                self.unfairPillCount++;
                self.isCpuPillAllowed = true;
                self.AddPillSparks(self.level.p1Pill.x, self.level.p1Pill.y);
            }
        }

        // sorry this is so much a dupe of the above.
        if (forced ||
            (isU(self.level.p2Pill) &&
             self.pillP2SpawnCountdown <= 0 &&
             self.isCpuPillAllowed &&
             self.unfairPillCount > -kDiffMax)) {
            // bias powerup creation toward the single player.
            const factor = kSpawnPlayerPillFactor * (gSinglePlayer ? 0.7 : 1 );
            var must = forced || (self.pillP2SpawnCooldown < PillSpawnCooldownFn() * 2);
            self.level.p2Pill = self.MaybeSpawnPill(
                must, dt, self.level.p2Pill, factor, self.level.p2Powerups
            );
            if (exists(self.level.p2Pill)) {
                self.pillP2SpawnCountdown = PillSpawnCooldownFn();
                self.unfairPillCount--;
                self.AddPillSparks(self.level.p2Pill.x, self.level.p2Pill.y);
            }
        }

        Assert(Math.abs(self.unfairPillCount) <= kDiffMax, "unfairPillCount");
    };

    self.MaybeSpawnPill = function( must, dt, prev, spawnFactor, maker ) {
        var can_paused = !self.paused;
        var can_attract = !self.isAttract;
        var can_factor = gR.RandomBool(spawnFactor);
        var can_empty = isU(prev);
        if (must || (can_paused && can_attract && can_factor && can_empty)) {
            return maker.MakeRandomPill(self);
        }
        return undefined;
    };

    self.StepNextState = function() {
        if (self.isAttract) {
            if (gPucks.A.length === 0) {
                // attract never ends until dismissed.
                self.CreateStartingPuck(self.level.vx0);
            }
            return undefined;
        }
        else {
            var nextState = self.CheckLevelOver();
            if (exists(nextState)) {
                SaveEndScreenshot(self);
            }
            return nextState;
        }
    };

    self.CheckLevelOver = function() {
        let nextState;
        if (!self.isAttract && gPucks.A.length == 0) {
            nextState = ForGameMode(gSinglePlayer, gGameMode, {
                regular: gSinglePlayer ? (gP1Score < gP2Score ? kGameOver : kLevelFin) : kGameOver,
                zen: kGameOver,
            });
        }
        return nextState;
    };

    self.StepAnimations = function( dt ) {
        Object.entries(self.animations).forEach(([id, anim]) => {
            var done = anim.Step( dt, self );
            if (done) {
                delete self.animations[id];
            }
        });
    };

    self.CreateStartingPuck = function(vx) {
        var x;
        var sign;
        var toLeft = [gw(0.7), -1];
        var toRight = [gw(0.3), 1];
        [x, sign] = ForSide(
            gP1Side,
            toRight,
            toLeft
        );

        var p = gPuckPool.Alloc();
        Assert(exists(p), "CreateStartingPuck");
        console.log("CreateStartingPuck", vx);
        p.PlacementInit({ x,
                          y: (self.isAttract ?
                              gh(gR.RandomRange(0.4, 0.6)) :
                              gh(0.3)),
                          vx: sign * vx,
                          vy: (self.isAttract ?
                               gR.RandomCentered(0, 2, 1) :
                               0.3),
                          ur: true });
        gPucks.A.push(p);
    };

    self.CreateRandomPuck = function() {
        var p = gPuckPool.Alloc();
        if (exists(p)) {
            p.PlacementInit({ x: gw(gR.RandomRange(1/8, 7/8)),
                              y: gh(gR.RandomRange(1/8, 7/8)),
                              vx: gR.RandomRange(self.maxVX*0.3, self.maxVX*0.5),
                              vy: gR.RandomCentered(1, 0.5),
                              ur: true });
            gPucks.A.push(p);
        }
    };

    self.ProcessAllInput = function() {
        // todo: figure out right way to deal with not/clearing inputs.
        if( !self.isAttract ) {
            gEventQueue.forEach((event, i) => {
                var cmds = {};
                event.updateFn(cmds);
                self.ProcessOneInput(cmds);
            });
            gEventQueue = [];
        }
    };

    self.ProcessOneInput = function(cmds) {
        // note: oddly enough, the paddles handle their own input.
        if (cmds.step) {
            if (self.paused) {
                self.stepping = true;
            }
        }
        if (cmds.gameOver) {
            if (self.paused) {
                self.quit = true;
            }
        }
        if (cmds.spawnPill) {
            if (self.paused) {
                // todo: move more of the pill code to the Level.
                self.MaybeSpawnPills(0, true);
            }
        }
        if (cmds.clearHighScore) {
            if (self.paused) {
                gLevelHighScores = {};
                DeleteLocal(LocalStorageKeys.highScores);
                self.levelHighScore = undefined;
            }
        }
        if(cmds.addPuck) {
            if (self.paused) {
                ForCount(50, () => {
                    self.CreateRandomPuck();
                });
            }
        }
        // everything below is about pause state and menu showing oh boy.
        if (self.theMenu?.ProcessOneInput(cmds)) {
            return;
        }
        var pbp = false;
        if (self.pauseButtonEnabled && isAnyPointerDown()) {
            var pxyr = { x: gPauseCenterX,
                         y: gPauseCenterY,
                         r: gPauseRadius*1.5 };
            // match: DrawPauseButton();
            var p1p = isPointInCircle(gP1Target.position, pxyr);
            var p2p = isPointInCircle(gP2Target.position, pxyr);
            if (p1p) { gP1Target.ClearPointer(); }
            if (p2p) { gP2Target.ClearPointer(); }
            pbp = p1p || p2p;
        }
        if (isAnyMenuPressed(cmds) || cmds.pause || pbp) {
            // match: Pause().
            self.paused = !self.paused;
            self.theMenu?.bMenu.Click(); // sure hope this stays in sync.
            clearAnyMenuPressed(); // todo: code smell.
        }
    };

    self.AddAnimation = function( a ) {
        self.animations[gNextID++] = a;
    };

    self.StepMoveables = function( dt ) {
        self.MovePucks( dt );
        StepSparks( dt );
        self.MovePills( dt );
    };

    self.UpdateScore = function(p) {
        var wasLeft = p.x < gw(0.5);
        if (wasLeft) {
            ForSide(gP1Side,
                    () => { gP2Score += kScoreIncrement; },
                    () => { gP1Score += kScoreIncrement; }
                   )();
        }
        else {
            ForSide(gP1Side,
                    () => { gP1Score += kScoreIncrement; },
                    () => { gP2Score += kScoreIncrement; }
                   )();
        }
    };

    self.MovePucks = function( dt ) {
        let pmaxvx = -Number.MAX_SAFE_INTEGER;
        gPucks.B.clear();
        gPucks.A.forEach((p, i) => {
            Assert(exists(p));
            p.Step(dt, self.maxVX, kMaxVY);
            Assert(!isBadNumber(p.x), p);
            Assert(!isBadNumber(p.y), p);
            if (!self.isAttract && !p.alive) {
                self.UpdateScore(p);
            }
            if (p.alive) {
                // xtras, barriers, neos do not split pucks,
                // only the main player & cpu paddles.
                const splits = p.AllPaddlesCollision(
                    [ self.paddleP1, self.paddleP2 ],
                    self.level.IsSuddenDeath(),
                    self.maxVX
                );
                self.level.OnPuckSplits(splits);
                
                // note: splits are pushed before parent, match: Draw()'s revEach() z order.
                if(self.level.isSpawning) {
                    for (let i = 0; i < splits?.length ?? 0; ++i) {
                        const p = gPuckPool.Alloc();
                        if (exists(p)) {
                            p.PlacementInit(splits[i]);
                            gPucks.B.push(p);
                        }
                    }
                }
                p.WallsCollision(self.maxVX);
                p.BarriersCollision(self.paddleP1.barriers.A);
                p.BarriersCollision(self.paddleP2.barriers.A);
                p.XtrasCollision(self.paddleP1.xtras.A);
                p.XtrasCollision(self.paddleP2.xtras.A);
                p.NeoCollision(self.paddleP1.neo);
                p.NeoCollision(self.paddleP2.neo);

                self.paddleP1.OnPuckMoved(p, i);
                self.paddleP2.OnPuckMoved(p, i);

                // splits' pmaxvx will get processed on the next frame.
                pmaxvx = Math.max(Math.abs(p.vx), pmaxvx);
                gPucks.B.metadata.pmaxvx = pmaxvx;

                gPucks.B.push(p);
            }
        });
        SwapBuffers(gPucks);
    };

    self.MovePills = function( dt ) {
        self.MovePlayerPill( dt );
        self.MoveCPUPill( dt );
    };

    self.MovePlayerPill = function( dt ) {
        if (exists(self.level.p1Pill)) {
            self.level.p1Pill = self.level.p1Pill.Step( dt, self );
        }
        if (exists(self.level.p1Pill)) {
            self.level.p1Pill = self.level.p1Pill.AllPaddlesCollision( self, [ self.paddleP1 ] );
        }
    };

    self.MoveCPUPill = function( dt ) {
        if (exists(self.level.p2Pill)) {
            self.level.p2Pill = self.level.p2Pill.Step( dt, self );
        }
        if (exists(self.level.p2Pill)) {
            self.level.p2Pill = self.level.p2Pill.AllPaddlesCollision( self, [ self.paddleP2 ] );
        }
    };

    self.Alpha = function( alpha ) {
        if (alpha == undefined) { alpha = 1; }
        return alpha * (self.isAttract ? 0.2 : 1);
    };

    // note: this really has to be z-under everything.
    // match: level.Draw().
    self.DrawMidLine = function() {
        if (!self.isAttract) {
            // note: this is all a tweaky hacky heuristic mess.
            var dashStep = gh() / (gMidLineDashCount*2);
            var top = ForGameMode(gSinglePlayer, gGameMode, {regular: gYInset*1.5, zen: gYInset}) + dashStep/2;
            var txo = gSmallFontSize;
            var bottom = ForGameMode(gSinglePlayer, gGameMode, {regular: gh() - gYInset*1.05 - txo, zen: gh()-gYInset});
            var range = bottom - top;
            var e = (self.level.EnergyFactor() ?? 0) * range;
            Cxdo(() => {
                gCx.beginPath();
                for( var y = top; y < bottom; y += dashStep*2 ) {
                    var ox = 0;//gR.RandomCentered(0, 0.5);
                    var width = y-top >= (range-e) ? gMidLineDashWidth*2 : gMidLineDashWidth;
                    gCx.rect( gw(0.5)+ ox -(width/2), y, width, dashStep );
                }
                gCx.fillStyle = RandomGreen(0.6);
                gCx.fill();
            });
        }
    };

    self.DrawCRTOutline = function() {
        if (!self.isAttract) {
            DrawCRTOutline();
        }
    };

    // match: GameState.DrawScoreHeader() et. al.
    self.DrawScoreHeader = function( isEndScreenshot ) {
        Cxdo(() => {
            const style = RandomMagenta(self.Alpha(isEndScreenshot ? 1 : 0.4));
            const p2 = (gSinglePlayer ? "GPT: " : "P2: ");
            const hiMsg = (gGameMode === kGameModeZen) ? "HIGH: " : "LVL HI: ";
            ForSide(self.isAttract ? "right" : gP1Side, 
                () => {
                    gCx.fillStyle = style;
                    if (exists(self.levelHighScore)) {
                        DrawText(hiMsg + self.levelHighScore, "left", gw(0.2), gh(0.12), gSmallerFontSizePt);
                    }
                    if (!self.isAttract) {
                        DrawText( p2 + gP2Score, "right", gw(0.8), gh(0.22), gRegularFontSizePt );
                        DrawText( "P1: " + gP1Score, "left", gw(0.2), gh(0.22), gRegularFontSizePt );
                    }
                },
                () => {
                    gCx.fillStyle = style;
                    if (exists(self.levelHighScore)) {
                        DrawText(hiMsg + self.levelHighScore, "right", gw(0.8), gh(0.12), gSmallerFontSizePt);
                    }
                    if (!self.isAttract) {
                        DrawText( p2 + gP2Score, "left", gw(0.2), gh(0.22), gRegularFontSizePt );
                        DrawText( "P1: " + gP1Score, "right", gw(0.8), gh(0.22), gRegularFontSizePt );
                    }
                }
            )();
        });
    };

    self.DrawMoveTarget = function(target) {
        // bug: yet another safari ios/ipados bug? the clipping doesn't
        // actually correctly work and so the butt end of the pointer
        // shows through a pixel or two, all very strange. so at least
        // making this pointer color == crt outline color to be less obvi.
        var side = target.side;
        var moveTargetY = target.position?.y;
        if (exists(side) && exists(moveTargetY) && !self.isAttract) {
            var xsize = syi(12);
            var ysize = syi(7);
            var xoff = xyNudge(moveTargetY, ysize, 12, gP1Side);
            ForSide(side,
                () => {
                    var left = xoff;
                    var right = left + xsize;
                    var y = WY(moveTargetY);
                    Cxdo(() => {
                        gCx.beginPath();
                        gCx.moveTo( left, y-ysize );
                        gCx.lineTo( left, y+ysize );
                        gCx.lineTo( right, y );
                        gCx.fillStyle = crtOutlineColorStr;
                        gCx.fill();
                    });
                },
                () => {
                    var right = gw()+xoff;
                    var left = right - xsize;
                    var y = WY(moveTargetY);
                    Cxdo(() => {
                        gCx.beginPath();
                        gCx.moveTo( right, y-ysize );
                        gCx.lineTo( right, y+ysize );
                        gCx.lineTo( left, y );
                        gCx.fillStyle = crtOutlineColorStr;
                        gCx.fill();
                    });
                }
            )();
        }
    };

    self.DrawPauseButton = function() {
        if (!self.isAttract && isAnyPointerEnabled()) {
            self.pauseButtonEnabled = true;
            var cx = gPauseCenterX;
            var cy = gPauseCenterY;
            Cxdo(() => {
                gCx.fillStyle = gCx.strokeStyle = RandomForColor(greySpec, 0.3);
                DrawText("ESC", "center", cx, cy + gSmallestFontSize*0.4, gSmallestFontSizePt);
                gCx.beginPath();
                gCx.roundRect(cx-gPauseRadius, cy-gPauseRadius,
                              gPauseRadius*2, gPauseRadius*2,
                              8);
                gCx.lineWidth = sx1(1.5);
                gCx.stroke();
                if (gDebug) {
                    gCx.fillStyle = "red";
                    // match: ProcessOneInput();
                    gCx.strokeRect(cx - gPauseRadius * 1.5,
                                   cy - gPauseRadius * 1.5,
                                   gPauseRadius * 3,
                                   gPauseRadius * 3);
                }
            });
        }
    };

    self.DrawAnimations = function() {
        Object.values(self.animations).forEach(a => a.Draw(self));
    };

    self.Draw = function(props) {
        if (!self.isAttract) { ClearScreen(); }
        if (!gResizing) {
            // painter's z order algorithm here below, keep important things last.

            self.DrawCRTOutline();

            const isEndScreenshot = !!props?.isEndScreenshot;

            if (!isEndScreenshot) { self.DrawMidLine(); }
            self.DrawScoreHeader( isEndScreenshot );
            self.level.Draw({ alpha: self.Alpha(), isEndScreenshot });

            // draw paddles under pucks, at least so i can visually debug collisions.
            const s01 = exists(self.level.splitsRemaining) ?
                  T01(self.level.splitsRemaining, self.level.splitsMax) :
                  undefined;
            self.paddleP1.Draw( self.Alpha(), self, s01, isEndScreenshot );
            self.paddleP2.Draw( self.Alpha(), self, s01, isEndScreenshot );

            // match: pucks revEach so splits show up on top, z order.
            // pucks going away from (single) player.
            gPucks.A.revEach(p => {
                if (Sign(p.vx) == ForSide(gP1Side, 1, -1)) {
                    Assert(exists(p));
                    p.Draw( self.Alpha() );
                }
            });
            // pucks attacking the (single) player on top.
            gPucks.A.revEach(p => {
                if (Sign(p.vx) == ForSide(gP1Side, -1, 1)) {
                    p.Draw( self.Alpha() );
                }
            });

            if (!isEndScreenshot) {
                gSparks.A.forEach(s => {
                    s.Draw( self.Alpha() );
                });
            }

            if (!isEndScreenshot) {
                self.DrawMoveTarget(gP1Target);
                if (!gSinglePlayer) {
                    self.DrawMoveTarget(gP2Target);
                }
            }

            if (!isEndScreenshot) {
                self.DrawAnimations(); // late/high z order so the animations can clear the screen if desired.
            }

            if (!isEndScreenshot) {
                self.theMenu?.Draw();
                self.DrawPauseButton();
            }
        }
        self.DrawDebug();
    };

    // call this last so it is the top z layer.
    self.DrawDebug = function() {
        if( ! gDebug ) { return; }
        self.paddleP1.DrawDebug();
        self.paddleP2.DrawDebug();
        gP1Target.DrawDebug();
        gP2Target.DrawDebug();
        Cxdo(() => {
            gCx.fillStyle = "magenta";
            DrawText(`${self.unfairPillCount} ${self.pillP1SpawnCountdown} ${self.pillP2SpawnCountdown}`, "left", gw(0.2), gh(0.4), gSmallestFontSizePt);

            gCx.fillStyle = RandomGrey();
            var mvx = gPucks.A.reduce((m,p) => { return p.alive ? Math.max(m, Math.abs(p.vx)) : m; }, 0);
            DrawText(F(mvx.toString()), "left", gw(0.1), gh(0.1), gSmallFontSizePt);
            gCx.fillStyle = "red";
            DrawText(F(self.maxVX.toString()), "left", gw(0.1), gh(0.1)+gSmallFontSize, gSmallFontSizePt);

            gCx.fillStyle = RandomBlue(0.5);
            DrawText( gPucks.A.length, "center", gw(0.6), gh(0.9), gRegularFontSizePt );
            DrawText( gFrameCount.toString(), "right", gw(0.9), gh(0.9), gSmallFontSizePt );

            gCx.fillStyle = RandomForColor(blueSpec, 0.3);
            DrawText( "D E B U G", "center", gw(0.5), gh(0.8), gBigFontSizePt );
        });
    };

    self.Init();
}

/*class*/ function LevelFinState() {
    var self = this;

    self.Init = function() {
        ResetInput();
        self.levelIndex = gLevelIndex;
        self.timeout = 1000 * 2;
        self.started = gGameTime;
        self.highScore = gLevelHighScores[gLevelIndex];
        self.isNewHighScore = false;
        if (gSinglePlayer) {
            if (isU(self.highScore) || gP1Score > self.highScore) {
                self.highScore = gP1Score;
                self.isNewHighScore = true;
            }
        }
        else {
            const maxScore = Math.max(gP1Score, gP2Score);
            if (isU(self.highScore) || maxScore > self.highScore) {
                self.highScore = maxScore;
                self.isNewHighScore = true;
            }
        }
        Assert(!isBadNumber(self.highScore));
        self.hiMsg = self.isNewHighScore ? `NEW LEVEL HIGH: ${self.highScore}` : undefined;

        self.goOn = false;
        PlayGameOver();

        if (self.isNewHighScore) {
            gLevelHighScores[gLevelIndex] = self.highScore;
            SaveLocal(LocalStorageKeys.highScores, gLevelHighScores, true);
        }
    };

    self.Step = function() {
        self.goOn = gGameTime - self.started > self.timeout;
        var nextState;
        gEventQueue.forEach((event, i) => {
            var cmds = {};
            event.updateFn(cmds);
            if (isU(nextState)) {
                nextState = self.ProcessOneInput(cmds);
            }
        });
        gEventQueue = [];
        return nextState;
    };

    self.ProcessOneInput = function(cmds) {
        if (self.goOn) {
            var ud = isAnyUpOrDownPressed();
            var ap = isAnyActivatePressed(cmds);
            var apd = isAnyPointerDown();
            if (ud || ap || apd) {
                gLevelIndex += 1;
                if (gSinglePlayer) {
                    return kGetReady;
                }
                else {
                    return kGameOverSummary;
                }
            }
        }
        return undefined;
    };

    self.Draw = function() {
        gSinglePlayer ? self.DrawSinglePlayer() : self.DrawTwoPlayer();
        self.DrawLevelHighScore();
    };

    self.DrawLevelHighScore = function() {
        if (self.hiMsg) {
            Cxdo(() => {
                gCx.fillStyle = RandomMagenta();
                DrawText(self.hiMsg, "center", gw(0.5), gh(0.68), gSmallFontSizePt);
            });
        }
    };

    self.DrawSinglePlayer = function() {
        Cxdo(() => {
            ClearScreen();
            gCx.drawImage(gCanvas2, 0, 0);
            gCx.fillStyle = RandomGreen(); // todo: ColorCycle()
            DrawText(
                `LEVEL ${self.levelIndex} WON!`,
                "center",
                gw(0.5),
                gh(0.55),
                gBigFontSizePt,
            );

            if (self.goOn) {
                gCx.fillStyle = RandomYellowSolid();
                DrawText(
                    "NEXT",
                    "center",
                    gw(0.5),
                    gh(0.8),
                    gRegularFontSizePt
                );
            }
        });
    };

    self.DrawTwoPlayer = function() {
        Cxdo(() => {
            ClearScreen();
            gCx.globalAlpha = 0.5;
            gCx.drawImage(gCanvas2, 0, 0);
            gCx.globalAlpha = 1;
            gCx.fillStyle = RandomForColor(greenSpec);
            let msg = "TIE!";
            if (gP1Score != gP2Score) {
                if (gP1Score > gP2Score) {
                    msg = "PLAYER 1 WINS!";
                } else {
                    msg = "PLAYER 2 WINS!";
                }
            }
            DrawText(
                msg,
                "center",
                gw(0.5), gh(0.5),
                gBigFontSizePt,
            );
            if (self.goOn) {
                gCx.fillStyle = RandomForColor(yellowSpec);
                DrawText(
                    "NEXT",
                    "center",
                    gw(0.5),
                    gh(0.8),
                    gRegularFontSizePt
                );
            }
        });
    };

    self.Init();
}

/*class*/ function GameOverState() {
    var self = this;

    self.Init = function() {
        ResetInput();
        self.timeout = 1000 * 2;
        self.started = gGameTime;
        self.goOn = false;
        PlayGameOver();
    };

    self.Step = function() {
        self.goOn = gGameTime - self.started > self.timeout;
        var nextState;
        gEventQueue.forEach((event, i) => {
            var cmds = {};
            event.updateFn(cmds);
            if (isU(nextState)) {
                nextState = self.ProcessOneInput(cmds);
            }
        });
        gEventQueue = [];
        return nextState;
    };

    self.ProcessOneInput = function(cmds) {
        if (self.goOn) {
            var ud = isAnyUpOrDownPressed();
            var ap = isAnyActivatePressed(cmds);
            var apd = isAnyPointerDown();
            if (ud || ap || apd) {
                // note: this next state might immediately terminate itself.
                return kGameOverSummary;
            }
        }
        return undefined;
    };

    self.Draw = function() {
        Cxdo(() => {
            ClearScreen();
            gCx.drawImage(gCanvas2, 0, 0);
            gCx.fillStyle = RandomForColor(redSpec);
            DrawText(
                "GAME OVER",
                "center",
                gw(0.5),
                gh(0.55),
                gBigFontSizePt,
            );
            if (self.goOn) {
                gCx.fillStyle = RandomForColor(yellowSpec);
                DrawText(
                    "NEXT",
                    "center",
                    gw(0.5),
                    gh(0.8),
                    gRegularFontSizePt
                );
            }
        });
    };

    self.Init();
}

/*class*/ function GameOverSummaryState() {
    var self = this;

    // todo: support game high score.
    self.Init = function() {
        ResetInput();
        self.timeoutMsg = 2000;
        self.timeoutEnd = 1000 * 10;
        self.started = gGameTime;
    };

    self.Step = function( dt ) {
        var nextState;
        self.goOn = (gGameTime - self.started) > self.timeoutMsg;
        nextState = self.ProcessAllInput();
        return nextState;
    };

    self.ProcessAllInput = function() {
        var nextState;
        var hasEvents = gEventQueue.length > 0;
        if (hasEvents) {
            gEventQueue.forEach((event, i) => {
                var cmds = {};
                event.updateFn(cmds);
                if (isU(nextState)) {
                    nextState = self.ProcessOneInput(cmds);
                }
            });
            gEventQueue = [];
        }
        if (exists(nextState)) { PlayBlip(); }
        return nextState;
    };

    self.ProcessOneInput = function(cmds) {
        var nextState;
        // note: whatever the non-undefined nextState is, it must ResetP1Side() and gP{1,2}Pointer.Reset().
        if (self.goOn &&
            (isAnyUpOrDownPressed() ||
             isAnyActivatePressed(cmds) ||
             isAnyPointerDown())) {
            nextState = kTitle;
        }
        else if (isU(nextState) && (gGameTime - self.started) > self.timeoutMsg+self.timeoutEnd) {
            nextState = kTitle;
        }
        return nextState;
    };
    
    self.Draw = function() {
        gSinglePlayer ? self.DrawSinglePlayer() : self.DrawTwoPlayer();
        self.DrawGoOn();
    };

    self.DrawGoOn = function() {
        if (self.goOn) {
            gCx.fillStyle = RandomForColor(yellowSpec);
            DrawText( "RETURN", "center", gw(0.5), gh(0.8), gRegularFontSizePt );
        }
    };        

    self.DrawSinglePlayer = function() {
        ClearScreen();
        var finalScore = gP1Score - gP2Score;
        var x = gw(0.5);
        var y = gh(0.5) - 20;
        Cxdo(() => {
            gCx.fillStyle = RandomForColor(magentaSpec);
            var msg = `FINAL SCORE: ${gP1Score} - ${gP2Score} = ${finalScore}`;
            DrawText( msg, "center", x, y, gRegularFontSizePt );
        });
    };

    self.DrawTwoPlayer = function() {
        Cxdo(() => {
            ClearScreen();

            // match: GameState.DrawScoreHeader() et. al.
            gCx.fillStyle = RandomGreen(0.3);
            var p1a = ForSide(gP1Side, "left", "right");
            var p1x = ForSide(gP1Side, gw(0.2), gw(0.8));
            DrawText( "P1: " + gP1Score, p1a, p1x, gh(0.22), gRegularFontSizePt );
            var p2a = ForSide(gP2Side, "left", "right");
            var p2x = ForSide(gP2Side, gw(0.2), gw(0.8));
            DrawText( "P2: " + gP2Score, p2a, p2x, gh(0.22), gRegularFontSizePt );

            gCx.fillStyle = RandomBlue();
            DrawText(
                "*** WINNER ***",
                "center",
                gw(0.5), gh(0.4),
                gReducedFontSizePt
            );

            gCx.fillStyle = ColorCycle();
            DrawText(
                // leading space to visually center player 1.
                gP1Score === gP2Score ? "TIE!" :
                    (gP1Score > gP2Score ? " PLAYER 1" : "PLAYER 2"),
                "center",
                gw(0.5), gh(0.6),
                gBigFontSizePt
            );
        });
    };

    self.Init();
}

/*class*/ function DebugState() {
    var self = this;
    self.Init = function() {
    };
    self.Step = function() {
    };
    self.Draw = function() {
        ClearScreen();
        Cxdo(() => {
            gCx.fillStyle = RandomForColor(blueSpec, 0.3);
            DrawText( "D E B U G", "center", gw(0.5), gh(0.8), gBigFontSizePt );
        });
    };
    self.Init();
}

// ----------------------------------------

function Gamepad1StickMove(e) {
    JoystickMove(gGamepad1, e, gGamepad1Sticks, gP1Target);
}
function Gamepad2StickMove(e) {
    JoystickMove(gGamepad2, e, gGamepad2Sticks, gP2Target);
}
function JoystickMove(gamepad, e, state, pointer) {
    var v = e.verticalValue;
    if (Math.abs(v) < state.$.dz) {
        gEventQueue.push({
            event_type: kEventGamepadJoystickMove,
            updateFn: () => {
                state.Reset();
                state.Update({ dz: kJoystickDeadZone });
                pointer.ClearY();
            }
        });
    }
    else if (v < 0 && !state.$.up) {
        gEventQueue.push({
            event_type: kEventGamepadJoystickMove,
            updateFn: () => {
                state.Set({
                    up: true,
                    down: false,
                    dz: kJoystickDeadZone/2
                });
                pointer.ClearY();
            }
        });
    }
    else if (v > 0 && !state.$.down) {
        gEventQueue.push({
            event_type: kEventGamepadJoystickMove,
            updateFn: () => {
                state.Set({
                    up: false,
                    down: true,
                    dz: kJoystickDeadZone/2
                });
                pointer.ClearY();
            }
        });
    }
}

function isButtonPressed(gamepad, bid) {
    return gamepad.buttons[bid].pressed;
}

function Gamepad1ButtonChange(e) {
    GamepadButtonChange(e.gamepad.gamepad, gGamepad1Buttons);
}
function Gamepad2ButtonChange(e) {
    GamepadButtonChange(e.gamepad.gamepad, gGamepad2Buttons);
}
function GamepadButtonChange(gamepad, state) {
    // dpad buttons up & down move player paddle and menu focus.
    if (isButtonPressed(gamepad, StandardMapping.Button.D_PAD_UP)) {
        gEventQueue.push({
            type: kEventGamepadButtonPressed,
            updateFn: () => {
                state.Update({ up: true });
            },
        });
        return;
    } else { // this flooding is sad but otherwise we have a race condtition.
        gEventQueue.push({
            type: kEventGamepadButtonReleased,
            updateFn: () => {
                state.Update({ up: false });
            },
        });
    }

    if (isButtonPressed(gamepad, StandardMapping.Button.D_PAD_BOTTOM)) {
        gEventQueue.push({
            type: kEventGamepadButtonPressed,
            updateFn: () => {
                state.Update({ down: true });
            }
        });
        return;
    } else { // this flooding is sad but otherwise we have a race condtition.
        gEventQueue.push({
            type: kEventGamepadButtonReleased,
            updateFn: () => {
                state.Update({ down: false });
            }
        });
    }

    // do nothing for dpad left & right.
    if (isButtonPressed(gamepad, StandardMapping.Button.D_PAD_LEFT)) {
        return;
    }
    if (isButtonPressed(gamepad, StandardMapping.Button.D_PAD_RIGHT)) {
        return;
    }

    // buttons 8, 9, 16 are "center cluster" per
    // https://www.w3.org/TR/gamepad/#remapping
    // which are to be "menu".
    if (isButtonPressed(gamepad, 8) ||
        isButtonPressed(gamepad, 9) ||
        isButtonPressed(gamepad, 16) ) {
        gEventQueue.push({
            type: kEventGamepadButtonPressed,
            updateFn: () => {
                state.Update({ menu: true });
            },
        });
        return;
    }
    else { // this flooding is sad but otherwise we have a race condtition.
        gEventQueue.push({
            type: kEventGamepadButtonReleased,
            updateFn: () => {
                state.Update({ menu: false });
            },
        });
    }

    // buttons 0, 1, 2, 3 are the "right cluster"
    // which are to be "activate".
    if (isButtonPressed(gamepad, 0) ||
        isButtonPressed(gamepad, 1) ||
        isButtonPressed(gamepad, 2) ||
        isButtonPressed(gamepad, 3) ) {
        gEventQueue.push({
            type: kEventGamepadButtonPressed,
            updateFn: () => {
                state.Update({ activate: true });
            },
        });
        return;
    }
    else { // this flooding is sad but otherwise we have a race condtition.
        gEventQueue.push({
            type: kEventGamepadButtonReleased,
            updateFn: () => {
                state.Update({ activate: false });
            },
        });
    }
}

function RegisterGamepad(e) {
    if (gGamepad1 == undefined) {
        gGamepad1 = e.gamepad.gamepad;
        e.gamepad.addEventListener('joystickmove', Gamepad1StickMove, StandardMapping.Axis.JOYSTICK_LEFT);
        e.gamepad.addEventListener('joystickmove', Gamepad1StickMove, StandardMapping.Axis.JOYSTICK_RIGHT);
        e.gamepad.addEventListener('buttonpress', Gamepad1ButtonChange);
        e.gamepad.addEventListener('buttonrelease', Gamepad1ButtonChange);
    }
    else if (gGamepad2 == undefined) {
        gGamepad2 = e.gamepad.gamepad;
        e.gamepad.addEventListener('joystickmove', Gamepad2StickMove, StandardMapping.Axis.JOYSTICK_LEFT);
        e.gamepad.addEventListener('joystickmove', Gamepad2StickMove, StandardMapping.Axis.JOYSTICK_RIGHT);
        e.gamepad.addEventListener('buttonpress', Gamepad2ButtonChange);
        e.gamepad.addEventListener('buttonrelease', Gamepad2ButtonChange);
    }
}

function RemoveGamepad(e) {
    if (e.gamepad.gamepad == gGamepad1) {
        e.gamepad.removeEventListener('buttonvaluechange', Gamepad1ButtonChange);
        e.gamepad.removeEventListener('joystickmove', Gamepad1StickMove, StandardMapping.Axis.JOYSTICK_RIGHT);
        e.gamepad.removeEventListener('joystickmove', Gamepad1StickMove, StandardMapping.Axis.JOYSTICK_LEFT);
        gGamepad1 = undefined;
    }
    else if (e.gamepad.gamepad == gGamepad2) {
        e.gamepad.removeEventListener('buttonvaluechange', Gamepad2ButtonChange);
        e.gamepad.removeEventListener('joystickmove', Gamepad2StickMove, StandardMapping.Axis.JOYSTICK_RIGHT);
        e.gamepad.removeEventListener('joystickmove', Gamepad2StickMove, StandardMapping.Axis.JOYSTICK_LEFT);
        gGamepad2 = undefined;
    }
}

// ----------------------------------------

function PointerProcess(e, updateFn) {
    var cvrect = gCanvas.getBoundingClientRect();
    var cvx = cvrect.x + window.scrollX;
    var cvy = cvrect.y + window.scrollY;
    // "regular" non-game-transformed screen pixel coordinates.
    // todo: handle window.devicePixelRatio.
    var x = (e.clientX - cvx);
    var y = (e.clientY - cvy);
    Assert(exists(updateFn), "PointerProcess");
    updateFn(x, y);
}

function MouseDown(e) {
    e.preventDefault();
    if (e.button === 0) {
        PointerProcess(
            e,
            (x, y) => {
                SetP1Side(x < gw(0.5) ? "left" : "right");
                gEventQueue.push({
                    type: kEventPointerDown,
                    updateFn: () => {
                        gP1Target.OnDown(kMousePointerId, x, y);
                        gP2Target.OnDown(kMousePointerId, x, y);
                    }
                });
            }
        );
    }
}

function MouseMove(e) {
    e.preventDefault();
    PointerProcess(
        e,
        (x, y) => {
            gEventQueue.push({
                type: kEventPointerMove,
                updateFn: () => {
                    gP1Target.OnMove(kMousePointerId, x, y);
                    gP2Target.OnMove(kMousePointerId, x, y);
                }
            });
        }
    );

}

function MouseUp(e) {
    e.preventDefault();
    if (e.button === 0) {
        PointerProcess(
            e,
            (x, y) => {
                gEventQueue.push({
                    type: kEventPointerUp,
                    updateFn: () => {
                        gP1Target.OnUp(kMousePointerId);
                        gP2Target.OnUp(kMousePointerId);
                    }
                });
            }
        );
    }
}

function TouchStart(e) {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; ++i) {
        const t = e.touches[i];
        const pid = t.identifier;
        PointerProcess(
            t,
            (x, y) => {
                SetP1Side(x < gw(0.5) ? "left" : "right");
                gEventQueue.push({
                    type: kEventPointerDown,
                    updateFn: () => {
                        gP1Target.OnDown(pid, x, y);
                        gP2Target.OnDown(pid, x, y);
                    }
                });
            }
        );
    }
}

function TouchMove(e) {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; ++i) {
        const t = e.touches[i];
        const pid = t.identifier;
        PointerProcess(
            t,
            (x, y) => {
                gEventQueue.push({
                    type: kEventPointerMove,
                    updateFn: () => {
                        gP1Target.OnMove(pid, x, y);
                        gP2Target.OnMove(pid, x, y);
                    }
                });
            }
        );
    }
}

function TouchEnd(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; ++i) {
        const t = e.changedTouches[i];
        const pid = t.identifier;
        PointerProcess(
            e,
            (x, y) => {
                gEventQueue.push({
                    type: kEventPointerUp,
                    updateFn: () => {
                        gP1Target.OnUp(pid);
                        gP2Target.OnUp(pid);
                    }
                });
            }
        );
    }
}

function ResetGlobalStorage() {
    gPuckPool = new Pool(
        kPuckPoolSize,
        () => new Puck()
    );
    gPucks = {
        A: new ReuseArray(kPuckPoolSize),
        B: new ReuseArray(kPuckPoolSize)
    };

    gSparkPool = new Pool(
        kSparkPoolSize,
        () => new Spark()
    );
    gSparks = {
        A: new ReuseArray(kSparkPoolSize),
        B: new ReuseArray(kSparkPoolSize)
    };
}

function OnOrientationChange() {
    OnResize();
}

// (the web is a pi(l)e of feces.)
var gResizing = false;
var gLastArea = 0;
var gMatchedAreaCount = 0;
var kMatchedAreaRequirement = 10;
var kResizeAllowedStates = [kDebug, kRoot, kWarning, kTitle];
function OnResize() {
    if (exists(gLifecycle)) {
        if (gLifecycle.state == kGame) {
            if (exists(gLifecycle.handler)) {
                gLifecycle.handler.Pause();
            }
        }
        else if (!gResizing && kResizeAllowedStates.includes(gLifecycle.state)) {
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
    gCanvas = document.getElementById( kCanvasName );
    gCx = gCanvas.getContext('2d');
    gCx.MoveTo = MoveTo;
    gCx.LineTo = LineTo;
    gCx.RoundRect = RoundRect;
    gCx.RectXYWH = RectXYWH;
    DoResize();
    RecalculateConstants();

    gCanvas2 = document.createElement('canvas');
    gCanvas2.width = gCanvas.width;
    gCanvas2.height = gCanvas.height;
    gCx2 = gCanvas2.getContext('2d');

    ResetClipping();

    var handlerMap = {};
    handlerMap[kRoot] = () => new RootState(kWarning);
    handlerMap[kWarning] = () => new WarningState();
    handlerMap[kTitle] = () => new TitleState();
    handlerMap[kGetReady] = () => new GetReadyState();
    handlerMap[kGame] = () => new GameState();
    handlerMap[kLevelFin] = () => new LevelFinState();
    handlerMap[kGameOver] = () => new GameOverState();
    handlerMap[kGameOverSummary] = () => new GameOverSummaryState();
    if (exists(gLifecycle)) { gLifecycle.Quit(); }
    gLifecycle = new Lifecycle( handlerMap );
    gLifecycle.RunLoop();

    StopAudio();
}

// er, i'm lazy and never un-register so be sure this only gets called once.
var initEventsRun = false;
function InitEvents() {
    Assert(!initEventsRun, "initEventsRun");
    initEventsRun = true;
    
    Gamepads.addEventListener('connect', RegisterGamepad);
    Gamepads.addEventListener('disconnect', RemoveGamepad);

    // fyi: the generic Pointer api has empirically very broken ux in many browsers if you ask me.
    window.addEventListener('mousedown', MouseDown);
    window.addEventListener('mousemove', MouseMove);
    window.addEventListener('mouseup', MouseUp);
    window.addEventListener('touchstart', TouchStart);
    window.addEventListener('touchmove', TouchMove);
    window.addEventListener('touchend', TouchEnd);
    window.addEventListener('touchcancel', TouchEnd);

    // trying to stop accidental gameplay-breaking swipe/scrolling by fingers. :-\
    document.addEventListener('pointerstart', (e) => {e.preventDefault();});
    document.addEventListener('pointermove', (e) => {e.preventDefault();});
    document.addEventListener('pointerend', (e) => {e.preventDefault();});
    document.addEventListener('pointercancel', (e) => {e.preventDefault();});

    window.addEventListener('keydown', (e) => {
        if (e.repeat) { return; }

        // my bad. keyCodes do not respect e.g. QWERTZ vs. QWERTY, they assume QWERTY.
        // that sort of works for WASD pattern, but maybe not for all debug commands.

        // assumes w/s is on the left hand side of keyboard,
        // arrow up/down are on the right hand side.

        if( e.keyCode == 13 || e.keyCode == 32 ) { // enter, ' '
            e.preventDefault();
            gEventQueue.push({
                type: kEventKeyDown,
                updateFn: (cmds) => {
                    cmds.activate = true;
                }
            });
        }

        if( e.keyCode == 87 ) { // 'w'
            e.preventDefault();
            gEventQueue.push({
                type: kEventKeyDown,
                updateFn: () => {
                    gP1Target.ClearY();
                    SetP1Side("left");
                    LeftKeys().Update({ up: true });
                }
            });
        }

        if( e.keyCode == 83 ) { // s
            e.preventDefault();
            gEventQueue.push({
                type: kEventKeyDown,
                updateFn: () => {
                    gP1Target.ClearY();
                    SetP1Side("left");
                    LeftKeys().Update({ down: true });
                }
            });
        }

        if( e.keyCode == 38 || e.keyCode == 73 ) { // arrow up, i
            e.preventDefault();
            gEventQueue.push({
                type: kEventKeyDown,
                updateFn: () => {
                    gP2Target.ClearY();
                    SetP1Side("right");
                    RightKeys().Update({ up: true });
                }
            });
        }

        if( e.keyCode == 40 || e.keyCode == 75 ) { // arrow down, k
            e.preventDefault();
            gEventQueue.push({
                type: kEventKeyDown,
                updateFn: () => {
                    gP2Target.ClearY();
                    SetP1Side("right");
                    RightKeys().Update({ down: true });
                }
            });
        }

        if( e.keyCode == 27 ) { // esc
            gEventQueue.push({
                type: kEventKeyDown,
                updateFn: (cmds) => {
                    cmds.menu = true;
                }
            });
        }
        if( e.keyCode == 80 || e.keyCode == 19 ) { // 'p', 'pause'
            gEventQueue.push({
                type: kEventKeyDown,
                updateFn: (cmds) => {
                    cmds.pause = true;
                }
            });
        }

        if( e.keyCode == 49 ) { // '1'
            gEventQueue.push({
                type: kEventKeyDown,
                updateFn: (cmds) => {
                    cmds.singlePlayer = true;
                }
            });
        }

        if( e.keyCode == 50 ) { // '2'
            gEventQueue.push({
                type: kEventKeyDown,
                updateFn: (cmds) => {
                    cmds.doublePlayer = true;
                }
            });
        }

        if( e.keyCode == 187 || e.keyCode == 61 ) { // '+' and '=', vs. firefox (?!)
            gEventQueue.push({
                type: kEventKeyDown,
                updateFn: (cmds) => {
                    if (gDebug) { cmds.addPuck = true; }
                }
            });
        }

        if( e.keyCode == 78 ) { // 'n'
            gEventQueue.push({
                type: kEventKeyDown,
                updateFn: (cmds) => {
                    if (gDebug) { cmds.step = true; }
                }
            });
        }

        if( e.keyCode == 81 ) { // 'q'
            gEventQueue.push({
                type: kEventKeyDown,
                updateFn: (cmds) => {
                    if (gDebug) { cmds.gameOver = true; }
                }
            });
        }

        if( e.keyCode == 66 ) { // 'b'
            gEventQueue.push({
                type: kEventKeyDown,
                updateFn: (cmds) => {
                    if (gDebug) { cmds.spawnPill = true; }
                }
            });
        }

        if( e.keyCode == 69 ) { // 'e'
            gEventQueue.push({
                type: kEventKeyDown,
                updateFn: (cmds) => {
                    if (gDebug) { cmds.nextMusic = true; }
                }
            });
        }

        if (e.keyCode == 46) { // delete
            gEventQueue.push({
                type: kEventKeyDown,
                updateFn: (cmds) => {
                    cmds.clearHighScore = true;
                }
            });
        }
    });

    // todo: fix which things should/not support continuous pressing
    // ie everything should clear the keydown as soon as the keyup is
    // consumed, the only exception being the game state for up/down.
    window.addEventListener('keyup', (e) => {
        if( e.keyCode == 13 || e.keyCode == 32 ) { // enter, ' '
            e.preventDefault();
            gEventQueue.push({
                type: kEventKeyUp,
                updateFn: (cmds) => {
                    cmds.activate = false;
                }
            });
        }

        if( e.keyCode == 87 ) { // 'w'
            e.preventDefault();
            gEventQueue.push({
                type: kEventKeyUp,
                updateFn: () => {
                    LeftKeys().Update({ up: false });
                }
            });
        }

        if( e.keyCode == 83 ) { // 's'
            e.preventDefault();
            gEventQueue.push({
                type: kEventKeyUp,
                updateFn: () => {
                    LeftKeys().Update({ down: false });
                }
            });
        }

        if( e.keyCode == 38 || e.keyCode == 73 ) { // arrow up, i
            e.preventDefault();
            gEventQueue.push({
                type: kEventKeyUp,
                updateFn: () => {
                    RightKeys().Update({ up: false });
                }
            });
        }

        if( e.keyCode == 40 || e.keyCode == 75 ) { // arrow down, k
            e.preventDefault();
            gEventQueue.push({
                type: kEventKeyUp,
                updateFn: () => {
                    RightKeys().Update({ down: false });
                }
            });
        }

        if( e.keyCode == 27 ) { // esc
            gEventQueue.push({
                type: kEventKeyUp,
                updateFn: (cmds) => {
                    cmds.menu = false;
                }
            });
        }

        // pause only works in game state, and there it == menu key.
        if( e.keyCode == 80 || e.keyCode == 19) { // 'p', 'pause'
            gEventQueue.push({
                type: kEventKeyUp,
                updateFn: (cmds) => {
                    cmds.pause = false;
                }
            });
        }

        if( e.keyCode == 187 ) { // '+' and '='
            gEventQueue.push({
                type: kEventKeyUp,
                updateFn: (cmds) => {
                    if (gDebug) { cmds.addPuck = false; }
                }
            });
        }

        if( e.keyCode == 78 ) { // 'n'
            gEventQueue.push({
                type: kEventKeyUp,
                updateFn: (cmds) => {
                    if (gDebug) { cmds.step = false; }
                }
            });
        }

        if( e.keyCode == 81 ) { // 'q'
            gEventQueue.push({
                type: kEventKeyUp,
                updateFn: (cmds) => {
                    if (gDebug) { cmds.gameOver = false; }
                }
            });
        }

        if( e.keyCode == 66 ) { // 'b'
            gEventQueue.push({
                type: kEventKeyUp,
                updateFn: (cmds) => {
                    if (gDebug) { cmds.spawnPill = false; }
                }
            });
        }

        if( e.keyCode == 69 ) { // 'e'
            gEventQueue.push({
                type: kEventKeyUp,
                updateFn: (cmds) => {
                    if (gDebug) { cmds.nextMusic = false; }
                }
            });
        }

        if (e.keyCode == 46) { // delete
            gEventQueue.push({
                type: kEventKeyUp,
                updateFn: (cmds) => {
                    if (gDebug) { cmds.clearHighScore = false; }
                }
            });
        }
    });

    window.addEventListener( 'orientationChange', OnOrientationChange, false );
    window.addEventListener( 'resize', OnResize, false );
}

window.addEventListener( 'load', () => { Start(); InitEvents(); }, false );
