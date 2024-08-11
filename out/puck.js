"use strict";

/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function Puck() {
  var self = this;
  self.Init = function () {
    self.id = gNextID++;
    self.alive = false;
  };

  /* props = { x, y, vx, vy, ur=true, forced=false, maxVX } */
  self.PlacementInit = function (props) {
    self.x = props.x;
    self.y = props.y;
    self.prevX = self.x;
    self.prevY = self.y;
    self.width = gPuckWidth;
    self.height = gPuckHeight;
    self.midX = self.x + self.width / 2;
    self.midY = self.y + self.height / 2;
    // tweak max vx a tad to avoid everything being too visually lock-step.
    self.vx = gR.RandomCentered(props.vx, props.vx / 10);
    self.vy = AvoidZero(props.vy, 0.1);
    self.alive = true;
    self.ur = aub(props.ur, false);
    self.startTime = self.ur ? -Number.MAX_SAFE_INTEGER : gGameTime;
    self.splitStyle = aub(props.forced, false) ? "yellow" : "white";
    self.isLocked = false;
  };
  self.Draw = function (alpha) {
    // scal size: more total pucks -> smaller size.
    var countScale = 1 + T10(gPucks.A.length, kEjectCountThreshold) * 0.4;

    // slight crt distortion of size based on horizontal position.
    var crtScale = T10(Math.abs(self.x - gw(0.5)), gw(0.5)) * 0.5 + 1;
    var width = self.width * countScale * crtScale;
    var dw = width - self.width;
    var height = self.height * countScale * crtScale;
    var dh = height - self.height;
    var wx = self.x - dw / 2;
    var wy = self.y - dh / 2;

    // fade things that aren't close and coming toward you.
    var avx = 0.8;
    var avxt = 1 - avx;
    var mid = gw(0.5);
    var range = gw(0.5) - gXInset;
    var t = 0;
    var vt = 0;
    if (Sign(self.vx) < 0 && wx < mid) {
      vt = wx - gXInset;
      t = easeOutExpo(T10(vt, range));
      avx += t * avxt;
    } else if (Sign(self.vx) > 0 && wx >= mid) {
      vt = wx - gXInset - mid;
      t = easeOutExpo(T01(vt, range));
      avx += t * avxt;
    }

    // young pucks (from paddle splits or powerups) render another color briefly.
    var dt = GameTime01(1000, self.startTime);
    var fadeinStyle = FadeIn(1);
    var inplayStyle = aub(fadeinStyle, gR.RandomFloat() > dt ? self.splitStyle : puckColorStr);
    var lostStyle = RandomYellow(0.7);
    var isLost = self.x + self.width < gXInset || self.x > gw(1) - gXInset;
    var style = isLost ? lostStyle : inplayStyle;
    Cxdo(function () {
      // a thin outline keeps things crisp when there are lots of pucks.
      gCx.beginPath();
      gCx.rect(wx - 1, wy - 1, width + 2, height + 2);
      gCx.lineWidth = sx1(1);
      gCx.strokeStyle = "black";
      gCx.stroke();
      gCx.beginPath();
      gCx.globalAlpha = alpha * avx;
      gCx.rect(wx, wy, width, height);
      gCx.fillStyle = style;
      gCx.fill();
      if (gDebug) {
        // tail to show direction of movement.
        // different y for opposite vx.
        gCx.beginPath();
        var oy = self.vx > 0 ? -1 : self.height + 1;
        gCx.strokeStyle = self.vx > 0 ? "magenta" : "pink";
        gCx.moveTo(self.prevX + self.width / 2, self.prevY + oy);
        gCx.lineTo(self.midX, self.y + oy);
        gCx.stroke();

        // highlight the ur pucks.
        if (self.ur) {
          gCx.beginPath();
          gCx.rect(wx, wy, width, height);
          gCx.strokeStyle = "red";
          gCx.stroke();
        }
      }
    });
  };
  self.Step = function (dt, maxVX, maxVY) {
    if (self.alive && !self.isLocked) {
      dt = dt * kPhysicsStepScale;
      self.prevX = self.x;
      self.prevY = self.y;
      self.x += self.vx * dt;
      self.y += self.vy * dt;
      Assert(!isNaN(self.prevX), [dt, self]);
      Assert(!isNaN(self.prevY), [dt, self]);
      Assert(!isNaN(self.x), [dt, self]);
      Assert(!isNaN(self.y), [dt, self]);
      var xout = self.x < 0 || self.x + self.width >= gWidth;
      Assert(!isNaN(xout), "xout");
      var yout = self.y < 0 || self.y + self.height >= gHeight;
      Assert(!isNaN(yout), "yout");
      self.alive = !(xout || yout);
      self.midX = self.x + self.width / 2;
      self.midY = self.y + self.height / 2;
      // note: no clipping or adjusting done here, see collision routines.

      self.vx = Math.min(maxVX, self.vx);
      self.vy = Math.min(maxVY, self.vy);
    }
  };

  // anybody calling this should also eventually follow up with level.OnPuckSplit() for bookkeeping.
  self.SplitPuck = function (_ref) {
    var _ref$forced = _ref.forced,
      forced = _ref$forced === void 0 ? false : _ref$forced,
      _ref$isSuddenDeath = _ref.isSuddenDeath,
      isSuddenDeath = _ref$isSuddenDeath === void 0 ? false : _ref$isSuddenDeath,
      maxVX = _ref.maxVX;
    Assert(exists(maxVX));
    var np = undefined;
    var count = gPucks.A.length;
    var dosplit = forced || count < ii(kEjectCountThreshold * 0.7) || count < kEjectCountThreshold && gR.RandomBool(1.05 - Clip01(Math.abs(self.vx / maxVX)));

    // I'M SURE THE HEURISTICS BELOW ARE CLEARLY GENIUS.
    // BUT I SORT OF NO LONGER HAVE ANY IDEA
    // WHAT/WHY THEY DO WHAT THEY DO. HA HA. 

    // sometimes force ejection to avoid too many pucks.
    // if there are already too many pucks to allow for a split-spawned-puck,
    // then we also want to sometimes eject the existing 'self' puck
    // to avoid ending up with just a linear stream of pucks.
    var r = gR.RandomFloat();
    var countFactor = Clip01(count / kEjectSpeedCountThreshold);
    var ejectCountFactor = Math.pow(countFactor, 3);
    var doejectCount = count > kEjectCountThreshold && r < 0.1;
    var doejectSpeed = self.vx > maxVX * 0.9 && r < ejectCountFactor;
    var doeject = doejectCount || doejectSpeed;
    if (!(forced || dosplit)) {
      if (doeject) {
        self.vy *= 1.1;
      }
      PlayBlip();
    } else {
      var slowCountFactor = ForGameMode(Math.pow(countFactor, 1.5), countFactor);
      // keep a few of the fast ones around.
      var slow = !doejectSpeed && self.vx > maxVX * 0.7 && gR.RandomFloat() < slowCountFactor;
      var slowF = gR.RandomRange(0.8, 0.9);
      var fastF = gR.RandomRange(1.005, 1.05);
      var zenF = gR.RandomRange(1.001, 1.01);
      var scaleF = ForGameMode(slow ? slowF : fastF, zenF);
      var vx = self.vx * scaleF;
      var vy = self.vy;
      vy = self.vy * (AvoidZero(0.5, 0.1) + 0.3);

      // code smell: because SplitPuck is called during MovePucks,
      // we return the new puck to go onto gPucks.B, whereas
      // MoveSparks happens after so it goes onto gSparks.A.
      np = {
        x: self.x,
        y: self.y,
        vx: vx,
        vy: vy,
        ur: false,
        forced: forced,
        maxVX: maxVX
      };
      AddSparks({
        x: self.x,
        y: self.y,
        vx: sx(1),
        vy: sy(0.5),
        count: 3,
        rx: sx(1),
        ry: sy(1)
      });
      PlayExplosion();
    }

    // try to hurry up when the level has no more pucks.
    var nvx = MinSigned(self.vx * (isSuddenDeath ? 1.1 : 1), maxVX);
    self.vx = nvx;
    return np;
  };
  self.CollisionTest = function (xywh, blockvx) {
    if (self.alive && !self.isLocked) {
      if (isU(blockvx) || Sign(self.vx) == blockvx) {
        // currently overlapping?
        var xRight = self.x >= xywh.x + xywh.width;
        var xLeft = self.x + self.width < xywh.x;
        var xSafe = xRight || xLeft;
        var xOverlaps = !xSafe;
        var yTop = self.y >= xywh.y + xywh.height;
        var yBottom = self.y + self.height < xywh.y;
        var ySafe = yTop || yBottom;
        var yOverlaps = !ySafe;

        // check if we seemed to have passed over xywh horizontally.
        // not going to require xywh object to also have a prevx field,
        // on the assumption they don't move at all, or not too fast anyway.
        var preSign = Sign(self.prevX - xywh.x);
        var postSign = Sign(self.x - xywh.x);
        var dxSkipped = preSign != postSign;
        if (dxSkipped && !xOverlaps && yOverlaps) {
          console.log("x skipped over collision");
        }
        return yOverlaps && (xOverlaps || dxSkipped);
      }
    }
    return false;
  };
  self.AdjustAndBounceX = function (xywh) {
    if (self.vx > 0) {
      self.x = xywh.x - self.width;
    } else {
      self.x = xywh.x + xywh.width;
    }
    self.vx *= -1;
  };
  self.ApplyEnglish = function (paddle) {
    // see also: english in level.js
    // smallest bit of vertical english.
    // too much means you never get to 'streaming'.
    // too little means you maybe crash the machine :-)
    // note that englishFactor increases as level ends.
    var dy = self.midY - paddle.GetMidY();
    var mody = gR.RandomFloat() * 0.02 * Math.abs(dy) * paddle.englishFactor;

    // try to avoid getting boringly stuck at top or bottom.
    // but don't want to utterly lose 'streaming'.
    var oy = 1;
    if (gR.RandomBool(0.1)) {
      var t01 = T01(Math.abs(self.x - gh(0.5)), gh(0.5));
      var ty = Math.pow(t01, 3);
      oy = 1 + ty * 1;
    }
    if (self.midY < paddle.GetMidY()) {
      self.vy -= mody * oy;
    } else if (self.midY > paddle.GetMidY()) {
      self.vy += mody * oy;
    }
  };
  self.PaddleCollision = function (paddle, isSuddenDeath, maxVX) {
    var newprops = undefined;
    var bounds = paddle.GetCollisionBounds(isSuddenDeath, maxVX);
    var hit = self.CollisionTest(bounds, -paddle.normalX);
    if (hit) {
      paddle.OnPuckHit();
      self.AdjustAndBounceX(paddle); // todo: bounceY too?
      self.ApplyEnglish(paddle);
      // explicitly not calling PlayBlip(), gets too noisy.
      if (paddle.isSplitter) {
        newprops = self.SplitPuck({
          isSuddenDeath: isSuddenDeath,
          maxVX: maxVX
        });
      }
    }
    return newprops;
  };
  self.AllPaddlesCollision = function (paddles, isSuddenDeath, maxVX) {
    var spawned;
    if (self.alive && !self.isLocked) {
      paddles.forEach(function (paddle) {
        var newprops = self.PaddleCollision(paddle, isSuddenDeath, maxVX);
        if (exists(newprops)) {
          if (isU(spawned)) {
            spawned = [];
          }
          spawned.push(newprops);
        }
      });
    }
    return spawned;
  };
  self.BarriersCollision = function (barriers) {
    if (self.alive && !self.isLocked && exists(barriers)) {
      barriers.forEach(function (barrier) {
        var hit = self.CollisionTest(barrier, ForSide(barrier.side, -1, 1));
        if (hit) {
          barrier.OnPuckHit();
          PlayBlip();
          self.AdjustAndBounceX(barrier);
        }
      });
    }
  };
  self.XtrasCollision = function (xtras) {
    if (self.alive && !self.isLocked && exists(xtras)) {
      xtras.forEach(function (xtra) {
        var hit = self.CollisionTest(xtra, -xtra.normalX);
        if (hit) {
          xtra.OnPuckHit();
          PlayBlip();
          self.AdjustAndBounceX(xtra);
        }
      });
    }
  };
  self.NeoCollision = function (neo) {
    if (self.alive && !self.isLocked && exists(neo)) {
      var hit = self.CollisionTest(neo);
      if (hit) {
        neo.OnPuckHit(self);
        PlayBlip();
        // no bounce, get stuck instead.
        self.isLocked = true;
      }
    }
  };
  self.WallsCollision = function (maxVX) {
    if (self.alive && !self.isLocked) {
      self.WallsBounceY();
      self.WallsRepelY(maxVX);
    }
  };
  self.WallsBounceY = function () {
    var did = false;
    if (self.y < gYInset) {
      did = true;
      self.y = gYInset;
    }
    var top = gHeight - gYInset;
    if (self.y + self.height > top) {
      did = true;
      self.y = top - self.height;
    }
    if (did) {
      self.vy *= -1;
      PlayBlip();
    }
  };
  self.WallsRepelY = function (maxVX) {
    var zone = gh(0.1);
    // if the puck is _not_ moving slowly, repel vertically away from walls
    // in order to try to prevent the user from just leaving their paddle
    // at the wall indefinitely and not moving, yet not losing pucks boringness.
    if (Math.abs(self.vx) > maxVX * 0.5) {
      // bounce harder if moving toward the respective wall;
      // trying to push it away would probably look more strange?
      if (self.y - gYInset < zone && self.vy < 0) {
        self.vy -= sy(0.01);
      }
      if (gh(1) - gYInset - self.y < zone && self.vy > 0) {
        self.vy += sy(0.01);
      }
    }
  };
  self.Init();
}