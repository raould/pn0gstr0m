"use strict";

/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function GenerateLightningPath(props) {
  // props = { x0, y0, x1, y1, range, steps=5 }
  // i wish i had started off this thing in typescript, you know?
  var x0 = props.x0,
    y0 = props.y0,
    x1 = props.x1,
    y1 = props.y1,
    range = props.range,
    _props$steps = props.steps,
    steps = _props$steps === void 0 ? 5 : _props$steps;
  var points = [[O5(x0), O5(y0)]];
  if (isU(x0), isU(y0), isU(x1), isU(y1)) {
    Assert(false, "bad props");
    return points;
  }
  if (isU(range)) {
    range = Math.min(Math.abs((x1 - x0) / 10), Math.abs((y1 - y0) / 10));
  }
  if (steps <= 0) {
    steps = 1;
  }
  var sx = ii((x1 - x0) / steps);
  var sy = ii((y1 - y0) / steps);
  for (var t = 1; t <= steps; ++t) {
    var px = points[t - 1][0];
    var py = points[t - 1][1];
    var rt = gR.RandomCentered(t, 0.1);
    var x = x0 + sx * rt;
    var y = y0 + sy * rt;
    var dx = x - px;
    var dy = y - py;
    var n = Math.sqrt(dx * dx + dy * dy);
    if (n == 0) {
      n = 1;
    }
    var nx = -dy / n;
    var ny = dx / n;
    var xo = x + nx * gR.RandomCentered(0, range, range / 2);
    var yo = y + ny * gR.RandomCentered(0, range, range / 2);
    points.push([O5(xo), O5(yo)]);
  }
  return points;
}
function AddLightningPath(props) {
  // props = { color, ...GenerateLightningPath.props }
  var color = props.color,
    x0 = props.x0,
    y0 = props.y0,
    x1 = props.x1,
    y1 = props.y1;
  var points = GenerateLightningPath(props);
  Cxdo(function () {
    gCx.strokeStyle = color;
    gCx.beginPath();
    gCx.moveTo(points[0][0], points[0][1]);
    points.forEach(function (p, i) {
      if (i > 0) {
        gCx.lineTo(p[0], p[1]);
      }
    });
    gCx.lineTo(x1, y1);
    gCx.lineWidth = 3;
    gCx.globalAlpha = 0.5;
    gCx.stroke();
    gCx.beginPath();
    gCx.moveTo(points[0][0], points[0][1]);
    points.forEach(function (p, i) {
      if (i > 0) {
        gCx.lineTo(p[0], p[1]);
      }
    });
    gCx.lineTo(x1, y1);
    gCx.lineWidth = 1;
    gCx.globalAlpha = 1;
    gCx.stroke();
  });
}
function MakePoofAnimation(x, y, radius) {
  var lifespan = 1000 * 1;
  var r = radius;
  return new GSAnimation({
    name: "poof",
    lifespan: lifespan,
    animFn: function animFn(self, dt, gameState) {
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
  return new GSAnimation({
    name: "crawllightning",
    lifespan: lifespan,
    animFn: function animFn(self, dt, gameState) {
      var t = T01(self.lifespan0 - self.life, self.lifespan0);
      var ti = ii(points.length * t);
      for (var i = 0; i < substeps; ++i) {
        var index = Clip(ti + i, 0, points.length - 1);
        pz[i] = points[index];
      }
    },
    drawFn: function drawFn(self) {
      Cxdo(function () {
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
        for (var i = 0; i < substeps; ++i) {
          gCx.lineTo(pz[i][0], pz[i][1]);
        }
        gCx.globalAlpha = 1;
        gCx.stroke();
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
  return new GSAnimation({
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
  return new GSAnimation({
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
  return new GSAnimation({
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
  return new GSAnimation({
    name: "wave",
    lifespan: lifespan,
    animFn: function animFn(self, dt, gameState) {
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
function MakeEngorgeAnimation(props) {
  var lifespan = props.lifespan,
    paddle = props.paddle,
    _endFn = props.endFn;
  var ph0 = paddle.height;
  var t10 = 1;
  return new GSAnimation({
    name: "engorge",
    lifespan: lifespan,
    animFn: function animFn(self, dt, gameState) {
      t10 = T10(self.lifespan0 - self.life, self.lifespan0);
    },
    drawFn: function drawFn() {
      AddLightningPath({
        color: RandomColor(),
        x0: paddle.GetMidX(),
        y0: paddle.y,
        x1: paddle.GetMidX(),
        y1: paddle.y + paddle.height,
        range: Math.max(sx1(1), paddle.width * 2 * t10)
      });
    },
    startFn: function startFn(gameState) {
      paddle.BeginEngorged();
    },
    endFn: function endFn(gameState) {
      paddle.EndEngorged();
      if (exists(_endFn)) {
        _endFn(gameState);
      }
    }
  });
}

// bug: safari ios/ipados renders the alpha here
// much more transparently than any windows desktop browsers
// (firefox, webkit) that i tested with. i don't know why
// this particular thing hits that bug but other parts
// of the rendering don't obviously encounter it???
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
  return new GSAnimation({
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
  return new GSAnimation({
    name: "chaos",
    lifespan: 300,
    drawFn: function drawFn() {
      targets.forEach(function (p, i) {
        if (p.alive) {
          AddLightningPath({
            color: RandomForColor(gR.RandomBool(0.5) ? magentaSpec : yellowSpec),
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