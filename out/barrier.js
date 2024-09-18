"use strict";

/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function Barrier(props /*x, y, height, width, hp, side*/) {
  var self = this;
  self.Init = function () {
    self.id = gNextID++;
    self.x = props.x;
    self.y = props.y;
    self.prevX = self.x;
    self.prevY = self.y;
    self.drawScale = aub(props.drawScale, 1);
    self.height = props.height;
    self.width = props.width * self.drawScale;
    self.hp0 = props.hp;
    self.hp = self.hp0;
    self.alive = props.hp > 0;
    self.side = props.side;
  };
  self.Step = function (dt) {
    self.alive = self.hp > 0;
  };
  self.Draw = function (alpha) {
    Cxdo(function () {
      // front-side wedge cuts.
      var edge = sx1(5);
      // max() prevent getting too thin for wedge shape.
      var thp = T01(self.hp, self.hp0);
      var hpw = Math.max(edge, ii(self.width * thp) + edge);
      var r = WX(ForSide(self.side, self.x + hpw, self.x + self.width));
      var l = WX(ForSide(self.side, self.x, r - hpw));
      var t = WY(self.y + sy1(1));
      var b = WY(self.y + self.height - sy1(1));
      ForSide(self.side, function () {
        gCx.beginPath();
        gCx.moveTo(l, t);
        gCx.lineTo(r - edge, t);
        gCx.lineTo(r, t + edge);
        gCx.lineTo(r, b - edge);
        gCx.lineTo(r - edge, b);
        gCx.lineTo(l, b);
        gCx.closePath();
      }, function () {
        gCx.beginPath();
        gCx.moveTo(r, t);
        gCx.lineTo(l + edge, t);
        gCx.lineTo(l, t + edge);
        gCx.lineTo(l, b - edge);
        gCx.lineTo(l + edge, b);
        gCx.lineTo(r, b);
        gCx.closePath();
      })();
      // match: paddle hp inflection point.
      gCx.fillStyle = RandomForColor(thp > 0.2 ? blueSpec : yellowSpec, alpha * 0.5);
      gCx.fill();
    });
  };
  self.OnPuckHit = function () {
    self.hp--;
  };
  self.Init();
}