"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// note: each powerup must have a unique pill,
// and the actual "powerup" is usually
// done via (ideally a unique) animation.

// note: look at the Make*Props() functions below
// to see what-all fields need to be defined i.e.
// (the business about ForSide and paddle references is wugly.)
/* {
   name,
   width, height,
   lifespan,
   isUrgent,
   testFn: (gameState) => {},
   drawFn: (self, alpha) => {},
   boomFn: (gameState) => {},
   endFn: () => {},
   }
*/

/* misc ideas:
   see the future
   xtra
   slowmo
   suction-blow
   magnasave
   bigger bar
   smaller bar
   swap sides
   autoplay
   cute animal catching
   bombs
*/

// needs to be longish so the cpu has any chance of getting it.
var kPillLifespan = 1000 * 20;

// just am enum, not array indices.
var kForcePushPill = 0;
var kDecimatePill = 1;
var kEngorgePill = 2;
var kSplitPill = 3;
var kDefendPill = 4;
var kXtraPill = 5;
var kNeoPill = 6;
var kChaosPill = 7;

// note: order matters.
var gPillIDs = [kForcePushPill, kDecimatePill, kEngorgePill, kChaosPill, kDefendPill, kSplitPill, kXtraPill, kNeoPill];

// note:
// 1) width and height are functions
// because they need to be evaluated after
// all the display resizing is done.
// see: width and height in GetReadyState.DrawPills().
// 2) keep the names short, to avoid overlapping
// on the Get Ready screen.
var gPillInfo = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, kForcePushPill, {
  name: "PUSH",
  maker: MakeForcePushProps,
  drawer: DrawForcePushPill,
  wfn: function wfn() {
    return sxi(20);
  },
  hfn: function hfn() {
    return syi(20);
  }
}), kDecimatePill, {
  name: "KILL",
  maker: MakeDecimateProps,
  drawer: DrawDecimatePill,
  wfn: function wfn() {
    return sxi(20);
  },
  hfn: function hfn() {
    return syi(20);
  }
}), kEngorgePill, {
  name: "PHAT",
  maker: MakeEngorgeProps,
  drawer: DrawEngorgePill,
  wfn: function wfn() {
    return sxi(20);
  },
  hfn: function hfn() {
    return syi(35);
  }
}), kSplitPill, {
  name: "ZPLT",
  maker: MakeSplitProps,
  drawer: DrawSplitPill,
  wfn: function wfn() {
    return sxi(20);
  },
  hfn: function hfn() {
    return syi(20);
  }
}), kDefendPill, {
  name: "SHLD",
  maker: MakeDefendProps,
  drawer: DrawDefendPill,
  wfn: function wfn() {
    return sxi(20);
  },
  hfn: function hfn() {
    return syi(40);
  }
}), kXtraPill, {
  name: "XTRA",
  maker: MakeXtraProps,
  drawer: DrawXtraPill,
  wfn: function wfn() {
    return sxi(15);
  },
  hfn: function hfn() {
    return syi(40);
  }
}), kNeoPill, {
  name: "NEO",
  maker: MakeNeoProps,
  drawer: DrawNeoPill,
  wfn: function wfn() {
    return sxi(20);
  },
  hfn: function hfn() {
    return syi(20);
  }
}), kChaosPill, {
  name: "WILD",
  maker: MakeChaosProps,
  drawer: DrawChaosPill,
  wfn: function wfn() {
    return sxi(20);
  },
  hfn: function hfn() {
    return syi(20);
  }
});
Assert(gPillInfo);

// cycle through the powerups in order
// so we have some control over when they
// are presented in the course of the game.
/*class*/
function Powerups(props) {
  var self = this;
  self.Init = function () {
    self.isPlayer = props.isPlayer;
    self.side = props.side;
    self.paddle = props.paddle;
    self.pillState = props.pillState;
  };
  self.MakeRandomPill = function (gameState) {
    var propsBase = self.NextPropsBase(gameState);
    if (exists(propsBase)) {
      // todo: meh, pills can have different lifespans, but currently they are all the same.
      Assert(exists(propsBase.lifespan), "lifespan");
      // spawn on the vertically opposite side from the player, to make it more noticeable.
      var yTop = gh(0.1);
      var yBottom = gh(0.9) - propsBase.height;
      var y = self.paddle.GetMidY() > gh(0.5) ? yTop : yBottom;
      var props = _objectSpread(_objectSpread({}, propsBase), {}, {
        name: propsBase.name,
        x: ForSide(self.side, gw(0.35), gw(0.65)),
        y: y,
        vx: ForSide(self.side, -1, 1) * sx(3),
        vy: gR.RandomCentered(0, 2, 0.5)
      });
      return new Pill(props);
    }
    return undefined;
  };
  self.NextPropsBase = function (gameState) {
    if (self.pillState.deck.length === 0) {
      return undefined;
    }

    // keep looping through the pills. also keeps the 
    // state across levels so you aren't retreading.
    var pid = self.pillState.deck.shift();
    self.pillState.deck.push(pid);
    var info = gPillInfo[pid];
    var maker = info.maker;
    Assert(exists(maker));
    Assert(typeof maker == "function", "maker()? ".concat(info.name, " ").concat(self.pillState, " ").concat(_typeof(maker)));
    var spec = maker(self);
    Assert(exists(spec), "wtf maker? ".concat(info.name));
    if (!spec.testFn(gameState)) {
      spec = undefined;
    }
    return spec;
  };
  self.Init();
}
;

// ----------------------------------------

function DrawForcePushPill(side, xywh, alpha) {
  var img = gImageCache[ForSide(side, "forcepushL", "forcepushR")];
  Cxdo(function () {
    var wx = WX(xywh.x);
    var wy = WY(xywh.y);
    gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
    var mx = wx + xywh.width / 2;
    var my = wy + xywh.height / 2;
    gCx.beginPath();
    gCx.arc(mx, my, xywh.width / 2 + sx1(1), 0, k2Pi);
    gCx.closePath();
    gCx.strokeStyle = gCx.fillStyle = RandomColor(alpha);
    gCx.lineWidth = sx1(1);
    gCx.stroke();
  });
}
function DrawDecimatePill(side, xywh, alpha) {
  var img = gImageCache["decimate"];
  Cxdo(function () {
    var wx = WX(xywh.x);
    var wy = WY(xywh.y);
    gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
    var mx = wx + ii(xywh.width / 2);
    var my = wy + ii(xywh.height / 2);
    gCx.beginPath();
    gCx.moveTo(mx, wy);
    gCx.lineTo(wx + xywh.width, my);
    gCx.lineTo(mx, wy + xywh.height);
    gCx.lineTo(wx, my);
    gCx.closePath();
    gCx.strokeStyle = gCx.fillStyle = RandomColor(alpha);
    gCx.lineWidth = sx1(1);
    gCx.stroke();
  });
}
function DrawEngorgePill(side, xywh, alpha) {
  var img = gImageCache["engorge"];
  Cxdo(function () {
    var wx = WX(xywh.x);
    var wy = WY(xywh.y);
    gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
    gCx.beginPath();
    gCx.rect(wx, wy, xywh.width, xywh.height);
    gCx.lineWidth = sx1(1);
    gCx.strokeStyle = gCx.fillStyle = RandomColor(alpha);
    gCx.stroke();
  });
}
function DrawSplitPill(side, xywh, alpha) {
  var img = gImageCache["split"];
  Cxdo(function () {
    var wx = WX(xywh.x);
    var wy = WY(xywh.y);
    gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
    gCx.beginPath();
    gCx.RoundRect(wx, wy, xywh.width, xywh.height, 10);
    gCx.strokeStyle = gCx.fillStyle = RandomColor(alpha);
    gCx.lineWidth = sx1(1);
    gCx.stroke();
  });
}
function DrawDefendPill(side, xywh, alpha) {
  var img = gImageCache["defend"];
  Cxdo(function () {
    var wx = WX(xywh.x);
    var wy = WY(xywh.y);
    gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
    gCx.beginPath();
    gCx.RoundRect(wx, wy, xywh.width, xywh.height, 14);
    gCx.strokeStyle = gCx.fillStyle = RandomColor(alpha);
    gCx.lineWidth = sx1(1);
    gCx.stroke();
  });
}
function DrawXtraPill(side, xywh, alpha) {
  var img = gImageCache["xtra"];
  Cxdo(function () {
    var wx = WX(xywh.x);
    var wy = WY(xywh.y);
    gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
    gCx.beginPath();
    gCx.RoundRect(wx, wy, xywh.width, xywh.height, 14);
    gCx.strokeStyle = gCx.fillStyle = RandomColor(alpha);
    gCx.lineWidth = sx1(1);
    gCx.stroke();
  });
}
function DrawNeoPill(side, xywh, alpha) {
  var img = gImageCache["neo"];
  Cxdo(function () {
    var wx = WX(xywh.x);
    var wy = WY(xywh.y);
    var mx = wx + ii(xywh.width / 2);
    var my = wy + ii(xywh.height / 2);
    gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
    gCx.beginPath();
    gCx.moveTo(mx, wy);
    gCx.lineTo(wx + xywh.width, my);
    gCx.lineTo(mx, wy + xywh.height);
    gCx.lineTo(wx, my);
    gCx.closePath();
    gCx.strokeStyle = gCx.fillStyle = RandomColor(alpha);
    gCx.lineWidth = sx1(1);
    gCx.stroke();
  });
}
function DrawChaosPill(side, xywh, alpha) {
  var img = gImageCache["chaos"];
  Cxdo(function () {
    // make it randomly resizing to look more chaotic.
    var o = gR.RandomRange(1, sx1(4));
    var wx = WX(xywh.x) - o;
    var wy = WY(xywh.y) - o;
    var ww = xywh.width + o * 2;
    var wh = xywh.height + o * 2;
    gCx.drawImage(img, wx, wy, ww, wh);
    var mx = wx + ww / 2;
    var my = wy + wh / 2;
    gCx.beginPath();
    gCx.arc(mx, my, ww / 2, 0, k2Pi);
    gCx.closePath();
    gCx.strokeStyle = gCx.fillStyle = RandomColor(alpha);
    gCx.lineWidth = sx1(1);
    gCx.stroke();
  });
}

// ----------------------------------------

function MakeForcePushProps(context) {
  var _gPillInfo$kForcePush = gPillInfo[kForcePushPill],
    name = _gPillInfo$kForcePush.name,
    wfn = _gPillInfo$kForcePush.wfn,
    hfn = _gPillInfo$kForcePush.hfn;
  var width = wfn();
  var height = hfn();
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    testFn: function testFn(gameState) {
      return (gDebug || gPucks.A.length > 5) && isU(context.paddle.neo);
    },
    drawFn: function drawFn(self) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return DrawForcePushPill(context.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      var targetSign = ForSide(context.side, -1, 1);
      gPucks.A.forEach(function (p) {
        if (Sign(p.vx) == targetSign) {
          p.vx *= -1;
        } else {
          p.vx = MinSigned(p.vx * 1.15, gameState.maxVX);
        }
      });
      gameState.AddAnimation(MakeWaveAnimation({
        lifespan: 250,
        side: context.side,
        paddle: context.paddle
      }));
    }
  };
}
function MakeDecimateProps(context) {
  var _gPillInfo$kDecimateP = gPillInfo[kDecimatePill],
    name = _gPillInfo$kDecimateP.name,
    wfn = _gPillInfo$kDecimateP.wfn,
    hfn = _gPillInfo$kDecimateP.hfn;
  var width = wfn();
  var height = hfn();
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    testFn: function testFn(gameState) {
      // looks unfun if there aren't enough pucks to destroy.
      // by the time the powerup is activated there might be even less.
      // e.g. consider that the other player might also be doing their decimate.
      return gDebug || gPucks.A.length > 30;
    },
    drawFn: function drawFn(self) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return DrawDecimatePill(context.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      // try to destroy at least 1, but leave at least enough alive to avoid(ish) game over.
      var minSaved = 3;
      if (gPucks.A.length > minSaved) {
        var count = Clip(gPucks.A.length - minSaved, 0, 20);
        if (count > 0) {
          PlayPowerupBoom();
          var targets = gPucks.A.map(function (p) {
            return {
              d: Math.abs(p.x - context.paddle.x),
              p: p
            };
          }).filter(function (e) {
            return e.d > gPaddleWidth * 3;
          }).
          // todo: not really working!?
          sort(function (a, b) {
            return a.d - b.d;
          }).slice(0, count).map(function (e) {
            return e.p;
          });
          Assert(targets.length < gPucks.A.length);
          console.log("targets", targets.length);
          if (targets.length === 0 && gPucks.A.length > 1) {
            targets = gPucks.A.slice(0, 1);
            console.log("targets'", targets.length);
          }
          targets.forEach(function (p) {
            p.alive = false;
            AddSparks({
              x: p.x,
              y: p.y,
              vx: p.vx / 3,
              vy: p.vy * 3,
              count: 10,
              rx: sx(1),
              ry: sy(1),
              colorSpec: whiteSpec
            });
          });
          gameState.AddAnimation(MakeTargetsLightningAnimation({
            lifespan: 200,
            targets: targets,
            paddle: context.paddle
          }));
        }
      }
    }
  };
}
function MakeEngorgeProps(context) {
  var _gPillInfo$kEngorgePi = gPillInfo[kEngorgePill],
    name = _gPillInfo$kEngorgePi.name,
    wfn = _gPillInfo$kEngorgePi.wfn,
    hfn = _gPillInfo$kEngorgePi.hfn;
  var width = wfn();
  var height = hfn();
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    isUrgent: true,
    testFn: function testFn(gameState) {
      return !context.paddle.engorged;
    },
    drawFn: function drawFn(self) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return DrawEngorgePill(context.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      gameState.AddAnimation(MakeEngorgeAnimation({
        lifespan: 1000 * 12,
        paddle: context.paddle
      }));
    }
  };
}
;
function MakeSplitProps(context) {
  var _gPillInfo$kSplitPill = gPillInfo[kSplitPill],
    name = _gPillInfo$kSplitPill.name,
    wfn = _gPillInfo$kSplitPill.wfn,
    hfn = _gPillInfo$kSplitPill.hfn;
  var width = wfn();
  var height = hfn();
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    testFn: function testFn(gameState) {
      return true;
    },
    drawFn: function drawFn(self) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return DrawSplitPill(context.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      var r = 10 / gPucks.A.length;
      var targets = gPucks.A.filter(function (p, i) {
        return i < 1 ? true : gR.RandomBool(r);
      });
      targets.forEach(function (t) {
        var maxVX = gameState.level.maxVX;
        var split = t.SplitPuck({
          forced: true,
          maxVX: maxVX
        });
        gameState.level.OnPuckSplits(1);
        var p = gPuckPool.Alloc();
        if (exists(p)) {
          p.PlacementInit(split);
          gPucks.A.push(p);
        }
      });
      gameState.AddAnimation(MakeSplitAnimation({
        lifespan: 250,
        targets: targets,
        side: context.side,
        paddle: context.paddle
      }));
    }
  };
}
function MakeDefendProps(context) {
  var _gPillInfo$kDefendPil = gPillInfo[kDefendPill],
    name = _gPillInfo$kDefendPil.name,
    wfn = _gPillInfo$kDefendPil.wfn,
    hfn = _gPillInfo$kDefendPil.hfn;
  var width = wfn();
  var height = hfn();
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    isUrgent: true,
    testFn: function testFn(gameState) {
      // todo: there is a bug here that let one paddle
      // have 2 defend powerups active at the same time wtf.
      return (gDebug || gameState.level.IsMidGame()) && (gDebug || gPucks.A.length > 10) && context.paddle.barriers.A.length == 0;
    },
    drawFn: function drawFn(self) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return DrawDefendPill(context.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      var n = 4; // match: kBarriersArrayInitialSize.
      // zen is more crazy so upping the hp and thus also scaling drawing so they aren't too wide.
      var pc = T01(gPucks.A.length, kPuckPoolSize);
      var hp = ForGameMode({
        regular: 50,
        hard: 70,
        zen: 50 + pc * 100,
        z2p: 50
      });
      console.log("defend pc=".concat(pc, " hp=").concat(F(hp)));
      var drawScale = ForGameMode({
        regular: 1,
        zen: 0.5
      });
      var width = sx1(hp / 3);
      var height = (gHeight - gYInset * 2) / n;
      var x = gw(ForSide(context.side, 0.1, 0.9));
      var targets = [];
      for (var i = 0; i < n; ++i) {
        var y = gYInset + i * height;
        var xoff = xyNudge(y, height, 10, context.side);
        context.paddle.AddBarrier({
          x: x + xoff,
          y: y,
          width: width,
          height: height,
          hp: hp,
          drawScale: drawScale,
          side: context.side
        });
        targets.push({
          x: x + width / 2,
          y: y + height / 2
        });
      }
      gameState.AddAnimation(MakeTargetsLightningAnimation({
        lifespan: 150,
        targets: targets,
        paddle: context.paddle,
        range: sx1(5)
      }));
    }
  };
}
function MakeXtraProps(context) {
  var _gPillInfo$kXtraPill = gPillInfo[kXtraPill],
    name = _gPillInfo$kXtraPill.name,
    wfn = _gPillInfo$kXtraPill.wfn,
    hfn = _gPillInfo$kXtraPill.hfn;
  var width = wfn();
  var height = hfn();
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    isUrgent: true,
    testFn: function testFn(gameState) {
      return (gDebug || gameState.level.IsMidGame()) && (gDebug || gPucks.A.length > 20) && context.paddle.xtras.A.length == 0;
    },
    drawFn: function drawFn(self) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return DrawXtraPill(context.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      var n = 6; // match: kXtrasArrayInitialSize.
      var yy = (gHeight - gYInset * 2) / n;
      var width = gPaddleWidth * 2 / 3;
      var height = Math.min(gPaddleHeight / 2, yy / 2);
      var pc = T01(gPucks.A.length, kPuckPoolSize);
      var hp = ForGameMode({
        regular: 30,
        hard: 50,
        zen: 50 + pc * 100,
        z2p: 50
      });
      console.log("xtra pc=".concat(pc, " hp=").concat(F(hp)));
      ForCount(n, function (i) {
        var x = ForSide(context.side, gw(0.15), gw(0.85));
        var xoff = isEven(i) ? 0 : gw(0.02);
        var y = gYInset + yy * i;
        var yMin = y;
        var yMax = y + yy;
        context.paddle.AddXtra({
          x: x + xoff,
          y: y,
          yMin: yMin,
          yMax: yMax,
          width: width,
          height: height,
          hp: hp,
          stepSize: Math.max(1, (yMax - yMin) / 10)
        });
      });
    }
  };
}
function MakeNeoProps(context) {
  var _gPillInfo$kNeoPill = gPillInfo[kNeoPill],
    name = _gPillInfo$kNeoPill.name,
    wfn = _gPillInfo$kNeoPill.wfn,
    hfn = _gPillInfo$kNeoPill.hfn;
  var width = wfn();
  var height = hfn();
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    isUrgent: true,
    testFn: function testFn(gameState) {
      return (gDebug || gameState.level.IsMidGame()) && (gDebug || gPucks.A.length > 20) && isU(context.paddle.neo);
    },
    drawFn: function drawFn(self) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return DrawNeoPill(context.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      context.paddle.AddNeo({
        x: ForSide(context.side, gw(0.4), gw(0.6)),
        normalX: ForSide(context.side, 1, -1),
        lifespan: 1000 * 4,
        side: context.side
      });
    }
  };
}
function MakeChaosProps(context) {
  var _gPillInfo$kChaosPill = gPillInfo[kChaosPill],
    name = _gPillInfo$kChaosPill.name,
    wfn = _gPillInfo$kChaosPill.wfn,
    hfn = _gPillInfo$kChaosPill.hfn;
  var width = wfn();
  var height = hfn();
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    testFn: function testFn(gameState) {
      return (gDebug || gPucks.A.length > 10) && isU(context.paddle.neo);
    },
    drawFn: function drawFn(self) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return DrawChaosPill(context.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      var targets = [];
      gPucks.A.forEach(function (p, i) {
        if (isMultiple(i, 3)) {
          p.vy *= -gR.RandomCentered(4, 2);
          targets.push(p);
        }
      });
      gameState.AddAnimation(MakeChaosAnimation({
        targets: targets
      }));
    }
  };
}