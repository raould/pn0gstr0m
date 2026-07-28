"use strict";

/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

var kDarkMatterDim = 30;
var kDarkMatterForce = 0.003;
var kDarkMatterAnimMsec = 16;

// true if any part of the rect is in bounds.
function InGameBounds(xywh) {
  var left = xywh.x;
  var right = xywh.x + xywh.width;
  var top = xywh.y;
  var bottom = xywh.y + xywh.height;
  var bad_left = left > gw();
  var bad_right = right < 0;
  var bad_top = top > gh();
  var bad_bottom = bottom < 0;
  return !(bad_left || bad_right || bad_bottom || bad_top);
}
;

/*class*/
function DarkMatterGenerator(props /*timeout*/) {
  var self = this;
  self.Init = function () {
    self.id = gNextID++;
    self.Reset();
    self.timeout = props.timeout;
  };
  self.Reset = function () {
    self.triggered = false; // latches when true.
    self.timeout = props.timeout * 2; // wait longer after the first time.
    Assert(self.timeout > 0);
  };
  self.Step = function (dt) {
    if (!self.triggered && self.ShouldStep()) {
      self.timeout = self.timeout - dt;
      self.triggered = self.timeout <= 0;
    }
  };
  self.ShouldStep = function () {
    return gPucks.A.length > kDarkMatterCountThreshold;
  };
  self.Generate = function () {
    var dim = sx1(kDarkMatterDim);
    // must satisfy InGameBounds().
    var x = gR.RandomChoice(gw(0.2), gw(0.8));
    var y = gPuckYAvg < gh(0.5) ? gh(0.9) : gh(0.1);
    var vx = (x < gw(0.5) ? 1 : -1) * sx(0.015);
    var vy = y < gh(0.5) ? sy(0.02) : -sy(0.02);
    return new DarkMatter({
      x: x,
      y: y,
      dim: dim,
      vx: vx,
      vy: vy
    });
  };
  self.DrawDebug = function () {
    Cxdo(function () {
      gCx.fillStyle = "yellow";
      DrawText("DM:".concat(self.timeout, " ").concat(String(self.triggered).toUpperCase()), "center", gw(0.6), gh(0.8), gSmallerFontSizePt);
    });
  };
  self.Init();
}

/*class*/
function DarkMatter(props /*x, y, dim, vx, vy*/) {
  var self = this;
  self.Init = function () {
    self.id = gNextID++;
    self.x = props.x;
    self.y = props.y;
    self.dim = props.dim;
    // w, h to satisfy InGameBounds().
    self.width = props.dim;
    self.height = props.dim;
    self.vx = props.vx;
    self.vy = props.vy;
    self.range = gh(0.3);
    self.imgs = [gImageCache["dm1"], gImageCache["dm2"], gImageCache["dm3"], gImageCache["dm4"]];
    self.frame = 0;
    self.lastTime = Date.now();
  };
  self.Step = function (dt) {
    self.alive = InGameBounds(self);
    if (self.alive) {
      self.x += self.vx * dt;
      self.y += self.vy * dt;
    }
  };
  self.StepPuck = function (dt, p) {
    if (self.alive) {
      // it is 'funny' how much programming languages
      // desperately suck when it comes to DSLs. i can't
      // even think straight when it is this fugly.
      // "i only tested this looks right empirically,
      // i did not prove it correct."
      var _FromTo = FromTo(p.x, p.y, self.x, self.y),
        x = _FromTo.x,
        y = _FromTo.y;
      var m = Magnitude(x, y);
      var _Norm = Norm(x, y, m),
        x = _Norm.x,
        y = _Norm.y;
      var g = kDarkMatterForce * m * T10nl(m, self.range, 4);
      p.vx += g * x;
      p.vy += g * y;
    }
  };
  self.Draw = function (alpha) {
    Cxdo(function () {
      var wx = WX(self.x);
      var wy = WY(self.y);
      var mx = wx + self.dim / 2;
      var my = wy + self.dim / 2;

      // outer constricting.
      // todo: this is badly tied to fps.
      var df = 30;
      var or = T10(gFrameCount % df, df) * sx1(100);
      var a = T01(gFrameCount % df, df);
      // outermost.
      gCx.beginPath();
      gCx.arc(mx, my, or, 0, k2Pi);
      gCx.closePath();
      gCx.strokeStyle = RandomYellow(a);
      gCx.lineWidth = sx1(1);
      gCx.stroke();
      // innermost.
      gCx.beginPath();
      gCx.arc(mx, my, or / 2, 0, k2Pi);
      gCx.closePath();
      gCx.strokeStyle = RandomRed(a);
      gCx.lineWidth = sx1(1);
      gCx.stroke();

      // inner.
      var now = Date.now();
      var dt = now - self.lastTime;
      if (dt > kDarkMatterAnimMsec) {
        self.frame = (self.frame + 1) % self.imgs.length;
        self.lastTime = now;
      }
      var img = self.imgs[self.frame];
      gCx.drawImage(img, wx, wy, self.dim, self.dim);
      if (gDebug) {
        // range.
        gCx.beginPath();
        gCx.arc(mx, my, self.dim / 2 + self.range, 0, k2Pi);
        gCx.closePath();
        gCx.strokeStyle = gCx.fillStyle = "rgba(255,255,0,0.1)";
        gCx.lineWidth = sx1(1);
        gCx.stroke();
      }
    });
  };
  self.Init();
}