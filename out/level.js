"use strict";

/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// see also: english in puck.js
var kEnglishStep = 0.004;

/*class*/
function Level(props) {
  var self = this;
  self.Init = function () {
    self.isAttract = aub(props.isAttract, false);
    self.startTime = gGameTime;

    // could be kAttractLevelIndex.
    self.index = props.index;

    // note: some of these are allowed to be undefined,
    // ie for attract mode level. although it is sort of ugly
    // and dangerous that way, vs. an explicit isAttract bool?
    // coding is hard please let me just go online shopping.

    self.vx0 = props.vx0;
    self.maxVX = props.maxVX;
    Assert(!isBadNumber(self.maxVX));
    self.speedupFactor = props.speedupFactor;
    self.englishFactorPlayer = 1;
    self.englishFactorCPU = 1;
    self.splitsMax = props.splitsCount; // undefined means unlimited.
    self.splitsRemaining = self.splitsMax;
    self.isSpawning = props.isSpawning;

    // todo: maybe GameState shouldn't own the paddles.
    self.paddleP1 = props.paddleP1;
    self.paddleP2 = props.paddleP2;
    self.pills = props.pills;
    self.p1Powerups = new Powerups({
      isPlayer: props.isP1Player,
      paddle: self.paddleP1,
      side: ForSide(gP1Side, "left", "right"),
      specs: self.pills
    });
    self.p1Pill = undefined;
    self.p2Powerups = new Powerups({
      isPlayer: props.isP2Player,
      paddle: self.paddleP2,
      side: ForSide(gP1Side, "right", "left"),
      specs: self.pills
    });
    self.p2Pill = undefined;
  };
  self.EnergyFactor = function () {
    if (isU(self.splitsRemaining)) {
      return undefined;
    } else {
      return self.splitsRemaining / self.splitsMax;
    }
  };
  self.OnPuckSplits = function (splits) {
    var _splits$length;
    var count = (_splits$length = splits == null ? void 0 : splits.length) != null ? _splits$length : 0;
    if (self.isSpawning) {
      Assert(count <= 1, count);
      if (count > 0 && exists(self.splitsRemaining)) {
        self.splitsRemaining = Math.max(0, self.splitsRemaining - count);
        self.isSpawning = self.splitsRemaining > 0;
      }
    }
  };
  self.Step = function (dt) {
    if (!self.isSpawning && exists(self.speedupFactor)) {
      Assert(gGameMode !== kGameModeZen);

      // allow future spawned pucks to go faster, up to a hard limit.
      self.maxVX = MinSigned(self.maxVX + self.speedupFactor * dt / kTimeStep, kMaxVX);

      // heuristics to increase english, all fairly arbitrary hacky values.
      // boost english at the very end of the level.
      var englishBoost = gPucks.A.length < 5 ? 10 : 1;
      // increase over time, more so for the player.
      self.englishFactorPlayer += dt / kTimeStep * kEnglishStep * englishBoost;
      // the cpu doesn't get as much english because if they are the
      // first one to hit a puck with a lot of english it looks like cheating.
      self.englishFactorCPU += dt / kTimeStep * kEnglishStep;
      self.paddleP1.englishFactor = self.paddleP1.isPlayer ? self.englishFactorPlayer : self.englishFactorCPU;
      self.paddleP2.englishFactor = self.paddleP2.isPlayer ? self.englishFactorPlayer : self.englishFactorCPU;

      // logOnDelta("+maxVX", F(self.maxVX), 1, F(kMaxVX));
      // logOnDelta("+englishFactorPlayer", F(self.englishFactorPlayer), 0.1);
      // logOnDelta("+englishFactorCPU", F(self.englishFactorCPU), 0.1);
    }
  };
  self.IsLastOfThePucks = function () {
    return exists(self.splitsRemaining) && self.splitsRemaining <= 200;
  };
  self.IsSuddenDeath = function () {
    return exists(self.splitsRemaining) && self.splitsRemaining <= 0;
  };

  // match: main.GameState,Draw().
  self.Draw = function (_ref) {
    var alpha = _ref.alpha,
      isEndScreenshot = _ref.isEndScreenshot;
    if (!isEndScreenshot) {
      self.DrawTitle(alpha);
      self.DrawEnergy(alpha);
      self.DrawPills(alpha);
      // todo: you'd maybe kind of expect lots of
      // other things like paddles and pucks to be
      // drawn by the level too, huh? ...
    }
  };
  self.DrawTitle = function (alpha) {
    if (self.index >= 1) {
      Cxdo(function () {
        gCx.fillStyle = RandomForColor(cyanSpec, alpha);
        DrawText("LVL".concat(self.index), "center", gw(0.5), gh(0.08), gSmallestFontSizePt);
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