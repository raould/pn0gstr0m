"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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

// do not check this (to main branch, anyway) in as true.
var gDebug = false;

// [{ fn, frames? }]
var gDebug_DrawList = [];
var gShowToasts = gDebug;

// screens auto-advance after this long.
var kUITimeout = 1000 * (gDebug ? 5 : 20);
var kCanvasName = "canvas"; // match: index.html
var gLifecycle;

// which title menu to show:
// if true, which is the expected shipping state,
// the title menu has more options.
// if false, then we are in "arcade/demo night"
// mode and the menu is just 1p, 2p, start
// and the only way to start the game is to click start.
// (for demo nights played with game controllers.)
// and !kAppMode 1p is only ever kGameModeRegular.
var kAppMode = true;
var kScoreIncrement = 1;
// note: see GameState.Init().
var kZeroScore = {
  game: 0,
  level: 0
};
var gP1Score;
var gP2Score;
function ResetScores() {
  gP1Score = _objectSpread({}, kZeroScore);
  gP2Score = _objectSpread({}, kZeroScore);
}
ResetScores();
function incrScore(pscore, amount) {
  pscore.level += amount;
  pscore.game += amount;
}

// mutually exclusive enum.
// regular & hard & zen are single player.
// hard is the ame as 1P but zen is different!
var kGameModeRegular = "regular";
var kGameModeHard = "hard";
var kGameModeZen = "zen";
var kGameMode2P = "2p";
var gGameMode = LoadLocal(LocalStorageKeys.gameMode, kGameModeRegular);
function is1P() {
  return gGameMode != kGameMode2P;
}
// code smell: sentinel values, -1 is attract, -2 is zen. 
var kAttractLevelIndex = -1;
var kZenLevelIndex = -2;
// levels are 1-based.
// todo: gLevelIndex is an overloaded mess yay.
var gLevelIndex = gGameMode === kGameModeZen ? kZenLevelIndex : 1;
// this doesn't even handle attract-mode levels.
function ForGameMode(_ref) {
  var regular = _ref.regular,
    hard = _ref.hard,
    zen = _ref.zen,
    z2p = _ref.z2p;
  if (gGameMode === kGameModeRegular) {
    return regular;
  } else if (gGameMode === kGameModeHard) {
    return exists(hard) ? hard : regular;
  } else if (gGameMode === kGameModeZen) {
    return exists(zen) ? zen : exists(hard) ? hard : regular;
  } else if (gGameMode === kGameMode2P) {
    return exists(z2p) ? z2p : exists(zen) ? zen : exists(hard) ? hard : regular;
  }
}
// note: calling this with no arguments is a hack
// to try to clean up state as the 1 vs. 2 player etc.
// choices change in the menu.
// todo: clean up all the globals and confusing
// inter-related state of 1 vs. 2 player vs. game mode
// vs. level type and index.
function SetGameMode() {
  var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : gGameMode;
  Assert(mode === kGameModeRegular || mode === kGameModeHard || mode === kGameModeZen || mode === kGameMode2P, mode);
  gGameMode = mode;
  ForGameMode({
    regular: function regular() {
      return gLevelIndex = 1;
    },
    zen: function zen() {
      return gLevelIndex = kZenLevelIndex;
    }
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
var kGreenFadeInMsec = 7000;
// "fade" in from 0 alpha to specified alphas.
var kAlphaFadeInMsec = 700;
var gLevelHighScores = LoadLocal(LocalStorageKeys.levelHighScores, {});
var gHighScore = LoadLocal(LocalStorageKeys.gameHighScore, 0);

// note that all the timing and stepping stuff is maybe fragile vs. frame rate?!
// although i did try to compensate in the run loop.
var kFPS = 30;
var kTimeStep = 1000 / kFPS;
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
  gMidLineDashWidth = sx1(1);
  gXInset = sxi(20);
  gYInset = sxi(20);
  gPaddleHeight = gh(0.11);
  gPaddleWidth = sxi(6);
  gPaddleStepSize = gPaddleHeight * 0.15;
  gPuckHeight = gPuckWidth = gh(0.012);
  gPauseCenterX = ForP1Side(gw(0.92), gw(0.08));
  gPauseCenterY = gh(0.12);
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
var kSpawnPlayerPillFactor = 0.003;

// actually useful sometimes when debugging.
var gNextID = 0;
var nokeys = {
  up: false,
  down: false
};
function noKeysState() {
  return _objectSpread({}, nokeys);
}
var gP1Keys = new WrapState({
  resetFn: noKeysState
});
var gP2Keys = new WrapState({
  resetFn: noKeysState
});
function isP1UpKey() {
  var reset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  if (gP1Keys.$.up || gP2Keys.$.up) {
    console.log("up");
  }
  var is = is1P() ? gP1Keys.$.up || gP2Keys.$.up : gP1Keys.$.up;
  if (is && reset) {
    gP1Keys.Reset();
    if (is1P()) {
      gP2Keys.Reset();
    }
  }
  return is;
}
function isP1DownKey() {
  var reset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  if (gP1Keys.$.down || gP2Keys.$.down) {
    console.log("down");
  }
  var is = is1P() ? gP1Keys.$.down || gP2Keys.$.down : gP1Keys.$.down;
  if (is && reset) {
    gP1Keys.Reset();
    if (is1P()) {
      gP2Keys.Reset();
    }
  }
  return is;
}
function isP2UpKey() {
  var reset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var is = is1P() ? false : gP2Keys.up;
  if (is && reset) {
    gP2Keys.Reset();
  }
  return is;
}
function isP2DownKey() {
  var reset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var is = is1P() ? false : gP2Keys.down;
  if (is && reset) {
    gP2Keys.Reset();
  }
  return is;
}
function isUpOrDownKeyPressed() {
  return gP1Keys.$.up || gP1Keys.$.down || gP2Keys.$.up || gP2Keys.$.down;
}
function LeftKeys() {
  return ForP1Side(gP1Keys, gP2Keys);
}
function RightKeys() {
  return ForP1Side(gP2Keys, gP1Keys);
}
var nostick = {
  up: false,
  down: false,
  dz: kJoystickDeadZone
};
function noStickState() {
  return _objectSpread({}, nostick);
}
var gGamepad1Sticks = new WrapState({
  resetFn: noStickState
});
var gGamepad2Sticks = new WrapState({
  resetFn: noStickState
});
var nobuttons = {
  up: false,
  down: false,
  menu: false,
  activate: false
};
function noButtonsState() {
  return _objectSpread({}, nobuttons);
}
var gGamepad1Buttons = new WrapState({
  resetFn: noButtonsState
});
var gGamepad2Buttons = new WrapState({
  resetFn: noButtonsState
});
function isGamepad1Up() {
  var reset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var g1up = !!gGamepad1Buttons.$.up || !!gGamepad1Sticks.$.up;
  var g2up = !!gGamepad2Buttons.$.up || !!gGamepad2Sticks.$.up;
  var is = is1P() ? g1up || g2up : g1up;
  if (is && reset) {
    gGamepad1Sticks.Reset();
    gGamepad1Buttons.Reset();
    if (is1P()) {
      gGamepad2Sticks.Reset();
      gGamepad2Buttons.Reset();
    }
  }
  return is;
}
function isGamepad1Down() {
  var reset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var g1down = !!gGamepad1Buttons.$.down || !!gGamepad1Sticks.$.down;
  var g2down = !!gGamepad2Buttons.$.down || !!gGamepad2Sticks.$.down;
  var is = is1P() ? g1down || g2down : g1down;
  if (is && reset) {
    gGamepad1Sticks.Reset();
    gGamepad1Buttons.Reset();
    if (is1P()) {
      gGamepad2Sticks.Reset();
      gGamepad2Buttons.Reset();
    }
  }
  return is;
}
function isGamepad2Up() {
  var reset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var is = !!gGamepad2Buttons.$.up || !!gGamepad2Sticks.$.up;
  if (is && reset) {
    gGamepad2Sticks.Reset();
    gGamepad2Buttons.Reset();
  }
  return is;
}
function isGamepad2Down() {
  var reset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var is = !!gGamepad2Buttons.$.down || !!gGamepad2Sticks.$.down;
  if (is && reset) {
    gGamepad2Sticks.Reset();
    gGamepad2Buttons.Reset();
  }
  return is;
}
function isGamepadActivatePressed() {
  var is = !!gGamepad1Buttons.$.activate || !!gGamepad2Buttons.$.activate;
  return is;
}
function isAnyUpOrDownPressed() {
  return isUpOrDownKeyPressed() || isGamepad1Up() || isGamepad1Down() || isGamepad2Up() || isGamepad2Down();
}
;
function isAnyActivatePressed(cmds) {
  return cmds.activate || isGamepadActivatePressed();
}
function clearAnyActivatePressed() {
  gGamepad1Buttons.$.activate = false;
  gGamepad2Buttons.$.activate = false;
}
function isGamepadMenuPressed() {
  var is = !!gGamepad1Buttons.$.menu || !!gGamepad2Buttons.$.menu;
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

function ResetInput() {
  // todo: code smell.
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
function LatchP1Side(side) {
  // the first call wins and everything thereafter is ignored, on purpose.
  if (gP1Side == undefined) {
    // todo: seems risky that 'side' exists in so many places.
    Assert(side != undefined);
    gP1Side = side;
    gP2Side = OtherSide(side);
    gP1Target.SetSide(gP1Side, is1P(), gw(0.5));
    if (!is1P()) {
      gP2Target.SetSide(gP2Side, false, gw(0.5));
    }
  }
}
var kNoopEvent = {
  updateFn: function updateFn() {
    return {};
  }
};
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
var gP1Target = new MoveTarget({
  name: "p1"
});
var gP2Target = new MoveTarget({
  name: "p2"
});
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
var kChargeUp = 3;
var kGame = 4;
var kLevelFin = 5; // todo: deprecate for LevelFinChoose.
var kLevelFinChoose = 6;
var kGameOver = 7;
var kGameOverSummary = 8;
var gCanvas;
var gCx;
var gCanvas2;
var gCx2;
var gToasts = [];
var gGamepad1;
var gGamepad2;
var kJoystickDeadZone = 0.5;
var gR = new Random(Math.round(Date.now()));

// ----------------------------------------

// return 0-1 during the given time period from the start of each level.
// return > 1 after the period.
function GameTime01(period) {
  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : gLevelTime;
  var diff = gGameTime - start;
  period = Math.max(1, period);
  var t = T01nl(diff, period);
  return t;
}

// (all) this really needs to go into GameState???
function isPlayer1(side) {
  return gP1Side === side;
}
function isPlayer2(side) {
  return gP2Side === side;
}

// todo: this has gotten surprisingly bad and confusing.
function ForP1Side(left, right) {
  return ForSide(gP1Side, left, right);
}
function ForP2Side(left, right) {
  return ForSide(gP2Side, left, right);
}
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
function Cxdo(fn) {
  // get it?
  gCx.save();
  fn();
  gCx.restore();
}
function SaveEndScreenshot(state) {
  Cxdo(function () {
    Assert(exists(state.Draw));
    state.Draw({
      isEndScreenshot: true
    });
    gCx2.clearRect(0, 0, gWidth, gHeight);
    gCx2.drawImage(gCanvas, 0, 0);
  });
}

// canvas' line drawing api is... weird.
function O5(v) {
  return Math.floor(v) + 0.5;
}
function MoveTo(x, y) {
  gCx.moveTo(O5(x), O5(y));
}
function LineTo(x, y) {
  gCx.lineTo(O5(x), O5(y));
}
function RoundRect(x, y, w, h, r) {
  // e.g. does not exist in msft edge 92.0.902.67.
  if (exists(gCx.roundRect)) {
    gCx.roundRect(x, y, w, h, r);
  } else {
    gCx.rect(x, y, w, h);
  }
}
function StrokeRect(x, y, w, h) {
  gCx.strokeRect(x, y, w, h);
  if (gDebug) {
    gCx.moveTo(x, y);
    gCx.lineTo(x + w, y + h);
    gCx.moveTo(x + w, y);
    gCx.lineTo(x, y + h);
  }
}
function RectXYWH(xywh) {
  gCx.rect(xywh.x, xywh.y, xywh.width, xywh.height);
}
function DrawText(data, align, x, y, size, wiggle, font) {
  if (wiggle != false) {
    x = WX(x);
    y = WY(y);
  }
  gCx.font = size + " " + (font != null ? font : kFontName);
  gCx.textAlign = align;
  gCx.fillText(data.toString(), x, y);
}
function AddSparks(props) {
  var x = props.x,
    y = props.y,
    vx = props.vx,
    vy = props.vy,
    count = props.count,
    rx = props.rx,
    ry = props.ry,
    colorSpec = props.colorSpec;
  for (var i = 0; i < count; i++) {
    var sxf = gR.RandomCentered(0, rx, Math.max(sx(1), rx / 10));
    var syf = gR.RandomCentered(0, ry, Math.max(sy(1), rx / 10));
    var svx = vx * sxf;
    var svy = vy * syf;
    var s = gSparkPool.Alloc();
    if (exists(s)) {
      s.PlacementInit({
        x: x,
        y: y,
        vx: svx,
        vy: svy,
        colorSpec: colorSpec
      });
      gSparks.A.push(s);
    } else {
      console.log("AddSparks: no spark available");
    }
  }
}
function StepSparks(dt) {
  gSparks.B.clear();
  gSparks.A.forEach(function (s) {
    s.Step(dt);
    s.alive && gSparks.B.push(s);
  });
  SwapBuffers(gSparks);
}
function StepToasts() {
  if (gToasts.length > 0) {
    var now = Date.now();
    gToasts = gToasts.filter(function (t) {
      return t.end > now;
    });
    if (gToasts.length > 0) {
      var y = gh(0.1);
      Cxdo(function () {
        gCx.fillStyle = "magenta";
        gToasts.forEach(function (t) {
          DrawText(t.msg, "center", gw(0.5), y, gSmallestFontSizePt, false, "monospace");
          y += gSmallestFontSize * 1.1;
          if (y > gh(0.8)) {
            y = gh(0.1);
          }
        });
      });
    }
  }
}
function PushToast(msg) {
  var lifespan = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
  console.log("PushToast", msg);
  gToasts.push({
    msg: msg.toUpperCase(),
    end: Date.now() + lifespan
  });
}
function ClearScreen() {
  gCx.clearRect(0, 0, gWidth, gHeight);
}
function DrawResizing() {
  Cxdo(function () {
    gCx.fillStyle = RandomColor();
    DrawText("R E S I Z I N G", "center", gw(0.5), gh(0.3), gSmallestFontSizePt);
    DrawText("R E S I Z I N G", "center", gw(0.5), gh(0.7), gSmallestFontSizePt);
  });
}
var gDrawTitleLatch = new RandomLatch(0.005, 250);
function DrawTitle() {
  var flicker = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  Cxdo(function () {
    gCx.fillStyle = flicker ? ColorCycle(kAppMode ? 1 : 0.4) : rgba255s(cyanDarkSpec.regular);
    DrawText("P N 0 G S T R 0 M", "center", gw(0.5), gh(0.4), gBigFontSizePt, flicker);
    gCx.fillStyle = rgba255s(cyanDarkSpec.regular);
    var msg = "ETERNAL BETA";
    if (flicker && gDrawTitleLatch.MaybeLatch(gGameTime)) {
      msg = "ETERNAL BUGS";
    }
    DrawText(msg, "right", gw(0.876), gh(0.45), gSmallestFontSizePt, flicker);
  });
}
function DrawWarning() {
  gCx.fillStyle = warningColorStr;
  var lineFactor = sy1(15);
  var y0 = gh(1) - gYInset - gWarning.length * lineFactor * 1.4;
  Cxdo(function () {
    gWarning.forEach(function (t, i) {
      DrawText(t, "center", gw(0.5), y0 + i * lineFactor, gSmallestFontSizePt, false, "monospace");
    });
  });
}
function DrawLandscape() {
  if (getWindowAspect() <= 1) {
    var rots = ["|", "/", "-", "\\", "|", "/", "-", "\\"];
    var i = ii(gFrameCount / 10) % rots.length;
    Cxdo(function () {
      gCx.fillStyle = rgba255s(yellowSpec.strong);
      DrawText("".concat(rots[i]).concat(rots[i]).concat(rots[i], "  r TRY LANDSCAPE r  ").concat(rots[i]).concat(rots[i]).concat(rots[i]), "center", gw(0.5), gh(0.90), gReducedFontSizePt, false);
    });
  }
}
function DrawBounds() {
  var alpha = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.5;
  if (!gDebug) {
    return;
  }
  Cxdo(function () {
    // the scaled bounds.
    gCx.beginPath();
    gCx.rect(gXInset, gYInset, gWidth - gXInset * 2, gHeight - gYInset * 2);
    gCx.lineWidth = 1;
    gCx.strokeStyle = "red";
    gCx.stroke();
  });
  Cxdo(function () {
    // the scaled x.
    gCx.beginPath();
    gCx.moveTo(0, 0);
    gCx.lineTo(gWidth, gHeight);
    gCx.moveTo(gWidth, 0);
    gCx.lineTo(0, gHeight);
    gCx.strokeStyle = rgba255s(white, alpha / 3);
    gCx.lineWidth = 10;
    gCx.stroke();
    gCx.strokeRect(5, 5, gWidth - 10, gHeight - 10);
  });
  Cxdo(function () {
    // the full canvas x.
    gCx.beginPath();
    gCx.moveTo(0, 0);
    gCx.lineTo(gCanvas.width, gCanvas.height);
    gCx.moveTo(gCanvas.width, 0);
    gCx.lineTo(0, gCanvas.height);
    gCx.strokeStyle = rgba255s(greenSpec.regular, alpha);
    gCx.lineWidth = 1;
    gCx.stroke();
    gCx.strokeRect(5, 5, gWidth - 10, gHeight - 10);
  });
  Cxdo(function () {
    // scaled grid.
    gCx.beginPath();
    gCx.moveTo(0, gh(1 / 3));
    gCx.lineTo(gw(1), gh(1 / 3));
    gCx.moveTo(0, gh(1 / 2));
    gCx.lineTo(gw(1), gh(1 / 2));
    gCx.moveTo(0, gh(2 / 3));
    gCx.lineTo(gw(1), gh(2 / 3));
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

  var inset = ii(Math.min(gXInset, gYInset) * 0.8);
  gCx.beginPath();
  gCx.moveTo(inset, inset);
  gCx.bezierCurveTo(inset, 0, gw(1) - inset, 0, gw(1) - inset, inset);
  gCx.bezierCurveTo(gw(1), inset, gw(1), gh(1) - inset, gw(1) - inset, gh(1) - inset);
  gCx.bezierCurveTo(gw(1) - inset, gh(1), inset, gh(1), inset, gh(1) - inset);
  gCx.bezierCurveTo(0, gh(1) - inset, 0, inset, inset, inset);
}
function DrawCRTOutline() {
  Cxdo(function () {
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
    Cxdo(function () {
      for (var i = 0; i < gDebug_DrawList.length; ++i) {
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
function DrawMoveTarget(target) {
  var _target$position;
  // bug: yet another safari ios/ipados bug? the clipping doesn't
  // actually correctly work and so the butt end of the pointer
  // shows through a pixel or two, all very strange. so at least
  // making this pointer color == crt outline color to be less obvi.
  var side = target.side;
  var moveTargetY = (_target$position = target.position) == null ? void 0 : _target$position.y;
  if (exists(side) && exists(moveTargetY)) {
    var xsize = syi(12);
    var ysize = syi(7);
    var xoff = xyNudge(moveTargetY, ysize, 12, gP1Side);
    ForSide(side, function () {
      var left = xoff;
      var right = left + xsize;
      var y = WY(moveTargetY);
      Cxdo(function () {
        gCx.beginPath();
        gCx.moveTo(left, y - ysize);
        gCx.lineTo(left, y + ysize);
        gCx.lineTo(right, y);
        gCx.fillStyle = crtOutlineColorStr;
        gCx.fill();
      });
    }, function () {
      var right = gw() + xoff;
      var left = right - xsize;
      var y = WY(moveTargetY);
      Cxdo(function () {
        gCx.beginPath();
        gCx.moveTo(right, y - ysize);
        gCx.lineTo(right, y + ysize);
        gCx.lineTo(left, y);
        gCx.fillStyle = crtOutlineColorStr;
        gCx.fill();
      });
    })();
  }
}
function DrawMoveTargets() {
  DrawMoveTarget(gP1Target);
  if (!is1P()) {
    DrawMoveTarget(gP2Target);
  }
}
function UpdateLocalStorage() {
  // todo: ugly that this only works "because globals".
  // note:
  // (1) this doesn't update the level high score dict
  // since that requires deep-equals testing. so that is
  // left to be done hard-coded elsewhere.
  // (2) this doesn't include the unplayed music, see sound.js
  SaveLocal(LocalStorageKeys.gameMode, gGameMode);
  SaveLocal(LocalStorageKeys.sfxMuted, gSfxMuted);
  SaveLocal(LocalStorageKeys.musicMuted, gMusicMuted);
}

// ----------------------------------------

/*class*/
function Lifecycle(handlerMap) {
  var self = this;
  self.Init = function () {
    self.handlerMap = handlerMap;
    self.state = kRoot;
    self.handler = handlerMap[self.state]();
    self.stop = false;
    self.transitioned = false;
    self.lastGameTime = Date.now();
  };
  self.Quit = function () {
    self.stop = true;
  };
  self.RunLoop = function () {
    var _self$handler$GetIsPa, _self$handler;
    if (self.stop) {
      return;
    }
    // this got complicated quickly, trying to handle time:
    // a) only stepping if enough time has really passed.
    // b) updating the screen even when paused & thus delta time is 0.
    var paused = aub((_self$handler$GetIsPa = (_self$handler = self.handler).GetIsPaused) == null ? void 0 : _self$handler$GetIsPa.call(_self$handler), false) || document.hidden;
    var now = Date.now();
    var dt = now - self.lastGameTime;
    if (dt >= kMaybeWasPausedInTheDangedDebuggerMsec) {
      // do not suddenly jump the sum of time we were paused in the debugger.
      self.lastGameTime = now;
    } else if (dt >= kTimeStepThreshold) {
      if (paused) {
        dt = 0;
      } else {
        gGameTime = now;
      }
      self.lastGameTime = now;
      // hack: give every step something to chew on even if just empty.
      if (gEventQueue.length === 0) {
        gEventQueue.push(kNoopEvent);
      }
      self.StepFrame(dt);
      gFrameCount++;
      gEventQueue = [];
    }
    requestAnimationFrame(self.RunLoop);
  };
  self.StepFrame = function (dt, paused) {
    Gamepads.poll();
    Assert(exists(self.handler), "RunLoop.handler");
    if (self.transitioned) {
      self.handler = self.handlerMap[self.state]();
      self.transitioned = false;
    }
    var rdt = paused ? 0 : dt;
    var next = self.handler.Step(rdt);
    ClearScreen();
    DrawCRTOutline();
    if (isU(next) || next == self.state) {
      self.handler.Draw();
    } else {
      console.log("transitioned from ".concat(self.state, " to ").concat(next));
      self.transitioned = true;
      self.state = next;
      cancelPointing();
    }
    self.DrawCRTScanlines();
    DrawDebugList();
    if (gDebug) {
      DrawBounds(0.3);
    }
    if (gShowToasts) {
      StepToasts();
    }
    UpdateLocalStorage();
  };
  self.DrawCRTScanlines = function () {
    if (self.state != kRoot && self.state != kWarning) {
      gCx.beginPath();
      Cxdo(function () {
        var height = 2;
        var skip = 10;
        var step = ii(skip / height);
        var start = ii(gFrameCount / 4) % skip;
        for (var y = gHeight - start; y >= 0; y -= step) {
          gCx.rect(0, y, gWidth, height);
        }
      });
      gCx.fillStyle = scanlineColorStr;
      gCx.fill();
    }
  };
  self.Init();
}

/*class*/
function RootState(nextState) {
  var self = this;
  self.Init = function () {
    self.nextState = nextState;
  };
  self.Step = function () {
    return self.nextState;
  };
  self.Draw = function () {};
  self.Init();
}

/*class*/
function WarningState() {
  var self = this;
  self.Init = function () {
    ResetInput();
    LoadAudio();
    self.done = false;
  };
  self.Step = function () {
    if (gDebug) {
      // skip it!
      return kTitle;
    } else {
      var nextState;
      gEventQueue.forEach(function (event, i) {
        var cmds = {};
        event.updateFn(cmds);
        if (isU(nextState)) {
          nextState = self.ProcessOneInput(cmds);
        }
      });
      return nextState;
    }
  };
  self.ProcessOneInput = function (cmds) {
    var ud = isAnyUpOrDownPressed();
    var ap = isAnyActivatePressed(cmds);
    var apd = isAnyPointerDown();
    if (ud || ap || apd) {
      self.done = true;
    }
    return self.done ? kTitle : undefined;
  };
  self.Draw = function () {
    if (gResizing) {
      DrawResizing();
    } else {
      DrawTitle(false);
      DrawWarning();
      DrawLandscape();
      DrawBounds();
    }
  };
  self.Init();
}

/*class*/
function TitleState() {
  var self = this;
  self.Init = function () {
    ResetInput();
    ResetP1Side();
    ResetScores();
    ResetLevelsPillStates();
    SetGameMode(gGameMode);
    if (!kAppMode) {
      // reset to 1 player every time for clarity.
      gGameMode = kGameModeRegular;
    }
    self.attract = new GameState({
      isAttract: true
    });
    self.timeout = gDebug ? 1 : 1000 * 1.5;
    self.started = gGameTime;
    self.done = false;
    self.musicTimer = setTimeout(BeginMusic, 1000); // avoid bugs? dunno.
    self.theMenu = self.MakeMenu();
    console.log("TitleState", is1P(), gGameMode);
  };
  self.MakeMenu = function () {
    if (kAppMode) {
      return new Menu({
        showButton: true,
        OnClose: function OnClose() {
          ResetP1Side();
          // forget any extra in-menu state
          // like which button is default selected.
          self.theMenu = self.MakeMenu();
        },
        MakeNavigation: function MakeNavigation() {
          return MakeAppMenuButtons();
        }
      });
    } else {
      var OnStart = function OnStart() {
        self.done = true;
      };
      var menu = new Menu({
        showButton: true,
        OnClose: function OnClose() {
          ResetP1Side();
          // forget any extra in-menu state
          // like which button is default selected.
          self.theMenu = self.MakeMenu();
        },
        MakeNavigation: function MakeNavigation(menu) {
          return MakeArcadeMenuButtons({
            OnStart: OnStart
          });
        }
      });
      return menu;
    }
  };
  self.isLoading = function () {
    return gGameTime - self.started <= self.timeout;
  };
  self.Step = function (dt) {
    var nextState;
    self.attract.Step(dt);
    self.theMenu.Step(); // note: does not handle input, see below.

    nextState = self.ProcessAllInput();
    if (exists(nextState)) {
      clearTimeout(self.musicTimer);
      StopAudio(true);
    }
    return nextState;
  };
  self.ProcessAllInput = function () {
    var nextState;
    gEventQueue.forEach(function (event, i) {
      var cmds = {};
      event.updateFn(cmds);
      if (isU(nextState)) {
        nextState = self.ProcessOneInput(cmds);
      }
    });
    return nextState;
  };
  self.ProcessOneInput = function (cmds) {
    if (cmds.singlePlayer) {
      // match: app_menu.bp1.click
      SetGameMode(kGameModeRegular);
      return undefined;
    }
    if (cmds.doublePlayer) {
      // match: app_menu.bp2.click
      SetGameMode(kGameMode2P);
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

    // the menu can be opened in various ways:
    // * "options" style gamepad buttons.
    // * "esc" key on keyboard.
    // * touching the menu button on-screen.
    if (!self.isLoading() && !self.theMenu.isOpen() && self.theMenu.ProcessTarget(gP1Target) == false && self.theMenu.ProcessTarget(gP2Target) == false && (isAnyUpOrDownPressed() || isAnyActivatePressed(cmds) || isAnyPointerDown())) {
      if (kAppMode) {
        self.done = true;
      } else {
        // the only way to start the game
        // in demo mode is with the start
        // button in the menu, to make it
        // clear to gamepad demo night users
        // what is going on, vs. app mode
        // touch being used to decide which
        // side 1p is on.
        self.theMenu.Open();
        gP1Target.ClearPointer();
        gP2Target.ClearPointer();
      }
    }
    var nextState;
    if (self.done) {
      // if it was all only gamepad inputs, there's no "side" set.
      if (isU(gP1Side)) {
        LatchP1Side("right");
      }
      nextState = kGetReady;
    }
    return nextState;
  };
  self.Draw = function () {
    if (gResizing) {
      self.started = gGameTime;
      DrawResizing();
    } else {
      Cxdo(function () {
        self.attract.Draw();
        DrawTitle();
        gCx.fillStyle = RandomGreen();
        var msg = "CONTROLS: TOUCH / MOUSE / GAMEPAD / W,S / I,K / u,v";
        if (self.isLoading()) {
          var msg = "LOADING...";
        }
        DrawText(msg, "center", gw(0.5), gh(0.6), gSmallFontSizePt);
      });
      self.theMenu.Draw();
      self.DrawMusicName();
    }
  };
  self.DrawMusicName = function () {
    if (!gMusicMuted) {
      var msg = "fetching music";
      if (exists(gMusicID)) {
        var name = gAudio.id2name[gMusicID];
        var meta = gAudio.name2meta[name];
        if (exists(meta == null ? void 0 : meta.basename) && !!(meta != null && meta.loaded)) {
          var msg = meta.basename;
        }
      }
      Cxdo(function () {
        gCx.fillStyle = rgba255s(greySpec.strong, 0.5);
        DrawText(msg.toUpperCase(), "center", gw(0.5), gh(0.94), gSmallestFontSizePt, false);
      });
    }
  };
  self.Init();
}

/*class*/
function GetReadyState() {
  var self = this;
  self.Init = function () {
    ResetInput();
    gStateMuted = false;
    var seconds = gDebug ? 2 : gP1PillState.deck.length > 0 ? 5 : 3;
    self.timeout = 1000 * seconds - 1;
    self.lastSec = Math.floor((self.timeout + 1) / 1000);
    self.animations = {};
    self.AddAnimation(MakeGameStartAnimation());
    PlayBlip();
    console.log("GetReadyState", is1P(), gGameMode);
  };
  self.AddAnimation = function (a) {
    self.animations[gNextID++] = a;
  };
  self.Step = function (dt) {
    self.StepAnimations(dt);
    self.timeout -= dt;
    var sec = Math.floor(self.timeout / 1000);
    if (sec < self.lastSec) {
      PlayBlip();
      self.lastSec = sec;
    }
    if (self.timeout <= 0) {
      return ForGameMode({
        regular: kChargeUp,
        hard: kChargeUp,
        zen: kGame,
        z2p: kGame
      });
    }
    return undefined;
  };
  self.StepAnimations = function (dt) {
    Object.entries(self.animations).forEach(function (_ref2) {
      var _ref3 = _slicedToArray(_ref2, 2),
        id = _ref3[0],
        anim = _ref3[1];
      var done = anim.Step(dt, self);
      if (done) {
        delete self.animations[id];
      }
    });
  };
  self.Draw = function () {
    self.DrawText();
    self.DrawPills();
    self.DrawAnimations();
  };
  self.DrawAnimations = function () {
    Object.values(self.animations).forEach(function (a) {
      return a.Draw();
    });
  };
  self.DrawPills = function () {
    var whscale = Math.max(0.4, T10(Math.max(gP1PillState.deck.length, gP2PillState.deck.length), gPillIDs.length));
    var y = gh(0.7);
    var maxWidth = 0;
    var maxHeight = 0;
    gP1PillState.deck.map(function (pid) {
      maxWidth = Math.max(maxWidth, gPillInfo[pid].wfn());
      maxHeight = Math.max(maxHeight, gPillInfo[pid].hfn());
    });
    gP2PillState.deck.map(function (pid) {
      maxWidth = Math.max(maxWidth, gPillInfo[pid].wfn());
      maxHeight = Math.max(maxHeight, gPillInfo[pid].hfn());
    });
    var ox = maxWidth * 3 * whscale;
    var labelY = y + sy1(10) + maxHeight * whscale;
    self.DrawPillsSide(gP1Side, gP1PillState.deck, whscale, ox, y, labelY);
    self.DrawPillsSide(gP2Side, gP2PillState.deck, whscale, ox, y, labelY);
  };
  self.DrawPillsSide = function (side, pills, whscale, ox, y, labelY) {
    var count = pills.length;
    if (count > 0) {
      var mx = gw(ForSide(side, 0.25, 0.75));
      var lx = mx - (count - 1) / 2 * ox;
      Cxdo(function () {
        for (var i = 0; i < count; ++i) {
          var pid = pills[i];
          var x = lx + ox * i;
          var _gPillInfo$pid = gPillInfo[pid],
            name = _gPillInfo$pid.name,
            drawer = _gPillInfo$pid.drawer,
            wfn = _gPillInfo$pid.wfn,
            hfn = _gPillInfo$pid.hfn;
          var width = wfn() * whscale;
          var height = hfn() * whscale;
          drawer(side, {
            x: x - width / 2,
            y: y - height / 2,
            width: width,
            height: height
          }, 1);
          gCx.fillStyle = RandomForColor(blueSpec);
          DrawText(name, "center", x, labelY, gSmallestFontSizePt);
        }
      });
    }
  };
  self.DrawText = function () {
    var p2txt = is1P() ? "" : "P2";
    var t = Math.ceil(self.timeout / 1000);
    Cxdo(function () {
      // match: GameState.DrawScoreHeader() et. al.
      gCx.fillStyle = RandomGreen(0.3);
      DrawText(ForP1Side("P1", p2txt), "left", gw(0.2), gh(0.22), gRegularFontSizePt);
      DrawText(ForP1Side(p2txt, "P1"), "right", gw(0.8), gh(0.22), gRegularFontSizePt);
      ForGameMode({
        regular: function regular() {
          gCx.fillStyle = RandomForColor(cyanSpec);
          DrawText("LEVEL ".concat(gLevelIndex), "center", gw(0.5), gh(0.3), gSmallFontSizePt);
        },
        zen: function zen() {} // only 1 level.
      })();
      gCx.fillStyle = RandomGreen();
      DrawText("GET READY! ".concat(t), "center", gw(0.5), gh(0.55), gBigFontSizePt);
    });
  };
  self.Init();
}

/*class*/
function ChargeUpState() {
  var self = this;
  self.Init = function () {
    var seconds = gDebug ? 1 : 3;
    self.timeout = 1000 * seconds - 1;
    self.lastSec = Math.floor((self.timeout + 1) / 1000);
    self.animations = {};
    self.AddAnimation(MakeChargeUpTextAnimation(self.timeout));
    self.AddAnimation(MakeChargeUpMeterAnimation(self.timeout));
  };
  self.AddAnimation = function (a) {
    self.animations[gNextID++] = a;
  };
  self.Step = function (dt) {
    self.StepAnimations(dt);
    self.timeout -= dt;
    var sec = Math.floor(self.timeout / 1000);
    if (sec < self.lastSec) {
      PlayBlip();
      self.lastSec = sec;
    }
    return self.timeout > 0 ? undefined : kGame;
  };
  self.StepAnimations = function (dt) {
    Object.entries(self.animations).forEach(function (_ref4) {
      var _ref5 = _slicedToArray(_ref4, 2),
        id = _ref5[0],
        anim = _ref5[1];
      var done = anim.Step(dt, self);
      if (done) {
        delete self.animations[id];
      }
    });
  };
  self.Draw = function () {
    self.DrawText();
    self.DrawAnimations();
  };
  self.DrawText = function () {
    var p2txt = is1P() ? "" : "P2";
    var t = Math.ceil(self.timeout / 1000);
    Cxdo(function () {
      // match: GameState.DrawScoreHeader() et. al.
      gCx.fillStyle = RandomGreen(0.3);
      DrawText(ForP1Side("P1", p2txt), "left", gw(0.2), gh(0.22), gRegularFontSizePt);
      DrawText(ForP1Side(p2txt, "P1"), "right", gw(0.8), gh(0.22), gRegularFontSizePt);

      // match: Level.DrawTitle().
      if (gLevelIndex >= 1) {
        gCx.fillStyle = RandomForColor(cyanSpec);
        DrawText("LEVEL ".concat(gLevelIndex), "center", gw(0.5), gh(0.08), gSmallestFontSizePt);
      }
    });
  };
  self.DrawAnimations = function () {
    Object.values(self.animations).forEach(function (a) {
      return a.Draw();
    });
  };
  self.Init();
}

/*class*/
function GameState(props) {
  var self = this;
  self.Init = function () {
    // the order of everything here matters (everything is fragile).

    // todo: i wish i knew a good way to pull this out, it
    // is making the code in this class kind of a headache.
    // also i don't like if(!self.isAttract) style due to "!"
    // but nor would i like e.g. self.isNormal i feel.
    self.isAttract = aub(props == null ? void 0 : props.isAttract, false);
    gStateMuted = self.isAttract;

    // todo: code smell, this 'reset' business is kind of a big confused mess. :-(
    RecalculateConstants();
    ResetGlobalStorage();
    ResetInput();
    gP1Score.level = 0;
    gP2Score.level = 0;
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

    // I think the gross ensuing code indicates the Paddle should perhaps
    // at least be split up into human & ai variants. :-\ ...so confused.
    // warning: this setup is easily confusing wrt left vs. right.
    var lp = {
      x: gXInset,
      y: gh(0.5)
    };
    var rp = {
      x: gWidth - gXInset - gPaddleWidth,
      y: gh(0.5)
    };

    // show paddle labels for zen or level 1.
    var p1label = self.isAttract || gLevelIndex > 1 ? undefined : "P1";
    var p2label = self.isAttract || gLevelIndex > 1 ? undefined : is1P() ? "GPT" : "P2";
    var paddle1specs = {
      isPlayer: !self.isAttract,
      width: gPaddleWidth,
      height: gPaddleHeight,
      label: p1label,
      isSplitter: !self.isAttract,
      keyStates: is1P() ? [gP1Keys, gP2Keys] : [gP1Keys],
      buttonStates: is1P() ? [gGamepad1Buttons, gGamepad2Buttons] : [gGamepad1Buttons],
      stickStates: is1P() ? [gGamepad1Sticks, gGamepad2Sticks] : [gGamepad1Sticks],
      target: gP1Target
    };
    var paddle2specs = {
      isPlayer: !self.isAttract && !is1P(),
      width: gPaddleWidth,
      height: gPaddleHeight,
      label: p2label,
      isSplitter: !self.isAttract,
      isPillSeeker: true,
      keyStates: is1P() ? [] : [gP2Keys],
      buttonStates: is1P() ? [] : [gGamepad2Buttons],
      stickStates: is1P() ? [] : [gGamepad2Sticks],
      target: gP2Target
    };

    // p1 is always a human player.
    // p2 is either cpu or another human.
    ForSide(gP1Side, function () {
      self.paddleP1 = new Paddle(_objectSpread(_objectSpread({}, paddle1specs), {}, {
        side: "left",
        x: lp.x,
        y: lp.y
      }));
      self.paddleP2 = new Paddle(_objectSpread(_objectSpread({}, paddle2specs), {}, {
        side: "right",
        x: rp.x,
        y: rp.y
      }));
    }, function () {
      self.paddleP1 = new Paddle(_objectSpread(_objectSpread({}, paddle1specs), {}, {
        side: "right",
        x: rp.x,
        y: rp.y
      }));
      self.paddleP2 = new Paddle(_objectSpread(_objectSpread({}, paddle2specs), {}, {
        side: "left",
        x: lp.x,
        y: lp.y
      }));
    })();
    self.MakeLevel();
    self.CreateStartingPuck(self.level.vx0);
    // make it look more interesting as the 1P levels increase.
    if (is1P()) {
      for (var pi = 1; pi < Math.min(self.level.index, gPillIDs.length); ++pi) {
        self.CreateStartingPuck(self.level.vx0);
      }
    }

    // this countdown is a block on both player & cpu ill spawning.
    // first wait is longer before the very first pill.
    // also see the 'must' check later on.
    // prevent pills from showing up too often, or too early - but not too late.
    self.pillSpawnCooldown = ForGameMode({
      regular: 1000 * 10,
      hard: 1000 * 15,
      zen: 1000 * 20,
      zp2: 1000 * 15
    });
    self.pillP1SpawnCountdown = self.pillSpawnCooldown;
    self.pillP2SpawnCountdown = self.pillSpawnCooldown;
    // make sure the cpu doesn't get one first, that looks too mean/unfair,
    // however, allow a 2nd player to get one first!
    self.isCpuPillAllowed = !is1P();
    // also, neither side gets too many pills before the other.
    self.unfairPillCount = 0;
    self.unfairPillDiffMax = 2;
    if (!self.isAttract) {
      PlayStart();
    }
  };
  self.MakeMenu = function () {
    return new Menu({
      showButton: false,
      OnClose: function OnClose() {
        self.paused = false;
        // forget any extra in-menu state
        // like which button is default seleted.
        self.theMenu = self.MakeMenu();
      },
      MakeNavigation: function MakeNavigation() {
        return MakeGameMenuButtons({
          OnQuit: function OnQuit() {
            self.quit = true;
          }
        });
      }
    });
  };
  self.MakeLevel = function () {
    Assert(exists(self.paddleP1));
    Assert(exists(self.paddleP2));
    if (self.isAttract) {
      self.level = MakeAttract(self.paddleP1, self.paddleP2);
    } else if (gGameMode === kGameMode2P) {
      self.level = MakeZ2P(self.paddleP1, self.paddleP2);
    } else if (gGameMode === kGameModeZen) {
      self.level = MakeZen(self.paddleP1, self.paddleP2);
    } else {
      Assert(gLevelIndex > 0);
      self.level = MakeLevel(gLevelIndex, self.paddleP1, self.paddleP2);
    }
    self.maxVX = self.level.maxVX;
    Assert(!isBadNumber(self.maxVX));
    //logOnDelta("maxVX", self.maxVX, 1);
  };
  self.Pause = function () {
    // match: ProcessOneInput().
    self.paused = true;
    if (exists(self.theMenu)) {
      var _self$theMenu;
      if (!((_self$theMenu = self.theMenu) != null && _self$theMenu.isOpen())) {
        var _self$theMenu2;
        (_self$theMenu2 = self.theMenu) == null || _self$theMenu2.bMenu.Click(); // sure hope this stays in sync.
        clearAnyMenuPressed(); // todo: code smell.
      }
    }
  };
  self.GetIsPaused = function () {
    return self.paused;
  };
  self.Step = function (dt) {
    var _self$theMenu3;
    (_self$theMenu3 = self.theMenu) == null || _self$theMenu3.Step(); // fyi this doesn't process menu inputs, that is below.
    self.level.Step(dt);
    self.maxVX = self.level.maxVX; // todo: code smell global.
    self.MaybeSpawnPills(dt);
    self.ProcessAllInput();
    if (self.quit) {
      SaveEndScreenshot(self);
      return ForGameMode({
        regular: gDebug ? kLevelFin : kGameOver,
        zen: kGameOver
      });
    }
    if (self.stepping) {
      dt = kTimeStep;
    }
    if (!self.paused || self.stepping) {
      self.paddleP1.Step(dt, self);
      self.paddleP2.Step(dt, self);
      self.StepMoveables(dt);
      self.StepAnimations(dt);
    }
    var nextState = self.StepNextState();
    self.stepping = false;
    return nextState;
  };
  self.AddPillSparks = function (x, y) {
    AddSparks({
      x: x,
      y: y,
      count: 50,
      vx: gR.RandomRange(0.4, 0.8),
      vy: gR.RandomRange(0.4, 0.8),
      rx: sx1(10),
      ry: sy1(10),
      colorSpec: cyanSpec
    });
  };
  self.MaybeSpawnPills = function (dt) {
    var forced = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    self.pillP1SpawnCountdown -= dt;
    self.pillP2SpawnCountdown -= dt;
    if (forced || isU(self.level.p1Pill) && self.pillP1SpawnCountdown <= 0 && self.unfairPillCount < self.unfairPillDiffMax) {
      var toolongago = self.pillP1SpawnCountdown < -self.pillSpawnCooldown * 2;
      var must = forced || toolongago;
      self.level.p1Pill = self.MaybeSpawnPill(must, self.level.p1Pill, kSpawnPlayerPillFactor, self.level.p1Powerups);
      if (exists(self.level.p1Pill)) {
        // increased frequency after the first one.
        self.pillP1SpawnCountdown = self.pillSpawnCooldown / 2;
        if (!forced) {
          self.unfairPillCount++;
        }
        self.isCpuPillAllowed = true;
        self.AddPillSparks(self.level.p1Pill.x, self.level.p1Pill.y);
      }
    }

    // the same-but-different as above.
    if (forced || isU(self.level.p2Pill) && self.pillP2SpawnCountdown <= 0 && self.isCpuPillAllowed && self.unfairPillCount > -self.unfairPillDiffMax) {
      // bias powerup creation toward the single player, no proof how much this does anything though.
      var factor = kSpawnPlayerPillFactor * (is1P() ? 0.5 : 1);
      var _toolongago = self.pillP2SpawnCountdown < -self.pillSpawnCooldown * 2;
      var must = forced || _toolongago;
      self.level.p2Pill = self.MaybeSpawnPill(must, self.level.p2Pill, factor, self.level.p2Powerups);
      if (exists(self.level.p2Pill)) {
        // increased frequency after the first one.
        self.pillP2SpawnCountdown = self.pillSpawnCooldown / 2;
        if (!forced) {
          self.unfairPillCount--;
        }
        self.AddPillSparks(self.level.p2Pill.x, self.level.p2Pill.y);
      }
    }
    Assert(Math.abs(self.unfairPillCount) <= self.unfairPillDiffMax, "unfairPillCount");
  };
  self.MaybeSpawnPill = function (must, prev, spawnFactor, maker) {
    var can_paused = !self.paused;
    var can_attract = !self.isAttract;
    var can_factor = gR.RandomBool(spawnFactor);
    var can_empty = isU(prev);
    if (must || can_paused && can_attract && can_factor && can_empty) {
      return maker.MakeRandomPill(self);
    }
    return undefined;
  };
  self.StepNextState = function () {
    if (self.isAttract) {
      if (gPucks.A.length === 0) {
        // attract never ends until dismissed.
        self.CreateStartingPuck(self.level.vx0);
      }
      return undefined;
    } else {
      var nextState = self.CheckLevelOver();
      if (exists(nextState)) {
        SaveEndScreenshot(self);
      }
      return nextState;
    }
  };
  self.CheckLevelOver = function () {
    var nextState;
    if (!self.isAttract && gPucks.A.length == 0) {
      nextState = ForGameMode({
        regular: is1P() ? gP1Score.level < gP2Score.level ? kGameOver : kLevelFin : kGameOver,
        zen: kGameOver
      });
    }
    return nextState;
  };
  self.StepAnimations = function (dt) {
    Object.entries(self.animations).forEach(function (_ref6) {
      var _ref7 = _slicedToArray(_ref6, 2),
        id = _ref7[0],
        anim = _ref7[1];
      var done = anim.Step(dt, self);
      if (done) {
        delete self.animations[id];
      }
    });
  };
  self.CreateStartingPuck = function (vx) {
    var toLeft = [gR.RandomCentered(gw(0.6), gw(0.1)), -1];
    var toRight = [gR.RandomCentered(gw(0.4), gw(0.1)), 1];
    var _ForSide = ForSide(gP1Side, toRight, toLeft),
      _ForSide2 = _slicedToArray(_ForSide, 2),
      x = _ForSide2[0],
      sign = _ForSide2[1];
    var p = gPuckPool.Alloc();
    Assert(exists(p), "CreateStartingPuck");
    console.log("CreateStartingPuck", vx);
    p.PlacementInit({
      x: x,
      y: gR.RandomCentered(gh(0.3), gh(0.1)),
      vx: gR.RandomCentered(sign * vx, sign * vx * 0.2),
      vy: self.isAttract ? gR.RandomCentered(0, 2, 1) : 0.3,
      ur: true
    });
    gPucks.A.push(p);
  };
  self.CreateRandomPuck = function () {
    var p = gPuckPool.Alloc();
    if (exists(p)) {
      p.PlacementInit({
        x: gw(gR.RandomRange(1 / 8, 7 / 8)),
        y: gh(gR.RandomRange(3.5 / 8, 4 / 8)),
        vx: gR.RandomRange(0.2, 0.3) * self.maxVX,
        vy: gR.RandomCentered(1, 0.5),
        ur: true
      });
      gPucks.A.push(p);
    }
  };
  self.ProcessAllInput = function () {
    // todo: figure out right way to deal with not/clearing inputs.
    if (!self.isAttract) {
      gEventQueue.forEach(function (event, i) {
        var cmds = {};
        event.updateFn(cmds);
        self.ProcessOneInput(cmds);
      });
    }
  };
  self.ProcessOneInput = function (cmds) {
    var _self$theMenu4;
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
        gHighScore = 0;
        self.levelHighScore = undefined;
        DeleteLocal(LocalStorageKeys.levelHighScores);
        DeleteLocal(LocalStorageKeys.gameHighScore);
      }
    }
    if (cmds.addPuck) {
      if (self.paused) {
        ForCount(50, function () {
          self.CreateRandomPuck();
        });
      }
    }
    // everything below is about pause state and menu showing oh boy.
    if ((_self$theMenu4 = self.theMenu) != null && _self$theMenu4.ProcessOneInput(cmds)) {
      return;
    }
    var pbp = false;
    if (self.pauseButtonEnabled && isAnyPointerDown()) {
      var pxyr = {
        x: gPauseCenterX,
        y: gPauseCenterY,
        r: gPauseRadius * 2.5
      };
      // match: DrawPauseButton();
      var p1p = isPointInCircle(gP1Target.position, pxyr);
      var p2p = isPointInCircle(gP2Target.position, pxyr);
      if (p1p) {
        gP1Target.ClearPointer();
      }
      if (p2p) {
        gP2Target.ClearPointer();
      }
      pbp = p1p || p2p;
    }
    if (isAnyMenuPressed(cmds) || cmds.pause || pbp) {
      var _self$theMenu5;
      // match: Pause().
      self.paused = !self.paused;
      (_self$theMenu5 = self.theMenu) == null || _self$theMenu5.bMenu.Click(); // sure hope this stays in sync.
      clearAnyMenuPressed(); // todo: code smell.
    }
  };
  self.AddAnimation = function (a) {
    self.animations[gNextID++] = a;
  };
  self.StepMoveables = function (dt) {
    self.MovePucks(dt);
    StepSparks(dt);
    self.MovePills(dt);
  };
  self.UpdateScore = function (p) {
    var wasLeft = p.x < gw(0.5);
    if (wasLeft) {
      ForP1Side(function () {
        incrScore(gP2Score, kScoreIncrement);
      }, function () {
        incrScore(gP1Score, kScoreIncrement);
      })();
    } else {
      ForP1Side(function () {
        incrScore(gP1Score, kScoreIncrement);
      }, function () {
        incrScore(gP2Score, kScoreIncrement);
      })();
    }
  };
  self.MovePucks = function (dt) {
    var pmaxvx = -Number.MAX_SAFE_INTEGER;
    gPucks.B.clear();
    gPucks.A.forEach(function (p, i) {
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
        var splits = p.AllPaddlesCollision(self.level.IsSuddenDeath(), self.maxVX, self.paddleP1, self.paddleP2);
        self.level.OnPuckSplits(splits);

        // note: splits are pushed before parent, match: Draw()'s revEach() z order.
        if (self.level.isSpawning) {
          for (var _i = 0; (_ref8 = _i < (splits == null ? void 0 : splits.length)) != null ? _ref8 : 0; ++_i) {
            var _ref8;
            var _p = gPuckPool.Alloc();
            if (exists(_p)) {
              _p.PlacementInit(splits[_i]);
              gPucks.B.push(_p);
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
  self.MovePills = function (dt) {
    self.MovePlayerPill(dt);
    self.MoveCPUPill(dt);
  };
  self.MovePlayerPill = function (dt) {
    if (exists(self.level.p1Pill)) {
      self.level.p1Pill = self.level.p1Pill.Step(dt, self);
    }
    if (exists(self.level.p1Pill)) {
      self.level.p1Pill = self.level.p1Pill.PaddleCollisionUpdate(self, self.paddleP1);
    }
  };
  self.MoveCPUPill = function (dt) {
    if (exists(self.level.p2Pill)) {
      self.level.p2Pill = self.level.p2Pill.Step(dt, self);
    }
    if (exists(self.level.p2Pill)) {
      self.level.p2Pill = self.level.p2Pill.PaddleCollisionUpdate(self, self.paddleP2);
    }
  };
  self.Alpha = function (alpha) {
    if (alpha == undefined) {
      alpha = 1;
    }
    return alpha * (self.isAttract ? 0.6 : 1);
  };

  // note: this really has to be z-under everything.
  // match: level.Draw().
  // match: MakeChargeUpMeterAnimation().
  self.DrawMidLine = function () {
    if (!self.isAttract) {
      var _self$level$EnergyFac;
      // note: this is all a tweaky hacky heuristic mess.
      var dashStep = gh() / (gMidLineDashCount * 2);
      var top = ForGameMode({
        regular: gYInset * 1.5,
        zen: gYInset
      }) + dashStep / 2;
      // match: Level.DrawText().
      var txo = gSmallFontSize;
      var bottom = ForGameMode({
        regular: gh() - gYInset * 1.05 - txo,
        zen: gh() - gYInset
      });
      var range = bottom - top;
      var e = ((_self$level$EnergyFac = self.level.EnergyFactor()) != null ? _self$level$EnergyFac : 0) * range;
      var gotfat = false;
      Cxdo(function () {
        gCx.beginPath();
        for (var y = top; y < bottom; y += dashStep * 2) {
          var ox = gR.RandomCentered(0, 0.5);
          var fat = y - top >= range - e;
          var width = fat ? gMidLineDashWidth * 3 : gMidLineDashWidth;
          gCx.rect(gw(0.5) + ox - width / 2, y, width, dashStep);
        }
        gCx.fillStyle = RandomGreen(0.5);
        gCx.fill();
      });
    }
  };
  self.DrawCRTOutline = function () {
    if (!self.isAttract) {
      DrawCRTOutline();
    }
  };

  // match: GameState.DrawScoreHeader() et. al.
  self.DrawScoreHeader = function (isEndScreenshot) {
    Cxdo(function () {
      var style = RandomMagenta(self.Alpha(isEndScreenshot ? 1 : 0.4));
      var p2 = is1P() ? "GPT: " : "P2: ";
      var hiMsg = gGameMode === kGameModeZen ? "HIGH: " : "LVL HI: ";
      // i wish i could be sure attract always had p1 on the right.
      ForSide(self.isAttract ? "right" : gP1Side,
      // p1 on the left.
      function () {
        gCx.fillStyle = style;
        if (exists(self.levelHighScore)) {
          DrawText(hiMsg + self.levelHighScore, "left", gw(0.2), gh(0.12), gSmallerFontSizePt);
        }
        if (!self.isAttract) {
          DrawText("P1: ".concat(gP1Score.level), "left", gw(0.2), gh(0.22), gRegularFontSizePt);
          DrawText(p2 + gP2Score.level, "right", gw(0.8), gh(0.22), gRegularFontSizePt);
        }
      },
      // p1 on the right.
      function () {
        gCx.fillStyle = style;
        if (exists(self.levelHighScore)) {
          DrawText(hiMsg + self.levelHighScore, "right", gw(0.8), gh(0.12), gSmallerFontSizePt);
        }
        if (!self.isAttract) {
          DrawText(p2 + gP2Score.level, "left", gw(0.2), gh(0.22), gRegularFontSizePt);
          DrawText("P1: ".concat(gP1Score.level), "right", gw(0.8), gh(0.22), gRegularFontSizePt);
        }
      })();
    });
  };
  self.DrawMoveTargets = function () {
    if (!self.isAttract) {
      DrawMoveTargets();
    }
  };
  self.DrawPauseButton = function () {
    if (!self.isAttract && isAnyPointerEnabled()) {
      self.pauseButtonEnabled = true;
      var cx = gPauseCenterX;
      var cy = gPauseCenterY;
      Cxdo(function () {
        gCx.fillStyle = gCx.strokeStyle = RandomForColor(greySpec, 0.3);
        DrawText("ESC", "center", cx, cy + gSmallestFontSize * 0.4, gSmallestFontSizePt);
        gCx.beginPath();
        gCx.RoundRect(cx - gPauseRadius, cy - gPauseRadius, gPauseRadius * 2, gPauseRadius * 2, gPauseRadius);
        gCx.lineWidth = sx1(1.5);
        gCx.stroke();
        if (gDebug) {
          gCx.fillStyle = "red";
          // match: ProcessOneInput();
          gCx.strokeRect(cx - gPauseRadius * 1.5, cy - gPauseRadius * 1.5, gPauseRadius * 3, gPauseRadius * 3);
        }
      });
    }
  };
  self.DrawAnimations = function () {
    Object.values(self.animations).forEach(function (a) {
      return a.Draw(self);
    });
  };
  self.Draw = function (props) {
    //if (!self.isAttract) { ClearScreen(); }
    if (!gResizing) {
      // painter's z order algorithm here below, keep important things last.

      self.DrawCRTOutline();
      var isEndScreenshot = !!(props != null && props.isEndScreenshot);
      if (!isEndScreenshot) {
        self.DrawMidLine();
      }
      self.DrawScoreHeader(isEndScreenshot);
      self.level.Draw({
        alpha: self.Alpha(),
        isEndScreenshot: isEndScreenshot
      });

      // draw paddles under pucks, at least so i can visually debug collisions.
      var s01 = exists(self.level.splitsRemaining) ? T01(self.level.splitsRemaining, self.level.splitsMax) : undefined;
      self.paddleP1.Draw(self.Alpha(), self, s01, isEndScreenshot);
      self.paddleP2.Draw(self.Alpha(), self, s01, isEndScreenshot);

      // match: pucks revEach so splits show up on top, z order.
      // pucks going away from (single) player.
      gPucks.A.revEach(function (p) {
        if (Sign(p.vx) == ForP1Side(1, -1)) {
          Assert(exists(p));
          p.Draw(self.Alpha());
        }
      });
      // pucks attacking the (single) player on top.
      gPucks.A.revEach(function (p) {
        if (Sign(p.vx) == ForP1Side(-1, 1)) {
          p.Draw(self.Alpha());
        }
      });
      if (!isEndScreenshot) {
        gSparks.A.forEach(function (s) {
          s.Draw(self.Alpha());
        });
      }
      if (!isEndScreenshot) {
        self.DrawMoveTargets();
      }
      if (!isEndScreenshot) {
        // late/high z order so the animations can clear the screen if desired.
        self.DrawAnimations();
      }
      if (!isEndScreenshot) {
        var _self$theMenu6;
        (_self$theMenu6 = self.theMenu) == null || _self$theMenu6.Draw();
        self.DrawPauseButton();
      }
    }
    self.DrawDebug();
  };

  // call this last so it is the top z layer.
  self.DrawDebug = function () {
    if (!gDebug) {
      return;
    }
    self.paddleP1.DrawDebug();
    self.paddleP2.DrawDebug();
    gP1Target.DrawDebug();
    gP2Target.DrawDebug();
    Cxdo(function () {
      gCx.fillStyle = "magenta";
      DrawText("".concat(self.unfairPillCount, " ").concat(self.pillP1SpawnCountdown, " ").concat(self.pillP2SpawnCountdown), "left", gw(0.2), gh(0.4), gSmallestFontSizePt);
      gCx.fillStyle = RandomGrey();
      var mvx = gPucks.A.reduce(function (m, p) {
        return p.alive ? Math.max(m, Math.abs(p.vx)) : m;
      }, 0);
      DrawText(F(mvx.toString()), "left", gw(0.1), gh(0.1), gSmallFontSizePt);
      gCx.fillStyle = "red";
      DrawText(F(self.maxVX.toString()), "left", gw(0.1), gh(0.1) + gSmallFontSize, gSmallFontSizePt);
      gCx.fillStyle = RandomBlue(0.5);
      DrawText(gPucks.A.length, "center", gw(0.6), gh(0.9), gRegularFontSizePt);
      DrawText(gFrameCount.toString(), "right", gw(0.9), gh(0.9), gSmallFontSizePt);
      gCx.fillStyle = RandomForColor(blueSpec, 0.3);
      DrawText("D E B U G", "center", gw(0.5), gh(0.8), gBigFontSizePt);
    });
  };
  self.Init();
}

/*class*/
function LevelFinState() {
  var self = this;
  self.Init = function () {
    ResetInput();
    self.levelIndex = gLevelIndex;
    self.timeout = 1000 * (gDebug ? 0 : 2);
    self.started = gGameTime;
    self.levelHigh = gLevelHighScores[self.levelIndex];
    self.isNewHighScore = false;
    if (is1P()) {
      if (gP1Score.level > 0 && (isU(self.levelHigh) || gP1Score.level > self.levelHigh)) {
        self.levelHigh = gP1Score.level;
        self.isNewHighScore = true;
      }
    } else {
      var maxScore = Math.max(gP1Score.level, gP2Score.level);
      if (maxScore > 0 && (isU(self.levelHigh) || maxScore > self.levelHigh)) {
        self.levelHigh = maxScore;
        self.isNewHighScore = true;
      }
    }
    if (self.isNewHighScore) {
      Assert(!isBadNumber(self.levelHigh));
      gLevelHighScores[self.levelIndex] = self.levelHigh;
      SaveLocal(LocalStorageKeys.levelHighScores, gLevelHighScores, true);
    }
    self.goOn = false;
    PlayGameOver();
  };
  self.Step = function () {
    self.goOn = gGameTime - self.started > self.timeout;
    var nextState;
    gEventQueue.forEach(function (event, i) {
      var cmds = {};
      event.updateFn(cmds);
      if (isU(nextState)) {
        nextState = self.ProcessOneInput(cmds);
      }
    });
    return nextState;
  };
  self.ProcessOneInput = function (cmds) {
    var advance = self.goOn && gGameTime - self.started > kUITimeout;
    if (!advance && self.goOn) {
      var ud = isAnyUpOrDownPressed();
      var ap = isAnyActivatePressed(cmds);
      var apd = isAnyPointerDown();
      advance = ud || ap || apd;
    }
    if (advance) {
      gLevelIndex += 1;
      if (is1P()) {
        return kLevelFinChoose;
      } else {
        return kGameOverSummary;
      }
    }
    return undefined;
  };
  self.Draw = function () {
    is1P() ? self.DrawSinglePlayer() : self.DrawTwoPlayer();
    self.DrawLevelHighScore();
  };
  self.DrawLevelHighScore = function () {
    var hiMsg = self.isNewHighScore ? "NEW LEVEL HIGH: ".concat(self.levelHigh) : undefined;
    if (hiMsg) {
      Cxdo(function () {
        gCx.fillStyle = ColorCycle();
        DrawText(hiMsg, "center", gw(0.5), gh(0.65), gSmallFontSizePt);
      });
    }
  };
  self.DrawSinglePlayer = function () {
    Cxdo(function () {
      gCx.fillStyle = RandomGreen();
      DrawText("LEVEL ".concat(self.levelIndex, " WON!"), "center", gw(0.5), gh(0.55), gBigFontSizePt);
      DrawText("P1 LVL: ".concat(gP1Score.level), ForP1Side("left", "right"), ForP1Side(gw(0.2), gw(0.8)), gh(0.2), gSmallFontSizePt);
      DrawText("P2 LVL: ".concat(gP2Score.level), ForP2Side("left", "right"), ForP2Side(gw(0.2), gw(0.8)), gh(0.2), gSmallFontSizePt);
      if (self.levelIndex > 1) {
        DrawText("P1 GAME: ".concat(gP1Score.game), ForP1Side("left", "right"), ForP1Side(gw(0.2), gw(0.8)), gh(0.3), gSmallFontSizePt);
        DrawText("P2 GAME: ".concat(gP2Score.game), ForP2Side("left", "right"), ForP2Side(gw(0.2), gw(0.8)), gh(0.3), gSmallFontSizePt);
      }
      if (self.goOn) {
        gCx.fillStyle = RandomYellowSolid();
        DrawText("NEXT", "center", gw(0.5), gh(0.8), gRegularFontSizePt);
      }
    });
  };
  self.DrawTwoPlayer = function () {
    Cxdo(function () {
      gCx.fillStyle = RandomForColor(greenSpec);
      var msg = "TIE!";
      if (gP1Score.level != gP2Score.level) {
        if (gP1Score.level > gP2Score.level) {
          msg = "PLAYER 1 WINS!";
        } else {
          msg = "PLAYER 2 WINS!";
        }
      }
      DrawText(msg, "center", gw(0.5), gh(0.5), gBigFontSizePt);
      if (self.goOn) {
        gCx.fillStyle = RandomForColor(yellowSpec);
        DrawText("NEXT", "center", gw(0.5), gh(0.8), gRegularFontSizePt);
      }
    });
  };
  self.Init();
}

/*class*/
function LevelFinChooseState() {
  var self = this;
  self.Init = function () {
    ResetInput();

    // might be empty if you already got them all!
    var p1Rewards = ChooseRewards(gP1PillState);
    var p2Rewards = ChooseRewards(gP2PillState);

    // theoretically the # of rewards should match because
    // all paddles are forced to get 1 reward at the end
    // of every level. it is only the order that might be different.
    // sure wish i could unit test this ha ha ha.
    Assert(p1Rewards.length === p2Rewards.length);
    // the ui expects at most 2.
    Assert(p1Rewards.length <= 2);
    var count = p1Rewards.length;
    self.timeout = 1000 * (count === 1 ? 5 : gDebug ? 100 : 10);
    self.started = gGameTime;

    // skip the whole sceen if all pills have been rewarded.
    self.goOn = count === 0;
    self.updateInputs = true;
    self.p1Specs = [];
    self.p2Specs = [];
    var sy = gHeight * 0.45 / count;
    // ugly: handle y-centering the last choose from only 1 final pill.
    var s0 = count === 1 ? gh(0.55) : gh(0.6) - sy / 2;
    for (var i = 0; i < count; ++i) {
      var cy = s0 + sy * i;
      var p1x = gw(ForP1Side(0.25, 0.75));
      self.p1Specs.push({
        pid: p1Rewards[i],
        cx: p1x,
        cy: cy
      });
    }
    for (var _i2 = 0; _i2 < count; ++_i2) {
      var _cy = s0 + sy * _i2;
      var p2x = gw(ForP2Side(0.25, 0.75));
      self.p2Specs.push({
        pid: p2Rewards[_i2],
        cx: p2x,
        cy: _cy
      });
    }
    self.p1Highlight = 0;
    self.p2Highlight = is1P() ? gR.RandomRangeInt(0, count - 1) : 0;
  };
  self.RemainingTime = function () {
    return self.started + self.timeout - gGameTime;
  };
  self.Step = function (dt) {
    var nextState;
    self.updateInput = self.RemainingTime() >= 0;
    self.goOn |= self.RemainingTime() <= -3000; // neg seconds to show final choice.
    if (self.goOn) {
      self.SaveHighlighted();
      nextState = kGetReady;
    } else if (self.updateInput) {
      self.StepCpu();
      gEventQueue.forEach(function (event, i) {
        var cmds = {};
        event.updateFn(cmds);
        if (isU(nextState)) {
          nextState = self.ProcessOneInput(cmds);
        }
      });
    }
    return nextState;
  };
  self.StepCpu = function () {
    if (is1P()) {
      var r = self.RemainingTime();
      var b = gR.RandomBool(T01(r, self.timeout * 1.5) * 0.1);
      if (b) {
        self.p2Highlight = (self.p2Highlight + 1) % self.p2Specs.length;
      }
    }
  };
  self.SaveHighlighted = function () {
    Assert(self.p1Specs.length <= 2);
    Assert(self.p2Specs.length <= 2);
    if (self.p1Specs.length > 0) {
      var _self$p1Specs$splice;
      var p1yes = (_self$p1Specs$splice = self.p1Specs.splice(self.p1Highlight, 1)) == null ? void 0 : _self$p1Specs$splice[0];
      Assert(exists(p1yes));
      gP1PillState.deck.unshift(p1yes.pid);
      if (self.p1Specs.length > 0) {
        var p1no = self.p1Specs.shift();
        Assert(exists(p1no));
        gP1PillState.remaining.push(p1no.pid);
      }
    }
    if (self.p2Specs.length > 0) {
      var _self$p2Specs$splice;
      var p2yes = (_self$p2Specs$splice = self.p2Specs.splice(self.p2Highlight, 1)) == null ? void 0 : _self$p2Specs$splice[0];
      Assert(exists(p2yes));
      gP2PillState.deck.unshift(p2yes.pid);
      if (self.p2Specs.length > 0) {
        var p2no = self.p2Specs.shift();
        Assert(exists(p2no));
        gP2PillState.remaining.push(p2no.pid);
      }
    }
  };
  self.ProcessOneInput = function () {
    var _self$ProcessTouch, _self$ProcessTouch2;
    if (self.goOn) {
      return;
    }
    self.ProcessButtons();
    self.p1Highlight = (_self$ProcessTouch = self.ProcessTouch(gP1Target, self.p1Specs)) != null ? _self$ProcessTouch : self.p1Highlight;
    self.p2Highlight = (_self$ProcessTouch2 = self.ProcessTouch(gP2Target, self.p2Specs)) != null ? _self$ProcessTouch2 : self.p2Highlight;
  };
  self.ProcessButtons = function () {
    if (isP1UpKey(true) || isGamepad1Up()) {
      self.p1Highlight = Math.max(0, self.p1Highlight - 1);
    }
    if (isP1DownKey(true) || isGamepad1Down()) {
      self.p1Highlight = Math.min(self.p1Specs.length - 1, self.p1Highlight + 1);
    }
    if (!is1P()) {
      if (isP2UpKey(true) || isGamepad2Up()) {
        self.p2Highlight = Math.max(0, self.p2Highlight - 1);
      }
      if (isP2DownKey(true) || isGamepad2Down()) {
        self.p2Highlight = Math.min(self.p2Specs.length - 1, self.p2Highlight + 1);
      }
    }
    return undefined;
  };
  self.ProcessTouch = function (target, specs) {
    for (var i = 0; i < specs.length; ++i) {
      var spec = specs[i];
      var oy = sy1(20);
      var y0 = spec.cy - oy;
      var y1 = spec.cy + oy;
      var hit = target.isDown() ? target.position.y >= y0 && target.position.y <= y1 : false;
      if (hit) {
        return i;
      }
    }
    return undefined;
  };
  self.Draw = function () {
    if (!self.goOn) {
      self.DrawText();
      self.DrawPills();
      if (self.updateInput) {
        DrawMoveTargets();
      }
    }
  };
  self.DrawText = function () {
    Cxdo(function () {
      gCx.fillStyle = RandomGreen();
      var countdown = Math.ceil(Math.max(0, self.RemainingTime() / 1000));
      var text = countdown > 0 ? "CHOOSE YOUR PRIZE!" : "CHOICE SAVED!";
      DrawText(text, "center", gw(0.5), gh(0.2), gRegularFontSizePt);
      if (countdown > 0) {
        var timeStr = String(countdown);
        DrawText(timeStr, "center", gw(0.5), gh(0.4), gBigFontSizePt);
      }
    });
  };
  self.DrawPills = function () {
    self.DrawPillsColumn(gP1Side, self.p1Specs, self.p1Highlight, "P1");
    self.DrawPillsColumn(gP2Side, self.p2Specs, self.p2Highlight, is1P() ? "GPT" : "P2");
  };
  self.DrawPillsColumn = function (side, specs, highlight, label) {
    Cxdo(function () {
      for (var i = 0; i < specs.length; ++i) {
        var spec = specs[i];
        var cx = spec.cx;
        var cy = spec.cy;
        var highlighted = highlight === i;
        if (self.updateInput || highlighted) {
          self.DrawPill(side, spec, highlighted);
          if (highlighted) {
            self.DrawArrow(side, cx, cy, label);
          }
        }
      }
    });
  };
  self.DrawPill = function (side, spec, highlighted) {
    var whscale = 1;
    var pid = spec.pid;
    var _gPillInfo$pid2 = gPillInfo[pid],
      name = _gPillInfo$pid2.name,
      drawer = _gPillInfo$pid2.drawer,
      wfn = _gPillInfo$pid2.wfn,
      hfn = _gPillInfo$pid2.hfn;
    var width = wfn() * whscale;
    var height = hfn() * whscale;
    var x = spec.cx - width / 2;
    var y = spec.cy - height / 2;
    drawer(side, {
      x: x,
      y: y,
      width: width,
      height: height
    }, 1);
    Cxdo(function () {
      gCx.fillStyle = RandomBlue();
      DrawText(name, "center", spec.cx, spec.cy + height / 2 + sy1(20), gSmallestFontSizePt);
    });
  };
  self.DrawArrow = function (side, x, y, label) {
    Cxdo(function () {
      gCx.fillStyle = RandomGreen();
      var mxo = gw(0.07);
      var ox = sx1(10);
      var oy = sy1(5);
      if (isU(side) || side === "right") {
        var axm = x + mxo;
        gCx.beginPath();
        gCx.moveTo(axm, y);
        gCx.lineTo(axm + ox, y - oy);
        gCx.lineTo(axm + ox, y + oy);
        gCx.lineTo(axm, y);
        gCx.fill();
        DrawText(label, OtherSide(side), axm + ox * 1.8, y + sy1(8), gReducedFontSizePt);
      } else {
        // left
        var axm = x - mxo;
        gCx.beginPath();
        gCx.moveTo(axm, y);
        gCx.lineTo(axm - ox, y - oy);
        gCx.lineTo(axm - ox, y + oy);
        gCx.lineTo(axm, y);
        gCx.fill();
        DrawText(label, OtherSide(side), axm - ox * 1.8, y + sy1(8), gReducedFontSizePt);
      }
    });
  };
  self.Init();
}

/*class*/
function GameOverState() {
  var self = this;
  self.Init = function () {
    ResetInput();
    self.timeout = 1000 * 2;
    self.started = gGameTime;
    self.goOn = false;
    PlayGameOver();
  };
  self.Step = function () {
    self.goOn = gGameTime - self.started > self.timeout;
    var nextState;
    gEventQueue.forEach(function (event, i) {
      var cmds = {};
      event.updateFn(cmds);
      if (isU(nextState)) {
        nextState = self.ProcessOneInput(cmds);
      }
    });
    return nextState;
  };
  self.ProcessOneInput = function (cmds) {
    var advance = gGameTime - self.started > kUITimeout;
    if (!advance && self.goOn) {
      var ud = isAnyUpOrDownPressed();
      var ap = isAnyActivatePressed(cmds);
      var apd = isAnyPointerDown();
      advance = ud || ap || apd;
    }
    // note: game over summary might immediately terminate itself.
    return advance ? kGameOverSummary : undefined;
  };
  self.Draw = function () {
    Cxdo(function () {
      gCx.globalAlpha = 0.1;
      gCx.drawImage(gCanvas2, 0, 0);
      gCx.globalAlpha = 1;
      gCx.fillStyle = RandomForColor(redSpec);
      DrawText("GAME OVER", "center", gw(0.5), gh(0.55), gBigFontSizePt);
      if (self.goOn) {
        gCx.fillStyle = RandomForColor(yellowSpec);
        DrawText("NEXT", "center", gw(0.5), gh(0.8), gRegularFontSizePt);
      }
    });
  };
  self.Init();
}

/*class*/
function GameOverSummaryState() {
  var self = this;
  self.Init = function () {
    ResetInput();
    self.timeoutMsg = 2000;
    self.started = gGameTime;
    self.maxScore = is1P() ? gP1Score.game : Math.max(gP1Score.game, gP2Score.game);
    self.isNewHighScore = self.maxScore > gHighScore;
    if (self.isNewHighScore) {
      gHighScore = self.maxScore;
      SaveLocal(LocalStorageKeys.gameHighScore, gHighScore);
    }
  };
  self.Step = function (dt) {
    self.goOn = gGameTime - self.started > self.timeoutMsg;
    var nextState;
    gEventQueue.forEach(function (event, i) {
      var cmds = {};
      event.updateFn(cmds);
      if (isU(nextState)) {
        nextState = self.ProcessOneInput(cmds);
      }
    });
    if (exists(nextState)) {
      PlayBlip();
    }
    return nextState;
  };
  self.ProcessOneInput = function (cmds) {
    var advance = self.goOn && gGameTime - self.started > kUITimeout;
    if (!advance && self.goOn) {
      var ud = isAnyUpOrDownPressed();
      var ap = isAnyActivatePressed(cmds);
      var apd = isAnyPointerDown();
      advance = ud || ap || apd;
    }
    // note: whatever the non-undefined nextState is, it must ResetP1Side() and gP{1,2}Pointer.Reset().
    return advance ? kTitle : undefined;
  };
  self.Draw = function () {
    is1P() ? self.DrawSinglePlayer() : self.DrawTwoPlayer();
    self.DrawGoOn();
  };
  self.DrawGoOn = function () {
    if (self.goOn) {
      gCx.fillStyle = RandomForColor(yellowSpec);
      DrawText("RETURN", "center", gw(0.5), gh(0.8), gRegularFontSizePt);
    }
  };
  self.DrawSinglePlayer = function () {
    Cxdo(function () {
      gCx.fillStyle = RandomForColor(magentaSpec);
      DrawText("P1 GAME: ".concat(gP1Score.game), ForP1Side("left", "right"), ForP1Side(gw(0.2), gw(0.8)), gh(0.2), gSmallFontSizePt);
      DrawText("P2 GAME: ".concat(gP2Score.game), ForP2Side("left", "right"), ForP2Side(gw(0.2), gw(0.8)), gh(0.2), gSmallFontSizePt);
      var msg = "FINAL SCORE: ".concat(gP1Score.game);
      DrawText(msg, "center", gw(0.5), gh(0.5), gRegularFontSizePt);
      if (self.isNewHighScore) {
        gCx.fillStyle = ColorCycle();
        DrawText("NEW HIGH: ".concat(self.maxScore), "center", gw(0.5), gh(0.65), gSmallFontSizePt);
      }
    });
  };
  self.DrawTwoPlayer = function () {
    Cxdo(function () {
      // match: GameState.DrawScoreHeader() et. al.
      gCx.fillStyle = RandomGreen(0.3);
      var p1a = ForP1Side("left", "right");
      var p1x = ForP1Side(gw(0.2), gw(0.8));
      DrawText("P1: ".concat(gP1Score.game), p1a, p1x, gh(0.22), gRegularFontSizePt);
      var p2a = ForP2Side("left", "right");
      var p2x = ForP2Side(gw(0.2), gw(0.8));
      DrawText("P2: ".concat(gP2Score.game), p2a, p2x, gh(0.22), gRegularFontSizePt);
      gCx.fillStyle = RandomBlue();
      DrawText("*** WINNER ***", "center", gw(0.5), gh(0.35), gReducedFontSizePt);
      gCx.fillStyle = RandomGreen();
      DrawText(
      // leading space to visually center player 1.
      gP1Score.game === gP2Score.game ? "TIE!" : gP1Score.game > gP2Score.game ? " PLAYER 1" : "PLAYER 2", "center", gw(0.5), gh(0.55), gBigFontSizePt);
      if (self.isNewHighScore) {
        gCx.fillStyle = ColorCycle();
        DrawText("NEW HIGH: ".concat(self.maxScore), "center", gw(0.5), gh(0.65), gSmallFontSizePt);
      }
    });
  };
  self.Init();
}

/*class*/
function DebugState() {
  var self = this;
  self.Init = function () {};
  self.Step = function () {};
  self.Draw = function () {
    Cxdo(function () {
      gCx.fillStyle = RandomForColor(blueSpec, 0.3);
      DrawText("D E B U G", "center", gw(0.5), gh(0.8), gBigFontSizePt);
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
      updateFn: function updateFn() {
        state.Reset();
        state.Update({
          dz: kJoystickDeadZone
        });
        pointer.ClearY();
      }
    });
  } else if (v < 0 && !state.$.up) {
    gEventQueue.push({
      event_type: kEventGamepadJoystickMove,
      updateFn: function updateFn() {
        state.Set({
          up: true,
          down: false,
          dz: kJoystickDeadZone / 2
        });
        pointer.ClearY();
      }
    });
  } else if (v > 0 && !state.$.down) {
    gEventQueue.push({
      event_type: kEventGamepadJoystickMove,
      updateFn: function updateFn() {
        state.Set({
          up: false,
          down: true,
          dz: kJoystickDeadZone / 2
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
      updateFn: function updateFn() {
        state.Update({
          up: true
        });
      }
    });
    return;
  } else {
    // this flooding is sad but otherwise we have a race condtition.
    gEventQueue.push({
      type: kEventGamepadButtonReleased,
      updateFn: function updateFn() {
        state.Update({
          up: false
        });
      }
    });
  }
  if (isButtonPressed(gamepad, StandardMapping.Button.D_PAD_BOTTOM)) {
    gEventQueue.push({
      type: kEventGamepadButtonPressed,
      updateFn: function updateFn() {
        state.Update({
          down: true
        });
      }
    });
    return;
  } else {
    // this flooding is sad but otherwise we have a race condtition.
    gEventQueue.push({
      type: kEventGamepadButtonReleased,
      updateFn: function updateFn() {
        state.Update({
          down: false
        });
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
  if (isButtonPressed(gamepad, 8) || isButtonPressed(gamepad, 9) || isButtonPressed(gamepad, 16)) {
    gEventQueue.push({
      type: kEventGamepadButtonPressed,
      updateFn: function updateFn() {
        state.Update({
          menu: true
        });
      }
    });
    return;
  } else {
    // this flooding is sad but otherwise we have a race condtition.
    gEventQueue.push({
      type: kEventGamepadButtonReleased,
      updateFn: function updateFn() {
        state.Update({
          menu: false
        });
      }
    });
  }

  // buttons 0, 1, 2, 3 are the "right cluster"
  // which are to be "activate".
  if (isButtonPressed(gamepad, 0) || isButtonPressed(gamepad, 1) || isButtonPressed(gamepad, 2) || isButtonPressed(gamepad, 3)) {
    gEventQueue.push({
      type: kEventGamepadButtonPressed,
      updateFn: function updateFn() {
        state.Update({
          activate: true
        });
      }
    });
    return;
  } else {
    // this flooding is sad but otherwise we have a race condtition.
    gEventQueue.push({
      type: kEventGamepadButtonReleased,
      updateFn: function updateFn() {
        state.Update({
          activate: false
        });
      }
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
  } else if (gGamepad2 == undefined) {
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
  } else if (e.gamepad.gamepad == gGamepad2) {
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
  var x = e.clientX - cvx;
  var y = e.clientY - cvy;
  Assert(exists(updateFn), "PointerProcess");
  updateFn(x, y);
}
function MouseDown(e) {
  e.preventDefault();
  if (e.button === 0) {
    PointerProcess(e, function (x, y) {
      LatchP1Side(x < gw(0.5) ? "left" : "right");
      gEventQueue.push({
        type: kEventPointerDown,
        updateFn: function updateFn() {
          gP1Target.OnDown(kMousePointerId, x, y);
          gP2Target.OnDown(kMousePointerId, x, y);
        }
      });
    });
  }
}
function MouseMove(e) {
  e.preventDefault();
  PointerProcess(e, function (x, y) {
    gEventQueue.push({
      type: kEventPointerMove,
      updateFn: function updateFn() {
        gP1Target.OnMove(kMousePointerId, x, y);
        gP2Target.OnMove(kMousePointerId, x, y);
      }
    });
  });
}
function MouseUp(e) {
  e.preventDefault();
  if (e.button === 0) {
    PointerProcess(e, function (x, y) {
      gEventQueue.push({
        type: kEventPointerUp,
        updateFn: function updateFn() {
          gP1Target.OnUp(kMousePointerId);
          gP2Target.OnUp(kMousePointerId);
        }
      });
    });
  }
}
function TouchStart(e) {
  e.preventDefault();
  var _loop = function _loop() {
    var t = e.touches[i];
    var pid = t.identifier;
    PointerProcess(t, function (x, y) {
      LatchP1Side(x < gw(0.5) ? "left" : "right");
      gEventQueue.push({
        type: kEventPointerDown,
        updateFn: function updateFn() {
          gP1Target.OnDown(pid, x, y);
          gP2Target.OnDown(pid, x, y);
        }
      });
    });
  };
  for (var i = 0; i < e.touches.length; ++i) {
    _loop();
  }
}
function TouchMove(e) {
  e.preventDefault();
  var _loop2 = function _loop2() {
    var t = e.touches[i];
    var pid = t.identifier;
    PointerProcess(t, function (x, y) {
      gEventQueue.push({
        type: kEventPointerMove,
        updateFn: function updateFn() {
          gP1Target.OnMove(pid, x, y);
          gP2Target.OnMove(pid, x, y);
        }
      });
    });
  };
  for (var i = 0; i < e.touches.length; ++i) {
    _loop2();
  }
}
function TouchEnd(e) {
  e.preventDefault();
  var _loop3 = function _loop3() {
    var t = e.changedTouches[i];
    var pid = t.identifier;
    PointerProcess(e, function (x, y) {
      gEventQueue.push({
        type: kEventPointerUp,
        updateFn: function updateFn() {
          gP1Target.OnUp(pid);
          gP2Target.OnUp(pid);
        }
      });
    });
  };
  for (var i = 0; i < e.changedTouches.length; ++i) {
    _loop3();
  }
}
function ResetGlobalStorage() {
  gPuckPool = new Pool(kPuckPoolSize, function () {
    return new Puck();
  });
  gPucks = {
    A: new ReuseArray(kPuckPoolSize),
    B: new ReuseArray(kPuckPoolSize)
  };
  gSparkPool = new Pool(kSparkPoolSize, function () {
    return new Spark();
  });
  gSparks = {
    A: new ReuseArray(kSparkPoolSize),
    B: new ReuseArray(kSparkPoolSize)
  };
}
function OnOrientationChange() {
  OnResize();
}
function OnBlur() {
  if (exists(gLifecycle)) {
    if (gLifecycle.state == kGame) {
      if (exists(gLifecycle.handler)) {
        gLifecycle.handler.Pause();
      }
    }
  }
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
    } else if (!gResizing && kResizeAllowedStates.includes(gLifecycle.state)) {
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
    h = w * 1 / kAspectRatio;
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
  gCanvas = document.getElementById(kCanvasName);
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
  handlerMap[kRoot] = function () {
    return new RootState(kWarning);
  };
  handlerMap[kWarning] = function () {
    return new WarningState();
  };
  handlerMap[kTitle] = function () {
    return new TitleState();
  };
  handlerMap[kGetReady] = function () {
    return new GetReadyState();
  };
  handlerMap[kChargeUp] = function () {
    return new ChargeUpState();
  };
  handlerMap[kGame] = function () {
    return new GameState();
  };
  handlerMap[kLevelFin] = function () {
    return new LevelFinState();
  };
  handlerMap[kLevelFinChoose] = function () {
    return new LevelFinChooseState();
  };
  handlerMap[kGameOver] = function () {
    return new GameOverState();
  };
  handlerMap[kGameOverSummary] = function () {
    return new GameOverSummaryState();
  };
  if (exists(gLifecycle)) {
    gLifecycle.Quit();
  }
  gLifecycle = new Lifecycle(handlerMap);
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
  document.addEventListener('pointerstart', function (e) {
    e.preventDefault();
  });
  document.addEventListener('pointermove', function (e) {
    e.preventDefault();
  });
  document.addEventListener('pointerend', function (e) {
    e.preventDefault();
  });
  document.addEventListener('pointercancel', function (e) {
    e.preventDefault();
  });
  window.addEventListener('keydown', function (e) {
    if (e.repeat) {
      return;
    }

    // my bad. keyCodes do not respect e.g. QWERTZ vs. QWERTY, they assume QWERTY.
    // that sort of works for WASD pattern, but maybe not for all debug commands.

    // assumes w/s is on the left hand side of keyboard,
    // arrow up/down are on the right hand side.

    if (e.keyCode == 13 || e.keyCode == 32) {
      // enter, ' '
      e.preventDefault();
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn(cmds) {
          cmds.activate = true;
        }
      });
    }
    if (e.keyCode == 87) {
      // 'w'
      e.preventDefault();
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn() {
          gP1Target.ClearY();
          LatchP1Side("left");
          LeftKeys().Update({
            up: true
          });
        }
      });
    }
    if (e.keyCode == 83) {
      // s
      e.preventDefault();
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn() {
          gP1Target.ClearY();
          LatchP1Side("left");
          LeftKeys().Update({
            down: true
          });
        }
      });
    }
    if (e.keyCode == 38 || e.keyCode == 73) {
      // arrow up, i
      e.preventDefault();
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn() {
          gP2Target.ClearY();
          LatchP1Side("right");
          RightKeys().Update({
            up: true
          });
        }
      });
    }
    if (e.keyCode == 40 || e.keyCode == 75) {
      // arrow down, k
      e.preventDefault();
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn() {
          gP2Target.ClearY();
          LatchP1Side("right");
          RightKeys().Update({
            down: true
          });
        }
      });
    }
    if (e.keyCode == 27) {
      // esc
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn(cmds) {
          cmds.menu = true;
        }
      });
    }
    if (e.keyCode == 80 || e.keyCode == 19) {
      // 'p', 'pause'
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn(cmds) {
          cmds.pause = true;
        }
      });
    }
    if (e.keyCode == 49) {
      // '1'
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn(cmds) {
          cmds.singlePlayer = true;
        }
      });
    }
    if (e.keyCode == 50) {
      // '2'
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn(cmds) {
          cmds.doublePlayer = true;
        }
      });
    }
    if (e.keyCode == 187 || e.keyCode == 61) {
      // '+' and '=', vs. firefox (?!)
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn(cmds) {
          if (gDebug) {
            cmds.addPuck = true;
          }
        }
      });
    }
    if (e.keyCode == 78) {
      // 'n'
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn(cmds) {
          if (gDebug) {
            cmds.step = true;
          }
        }
      });
    }
    if (e.keyCode == 81) {
      // 'q'
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn(cmds) {
          if (gDebug) {
            cmds.gameOver = true;
          }
        }
      });
    }
    if (e.keyCode == 66) {
      // 'b'
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn(cmds) {
          if (gDebug) {
            cmds.spawnPill = true;
          }
        }
      });
    }
    if (e.keyCode == 69) {
      // 'e'
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn(cmds) {
          if (gDebug) {
            cmds.nextMusic = true;
          }
        }
      });
    }
    if (e.keyCode == 46) {
      // delete
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn(cmds) {
          cmds.clearHighScore = true;
        }
      });
    }
  });

  // todo: fix which things should/not support continuous pressing
  // ie everything should clear the keydown as soon as the keyup is
  // consumed, the only exception being the game state for up/down.
  window.addEventListener('keyup', function (e) {
    if (e.keyCode == 13 || e.keyCode == 32) {
      // enter, ' '
      e.preventDefault();
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn(cmds) {
          cmds.activate = false;
        }
      });
    }
    if (e.keyCode == 87) {
      // 'w'
      e.preventDefault();
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn() {
          LeftKeys().Update({
            up: false
          });
        }
      });
    }
    if (e.keyCode == 83) {
      // 's'
      e.preventDefault();
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn() {
          LeftKeys().Update({
            down: false
          });
        }
      });
    }
    if (e.keyCode == 38 || e.keyCode == 73) {
      // arrow up, i
      e.preventDefault();
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn() {
          RightKeys().Update({
            up: false
          });
        }
      });
    }
    if (e.keyCode == 40 || e.keyCode == 75) {
      // arrow down, k
      e.preventDefault();
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn() {
          RightKeys().Update({
            down: false
          });
        }
      });
    }
    if (e.keyCode == 27) {
      // esc
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn(cmds) {
          cmds.menu = false;
        }
      });
    }

    // pause only works in game state, and there it == menu key.
    if (e.keyCode == 80 || e.keyCode == 19) {
      // 'p', 'pause'
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn(cmds) {
          cmds.pause = false;
        }
      });
    }
    if (e.keyCode == 187) {
      // '+' and '='
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn(cmds) {
          if (gDebug) {
            cmds.addPuck = false;
          }
        }
      });
    }
    if (e.keyCode == 78) {
      // 'n'
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn(cmds) {
          if (gDebug) {
            cmds.step = false;
          }
        }
      });
    }
    if (e.keyCode == 81) {
      // 'q'
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn(cmds) {
          if (gDebug) {
            cmds.gameOver = false;
          }
        }
      });
    }
    if (e.keyCode == 66) {
      // 'b'
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn(cmds) {
          if (gDebug) {
            cmds.spawnPill = false;
          }
        }
      });
    }
    if (e.keyCode == 69) {
      // 'e'
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn(cmds) {
          if (gDebug) {
            cmds.nextMusic = false;
          }
        }
      });
    }
    if (e.keyCode == 46) {
      // delete
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn(cmds) {
          if (gDebug) {
            cmds.clearHighScore = false;
          }
        }
      });
    }
  });
  window.addEventListener('orientationChange', OnOrientationChange, false);
  window.addEventListener('resize', OnResize, false);
  window.addEventListener('blur', OnBlur, false);
}
window.addEventListener('load', function () {
  Start();
  InitEvents();
}, false);