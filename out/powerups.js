"use strict";

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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
   isPlayerOnly,
   width, height,
   lifespan,
   isUrgent,
   testFn: (gameState) => {},
   canSkip, // don't get stuck waiting on this one's testFn to pass.
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

// levels are 1-based, and level 1 has no powerups.
// levels with powerup pills have 2 types of pill.
var gPillIDs = [kForcePushPill, kDecimatePill, kEngorgePill, kSplitPill, kDefendPill, kChaosPill, kXtraPill, kNeoPill];
// there should be 2 per level
// for the first n levels.
Assert(gPillIDs.length % 2 === 0);
var gPillInfo = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, kForcePushPill, {
  name: "FORCE PUSH",
  maker: MakeForcePushProps,
  drawer: DrawForcePushPill,
  width: sxi(30),
  height: syi(30)
}), kDecimatePill, {
  name: "DECIMATE",
  maker: MakeDecimateProps,
  drawer: DrawDecimatePill,
  width: sxi(30),
  height: syi(30)
}), kEngorgePill, {
  name: "ENGORGE",
  maker: MakeEngorgeProps,
  drawer: DrawEngorgePill,
  width: sxi(25),
  height: syi(35)
}), kSplitPill, {
  // "SPLIT" could be a confusing name since
  // the level msg says "n splits remaining".
  name: "ZPLT",
  maker: MakeSplitProps,
  drawer: DrawSplitPill,
  width: sxi(30),
  height: syi(30)
}), kDefendPill, {
  name: "DEFEND",
  maker: MakeDefendProps,
  drawer: DrawDefendPill,
  width: sxi(25),
  height: syi(40)
}), kXtraPill, {
  name: "XTRA",
  maker: MakeXtraProps,
  drawer: DrawXtraPill,
  width: sxi(30),
  height: syi(30)
}), kNeoPill, {
  name: "NEO",
  maker: MakeNeoProps,
  drawer: DrawNeoPill,
  width: sxi(30),
  height: syi(30)
}), kChaosPill, {
  name: "CHAOS",
  maker: MakeChaosProps,
  drawer: DrawChaosPill,
  width: sxi(30),
  height: syi(30)
});
Assert(gPillInfo);

/*class*/
function Powerups(props) {
  var self = this;
  self.Init = function () {
    self.isPlayer = props.isPlayer;
    self.side = props.side;
    self.paddle = props.paddle;
    self.specs = props.specs;
    // cycle through the powerups in order
    // so we have some control over when they
    // are presented in the course of the game.
    self.powerupDeck = [];
    self.powerupLocks = {};
  };
  self.MakeRandomPill = function (gameState) {
    var propsBase = self.NextPropsBase(gameState);
    if (exists(propsBase)) {
      // fyi allow pills to have different lifespans, tho currently they are all the same.
      Assert(exists(propsBase.lifespan), "lifespan");
      var y = gR.RandomChoice(gh(0.1), gh(0.9) - propsBase.height);
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
    self.UpdateDeck();
    var newFn = Peek(self.powerupDeck);
    if (isU(newFn)) {
      return undefined;
    }
    Assert(typeof newFn == "function", "newFn()? ".concat(self.powerupDeck, " ").concat(_typeof(newFn)));
    var s = newFn(self);
    Assert(exists(s), "newFn?");

    // the order of these conditionals does matter.
    if (self.isPlayerOnly(s)) {
      s = undefined;
    } else if (self.isApplicable(s, gameState)) {
      // keep s.
    } else if (self.isSkippable(s)) {
      s = undefined;
    }
    self.powerupDeck.pop();
    return s;
  };
  self.UpdateDeck = function () {
    // used them all, restart deck.
    if (self.powerupDeck.length <= 0 && self.specs.length > 0) {
      self.powerupDeck = _toConsumableArray(self.specs).reverse();
      Assert(self.powerupDeck.length > 0, "invalid powerup deck length");
    }
  };
  self.isPlayerOnly = function (spec) {
    // e.g. radar only really makes sense for the player.
    return exists(spec.isPlayerOnly) && spec.isPlayerOnly && !self.isPlayer;
  };
  self.isApplicable = function (spec, gameState) {
    // is the current game state applicable?
    return spec.testFn(gameState);
  };
  self.isSkippable = function (spec) {
    // don't get stuck on a powerup that might never happen.
    return aub(spec.canSkip, false);
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
    gCx.arc(mx, my, xywh.width / 2, 0, k2Pi);
    gCx.closePath();
    gCx.strokeStyle = gCx.fillStyle = RandomColor(alpha);
    gCx.lineWidth = sx1(2);
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
    gCx.lineWidth = sx1(2);
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
    gCx.lineWidth = sx1(2);
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
    gCx.lineWidth = sx1(2);
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
    gCx.RoundRect(wx, wy, xywh.width, xywh.height, 10);
    gCx.strokeStyle = gCx.fillStyle = RandomColor(alpha);
    gCx.lineWidth = sx1(2);
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
    gCx.RoundRect(wx, wy, xywh.width, xywh.height, 10);
    gCx.strokeStyle = gCx.fillStyle = RandomColor(alpha);
    gCx.lineWidth = sx1(2);
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
    gCx.lineWidth = sx1(2);
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
    gCx.lineWidth = sx1(2);
    gCx.stroke();
  });
}

// ----------------------------------------

function MakeForcePushProps(maker) {
  var _gPillInfo$kForcePush = gPillInfo[kForcePushPill],
    name = _gPillInfo$kForcePush.name,
    width = _gPillInfo$kForcePush.width,
    height = _gPillInfo$kForcePush.height;
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    testFn: function testFn(gameState) {
      return (gDebug || gPucks.A.length > 5) && isU(maker.paddle.neo);
    },
    drawFn: function drawFn(self, alpha) {
      return DrawForcePushPill(maker.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      var targetSign = ForSide(maker.side, -1, 1);
      gPucks.A.forEach(function (p) {
        if (Sign(p.vx) == targetSign) {
          p.vx *= -1;
        } else {
          p.vx = MinSigned(p.vx * 1.15, gameState.maxVX);
        }
      });
      gameState.AddAnimation(MakeWaveAnimation({
        lifespan: 250,
        side: maker.side,
        paddle: maker.paddle
      }));
    }
  };
}
function MakeDecimateProps(maker) {
  var _gPillInfo$kDecimateP = gPillInfo[kDecimatePill],
    name = _gPillInfo$kDecimateP.name,
    width = _gPillInfo$kDecimateP.width,
    height = _gPillInfo$kDecimateP.height;
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    testFn: function testFn(gameState) {
      // looks unfun if there aren't enough pucks to destroy.
      return gDebug || gPucks.A.length > 20;
    },
    canSkip: true,
    drawFn: function drawFn(self, alpha) {
      return DrawDecimatePill(maker.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      // try to destroy at least 1, but leave at least 1 still alive.
      // prefer destroying the ones closest to the player.
      var count = Math.max(1, Math.floor(gPucks.A.length * 0.4)); // not deci-mate, i know.
      if (gPucks.A.length > 1 && count === 0) {
        count = 1;
      }
      if (gPucks.A.length - count > 0) {
        PlayPowerupBoom();
        var byd = gPucks.A.map(function (p) {
          return {
            d: Math.abs(p.x - maker.paddle.x),
            p: p
          };
        }).sort(function (a, b) {
          return a.d - b.d;
        });
        var targets = byd.slice(0, count).map(function (e) {
          return e.p;
        });
        Assert(targets.length < gPucks.A.length);
        targets.forEach(function (p) {
          p.alive = false;
          AddSparks({
            x: p.x,
            y: p.y,
            vx: p.vx,
            vy: p.vy,
            count: 2,
            rx: sx(1),
            ry: sy(1)
          });
        });
        gameState.AddAnimation(MakeTargetsLightningAnimation({
          lifespan: 200,
          targets: targets,
          paddle: maker.paddle
        }));
      }
    }
  };
}
function MakeEngorgeProps(maker) {
  var _gPillInfo$kEngorgePi = gPillInfo[kEngorgePill],
    name = _gPillInfo$kEngorgePi.name,
    width = _gPillInfo$kEngorgePi.width,
    height = _gPillInfo$kEngorgePi.height;
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    isUrgent: true,
    testFn: function testFn(gameState) {
      return !maker.paddle.engorged;
    },
    canSkip: true,
    drawFn: function drawFn(self, alpha) {
      return DrawEngorgePill(maker.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      gameState.AddAnimation(MakeEngorgeAnimation({
        lifespan: 1000 * 12,
        paddle: maker.paddle
      }));
    }
  };
}
;
function MakeSplitProps(maker) {
  var _gPillInfo$kSplitPill = gPillInfo[kSplitPill],
    name = _gPillInfo$kSplitPill.name,
    width = _gPillInfo$kSplitPill.width,
    height = _gPillInfo$kSplitPill.height;
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    testFn: function testFn(gameState) {
      return true;
    },
    drawFn: function drawFn(self, alpha) {
      return DrawSplitPill(maker.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      var r = 10 / gPucks.A.length;
      var targets = gPucks.A.filter(function (p, i) {
        return i < 1 ? true : gR.RandomBool(r);
      });
      targets.forEach(function (p) {
        var maxVX = gameState.level.maxVX;
        var splits = p.SplitPuck({
          forced: true,
          maxVX: maxVX
        });
        gameState.level.OnPuckSplit(1);
        gPucks.A.push(splits);
      });
      gameState.AddAnimation(MakeSplitAnimation({
        lifespan: 250,
        targets: targets,
        side: maker.side,
        paddle: maker.paddle
      }));
    }
  };
}
function MakeDefendProps(maker) {
  var _gPillInfo$kDefendPil = gPillInfo[kDefendPill],
    name = _gPillInfo$kDefendPil.name,
    width = _gPillInfo$kDefendPil.width,
    height = _gPillInfo$kDefendPil.height;
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    isUrgent: true,
    testFn: function testFn(gameState) {
      return maker.paddle.barriers.A.length == 0 && (gDebug || gPucks.A.length > 25);
    },
    canSkip: true,
    drawFn: function drawFn(self, alpha) {
      return DrawDefendPill(maker.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      var n = 4; // match: kBarriersArrayInitialSize.
      var hp = 30;
      var width = sx1(hp / 3);
      var height = (gHeight - gYInset * 2) / n;
      var x = gw(ForSide(maker.side, 0.1, 0.9));
      var targets = [];
      for (var i = 0; i < n; ++i) {
        var y = gYInset + i * height;
        var xoff = xyNudge(y, height, 10, maker.side);
        maker.paddle.AddBarrier({
          x: x + xoff,
          y: y,
          width: width,
          height: height,
          hp: hp,
          side: maker.side
        });
        targets.push({
          x: x + width / 2,
          y: y + height / 2
        });
      }
      gameState.AddAnimation(MakeTargetsLightningAnimation({
        lifespan: 150,
        targets: targets,
        paddle: maker.paddle
      }));
    }
  };
}
function MakeXtraProps(maker) {
  var _gPillInfo$kXtraPill = gPillInfo[kXtraPill],
    name = _gPillInfo$kXtraPill.name,
    width = _gPillInfo$kXtraPill.width,
    height = _gPillInfo$kXtraPill.height;
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    isUrgent: true,
    testFn: function testFn(gameState) {
      return maker.paddle.xtras.A.length == 0 && (gDebug || gPucks.A.length > 20);
    },
    canSkip: true,
    drawFn: function drawFn(self, alpha) {
      return DrawXtraPill(maker.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      var n = 6; // match: kXtrasArrayInitialSize.
      var yy = (gHeight - gYInset * 2) / n;
      var width = gPaddleWidth * 2 / 3;
      var height = Math.min(gPaddleHeight / 2, yy / 2);
      var hp = 30;
      ForCount(n, function (i) {
        var x = ForSide(maker.side, gw(0.15), gw(0.85));
        var xoff = isEven(i) ? 0 : gw(0.02);
        var y = gYInset + yy * i;
        var yMin = y;
        var yMax = y + yy;
        maker.paddle.AddXtra({
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
function MakeNeoProps(maker) {
  var _gPillInfo$kNeoPill = gPillInfo[kNeoPill],
    name = _gPillInfo$kNeoPill.name,
    width = _gPillInfo$kNeoPill.width,
    height = _gPillInfo$kNeoPill.height;
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    isUrgent: true,
    testFn: function testFn(gameState) {
      // todo: in some playtesting this was being spawned too often, maybe each props needs a spawn weight too?
      return (gDebug || gPucks.A.length > kEjectCountThreshold / 2) && isU(maker.paddle.neo);
    },
    canSkip: true,
    drawFn: function drawFn(self, alpha) {
      return DrawNeoPill(maker.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      maker.paddle.AddNeo({
        x: ForSide(maker.side, gw(0.4), gw(0.6)),
        normalX: ForSide(maker.side, 1, -1),
        lifespan: 1000 * 4,
        side: maker.side
      });
    }
  };
}
function MakeChaosProps(maker) {
  var _gPillInfo$kChaosPill = gPillInfo[kChaosPill],
    name = _gPillInfo$kChaosPill.name,
    width = _gPillInfo$kChaosPill.width,
    height = _gPillInfo$kChaosPill.height;
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    testFn: function testFn(gameState) {
      return (gDebug || gPucks.A.length > 10) && isU(maker.paddle.neo);
    },
    drawFn: function drawFn(self, alpha) {
      return DrawChaosPill(maker.side, self, alpha);
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