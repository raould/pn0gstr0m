"use strict";

/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// todo: puck collision.
// todo: 'curvature'.
// note: everything assumes using full gHeight.

var kDeathFrames = 30;
var kStepPeriod = 5;
function RandomBlockColor() {
  var choices = [redSpec, greenSpec, blueSpec, cyanSpec, magentaSpec, yellowSpec];
  return rgba255s(gR.RandomElement(choices).regular);
}
function YarCol(props /*count, isUp, x, width*/) {
  var self = this;
  self.Init = function () {
    self.alive = true;
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
    if (self.alive) {
      var step = self.bh / 4;
      var dy = SafeDiv0(dt, kStepPeriod) * (self.isUp ? -1 : 1) * step;
      self.yoff = mod(self.yoff + dy, gHeight);
      var alive = self.blocks.length;
      for (var i = 0; i < self.blocks.length; ++i) {
        var b = self.blocks[i];
        if (typeof b === "number") {
          // dying.
          if (b <= 0) {
            self.blocks[i] = undefined;
          } else {
            self.blocks[i] = b - 1;
          }
        }
        if (self.blocks[i] === undefined) {
          --alive;
        }
      }
      ;
      self.alive = alive > 0;
      if (!self.alive) {
        console.log("%%%%% yars column dead!");
      }
    }
    return self.alive;
  };
  self.Draw = function (alpha) {
    if (self.alive) {
      Cxdo(function () {
        var ga = gCx.globalAlpha;
        gCx.globalAlpha = alpha;
        for (var i = 0; i < self.blocks.length; ++i) {
          var y = mod(i * self.bh + self.yoff, gHeight);
          var bottom = (y + self.bh) % gHeight;
          var block = self.blocks[i];
          var fillStyle = typeof block === "number" ? rgba255s(whiteSpec.strong, Clip01(0.2 + block / kDeathFrames)) : block;
          if (exists(block)) {
            gCx.beginPath();
            gCx.rect(self.x, y, self.width, self.bh);
            gCx.fillStyle = fillStyle;
            gCx.fill();
            if (bottom < y) {
              // wrapped at the bottom, so missing at the top.
              gCx.beginPath();
              gCx.rect(self.x, bottom - self.bh, self.width, self.bh);
              gCx.fillStyle = fillStyle;
              gCx.fill();
            }
          }
        }
        gCx.globalAlpha = ga;
      });
    }
  };
  self.CollisionTest = function (puck) {
    var collided = false;
    if (self.alive) {
      var r = self.x + self.width;
      var pr = puck.prevX + puck.width;
      // todo: curvature.
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
        var by = mod(puck.midY - self.yoff, gHeight);
        var bi = round(by / self.bh);
        if (bi >= 0 && bi < self.blocks.length) {
          collided = typeof self.blocks[bi] === "string";
          if (collided) {
            self.blocks[bi] = kDeathFrames; // hard-coded hack # of frames.
            // todo: bounce the puck.
            // todo: check every column.
          }
        }
      }
    }
    return collided;
  };
  self.Init();
}
function Yars(props /*midX, cols, rows, col_width*/) {
  var self = this;
  self.Init = function () {
    // support xywh
    self.id = gNextID++;
    self.width = props.col_width * props.cols;
    self.x = props.midX - self.width / 2;
    self.y = 0;
    self.height = gHeight;
    self.cols = Array.from({
      length: props.cols
    }, function (e, i) {
      return new YarCol({
        count: props.rows,
        x: self.x + i * props.col_width,
        isUp: i % 2 === 1,
        width: props.col_width
      });
    });
  };
  self.Step = function (dt) {
    var alive = self.cols.reduce(function (a, c) {
      var ca = c.Step(dt);
      return a || ca;
    }, false);
    if (!alive) {
      console.log("--------------- yars dead!");
    }
    return alive ? self : undefined;
  };
  self.Draw = function (alpha) {
    self.cols.forEach(function (c) {
      return c.Draw(alpha);
    });
    /*
    if (gDebug) {
        Cxdo(() => {
    	gCx.beginPath();
    	gCx.rect(self.x, 0, self.width, gHeight);
    	gCx.lineWidth = 1;
    	gCx.strokeStyle = "cyan";
    	gCx.stroke();
        });
        }
        */
  };
  self.CollisionTest = function (puck) {
    return self.cols.reduce(function (r, c) {
      return r || c.CollisionTest(puck);
    }, false);
  };
  self.Init();
}