"use strict";

/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// todo: puck collision.
// todo: 'curvature'.
// note: everything assumes using full gHeight.

function RandomBlockColor() {
  var choices = [magentaSpec, blueSpec, redSpec, yellowSpec];
  return rgba255s(gR.RandomElement(choices).strong, 0.5);
}
function YarCol(props /*side, count, isUp, x, width*/) {
  var self = this;
  self.Init = function () {
    self.side = props.side;
    self.isUp = props.isUp;
    self.x = props.x;
    self.width = props.width;
    self.yoff = 0; // from 0 to gHeight.
    self.bh = gHeight / props.count;
    self.blocks = Array.from({
      length: props.count
    }, function (e, i) {
      return RandomBlockColor();
    });
  };
  self.Step = function (dt) {
    var step = self.bh / 4;
    var dy = dt / 10 * (self.isUp ? -1 : 1) * step;
    self.yoff = (self.yoff + dy) % gHeight;
    for (var i = 0; i < self.blocks.length; ++i) {
      var b = self.blocks[i];
      if (typeof b === "number") {
        // dead.
        if (b <= 0) {
          self.blocks[i] = undefined;
        } else {
          self.blocks[i] = b - 1;
        }
      }
    }
    ;
  };
  self.Draw = function (alpha) {
    Cxdo(function () {
      for (var i = 0; i < self.blocks.length; ++i) {
        var y = mod(i * self.bh + self.yoff, gHeight);
        var xoff = 0; // todo: ((gHeight/2)-Math.abs((gHeight/2)-(y+self.bh/2))) * ForSide(self.side, -0.02, 0.02);
        var bottom = (y + self.bh) % gHeight;
        var block = self.blocks[i];
        var fillStyle = typeof block === "number" ? "white" : block; // dying.
        if (exists(block)) {
          gCx.beginPath();
          gCx.rect(self.x + xoff, y, self.width, self.bh);
          gCx.fillStyle = fillStyle;
          gCx.fill();
          if (bottom < y) {
            // wrapped at the bottom, so missing at the top.
            gCx.beginPath();
            gCx.rect(self.x + xoff, bottom - self.bh, self.width, self.bh);
            gCx.fillStyle = fillStyle;
            gCx.fill();
          }
        }
      }
    });
  };
  self.CollisionTest = function (puck) {
    var r = self.x + self.width;
    var pr = puck.prevX + puck.width;

    // todo: curvature.

    var collided = false;
    if (puck.prevX >= r) {
      // puck is to the right.
      if (puck.vx < 0) {
        // puck is attacking.
        collided = puck.x <= r;
      }
    } else if (pr <= self.x) {
      // puck is to the left.
      if (puck.vx > 0) {
        // puck is attacking.
        collided = puck.x + puck.width >= self.x;
      }
    }
    // else puck is inside yars, let it go. (todo: eat it?)

    if (collided) {
      var by = puck.midY + (self.isUp ? -self.yoff : self.yoff);
      var bi = Math.floor(by / self.bh + 0.5);
      if (bi >= 0 && bi < self.blocks.length) {
        self.blocks[bi] = 30; // hard-coded hack # of frames.
        // todo: bounce the puck.
        // todo: check every column.
      }
    }
    return collided;
  };
  self.Init();
}
function Yars(props /*side, cols, col_width*/) {
  var self = this;
  self.Init = function () {
    // support xywh
    self.id = gNextID++;
    self.side = props.side;
    self.x = ForSide(self.side, gw(0.1), gw(0.9));
    self.y = 0;
    self.width = props.col_width * props.cols;
    self.height = gHeight;
    self.cols = Array.from({
      length: props.cols
    }, function (e, i) {
      return new YarCol({
        side: self.side,
        count: 50,
        x: self.x + i * props.col_width,
        isUp: i % 2 === 1,
        width: props.col_width
      });
    });
  };
  self.Step = function (dt) {
    self.cols.forEach(function (c) {
      return c.Step(dt);
    });
    // todo: kill itself once empty.
    return self;
  };
  self.Draw = function (alpha) {
    self.cols.forEach(function (c) {
      return c.Draw(alpha);
    });
  };
  self.CollisionTest = function (puck) {
    return self.cols.reduce(function (r, c) {
      return r || c.CollisionTest(puck);
    }, false);
  };
  self.Init();
}