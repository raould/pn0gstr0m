"use strict";

/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function RandomBlockColor() {
  var choices = [magentaSpec, blueSpec, redSpec, yellowSpec];
  return RandomForColor(gR.RandomElement(choices));
}
function YarCol(props /*count, isUp, x, width*/) {
  var self = this;
  self.Init = function () {
    self.isUp = props.isUp;
    self.x = props.x;
    self.width = props.width;
    self.offset = 0; // from 0 to gHeight.
    self.bh = gHeight / props.count;
    self.blocks = Array.from({
      length: props.count
    }, function (e, i) {
      return RandomBlockColor();
    });
  };
  self.Step = function (dt) {
    // todo: adjust things.
    var step = self.bh / 4;
    var dy = dt / 10 * (self.isUp ? -1 : 1) * step;
    self.offset = (self.offset + dy) % gHeight;

    // testing hack.
    if (gR.RandomBool(0.01)) {
      var ri = gR.RandomRangeInt(0, self.blocks.length);
      self.blocks[ri] = undefined;
    }
  };
  self.Draw = function (alpha) {
    Cxdo(function () {
      for (var i = 0; i < self.blocks.length; ++i) {
        var y = mod(i * self.bh + self.offset, gHeight);
        var block = self.blocks[i];
        if (exists(block)) {
          gCx.beginPath();
          gCx.rect(self.x, y, self.width, self.bh);
          gCx.fillStyle = block;
          gCx.fill();
        }
      }
    });
  };
  self.Init();
}
function Yars(props /*side, cols, col_width*/) {
  var self = this;
  self.Init = function () {
    self.id = gNextID++;
    self.side = props.side;
    self.cols = Array.from({
      length: props.cols
    }, function (e, i) {
      return new YarCol({
        count: 30,
        isUp: i % 2 === 1,
        x: i * props.col_width + ForSide(self.side, gw(0.2), gw(0.8)),
        // todo: adjust.
        width: props.col_width
      });
    });
  };
  self.Step = function (dt) {
    self.cols.forEach(function (c) {
      return c.Step(dt);
    });
  };
  self.Draw = function (alpha) {
    self.cols.forEach(function (c) {
      return c.Draw(alpha);
    });
  };
  self.Init();
}