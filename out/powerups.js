"use strict";

function _readOnlyError(r) { throw new TypeError('"' + r + '" is read-only'); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
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
var kBarrierPill = 4;
var kXtraPill = 5;
var kNeoPill = 6;
var kWildPill = 7;
var kYarsPill = 8;
var kWallPill = 9;

// note: order matters, this is the
// canonical progression through the pills.
// match: gPillInfo length.
var gPillIDs = [kForcePushPill, kDecimatePill, kSplitPill, kWildPill, kEngorgePill, kWallPill, kYarsPill, kBarrierPill, kXtraPill, kNeoPill];

// note:
// 1) width and height are functions
// because they need to be evaluated after
// all the display resizing is done.
// see: width and height in GetReadyState.DrawPills().
// 2) keep the names short, to avoid overlapping
// on the Get Ready screen.
// match: gPillIDs length.
var gPillInfo = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, kForcePushPill, {
  name: "PUSH",
  maker: MakeForcePushProps,
  drawer: DrawForcePushPill,
  wfn: function wfn() {
    return sxi(20);
  },
  hfn: function hfn() {
    return sxi(20);
  }
}), kDecimatePill, {
  name: "ZAP",
  maker: MakeDecimateProps,
  drawer: DrawDecimatePill,
  wfn: function wfn() {
    return sxi(20);
  },
  hfn: function hfn() {
    return sxi(20);
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
}), kWildPill, {
  name: "WILD",
  maker: MakeWildProps,
  drawer: DrawWildPill,
  wfn: function wfn() {
    return sxi(22);
  },
  hfn: function hfn() {
    return sxi(22);
  }
}), kBarrierPill, {
  name: "SHLD",
  maker: MakeBarrierProps,
  drawer: DrawBarrierPill,
  wfn: function wfn() {
    return sxi(20);
  },
  hfn: function hfn() {
    return syi(40);
  }
}), kSplitPill, {
  name: "ZPLT",
  maker: MakeSplitProps,
  drawer: DrawSplitPill,
  wfn: function wfn() {
    return sxi(20);
  },
  hfn: function hfn() {
    return sxi(20);
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
    return sxi(20);
  }
}), kYarsPill, {
  name: "YARS",
  maker: MakeYarsProps,
  drawer: DrawYarsPill,
  wfn: function wfn() {
    return sx1(20);
  },
  hfn: function hfn() {
    return sx1(20);
  }
}), kWallPill, {
  name: "WALL",
  maker: MakeWallProps,
  drawer: DrawWallPill,
  wfn: function wfn() {
    return sx1(15);
  },
  hfn: function hfn() {
    return sy1(30);
  }
});
Assert(gPillInfo);
Assert(Object.keys(gPillInfo).length === gPillIDs.length);

// cycle through the powerups in order
// so we have some control over when they
// are presented in the course of the game.
// one per paddle.
/*class*/
function Powerups(props) {
  var self = this;
  self.Init = function () {
    self.level = props.level;
    self.isPlayer = props.isPlayer;
    self.side = props.side;
    self.paddle = props.paddle;
    Assert(self.side === self.paddle.side);
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
      var _props = _objectSpread(_objectSpread({}, propsBase), {}, {
        name: propsBase.name,
        x: ForSide(self.side, gw(0.35), gw(0.65)),
        y: y,
        vx: ForSide(self.side, -1, 1) * sx(3),
        vy: gR.RandomCentered(0, 2, 0.5)
      });
      return new Pill(_props);
    }
    return undefined;
  };
  self.NextPropsBase = function (gameState) {
    if (self.pillState.deck.length === 0) {
      return undefined;
    }

    // if one player already has any defense, then try to give the other player the same chance.
    // todo: also barrier? xtras?
    var pid = self.pillState.deck.shift();
    var otherPaddle = self.paddle === gameState.paddleP1 ? gameState.paddleP2 : gameState.paddleP1;
    if (exists(otherPaddle.blocks) && isU(self.paddle.blocks) && self.pillState.deck.includes(kYarsPill) && gPillInfo[kYarsPill].maker(self).testFn(gameState)) {
      self.pillState.deck.push(pid);
      pid = kYarsPill;
    }
    Assert(exists(pid));
    var info = gPillInfo[pid];
    var maker = info.maker;
    Assert(exists(maker));
    Assert(typeof maker == "function", "maker()? ".concat(info.name, " ").concat(self.pillState, " ").concat(_typeof(maker)));
    var spec = maker(self);
    Assert(exists(spec), "wtf maker? ".concat(info.name));
    if (!spec.testFn(gameState)) {
      spec = undefined;
      if (gDebug) {
        // loop through them all.
        self.pillState.deck.push(pid);
      } else {
        // try the failed powerup again after the next one
        // in order to attempt to spawn the new ones soon even
        // if they were skipped i.e. at the start of the level when
        // there aren't many pucks.
        self.pillState.deck.splice(1, 0, pid);
      }
    } else {
      // keep looping through the pills. also keeps the 
      // state across levels so you aren't retreading.
      self.pillState.deck.push(pid);
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
    gCx.strokeStyle = RandomColor(alpha);
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
    gCx.strokeStyle = RandomColor(alpha);
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
    gCx.strokeStyle = RandomColor(alpha);
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
    gCx.strokeStyle = RandomColor(alpha);
    gCx.lineWidth = sx1(1);
    gCx.stroke();
  });
}
function DrawBarrierPill(side, xywh, alpha) {
  var img = gImageCache["barrier"];
  Cxdo(function () {
    var wx = WX(xywh.x);
    var wy = WY(xywh.y);
    gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
    gCx.beginPath();
    gCx.RoundRect(wx, wy, xywh.width, xywh.height, 14);
    gCx.strokeStyle = RandomColor(alpha);
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
    gCx.strokeStyle = RandomColor(alpha);
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
    gCx.strokeStyle = RandomColor(alpha);
    gCx.lineWidth = sx1(1);
    gCx.stroke();
  });
}
function DrawWildPill(side, xywh, alpha) {
  var img = gImageCache["wild"];
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
    gCx.strokeStyle = RandomColor(alpha);
    gCx.lineWidth = sx1(1);
    gCx.stroke();
  });
}
function DrawYarsPill(side, xywh, alpha) {
  var img = gImageCache[ForSide(side, "yarsL", "yarsR")];
  Cxdo(function () {
    var wx = WX(xywh.x);
    var wy = WY(xywh.y);
    gCx.drawImage(img, wx, wy, xywh.width, xywh.height);
    var mx = wx + xywh.width / 2;
    var my = wy + xywh.height / 2;
    gCx.beginPath();
    gCx.arc(mx, my, xywh.width / 2 + sx1(4), 0, k2Pi);
    gCx.closePath();
    gCx.strokeStyle = RandomColor(alpha);
    gCx.lineWidth = sx1(2);
    gCx.stroke();
  });
}
function DrawWallPill(side, xywh, alpha) {
  Cxdo(function () {
    var wx = WX(xywh.x);
    var wy = WY(xywh.y);
    gCx.beginPath();
    gCx.rect(wx, wy, xywh.width, xywh.height);
    gCx.lineWidth = sx1(2);
    gCx.strokeStyle = RandomColor(alpha);
    gCx.stroke();
    gCx.beginPath();
    gCx.rect(wx, wy, xywh.width, xywh.height);
    gCx.fillStyle = RandomCyan(alpha * 0.5);
    gCx.fill();
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
      var can = gPucks.A.length > 5 && isU(context.paddle.neo);
      //console.log("push?", can);
      return can;
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
          p.vx *= -1.15;
        } else {
          p.vx = MinSigned(p.vx * 1.15, gameState.maxVX);
        }
        p.vy *= ForGameMode({
          regular: 1.1,
          hard: 1.2,
          zen: 1,
          pp: 2
        });
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
      var can = gPucks.A.length > 30;
      //console.log("decimate?", can);
      return can;
    },
    drawFn: function drawFn(self) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return DrawDecimatePill(context.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      // try to destroy at least 1, but leave at least enough alive to avoid(ish) game over.
      var minSaved = 3;
      var pcount = gPucks.A.length;
      if (pcount > minSaved) {
        var clipMax = kAppMode ? 20 : pcount * 0.6;
        var count = Clip(pcount - minSaved, 0, clipMax);
        //console.log("decimate", pcount, clipMax, count);
        if (count > 0) {
          PlayPowerupBoom();
          var targets = gPucks.A.map(function (p) {
            return {
              d: Math.abs(p.x - context.paddle.x),
              p: p
            };
          }).filter(function (e) {
            return e.d > gPaddleWidth * 3;
          }).sort(function (a, b) {
            return a.d - b.d;
          }).slice(0, count).map(function (e) {
            return e.p;
          });
          Assert(targets.length < pcount);
          if (targets.length === 0 && pcount > 1) {
            gPucks.A.slice(0, 1), _readOnlyError("targets");
          }
          targets.forEach(function (p) {
            p.alive = "gone"; // special hard-coded case, yay.
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
      var can = !context.paddle.engorged;
      //console.log("engorce?", can);
      return can;
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
      var can = gPucks.A.length < kPuckPoolSize / 3;
      //console.log("split?", can);
      return can;
    },
    drawFn: function drawFn(self) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return DrawSplitPill(context.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      var needone = true;
      var targets = [];
      gPucks.A.forEach(function (p) {
        var pick = needone;
        needone = false;
        if (!pick) {
          if (gPucks.A.length <= 10) {
            pick = true;
          } else {
            pick = gR.RandomBool(10 / gPucks.A.length);
          }
        }
        if (pick) {
          targets.push(p);
        }
      });
      targets.forEach(function (t) {
        var maxVX = gameState.level.maxVX;
        var split = t.MaybeSplitPuck({
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
function MakeBarrierProps(context) {
  var _gPillInfo$kBarrierPi = gPillInfo[kBarrierPill],
    name = _gPillInfo$kBarrierPi.name,
    wfn = _gPillInfo$kBarrierPi.wfn,
    hfn = _gPillInfo$kBarrierPi.hfn;
  var width = wfn();
  var height = hfn();
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    isUrgent: true,
    testFn: function testFn(gameState) {
      // todo: there was a bug i saw once that let one paddle
      // have 2 barrier powerups active at the same time wtf.
      var can_end = gameState.level.IsBeforeEndingGame();
      var p_count = gPucks.A.length > kPuckPoolSize / 5;
      var can_paddles = context.paddle.barriers.A.length === 0;
      var can_blocks = isU(context.level.blocks);
      var can_yars = isU(context.paddle.yars);
      var can = can_end && p_count && can_paddles && can_blocks && can_yars;
      console.log("barrier?", can_end, p_count, can_paddles, can_blocks, can_yars, can);
      return can;
    },
    drawFn: function drawFn(self) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return DrawBarrierPill(context.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      // if the other player has any barriers, we should match their hp0.
      // else the hp should be related to the number of pucks.
      // and we don't want barriers to be less than some useful absolute amount.
      var minHp = 50;
      var otherPaddle = self.paddle === gameState.paddleP1 ? gameState.paddleP2 : gameState.paddleP1;
      var other_hp0 = otherPaddle.barriers.A.reduce(function (m, b) {
        return Math.max(m, b.hp0);
      }, 0);
      var hpf = ForGameMode({
        regular: 1,
        hard: 1.5,
        zen: 2,
        pp: 1.5
      });
      var pf = gPucks.A.length / (kPuckPoolSize / 5);
      var hpp = hpf * Math.max(minHp, minHp * pf);
      var hp = other_hp0 === 0 ? hpp : other_hp0;
      console.log("barrier minHp=".concat(minHp, " ohp0=").concat(other_hp0, " hpf=").concat(hpf, " pf=").concat(pf, " hpp=").concat(hpp, " hp=").concat(F(hp)));
      var drawScale = ForGameMode({
        regular: 1,
        zen: 0.5
      });
      var width = sx1(10); // no matter what the hp.
      var height = (gHeight - gYInset * 2) / kBarriersCount;
      var x = gw(ForSide(context.side, 0.1, 0.9));
      var targets = [];
      for (var i = 0; i < kBarriersCount; ++i) {
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
      var can_end = gameState.level.IsBeforeEndingGame();
      var p_count = gPucks.A.length > kPuckPoolSize / 2;
      var can_paddles = context.paddle.xtras.A.length === 0;
      var can_blocks = isU(context.level.blocks);
      var can_yars = isU(context.paddle.yars);
      var can = can_end && p_count && can_paddles && can_blocks && can_yars;
      console.log("xtras?", can_end, p_count, can_paddles, can_blocks, can_yars, can);
      return can;
    },
    drawFn: function drawFn(self) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return DrawXtraPill(context.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      var yy = (gHeight - gYInset * 2) / kXtrasCount;
      var width = gPaddleWidth * 2 / 3;
      var height = Math.min(gPaddleHeight / 2, yy / 2);
      var hp = ForGameMode({
        regular: 30,
        hard: 50,
        zen: 100,
        pp: 50
      });
      //console.log(`xtra pc=${pc} hp=${F(hp)}`);
      for (var i = 0; i < kXtrasCount; ++i) {
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
      }
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
      var can = gameState.level.IsBeforeEndingGame() && gPucks.A.length > 20 && isU(context.paddle.neo);
      //console.log("neo?", can);
      return can;
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
function MakeWildProps(context) {
  var _gPillInfo$kWildPill = gPillInfo[kWildPill],
    name = _gPillInfo$kWildPill.name,
    wfn = _gPillInfo$kWildPill.wfn,
    hfn = _gPillInfo$kWildPill.hfn;
  var width = wfn();
  var height = hfn();
  return {
    name: name,
    width: width,
    height: height,
    // try to force more wild in arcade mode
    // to break up streaming-for-too-long?!
    // see also: dark matter.
    lifespan: kPillLifespan * (kAppMode ? 1 : 2),
    testFn: function testFn(gameState) {
      var can = gPucks.A.length > 10 && isU(context.paddle.neo);
      //console.log("wild?", can);
      return can;
    },
    drawFn: function drawFn(self) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return DrawWildPill(context.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      var vs = ForSide(context.paddle.side, 1, -1);
      var targets = [];
      gPucks.A.forEach(function (p) {
        var ps = Math.sign(p.vx);
        if (vs === ps) {
          // repeated applications in a level gets crazy.
          p.vy *= gR.RandomCentered(3, 1);
          targets.push(p);
        }
      });
      gameState.AddAnimation(MakeWildAnimation({
        targets: targets
      }));
    }
  };
}
function IsWeakBlocks(blocks, fraction) {
  if (exists(blocks)) {
    return blocks.hp / blocks.maxHp < fraction;
  }
  return true;
}
function MakeYarsProps(context) {
  var _gPillInfo$kYarsPill = gPillInfo[kYarsPill],
    name = _gPillInfo$kYarsPill.name,
    wfn = _gPillInfo$kYarsPill.wfn,
    hfn = _gPillInfo$kYarsPill.hfn;
  var width = wfn();
  var height = hfn();
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    isUrgent: true,
    testFn: function testFn(gameState) {
      var p_count = gPucks.A.length > kPuckPoolSize * 1 / 2;
      var can_yars = IsWeakBlocks(context.paddle.blocks, 1 / 4);
      var can_wall = IsWeakBlocks(context.level.blocks, 1 / 4);
      var can_barriers = context.paddle.barriers.A.length === 0;
      var can_xtras = context.paddle.xtras.A.length === 0;
      var can = p_count && can_yars && can_wall && can_barriers && can_xtras;
      console.log("yars?", p_count, can_yars, can_wall, can_barriers, can_xtras, can);
      return can;
    },
    drawFn: function drawFn(self) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return DrawYarsPill(context.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      var midX = ForSide(context.paddle.side, gw(0.15), gw(0.85));
      var pc = T01(gPucks.A.length, kPuckPoolSize);
      var cols = 3 + Math.min(gPucks.A.length / 150);
      var rows = 40;
      context.paddle.AddBlocks({
        isYars: true,
        side: context.side,
        midX: midX,
        cols: cols,
        rows: rows,
        col_width: gw(0.01),
        dy: 1.5
      });
    }
  };
}
function MakeWallProps(context) {
  var _gPillInfo$kWallPill = gPillInfo[kWallPill],
    name = _gPillInfo$kWallPill.name,
    wfn = _gPillInfo$kWallPill.wfn,
    hfn = _gPillInfo$kWallPill.hfn;
  var width = wfn();
  var height = hfn();
  var cols = 4;
  var rows = 30;
  return {
    name: name,
    width: width,
    height: height,
    lifespan: kPillLifespan,
    isUrgent: true,
    testFn: function testFn(gameState) {
      var p_count = gPucks.A.length > kPuckPoolSize * 1 / 2;
      var can_wall = IsWeakBlocks(context.level.blocks, 1 / 4);
      var can_yars = IsWeakBlocks(context.paddle.blocks, 1 / 4);
      var can_barriers = context.paddle.barriers.A.length === 0;
      var can_xtras = context.paddle.xtras.A.length === 0;
      var can = p_count && can_wall && can_yars && can_barriers && can_xtras;
      //console.log("wall?", can);
      return can;
    },
    drawFn: function drawFn(self) {
      var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return DrawWallPill(context.side, self, alpha);
    },
    boomFn: function boomFn(gameState) {
      PlayPowerupBoom();
      var pc = T01(gPucks.A.length, kPuckPoolSize);
      var midX = gw(0.5);
      // there can be only 1.
      gameState.paddleP1.wall = undefined;
      gameState.paddleP2.wall = undefined;
      context.level.AddBlocks({
        isYars: false,
        midX: midX,
        cols: cols,
        rows: rows,
        col_width: gw(0.015),
        dy: 1.5
      });
    }
  };
}