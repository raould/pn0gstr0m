"use strict";

/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

/*class*/
function Level(props) {
  var self = this;
  self.Init = function () {
    self.maxVX0 = props.maxVX;
    self.maxVX = self.maxVX0;
    self.speedupFactor = props.speedupFactor;
    self.speedupTimeout = props.speedupTimeout;
    self.puckCount = props.puckCount;
    self.alive = true;
    self.p1Powerups = new Powerups({
      isPlayer: props.isP1Player,
      paddle: props.paddleP1,
      side: ForSide(gP1Side, "left", "right"),
      specs: props.pills
    });
    self.p1Pill = undefined;
    self.p2Powerups = new Powerups({
      isPlayer: props.isP2Player,
      paddle: props.paddleP2,
      side: ForSide(gP1Side, "right", "left"),
      specs: props.pills
    });
    self.p2Pill = undefined;
  };
  self.OnPuckLost = function () {
    self.puckCount = Math.max(0, self.puckCount - 1);
    self.alive = self.puckCount > 0;
  };
  self.Step = function (dt) {
    self.speedupTimeout -= dt;
    if (self.speedupTimeout <= 0) {
      self.maxVX += self.speedupFactor * dt / kTimeStep;
    }
  };
  self.Draw = function (alpha) {
    // some (most) levels in the future are expected
    // to end after the puckCount drops to zero.
    // todo: find some attractive way to indicate that to the user.
    if (gDebug && self.puckCount < 100) {
      Cxdo(function () {
        gCx.fillStyle = gCx.strokeStyle = "magenta";
        DrawText(self.puckCount.toString(), "center", WX(gw(0.5)), WY(gPucksTextY), gSmallFontSizePt);
      });
    }
    self.DrawPills(alpha);
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
      DrawText(msg, "center", x, gPillTextY, gSmallestFontSizePt);
    });
  };
  self.Init();
}