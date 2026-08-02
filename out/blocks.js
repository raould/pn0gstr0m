"use strict";

/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// todo: puck collision.
// todo: 'curvature'.
// note: everything assumes using full gHeight.

var kDeathFrames = 30;
var kStepPeriod = 10;
function y2xoff(side, y) {
  if (exists(side)) {
    var dxMax = sx(5);
    var dy = gHeight / 2 - Math.abs(gHeight / 2 - y);
    var t = T10(dy, gHeight / 2);
    return ForSide(side, 2, -2) * (dxMax - Math.pow(t, 2) * dxMax);
  }
  return 0;
}
function RandomBlockColor(isYars) {
  var a = [greenSpec, blueSpec, cyanSpec];
  var b = [redSpec, magentaSpec, yellowSpec];
  return rgba255s(gR.RandomElement(isYars ? a : b).regular);
}

// this is getting too overloaded, "isYars" sucks.

function Blocks(props /*isYars, side, midX, cols, rows, col_width, dy*/) {
  var self = this;
  self.Init = function () {
    // support xw
    self.id = gNextID++;
    self.isYars = props.isYars;
    self.alive = true;
    self.hp = props.cols * props.rows;
    self.maxHp = self.hp; // other code needs to know this.
    self.width = props.col_width * props.cols;
    self.x = props.midX - self.width / 2;
    self.dy = props.dy;
    self.cols = Array.from({
      length: props.cols
    }, function (e, i) {
      // outside-in works best for collision testing.
      var ci = i % 2 === 0 ? i / 2 : Math.floor(props.cols - i / 2);
      return new BlockCol({
        isYars: props.isYars,
        side: props.side,
        // undefined means wall.
        count: props.rows,
        x: self.x + ci * props.col_width,
        isUp: ci % 2 === 1,
        width: props.col_width,
        dy: props.dy
      });
    });
  };
  self.Step = function (dt) {
    self.hp = 0;
    self.alive = self.cols.reduce(function (a, c) {
      var ca = c.Step(dt);
      self.hp += c.hp;
      return a || ca;
    }, false);
    if (!self.alive) {
      console.log("--------------- blocks dead!");
    }
    return self.alive ? self : undefined;
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
    for (var i = 0; i < self.cols.length; ++i) {
      var c = self.cols[i];
      var hit = c.CollisionTest(puck);
      if (exists(hit)) {
        hit.dy = self.dy;
        return hit;
      }
    }
  };
  self.Init();
}
function BlockCol(props /*isYars, side, count, isUp, x, width*/) {
  var self = this;
  self.Init = function () {
    self.id = gNextID++;
    self.alive = true;
    self.hp = props.count;
    self.side = props.side; // undefined means wall.
    self.isUp = props.isUp;
    self.x = props.x;
    self.width = props.width;
    self.yoff = 0; // from 0 to gHeight.
    self.bh = gHeight / props.count;
    self.blocks = Array.from({
      length: props.count
    }, function (e, i) {
      return RandomBlockColor(props.isYars);
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
      self.hp = alive;
      self.alive = self.hp > 0;
      if (!self.alive) {
        console.log("%%%%% blocks column dead!");
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
          var block = self.blocks[i];
          if (exists(block)) {
            var y = mod(i * self.bh + self.yoff, gHeight);
            var xoff = y2xoff(self.side, y);
            var bottom = (y + self.bh) % gHeight;
            var fillStyle = typeof block === "number" ? rgba255s(whiteSpec.strong, Clip01(0.2 + block / kDeathFrames)) : block;
            // inside fill.
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
            // outside border.
            gCx.beginPath();
            gCx.rect(self.x + xoff, y, self.width, self.bh);
            gCx.strokeStyle = backgroundColorStr;
            gCx.lineWidth = 1;
            gCx.stroke();
            if (bottom < y) {
              // wrapped at the bottom, so missing at the top.
              gCx.beginPath();
              gCx.rect(self.x + xoff, bottom - self.bh, self.width, self.bh);
              gCx.stroke();
            }
          }
        }
        gCx.globalAlpha = ga;
      });
    }
  };
  self.CollisionTest = function (puck) {
    var hit = false;
    var collided = undefined;
    if (self.alive) {
      var xoff = y2xoff(self.side, puck.y);
      var l = self.x + xoff;
      var r = l + self.width;
      var ppl = puck.prevX;
      var ppr = ppl + puck.width;
      if (ppl >= r) {
        // puck is to the right.
        if (puck.vx < 0) {
          // puck is attacking.
          hit = puck.x <= r;
        }
      } else if (ppr <= l) {
        // puck is to the left.
        if (puck.vx > 0) {
          // puck is attacking.
          hit = puck.x + puck.width >= l;
        }
      }
      // else puck is inside blocks, let it go. (todo: eat it?)

      if (hit) {
        var by = mod(puck.midY - self.yoff, gHeight);
        var bi = round(by / self.bh);
        if (bi >= 0 && bi < self.blocks.length) {
          hit = typeof self.blocks[bi] === "string";
          if (hit) {
            self.blocks[bi] = kDeathFrames; // hard-coded hack # of frames.
            collided = {
              x: l,
              width: self.width
            };
          }
        }
      }
    }
    return collided;
  };
  self.Init();
}