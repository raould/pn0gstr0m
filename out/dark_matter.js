"use strict";

/* Copyright (C) 2025 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

var kDarkMatterForce = 0.003;

/*class*/
function DarkMatterGenerator(props /*timeout*/) {
  var self = this;
  self.Init = function () {
    self.id = gNextID++;
    self.Reset();
  };
  self.Reset = function () {
    self.timeout = props.timeout;
    self.triggered = false; // latches when true.
  };
  self.Step = function (dt) {
    if (gPucks.A.length > kStreamingCountThreshold) {
      self.timeout = Math.max(0, self.timeout - dt);
      self.triggered = self.triggered || self.timeout <= 0;
    } else {
      self.timeout = props.timeout;
    }
    //logEvery("dmg", `${F(self.timeout)} ${self.triggered}`, kFPS);
  };
  self.DrawDebug = function () {
    Cxdo(function () {
      gCx.fillStyle = "yellow";
      DrawText("".concat(self.timeout, " ").concat(String(self.triggered).toUpperCase()), "center", gw(0.6), gh(0.8), gSmallerFontSizePt);
    });
  };
  self.Init();
}

/*class*/
function DarkMatter(props /*x, y, width, height, vx, vy*/) {
  var self = this;
  self.Init = function () {
    self.id = gNextID++;
    self.x = props.x;
    self.y = props.y;
    self.width = props.width;
    self.height = props.height;
    self.vx = props.vx;
    self.vy = props.vy;
    self.range = gh(0.3);
  };
  self.Step = function (dt) {
    self.alive = InGameBounds(self);
    if (self.alive) {
      self.x += self.vx * dt;
      self.y += self.vy * dt;
      gPucks.A.forEach(function (p) {
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
      });
    }
  };
  self.Draw = function (alpha) {
    Cxdo(function () {
      var wx = WX(self.x);
      var wy = WY(self.y);
      var mx = wx + self.width / 2;
      var my = wy + self.height / 2;

      // outer.
      gCx.beginPath();
      gCx.arc(mx, my, self.width / 2 + sx1(1), 0, k2Pi);
      gCx.closePath();
      gCx.strokeStyle = gCx.fillStyle = RandomColor(alpha);
      gCx.lineWidth = sx1(gR.RandomRange(2, 4));
      gCx.stroke();

      // inner.
      var scale = T10(gGameTime % 300, 300);
      gCx.beginPath();
      gCx.arc(mx, my, scale * self.width / 2 + sx1(1), 0, k2Pi);
      gCx.closePath();
      gCx.strokeStyle = gCx.fillStyle = RandomYellow();
      gCx.lineWidth = sx1(1);
      gCx.stroke();
      if (gDebug) {
        // range.
        gCx.beginPath();
        gCx.arc(mx, my, self.width / 2 + self.range, 0, k2Pi);
        gCx.closePath();
        gCx.strokeStyle = gCx.fillStyle = "rgba(255,255,0,0.2)";
        gCx.lineWidth = sx1(1);
        gCx.stroke();
      }
    });
  };
  self.Init();
}