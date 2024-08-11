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

var gDebug = true;
var gDebugDrawList = [];
var gShowToasts = gDebug;
var kCanvasName = "canvas"; // match: index.html
var gLifecycle;
var gSinglePlayer = LoadLocal(LocalStorageKeys.singlePlayer, true);
var kScoreIncrement = 1;
var gP1Score = 0;
var gP2Score = 0;
var gP1Wins = 0;
var gP2Wins = 0;
var k2PWinBy = 3;
function is2PGameOver() {
  return Math.abs(gP1Wins - gP2Wins) >= k2PWinBy;
}

// todo: the game mode stuff is a big ball of mud within
// the larger death star of mud that is all of this code.
// enum, mutually exclusive.
var kGameModeRegular = "regular";
var kGameModeHard = "hard";
var kGameModeZen = "zen";
var gGameMode = LoadLocal(LocalStorageKeys.gameMode, kGameModeRegular);
// code smell: sentinel values, -1 is attract, -2 is zen. 
var kAttractLevelIndex = -1;
var kZenLevelIndex = -2;
// levels are 1-based.
// todo: gLevelIndex is an overloaded mess.
var gLevelIndex = gGameMode === kGameModeZen ? kZenLevelIndex : 1;
function ForGameMode(regular, other1, other2) {
  if (gGameMode === kGameModeRegular) {
    return regular;
  } else if (gGameMode === kGameModeHard) {
    return exists(other2) ? other1 : regular;
  } else if (gGameMode === kGameModeZen) {
    return exists(other2) ? other2 : other1;
  }
}
function SetGameMode(mode) {
  Assert(mode === kGameModeRegular || mode === kGameModeHard || mode === kGameModeZen, mode);
  gGameMode = mode;
  ForGameMode(function () {
    return gLevelIndex = 1;
  }, function () {
    return gLevelIndex = kZenLevelIndex;
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
var kFPS = 30;
var kTimeStep = 1000 / kFPS;
var kMaybeWasPausedInTheDangedDebuggerMsec = 1000 * 1; // whatevez!
var gLevelTime = 0;
var gLastFrameTime = gLevelTime;
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
  gPaddleStepSize = gPaddleHeight * 0.2;
  gPuckHeight = gPuckWidth = gh(0.012);
  gPauseCenterX = gw(0.54);
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
var kMaxSparkFrame = 10;
var kEjectCountThreshold = 100;
var kEjectSpeedCountThreshold = 90;
var kPuckPoolSize = 500;
var kSparkPoolSize = 500;
var kBarriersArrayInitialSize = 4;
var kXtrasArrayInitialSize = 6;

// prevent pills from showing up too often, or too early - but not too late.
var PillSpawnCooldownFn = function PillSpawnCooldownFn() {
  return ForGameMode(function () {
    return 1000 * 5;
  }, function () {
    return 1000 * 10;
  }, function () {
    return 1000 * 20;
  })();
};
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
var gPNoneKeys = new WrapState({
  resetFn: noKeysState
});
function isUpOrDownKeyPressed() {
  return gP1Keys.$.up || gP1Keys.$.down || gP2Keys.$.up || gP2Keys.$.down;
}
function LeftKeys() {
  return ForSide(gP1Side, gP1Keys, gP2Keys);
}
function RightKeys() {
  return ForOtherSide(gP1Side, gP1Keys, gP2Keys);
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
  return !!gGamepad1Buttons.$.up || !!gGamepad1Sticks.$.up;
}
function isGamepad1Down() {
  return !!gGamepad1Buttons.$.down || !!gGamepad1Sticks.$.down;
}
function isGamepad2Up() {
  return !!gGamepad2Buttons.$.up || !!gGamepad2Sticks.$.up;
}
function isGamepad2Down() {
  return !!gGamepad2Buttons.$.down || !!gGamepad2Sticks.$.down;
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
var gR = new Random(0x1BADB002);

// ----------------------------------------

function GameTime01(period) {
  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : gLevelTime;
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
    ry = props.ry;
  for (var s = 0; s < count; s++) {
    var svx = vx * gR.RandomCentered(0, rx, rx / 3);
    var svy = vy * gR.RandomCentered(0, ry, ry / 3);
    var s = gSparkPool.Alloc();
    s.PlacementInit({
      x: x,
      y: y,
      vx: svx,
      vy: svy
    });
    gSparks.A.push(s);
  }
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
var gDrawTitleLatch = new RandomLatch(0.01, 250);
function DrawTitle() {
  var flicker = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  Cxdo(function () {
    gCx.fillStyle = flicker ? RandomForColor(cyanSpec, 0.8) : rgba255s(cyanDarkSpec.regular);
    DrawText("P N 0 G S T R 0 M", "center", gw(0.5), gh(0.4), gBigFontSizePt, flicker);
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
    gCx.strokeStyle = rgba255s(white, alpha / 2);
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
    gCx.strokeStyle = rgba255s(magentaSpec.regular, alpha);
    gCx.lineWidth = 2;
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
    gCx.strokeStyle = "pink";
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
    Cxdo(function () {
      for (var i = 0; i < gDebugDrawList.length; ++i) {
        gDebugDrawList[i]();
      }
    });
    gDebugDrawList = [];
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

/*class*/
function Lifecycle(handlerMap) {
  var self = this;
  self.Init = function () {
    self.handlerMap = handlerMap;
    self.state = kRoot;
    self.handler = handlerMap[self.state]();
    self.stop = false;
    self.transitioned = false;
    self.lastTime = Date.now();
  };
  self.Quit = function () {
    self.stop = true;
  };
  self.RunLoop = function () {
    if (self.stop) {
      return;
    }
    var remainder = kTimeStep;
    var now = Date.now();
    var clockDiff = now - self.lastTime;

    // oy veh oh brother sheesh barf,
    // trying to not progress time
    // if we were stopped in the debugger.
    if (clockDiff >= kMaybeWasPausedInTheDangedDebuggerMsec) {
      self.lastTime = now;
    } else {
      var _self$handler$GetIsPa, _self$handler;
      Gamepads.poll();

      // this got complicated quickly, trying to handle time:
      // a) only stepping if enough time has really passed.
      // b) updating the screen even when paused & thus delta time is 0.

      self.lastTime = now;
      var paused = aub((_self$handler$GetIsPa = (_self$handler = self.handler).GetIsPaused) == null ? void 0 : _self$handler$GetIsPa.call(_self$handler), false);
      gGameTime += paused ? 0 : clockDiff;
      var fdt = gGameTime - gLastFrameTime;
      if (fdt < kTimeStep && !paused) {
        remainder = kTimeStep - fdt;
      } else {
        var _self$handler$GetIsPa2, _self$handler2;
        Assert(exists(self.handler), "RunLoop");
        if (self.transitioned) {
          self.handler = self.handlerMap[self.state]();
          self.transitioned = false;
        }

        // even when paused, must Step to handle input.
        // also call Draw to keep the screen in sync.
        paused = aub((_self$handler$GetIsPa2 = (_self$handler2 = self.handler).GetIsPaused) == null ? void 0 : _self$handler$GetIsPa2.call(_self$handler2), false);
        var rdt = paused ? 0 : fdt;
        var next = self.handler.Step(rdt);
        self.handler.Draw();
        if (exists(next) && next !== self.state) {
          console.log("transitioned from ".concat(self.state, " to ").concat(next));
          self.transitioned = true;
          self.state = next;
          cancelPointing();
        }
        gLastFrameTime = gGameTime;
        ++gFrameCount;
        self.DrawCRTScanlines();
        DrawDebugList();
        if (gDebug) {
          DrawBounds(0.2);
        }
        if (gShowToasts) {
          StepToasts();
        }
        UpdateLocalStorage();
        remainder = kTimeStep - (fdt - kTimeStep);
      }
    }
    setTimeout(self.RunLoop, Math.max(1, remainder));
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
    var nextState;
    gEventQueue.forEach(function (event, i) {
      var cmds = {};
      event.updateFn(cmds);
      if (isU(nextState)) {
        nextState = self.ProcessOneInput(cmds);
      }
    });
    gEventQueue = [];
    return nextState;
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
    ClearScreen();
    if (gResizing) {
      DrawResizing();
    } else {
      DrawCRTOutline();
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
    SetGameMode(gGameMode);
    self.attract = new GameState({
      isAttract: true
    });
    self.timeout = gDebug ? 1 : 1000 * 1.5;
    self.started = gGameTime;
    self.done = false;
    // at one point i guess it felt nicer to not start music immediately?
    self.musicTimer = setTimeout(BeginMusic, 1000);
    self.theMenu = self.MakeMenu();
  };
  self.MakeMenu = function () {
    return new Menu(_objectSpread({
      isHidden: false,
      OnClose: function OnClose() {
        ResetP1Side();
        // forget any extra in-menu state
        // like which button is default selected.
        self.theMenu = self.MakeMenu();
      }
    }, MakeMainMenuButtons()));
  };
  self.isLoading = function () {
    return gGameTime - self.started <= self.timeout;
  };
  self.Step = function (dt) {
    var nextState = undefined;
    self.attract.Step(dt);
    self.theMenu.Step(); // note: this doesn't process menu input, actually.
    nextState = self.ProcessAllInput();
    if (exists(nextState)) {
      clearTimeout(self.musicTimer);
      StopAudio(true);
    }
    return nextState;
  };
  self.ProcessAllInput = function () {
    var nextState;
    var hasEvents = gEventQueue.length > 0;
    if (hasEvents) {
      gEventQueue.forEach(function (event, i) {
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
  self.ProcessOneInput = function (cmds) {
    if (cmds.singlePlayer) {
      gSinglePlayer = true;
      return undefined;
    }
    if (cmds.doublePlayer) {
      gSinglePlayer = false;
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
    if (!self.isLoading() && !self.theMenu.isOpen() && (isAnyUpOrDownPressed() || isAnyActivatePressed(cmds) || isAnyPointerDown())) {
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
  self.Draw = function () {
    ClearScreen();
    if (gResizing) {
      self.started = gGameTime;
      DrawResizing();
    } else {
      DrawCRTOutline();
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
    var seconds = gDebug ? 1 : ChoosePillIDs(gLevelIndex).length === 2 ? 5 : 3;
    self.timeout = 1000 * seconds - 1;
    self.lastSec = Math.floor((self.timeout + 1) / 1000);
    self.pillIDs = ChoosePillIDs(gLevelIndex);
    PlayBlip();
  };
  self.Step = function (dt) {
    self.timeout -= dt;
    var sec = Math.floor(self.timeout / 1000);
    if (sec < self.lastSec) {
      PlayBlip();
      self.lastSec = sec;
    }
    return self.timeout > 0 ? undefined : kGame;
  };
  self.Draw = function () {
    ClearScreen();
    DrawCRTOutline();
    self.DrawText();
    self.DrawPills();
  };
  self.DrawText = function () {
    var t = Math.ceil(self.timeout / 1000);
    var zpt = MakeSplitsCount(gLevelIndex);
    Cxdo(function () {
      // match: GameState.DrawScoreHeader() et. al.
      gCx.fillStyle = RandomGreen(0.3);
      DrawText(ForSide(gP1Side, "P1", "P2"), "left", gw(0.2), gh(0.22), gRegularFontSizePt);
      DrawText(ForSide(gP1Side, "P2", "P1"), "right", gw(0.8), gh(0.22), gRegularFontSizePt);
      gCx.fillStyle = RandomGreen();
      if (gGameMode !== kGameModeZen) {
        DrawText("LEVEL ".concat(gLevelIndex), "center", gw(0.5), gh(0.3), gSmallFontSizePt);
      }
      var y = self.pillIDs.length === 0 ? gh(0.55) : gh(0.52);
      DrawText("GET READY! ".concat(t), "center", gw(0.5), y, gBigFontSizePt);
      if (exists(zpt)) {
        gCx.fillStyle = RandomForColor(cyanSpec);
        DrawText("ZERO POINT ENERGY: ".concat(zpt), "center", gw(0.5), gh(0.9), gSmallFontSizePt);
      }
    });
  };
  self.DrawPills = function () {
    // 0 pills on attract and level 1;
    // 2 pills in order for the first N levels;
    // 4 random pills thereafter.
    // all pills in zen mode so/but don't bother showing them here.
    if (gGameMode === kGameModeZen) {
      return;
    }
    if (self.pillIDs.length > 0) {
      var ty = gh(0.8);
      Cxdo(function () {
        gCx.fillStyle = RandomGreen();
        if (self.pillIDs.length <= 2) {
          DrawText("POWERUPS", "center", gw(0.5), ty, gReducedFontSizePt);
        }
        var dx = gw() / (self.pillIDs.length + 1);
        var x0 = dx;
        var scale = 1;
        for (var i = 0; i < self.pillIDs.length; ++i) {
          var pid = self.pillIDs[i];
          var _gPillInfo$pid = gPillInfo[pid],
            name = _gPillInfo$pid.name,
            drawer = _gPillInfo$pid.drawer,
            wfn = _gPillInfo$pid.wfn,
            hfn = _gPillInfo$pid.hfn;
          var width = wfn() * scale;
          var height = hfn() * scale;
          var x = x0 + dx * i;
          var oy = Math.sin(x * 10 + gGameTime / 150) * (height / 2) * 0.2;
          drawer(gP1Side,
          // just the least wrong choice for side.
          {
            x: x - width / 2,
            y: ty - height / 2 - sy(40) - oy,
            width: width,
            height: height
          }, 1);
          DrawText(name, "center", x, ty, gSmallestFontSizePt);
        }
      });
    }
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
    gMonochrome = self.isAttract; // todo: make gMonochrome local instead?
    gLevelTime = gGameTime;
    gP1Score = 0;
    gP2Score = 0;
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
    var p2label = self.isAttract || gLevelIndex > 1 ? undefined : gSinglePlayer ? "GPT" : "P2";
    ForSide(gP1Side, function () {
      // p1 is always a human player.
      // p2 is either cpu or human.
      self.paddleP1 = new Paddle({
        isPlayer: !self.isAttract,
        side: "left",
        x: lp.x,
        y: lp.y,
        width: gPaddleWidth,
        height: gPaddleHeight,
        label: p1label,
        isSplitter: !self.isAttract,
        keyStates: gSinglePlayer ? [gP1Keys, gP2Keys] : [gP1Keys],
        buttonState: gGamepad1Buttons,
        stickState: gGamepad1Sticks,
        target: gP1Target
      });
      self.paddleP2 = new Paddle({
        isPlayer: !self.isAttract && !gSinglePlayer,
        side: "right",
        x: rp.x,
        y: rp.y,
        width: gPaddleWidth,
        height: gPaddleHeight,
        label: p2label,
        isSplitter: !self.isAttract,
        isPillSeeker: true,
        keyStates: gSinglePlayer ? [gPNoneKeys] : [gP2Keys],
        buttonState: gGamepad2Buttons,
        stickState: gGamepad2Sticks,
        target: gP2Target
      });
    }, function () {
      self.paddleP1 = new Paddle({
        isPlayer: !self.isAttract,
        side: "right",
        x: rp.x,
        y: rp.y,
        width: gPaddleWidth,
        height: gPaddleHeight,
        label: p1label,
        isSplitter: !self.isAttract,
        keyStates: gSinglePlayer ? [gP1Keys, gP2Keys] : [gP1Keys],
        buttonState: gGamepad1Buttons,
        stickState: gGamepad1Sticks,
        target: gP1Target
      });
      self.paddleP2 = new Paddle({
        isPlayer: !self.isAttract && !gSinglePlayer,
        side: "left",
        x: lp.x,
        y: lp.y,
        width: gPaddleWidth,
        height: gPaddleHeight,
        label: p2label,
        isSplitter: !self.isAttract,
        isPillSeeker: true,
        keyStates: gSinglePlayer ? [gPNoneKeys] : [gP2Keys],
        buttonState: gGamepad2Buttons,
        stickState: gGamepad2Sticks,
        target: gP2Target
      });
    })();
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
  self.MakeMenu = function () {
    return new Menu(_objectSpread({
      isHidden: true,
      OnClose: function OnClose() {
        self.paused = false;
        // forget any extra in-menu state
        // like which button is default seleted.
        self.theMenu = self.MakeMenu();
      }
    }, MakeGameMenuButtons({
      OnQuit: function OnQuit() {
        self.quit = true;
      }
    })));
  };
  self.MakeLevel = function () {
    Assert(exists(self.paddleP1));
    Assert(exists(self.paddleP2));
    if (self.isAttract) {
      self.level = MakeAttract(self.paddleP1, self.paddleP2);
    } else if (gGameMode === kGameModeZen) {
      self.level = MakeZen(self.paddleP1, self.paddleP2);
    } else {
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
    //logOnDelta("maxVX", self.maxVX, 1);
    self.MaybeSpawnPills(dt);
    self.ProcessAllInput();
    if (self.quit) {
      SaveEndScreenshot(self);
      return ForGameMode(gDebug ? kLevelFin : kTitle, kTitle);
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
  self.MaybeSpawnPills = function (dt) {
    if (self.level.pills.length == 0) {
      return;
    }
    self.pillP1SpawnCountdown -= dt;
    self.pillP2SpawnCountdown -= dt;
    var kDiffMax = 2;
    if (isU(self.level.p1Pill) && self.pillP1SpawnCountdown <= 0 && self.unfairPillCount < kDiffMax) {
      self.level.p1Pill = self.MaybeSpawnPill(self.pillP1SpawnCooldown < PillSpawnCooldownFn() * 2, dt, self.level.p1Pill, kSpawnPlayerPillFactor, self.level.p1Powerups);
      if (exists(self.level.p1Pill)) {
        self.pillP1SpawnCountdown = PillSpawnCooldownFn();
        self.unfairPillCount++;
        self.isCpuPillAllowed = true;
        AddSparks({
          x: self.level.p1Pill.x,
          y: self.level.p1Pill.y,
          count: 50,
          vx: gR.RandomCentered(0, 2, 1),
          vy: gR.RandomCentered(0, 2, 1),
          rx: 10,
          ry: 10
        });
      }
    }
    if (isU(self.level.p2Pill) && self.pillP2SpawnCountdown <= 0 && self.isCpuPillAllowed && self.unfairPillCount > -kDiffMax) {
      // bias powerup creation toward the single player.
      var factor = kSpawnPlayerPillFactor * (gSinglePlayer ? 0.7 : 1);
      self.level.p2Pill = self.MaybeSpawnPill(self.pillP2SpawnCooldown < PillSpawnCooldownFn() * 2, dt, self.level.p2Pill, factor, self.level.p2Powerups);
      if (exists(self.level.p2Pill)) {
        self.pillP2SpawnCountdown = PillSpawnCooldownFn();
        self.unfairPillCount--;
        AddSparks({
          x: self.level.p2Pill.x,
          y: self.level.p2Pill.y,
          count: 50,
          vx: gR.RandomCentered(0, 2, 1),
          vy: gR.RandomCentered(0, 2, 1),
          rx: 10,
          ry: 10
        });
      }
    }
    Assert(Math.abs(self.unfairPillCount) <= kDiffMax, "unfairPillCount");
  };
  self.MaybeSpawnPill = function (must, dt, prev, spawnFactor, maker) {
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
      if (gSinglePlayer) {
        nextState = gP1Score < gP2Score ? kGameOver : kLevelFin;
      } else {
        // in a tie, nobody records a 'win'.
        if (gP1Score == gP2Score) {
          nextState = kLevelFin;
        } else if (gP1Score > gP2Score) {
          gP1Wins += 1;
        } else {
          gP2Wins += 1;
        }
        nextState = is2PGameOver() ? kGameOver : kLevelFin;
      }
    }
    return nextState;
  };
  self.StepAnimations = function (dt) {
    Object.entries(self.animations).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        id = _ref2[0],
        anim = _ref2[1];
      var done = anim.Step(dt, self);
      if (done) {
        delete self.animations[id];
      }
    });
  };
  self.CreateStartingPuck = function (vx) {
    // i am crying into my drink.
    // single player: puck goes towards gpu.
    // two player: puck goes toward p2.
    var sign = ForSide(gP1Side, 1, -1);
    var p = gPuckPool.Alloc();

    // match: all games start with cyan pucks.
    p.PlacementInit({
      x: gw(ForSide(gP1Side, 0.3, 0.7)),
      y: self.isAttract ? gh(gR.RandomRange(0.4, 0.6)) : gh(0.3),
      vx: sign * vx,
      vy: self.isAttract ? gR.RandomCentered(0, 2, 1) : 0.3,
      ur: true
    });
    gPucks.A.push(p);
  };
  self.CreateRandomPuck = function () {
    var p = gPuckPool.Alloc();
    p.PlacementInit({
      x: gw(gR.RandomRange(1 / 8, 7 / 8)),
      y: gh(gR.RandomRange(1 / 8, 7 / 8)),
      vx: gR.RandomRange(self.maxVX * 0.3, self.maxVX * 0.5),
      vy: gR.RandomCentered(1, 0.5),
      ur: true
    });
    gPucks.A.push(p);
  };
  self.ProcessAllInput = function () {
    // todo: figure out right way to deal with not/clearing inputs.
    if (!self.isAttract) {
      gEventQueue.forEach(function (event, i) {
        var cmds = {};
        event.updateFn(cmds);
        self.ProcessOneInput(cmds);
      });
      gEventQueue = [];
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
        self.level.p1Pill = self.level.p1Powerups.MakeRandomPill(self);
        self.level.p2Pill = self.level.p2Powerups.MakeRandomPill(self);
      }
    }
    if (cmds.clearHighScore) {
      if (self.paused) {
        gLevelHighScores = {};
        DeleteLocal(LocalStorageKeys.highScores);
        self.levelHighScore = undefined;
      }
    }
    if (cmds.addPuck) {
      if (self.paused) {
        ForCount(10, function () {
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
        r: gPauseRadius * 1.5
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
    self.MoveSparks(dt);
    self.MovePills(dt);
  };
  self.UpdateScore = function (p) {
    var wasLeft = p.x < gw(0.5);
    if (wasLeft) {
      ForSide(gP1Side, function () {
        gP2Score += kScoreIncrement;
      }, function () {
        gP1Score += kScoreIncrement;
      })();
    } else {
      ForSide(gP1Side, function () {
        gP1Score += kScoreIncrement;
      }, function () {
        gP2Score += kScoreIncrement;
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
        var splits = p.AllPaddlesCollision([self.paddleP1, self.paddleP2], self.level.IsSuddenDeath(), self.maxVX);
        self.level.OnPuckSplits(splits);

        // note: splits are pushed before parent, match: Draw()'s revEach() z order.
        if (self.level.isSpawning) {
          for (var _i = 0; (_ref3 = _i < (splits == null ? void 0 : splits.length)) != null ? _ref3 : 0; ++_i) {
            var _ref3;
            var s = gPuckPool.Alloc();
            if (exists(s)) {
              s.PlacementInit(splits[_i]);
              gPucks.B.push(s);
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
  self.MoveSparks = function (dt) {
    gSparks.B.clear();
    gSparks.A.forEach(function (s) {
      s.Step(dt);
      s.alive && gSparks.B.push(s);
    });
    SwapBuffers(gSparks);
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
      self.level.p1Pill = self.level.p1Pill.AllPaddlesCollision(self, [self.paddleP1]);
    }
  };
  self.MoveCPUPill = function (dt) {
    if (exists(self.level.p2Pill)) {
      self.level.p2Pill = self.level.p2Pill.Step(dt, self);
    }
    if (exists(self.level.p2Pill)) {
      self.level.p2Pill = self.level.p2Pill.AllPaddlesCollision(self, [self.paddleP2]);
    }
  };
  self.Alpha = function (alpha) {
    if (alpha == undefined) {
      alpha = 1;
    }
    return alpha * (self.isAttract ? 0.2 : 1);
  };

  // note: this really has to be z-under everything.
  self.DrawMidLine = function () {
    if (!self.isAttract) {
      var _self$level$EnergyFac;
      var dashStep = (gh() - 2 * gYInset) / (gMidLineDashCount * 2);
      var top = gYInset + dashStep / 2;
      var txo = gSmallFontSize;
      var bottom = gh() - gYInset - txo;
      var range = bottom - top;
      var e = ((_self$level$EnergyFac = self.level.EnergyFactor()) != null ? _self$level$EnergyFac : 0) * range;
      Cxdo(function () {
        gCx.beginPath();
        for (var y = top; y < bottom; y += dashStep * 2) {
          var ox = 0; //gR.RandomCentered(0, 0.5);
          var width = y - top >= range - e ? gMidLineDashWidth * 2 : gMidLineDashWidth;
          gCx.rect(gw(0.5) + ox - width / 2, y, width, dashStep);
        }
        gCx.fillStyle = RandomGreen(0.6);
        gCx.fill();
      });
    }
  };
  self.DrawCRTOutline = function () {
    if (!self.isAttract) {
      DrawCRTOutline();
    }
  };

  // match: GetReady.Draw() et. al.
  self.DrawScoreHeader = function (isEndScreenshot) {
    Cxdo(function () {
      var style = RandomMagenta(self.Alpha(isEndScreenshot ? 1 : 0.4));
      var p2 = gSinglePlayer ? "GPT: " : "P2: ";
      var hiMsg = gGameMode === kGameModeZen ? "HIGH: " : "LVL HI: ";
      ForSide(self.isAttract ? "right" : gP1Side, function () {
        gCx.fillStyle = style;
        if (exists(self.levelHighScore)) {
          DrawText(hiMsg + self.levelHighScore, "left", gw(0.2), gh(0.12), gSmallerFontSizePt);
        }
        if (!self.isAttract) {
          DrawText(p2 + gP2Score, "right", gw(0.8), gh(0.22), gRegularFontSizePt);
          DrawText("P1: " + gP1Score, "left", gw(0.2), gh(0.22), gRegularFontSizePt);
        }
      }, function () {
        gCx.fillStyle = style;
        if (exists(self.levelHighScore)) {
          DrawText(hiMsg + self.levelHighScore, "right", gw(0.8), gh(0.12), gSmallerFontSizePt);
        }
        if (!self.isAttract) {
          DrawText(p2 + gP2Score, "left", gw(0.2), gh(0.22), gRegularFontSizePt);
          DrawText("P1: " + gP1Score, "right", gw(0.8), gh(0.22), gRegularFontSizePt);
        }
      })();
    });
  };
  self.DrawMoveTarget = function (target) {
    var _target$position;
    // bug: yet another safari ios/ipados bug? the clipping doesn't
    // actually correctly work and so the butt end of the pointer
    // shows through a pixel or two, all very strange. so at least
    // making this pointer color == crt outline color to be less obvi.
    var side = target.side;
    var moveTargetY = (_target$position = target.position) == null ? void 0 : _target$position.y;
    if (exists(side) && exists(moveTargetY) && !self.isAttract) {
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
  };
  self.DrawPauseButton = function () {
    if (!self.isAttract && isAnyPointerEnabled()) {
      self.pauseButtonEnabled = true;
      var cx = gPauseCenterX;
      var cy = gPauseCenterY;
      Cxdo(function () {
        gCx.fillStyle = gCx.strokeStyle = RandomGrey(0.3);
        DrawText("ESC", "center", cx, cy + gSmallestFontSize * 0.4, gSmallestFontSizePt);
        gCx.beginPath();
        gCx.arc(cx, cy, gPauseRadius, 0, k2Pi, true);
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
    if (!self.isAttract) {
      ClearScreen();
    }
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
      var s01 = exists(self.level.splitsRemaining) ? Clip01(self.level.splitsRemaining / self.level.splitsAllowed) : undefined;
      self.paddleP1.Draw(self.Alpha(), self, s01);
      self.paddleP2.Draw(self.Alpha(), self, s01);

      // match: pucks revEach so splits show up on top, z order.
      // pucks going away from (single) player.
      gPucks.A.revEach(function (p) {
        if (Sign(p.vx) == ForSide(gP1Side, 1, -1)) {
          Assert(exists(p));
          p.Draw(self.Alpha());
        }
      });
      // pucks attacking the (single) player on top.
      gPucks.A.revEach(function (p) {
        if (Sign(p.vx) == ForSide(gP1Side, -1, 1)) {
          p.Draw(self.Alpha());
        }
      });
      if (!isEndScreenshot) {
        gSparks.A.forEach(function (s) {
          s.Draw(self.Alpha());
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
    self.timeout = 1000 * 2;
    self.started = gGameTime;
    self.highScore = gLevelHighScores[gLevelIndex];
    self.isNewHighScore = false;
    if (gSinglePlayer) {
      if (isU(self.highScore) || gP1Score > self.highScore) {
        self.highScore = gP1Score;
        self.isNewHighScore = true;
      }
    } else {
      var maxScore = Math.max(gP1Score, gP2Score);
      if (isU(self.highScore) || maxScore > self.highScore) {
        self.highScore = maxScore;
        self.isNewHighScore = true;
      }
    }
    Assert(!isBadNumber(self.highScore));
    self.hiMsg = self.isNewHighScore ? "NEW LEVEL HIGH: ".concat(self.highScore) : undefined;
    console.log(self.highScore, self.isNewHighScore, gLevelIndex, gLevelHighScores);
    self.goOn = false;
    PlayGameOver();
    if (self.isNewHighScore) {
      gLevelHighScores[gLevelIndex] = self.highScore;
      SaveLocal(LocalStorageKeys.highScores, gLevelHighScores, true);
    }
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
    gEventQueue = [];
    return nextState;
  };
  self.ProcessOneInput = function (cmds) {
    if (self.goOn) {
      var ud = isAnyUpOrDownPressed();
      var ap = isAnyActivatePressed(cmds);
      var apd = isAnyPointerDown();
      if (ud || ap || apd) {
        gLevelIndex += 1;
        if (gSinglePlayer) {
          return kGetReady;
        } else {
          return is2PGameOver() ? kGameOverSummary : kGetReady;
        }
      }
    }
    return undefined;
  };
  self.Draw = function () {
    gSinglePlayer ? self.DrawSinglePlayer() : self.DrawTwoPlayer();
    self.DrawLevelHighScore();
  };
  self.DrawLevelHighScore = function () {
    if (self.hiMsg) {
      Cxdo(function () {
        gCx.fillStyle = RandomGreen();
        DrawText(self.hiMsg, "center", gw(0.5), gh(0.65), gReducedFontSizePt);
      });
    }
  };
  self.DrawSinglePlayer = function () {
    Cxdo(function () {
      ClearScreen();
      gCx.drawImage(gCanvas2, 0, 0);
      gCx.fillStyle = RandomGreen(); // todo: ColorCycle()
      DrawText("LEVEL ".concat(self.levelIndex, " WON!"), "center", gw(0.5), gh(0.55), gBigFontSizePt);
      if (self.goOn) {
        gCx.fillStyle = RandomYellowSolid();
        DrawText("NEXT", "center", gw(0.5), gh(0.8), gRegularFontSizePt);
      }
    });
  };
  self.DrawTwoPlayer = function () {
    Cxdo(function () {
      ClearScreen();
      gCx.globalAlpha = 0.5;
      gCx.drawImage(gCanvas2, 0, 0);
      gCx.globalAlpha = 1;
      gCx.fillStyle = RandomGreen(); // todo: ColorCycle()
      var msg = "TIE!";
      if (gP1Score != gP2Score) {
        if (gP1Score > gP2Score) {
          msg = "PLAYER 1 WINS!";
        } else {
          msg = "PLAYER 2 WINS!";
        }
      }
      DrawText(msg, "center", gw(0.5), gh(0.5), gBigFontSizePt);
      var leftMsg = ForSide(gP1Side, "P1: ".concat(gP1Wins, " WINS"), "P2: ".concat(gP2Wins, " WINS"));
      var rightMsg = ForOtherSide(gP1Side, "P1: ".concat(gP1Wins, " WINS"), "P2: ".concat(gP2Wins, " WINS"));
      DrawText(leftMsg, "left", gw(0.2), gh(0.6), gSmallFontSizePt);
      DrawText(rightMsg, "right", gw(0.8), gh(0.6), gSmallFontSizePt);
      if (self.goOn) {
        gCx.fillStyle = RandomYellowSolid();
        DrawText("NEXT", "center", gw(0.5), gh(0.8), gRegularFontSizePt);
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
    gEventQueue = [];
    return nextState;
  };
  self.ProcessOneInput = function (cmds) {
    if (self.goOn) {
      var ud = isAnyUpOrDownPressed();
      var ap = isAnyActivatePressed(cmds);
      var apd = isAnyPointerDown();
      if (ud || ap || apd) {
        return kGameOverSummary;
      }
    }
    return undefined;
  };
  self.Draw = function () {
    Cxdo(function () {
      ClearScreen();
      gCx.drawImage(gCanvas2, 0, 0);
      gCx.fillStyle = RandomGreen(); // todo: ColorCycle()
      DrawText("GAME OVER", "center", gw(0.5), gh(0.55), gBigFontSizePt);
      if (self.goOn) {
        gCx.fillStyle = RandomYellowSolid();
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
    self.timeoutMsg = 1000;
    self.timeoutEnd = 1000 * 10;
    self.started = gGameTime;
  };
  self.Step = function () {
    if (self.relevant) {
      var nextState;
      self.goOn = gGameTime - self.started > self.timeoutMsg;
      nextState = self.ProcessAllInput();
      return nextState;
    } else {
      return kTitle;
    }
  };
  self.ProcessAllInput = function () {
    var nextState;
    var hasEvents = gEventQueue.length > 0;
    if (hasEvents) {
      gEventQueue.forEach(function (event, i) {
        var cmds = {};
        event.updateFn(cmds);
        if (isU(nextState)) {
          nextState = self.ProcessOneInput(cmds);
        }
      });
      gEventQueue = [];
    }
    if (exists(nextState)) {
      PlayBlip();
    }
    return nextState;
  };
  self.ProcessOneInput = function (cmds) {
    var nextState;
    // note: whatever the non-undefined nextState is, it must ResetP1Side() and gP{1,2}Pointer.Reset().
    if (self.goOn && (isAnyUpOrDownPressed() || isAnyActivatePressed(cmds) || isAnyPointerDown())) {
      nextState = kTitle;
    } else if (isU(nextState) && gGameTime - self.started > self.timeoutMsg + self.timeoutEnd) {
      nextState = kTitle;
    }
    return nextState;
  };
  self.Draw = function () {
    if (self.relevant) {
      gSinglePlayer ? self.DrawSinglePlayer() : self.DrawTwoPlayer();
    }
  };
  self.DrawSinglePlayer = function () {
    ClearScreen();
    var x = gw(0.5);
    var y = gh(0.5) - 20;
    var nextState;
    Cxdo(function () {
      gCx.fillStyle = RandomMagentaSolid();
      var msg = "FINAL SCORE: ".concat(gP1Score, " - ").concat(gP2Score, " = ").concat(self.finalScore);
      DrawText(msg, "center", x, y, gRegularFontSizePt);
      if (self.goOn) {
        gCx.fillStyle = RandomYellowSolid();
        DrawText("NEXT", "center", gw(0.5), gh(0.8), gRegularFontSizePt);
      }
    });
    return nextState;
  };
  self.DrawTwoPlayer = function () {
    ClearScreen();
    var nextState;
    Cxdo(function () {
      // todo: new high score message like single player.

      gCx.fillStyle = RandomMagenta();
      DrawText("*** FINAL CHAMPION ***", "center", gw(0.5), gh(0.5) - gBigFontSize, gReducedFontSizePt);
      DrawText("PLAYER ".concat(gP1Wins > gP2Wins ? "ONE" : "TWO", "!"), "center", gw(0.5), gh(0.5), gBigFontSizePt);
      var leftMsg = ForSide(gP1Side, "P1: ".concat(gP1Wins, " WINS"), "P2: ".concat(gP2Wins, " WINS"));
      var rightMsg = ForOtherSide(gP1Side, "P1: ".concat(gP1Wins, " WINS"), "P2: ".concat(gP2Wins, " WINS"));
      DrawText(leftMsg, "left", gw(0.2), gh(0.6), gSmallFontSizePt);
      DrawText(rightMsg, "right", gw(0.8), gh(0.6), gSmallFontSizePt);
      if (self.goOn) {
        gCx.fillStyle = RandomYellow();
        DrawText("RETURN", "center", gw(0.5), gh(0.8), gReducedFontSizePt);
      }
    });
    return nextState;
  };
  self.Init();
}

/*class*/
function DebugState() {
  var self = this;
  self.Init = function () {};
  self.Step = function () {};
  self.Draw = function () {
    ClearScreen();
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
      SetP1Side(x < gw(0.5) ? "left" : "right");
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
      SetP1Side(x < gw(0.5) ? "left" : "right");
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
  handlerMap[kGame] = function () {
    return new GameState();
  };
  handlerMap[kLevelFin] = function () {
    return new LevelFinState();
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
          SetP1Side("left");
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
          SetP1Side("left");
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
          SetP1Side("right");
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
          SetP1Side("right");
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
}
window.addEventListener('load', function () {
  Start();
  InitEvents();
}, false);