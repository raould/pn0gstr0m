"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// see also: english in puck.js
var kEnglishStep = 0.05;

/*class*/
function Level(props) {
  var self = this;
  self.Init = function () {
    self.isAttract = aub(props.isAttract, false);
    self.startTime = gGameTime;

    // for the regular 1 player game, index is 1-based.
    // see also: main.js k*LevelInt values.
    self.levelInt = props.levelInt;

    // note: some of these are allowed to be undefined,
    // ie for attract mode level. although it is sort of ugly
    // and dangerous that way, vs. an explicit isAttract bool?
    // coding is hard please let me just go online shopping.

    self.vx0 = props.vx0;
    self.maxVX = props.maxVX;
    console.log("level vx's", self.levelInt, self.vx0, self.maxVX);
    Assert(!isBadNumber(self.maxVX));
    self.speedupFactor = props.speedupFactor;
    // these do not apply until later in the level.
    self.englishFactorPlayer = props.englishFactorPlayer;
    self.denglishFactorCPU = props.englishFactorCPU;
    self.splitsMax = props.splitsCount; // undefined means unlimited.
    self.splitsRemaining = self.splitsMax;
    self.isSpawning = props.isSpawning;

    // todo: maybe GameState shouldn't own the paddles.
    self.paddleP1 = props.paddleP1;
    self.paddleP2 = props.paddleP2;

    // powerup code is split very nastily across many files.
    self.p1Powerups = new Powerups({
      level: self,
      isPlayer: props.isP1Player,
      paddle: self.paddleP1,
      otherPaddle: self.paddleP2,
      side: ForSide(gP1Side, "left", "right"),
      pillState: props.p1PillState
    });
    self.p1Pill = undefined;
    self.p2Powerups = new Powerups({
      level: self,
      isPlayer: props.isP2Player,
      paddle: self.paddleP2,
      otherPaddle: self.paddleP1,
      side: ForSide(gP1Side, "right", "left"),
      pillState: props.p2PillState
    });
    self.p2Pill = undefined;

    // effects not owned by a side.
    self.bricks = undefined;
  };
  self.EnergyFactor = function () {
    if (isU(self.splitsRemaining)) {
      return undefined;
    } else {
      return T01(self.splitsRemaining, self.splitsMax);
    }
  };
  self.OnPaddlePuckSplits = function (splits) {
    var _splits$length;
    var count = (_splits$length = splits == null ? void 0 : splits.length) != null ? _splits$length : 0;
    Assert(count <= 1, count); // expecting doubling at most.
    if (self.isSpawning) {
      if (count > 0 && exists(self.splitsRemaining)) {
        self.splitsRemaining = Math.max(0, self.splitsRemaining - count);
        self.isSpawning = self.splitsRemaining > 0;
      }
    }
  };
  self.Step = function (dt) {
    self.StepBricks(dt);
    // ugh, see: paddle, puck.
    if (self.IsSecondHalfGame()) {
      Assert(gGameMode !== kGameModeZen);
      self.StepMaxVX(dt);
      self.StepEnglish(dt);
    }
  };
  self.StepMaxVX = function (dt) {
    if (exists(self.speedupFactor)) {
      // allow future spawned pucks to go faster, up to a hard limit.
      self.maxVX = MinSigned(self.maxVX + self.speedupFactor * dt / kTimeStep, kMaxVX);
    }
  };
  self.StepEnglish = function (dt) {
    // heuristics to increase english, all fairly arbitrary hacky values.
    // increases over time, more so for human players.
    if (exists(self.englishFactorPlayer)) {
      var de = dt / kTimeStep * kEnglishStep;
      var boostFactor = Clip01(1 - 0.25 - Math.pow(self.EnergyFactor(), 3));
      self.englishFactorPlayer += de * boostFactor;
    }

    // cpu doesn't get as much english, it looks strange to me otherwise.
    if (exists(self.englishFactorCPU)) {
      self.englishFactorCPU += dt / kTimeStep * kEnglishStep;
    }

    // store the new values on the paddles, the pucks read from them.
    self.paddleP1.ApplyEnglishFactor(self.englishFactorPlayer, self.englishFactorCPU);
    self.paddleP2.ApplyEnglishFactor(self.englishFactorPlayer, self.englishFactorCPU);
  };

  // make the latter half of a level get more zany in order to hurry things up.
  self.IsSecondHalfGame = function () {
    return !self.IsNGame(self.splitsMax * 0.5);
  };

  // avoid some powerups at the end of a level
  // because they can get into degenerate states
  // that are hard to escape w/out enough pucks.
  self.IsBeforeEndingGame = function () {
    return self.IsNGame(Math.min(self.splitsMax * 0.7, 100));
  };
  self.IsNGame = function (n) {
    var isNGame = true;
    if (exists(self.splitsRemaining)) {
      isNGame = self.splitsRemaining > n;
    }
    return isNGame;
  };
  self.IsSuddenDeath = function () {
    return exists(self.splitsRemaining) && self.splitsRemaining <= 0;
  };
  self.AddBricks = function (props) {
    self.bricks = new Blocks(_objectSpread(_objectSpread({}, props), {}, {
      isYars: false
    }));
  };
  self.StepBricks = function (dt) {
    if (exists(self.bricks)) {
      self.bricks = self.bricks.Step(dt);
    }
  };

  // match: main.GameState,Draw().
  // todo: Draw is too split up, kind of
  // confusing that midline is in game state.
  self.Draw = function (_ref) {
    var alpha = _ref.alpha,
      isEndScreenshot = _ref.isEndScreenshot;
    if (!isEndScreenshot) {
      var _self$bricks;
      self.DrawTitle(alpha);
      self.DrawEnergy(alpha);
      self.DrawPills(alpha);
      (_self$bricks = self.bricks) == null || _self$bricks.Draw(alpha);
      // todo: you'd maybe kind of expect lots of
      // other things like paddles and pucks to be
      // drawn by the level too, huh? ... :-(
    }
  };
  self.DrawTitle = function (alpha) {
    if (self.levelInt >= 1) {
      Cxdo(function () {
        gCx.fillStyle = RandomForColor(cyanSpec, alpha);
        DrawText("LEVEL ".concat(self.levelInt), "center", gw(0.5), gh(0.08), gSmallestFontSizePt);
      });
    }
  };
  self.DrawEnergy = function (alpha) {
    if (exists(self.splitsRemaining)) {
      Cxdo(function () {
        gCx.beginPath();
        gCx.fillStyle = RandomForColor(cyanSpec, alpha);
        if (self.splitsRemaining > 0) {
          DrawText(self.splitsRemaining, "center", gw(0.5), gh(0.95), gSmallerFontSizePt);
        } else {
          DrawText("NIL", "center", gw(0.5), gh(0.95), gSmallerFontSizePt);
        }
      });
    }
  };
  self.DrawPills = function (alpha) {
    if (exists(self.p1Pill)) {
      self.DrawPill(alpha, self.p1Pill, gP1Side, RandomMagenta(alpha));
    }
    if (exists(self.p2Pill)) {
      self.DrawPill(alpha, self.p2Pill, OtherSide(gP1Side), RandomGrey(alpha));
    }
  };
  self.DrawPill = function (alpha, pill, side, color) {
    pill.Draw(alpha);
    Cxdo(function () {
      gCx.fillStyle = color;
      var msg = "".concat(pill.name.toUpperCase(), " ").concat(ii(pill.lifespan / 1000));
      var x = ForSide(side, gw(0.25), gw(0.75));
      DrawText(msg, "center", x, gPillTextY, gSmallFontSizePt);
    });
  };
  self.Init();
}