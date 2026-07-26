"use strict";

/* Copyright (C) 2011-2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function MakeWipedownAnimation() {
  var lifespan = 700;
  return new Animation({
    name: "gamestart",
    lifespan: lifespan,
    drawFn: function drawFn(self) {
      var t = T10(self.life, self.lifespan0);
      var h = gh(0.05);
      var c = 10;
      var ybase = -(h * c);
      var yrange = gHeight + 2 * (h * c);
      var y = ybase + t * yrange;
      Cxdo(function () {
        var lastY = y;
        for (var i = 0; i < ii(c / 2); ++i) {
          // top bars
          var yo = y + i * h;
          gCx.beginPath();
          gCx.rect(0, yo, gWidth, h * 0.8);
          gCx.fillStyle = RandomForColor(greenSpec, 1 / c * i);
          gCx.fill();
          lastY = yo + h * 0.8;
        }
        gCx.beginPath(); // shutter effect.
        gCx.rect(0, lastY, gWidth, gHeight - lastY);
        gCx.fillStyle = backgroundColorStr;
        gCx.fill();
        for (var i = ii(c / 2); i < c; ++i) {
          // bottom bars.
          var yo = y + i * h;
          gCx.beginPath();
          gCx.rect(0, yo, gWidth, h * 0.8);
          gCx.fillStyle = RandomForColor(greenSpec, 1 - 1 / c * i);
          gCx.fill();
        }
      });
    }
  });
}
function MakeChargeUpTextAnimation(duration) {
  var lifespan = duration;
  return new Animation({
    name: "chargeup_text",
    lifespan: lifespan,
    drawFn: function drawFn(self) {
      // match: Level.Draw().
      // todo: gLevelIndex use here is evil.
      var zpt = MakeSplitsCount(gLevelIndex);
      if (exists(zpt)) {
        // match: MakeChargeUpMeterAnimation t.
        var t = T01(self.lifespan0 - self.life, self.lifespan0 * 0.6);
        var zptT = Math.ceil(zpt * t);
        Cxdo(function () {
          gCx.fillStyle = RandomForColor(cyanSpec);
          DrawText("SPLIT ENERGY: ".concat(zptT), "center", gw(0.5), gh(0.95), gSmallerFontSizePt);
        });
      }
    }
  });
}
function MakeChargeUpMeterAnimation(duration) {
  var lifespan = duration;
  return new Animation({
    name: "chargeup_meter",
    lifespan: lifespan,
    drawFn: function drawFn(self) {
      // match: GameState.DrawMidLine().
      // todo: gLevelIndex use here is evil.
      var zpt = MakeSplitsCount(gLevelIndex);
      if (exists(zpt)) {
        // match: MakeChargeUpTextAnimation t.
        var t = T01(self.lifespan0 - self.life, self.lifespan0 * 0.6);
        var zptT = Math.ceil(zpt * t);
        var dashStep = gh() / (gMidLineDashCount * 2);
        var top = ForGameMode({
          regular: gYInset * 1.5,
          zen: gYInset
        }) + dashStep / 2;
        // match: Level.DrawText().
        var txo = gSmallFontSizePt;
        var bottom = gh() - gYInset * 1.05 - txo;
        var range = bottom - top;
        var e = zptT / zpt * range;
        var gotfat = false;
        Cxdo(function () {
          gCx.beginPath();
          for (var y = top; y < bottom; y += dashStep * 2) {
            var ox = gR.RandomCentered(0, 0.5);
            var fat = y - top >= range - e;
            var width = fat ? gMidLineDashWidth * 3 : gMidLineDashWidth;
            gCx.rect(gw(0.5) + ox - width / 2, y, width, dashStep);
          }
          gCx.fillStyle = RandomGreen(0.5);
          gCx.fill();
        });
      }
    }
  });
}
function MakeLastPuckWonAnimation(duration, cx) {
  var lifespan = duration;
  return new Animation({
    name: "lastpuckwon",
    lifespan: lifespan,
    drawFn: function drawFn(self) {
      var t = T01(self.lifespan0 - self.life, self.lifespan0 * 0.6);
      Cxdo(function () {
        gCx.fillStyle = RandomForColor(yellowSpec, easeOutExpo(1 - t));
        DrawText("+".concat(kScoreLastPuckIncrement, " LAST PUCK!"), "center", cx, gh(1) - t * gh(0.3), gSmallFontSizePt);
      });
    }
  });
}
function MakePoofAnimation(x, y, radius) {
  var lifespan = 1000 * 1;
  var r = radius;
  return new Animation({
    name: "poof!",
    lifespan: lifespan,
    animFn: function animFn(self, dt) {
      r += dt / kTimeStep * 1.5;
    },
    drawFn: function drawFn(self) {
      var alpha = T01(self.life, self.lifespan0);
      Cxdo(function () {
        gCx.strokeStyle = RandomForColor(redSpec, alpha);
        gCx.lineWidth = sx1(1);
        gCx.beginPath();
        gCx.arc(WX(x), WY(y), r * gR.RandomRange(1, 1.05), 0, k2Pi);
        gCx.stroke();
        gCx.beginPath();
        gCx.arc(WX(x), WY(y), r / 2 * gR.RandomRange(1, 1.05), 0, k2Pi);
        gCx.stroke();
        gCx.beginPath();
        gCx.lineWidth = sx1(2);
        gCx.arc(WX(x), WY(y), r / 4 * gR.RandomRange(1, 1.05), 0, k2Pi);
        gCx.stroke();
      });
    }
  });
}

// bounty: make it follow a curve to look more like arcing.
function MakeCrawlingLightningAnimation(props) {
  var color = props.color,
    lifespan = props.lifespan,
    x0 = props.x0,
    y0 = props.y0,
    x1 = props.x1,
    y1 = props.y1,
    range = props.range,
    steps = props.steps,
    substeps = props.substeps,
    endFn = props.endFn;
  var points = GenerateLightningPath(props);
  var pz = Array(substeps).fill(points[0]);
  substeps = Math.min(substeps, pz.length);
  return new Animation({
    name: "crawllightning",
    lifespan: lifespan,
    animFn: function animFn(self, dt) {
      var t = T01(self.lifespan0 - self.life, self.lifespan0);
      var ti = ii(points.length * t);
      for (var i = 0; i < substeps; ++i) {
        var index = Clip(ti + i, 0, points.length - 1);
        pz[i] = points[index];
      }
    },
    drawFn: function drawFn(self) {
      Cxdo(function () {
        var ga = gCx.globalAlpha;
        gCx.strokeStyle = color;
        gCx.lineWidth = sx1(3);
        gCx.beginPath();
        gCx.moveTo(pz[0][0], pz[0][1]);
        for (var i = 0; i < substeps; ++i) {
          gCx.lineTo(pz[i][0], pz[i][1]);
        }
        gCx.globalAlpha = 0.3;
        gCx.stroke();
        gCx.lineWidth = sx1(1);
        gCx.beginPath();
        gCx.moveTo(pz[0][0], pz[0][1]);
        for (var _i = 0; _i < substeps; ++_i) {
          gCx.lineTo(pz[_i][0], pz[_i][1]);
        }
        gCx.globalAlpha = 1;
        gCx.stroke();
        gCx.globalAlpha = ga;
      });
    },
    endFn: endFn
  });
}
function Make2PtLightningAnimation(props) {
  var lifespan = props.lifespan,
    x0 = props.x0,
    y0 = props.y0,
    x1 = props.x1,
    y1 = props.y1,
    range = props.range,
    steps = props.steps,
    endFn = props.endFn;
  return new Animation({
    name: "2ptlightning",
    lifespan: lifespan,
    drawFn: function drawFn() {
      AddLightningPath({
        color: RandomColor(),
        x0: x0,
        y0: y0,
        x1: x1,
        y1: y1,
        range: range,
        steps: steps
      });
    },
    endFn: endFn
  });
}
function MakeTargetsLightningAnimation(props) {
  var lifespan = props.lifespan,
    targets = props.targets,
    paddle = props.paddle,
    endFn = props.endFn;
  return new Animation({
    name: "targetslightning",
    lifespan: lifespan,
    drawFn: function drawFn() {
      var px, py;
      targets.forEach(function (xy) {
        var _px, _py;
        var spec = {
          color: gR.RandomBool(0.4) ? RandomMagenta() : RandomBlue(),
          // todo: er, ahem, there's maybe some bug where the last leg of lightning
          // can be short due to subdividing, so i am reversing start and end
          // on purpose to compensate because it looks less bad for now.
          x0: xy.x,
          y0: xy.y,
          x1: (_px = px) != null ? _px : paddle.GetMidX(),
          y1: (_py = py) != null ? _py : paddle.GetMidY(),
          steps: 10,
          range: aub(props.range, sx1(15))
        };
        AddLightningPath(spec);
        px = spec.x0;
        py = spec.y0;
      });
    },
    endFn: endFn
  });
}
function MakeSplitAnimation(props) {
  var side = props.side,
    lifespan = props.lifespan,
    targets = props.targets,
    paddle = props.paddle,
    endFn = props.endFn;
  // start chain at nearest puck, assumes rhs default.
  targets.sort(function (a, b) {
    return b.x - a.x;
  });
  ForSide(side, function () {
    return targets.reverse;
  }, function () {})();
  return new Animation({
    name: "split",
    lifespan: lifespan,
    drawFn: function drawFn() {
      var p0 = {
        x: paddle.GetMidX(),
        y: paddle.GetMidY()
      };
      targets.forEach(function (p1, i) {
        AddLightningPath({
          color: RandomColor(),
          x0: p0.x,
          y0: p0.y,
          x1: p1.x,
          y1: p1.y,
          range: sx1(5),
          steps: 10
        });
        p0 = p1;
      });
    },
    endFn: endFn
  });
}
function MakeWaveAnimation(props) {
  var side = props.side,
    lifespan = props.lifespan,
    paddle = props.paddle,
    endFn = props.endFn;
  var x0 = paddle.GetMidX();
  var y0 = paddle.GetMidY();
  var a0 = ForSide(side, -Math.PI * 1 / 2, Math.PI * 1 / 2);
  var a1 = a0 + Math.PI;
  var t = 0;
  return new Animation({
    name: "wave",
    lifespan: lifespan,
    animFn: function animFn(self, dt) {
      t = T10(self.life, self.lifespan0);
    },
    drawFn: function drawFn(self) {
      Cxdo(function () {
        gCx.lineWidth = sx1(2);
        gCx.strokeStyle = "magenta";
        for (var ri = 1; ri <= 3; ++ri) {
          gCx.beginPath();
          gCx.arc(x0, y0, gw(t) + sx(5 * ri), a0, a1);
          gCx.stroke();
        }
      });
    },
    endFn: endFn
  });
}

// deprecated due to safari bug: ios/ipados renders the alpha here
// much more transparently than any windows desktop browsers
// (firefox, webkit) that i tested with, making this useless on apple.
//
// bounty: somebody should make this actually
// line trace into the future so the graph
// is literally where you should be w/in the
// next few seconds accouting for all bounces.
function MakeRadarAnimation(props) {
  var side = props.side,
    endFn = props.endFn;
  // match: GameState paddle inset position at gh(0.5)
  // although this is hacked up even more for aesthetics.
  var w = gXInset * 0.8;
  var x = ForSide(side, 0, gWidth - w);
  return new Animation({
    name: "radar",
    lifespan: undefined,
    drawFn: function drawFn() {
      Cxdo(function () {
        gCx.fillStyle = "rgba(200, 200, 0, 0.08)";
        gPucks.A.forEach(function (p) {
          var y0 = Math.max(gYInset, p.y - p.height);
          var y1 = Math.min(gHeight - gYInset, p.y + p.height * 2);
          var xoff = xyNudge(p.GetMidY(), p.height, 10, side);
          var h = y1 - y0;
          if (Sign(p.vx) == ForSide(side, -1, 1)) {
            gCx.beginPath();
            gCx.rect(x + xoff, y0, w, h);
            gCx.fill();
          }
        });
      });
    },
    endFn: endFn
  });
}
function MakeChaosAnimation(props) {
  var targets = props.targets,
    endFn = props.endFn;
  var oldvys = targets.map(function (p) {
    return p.vy;
  });
  return new Animation({
    name: "chaos",
    lifespan: 300,
    drawFn: function drawFn() {
      var color = RandomForColor(yellowDarkSpec);
      targets.forEach(function (p, i) {
        if (p.alive) {
          AddLightningPath({
            color: color,
            x0: p.x,
            y0: Sign(oldvys[i]) == 1 ? gYInset : gHeight - gYInset,
            x1: p.x,
            y1: p.y,
            range: sx1(3),
            steps: 10
          });
        }
      });
    },
    endFn: endFn
  });
}