"use strict";

/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function MakeGameStartAnimation() {
  var lifespan = 700;
  return new Animation({
    name: "gamestart",
    lifespan: lifespan,
    drawFn: function drawFn(anim) {
      var t = T10(anim.life, anim.lifespan0);
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
function MakeChargeUpTextAnimation(timeout) {
  var lifespan = timeout;
  return new Animation({
    name: "gamestart",
    lifespan: lifespan,
    drawFn: function drawFn(anim) {
      // match: Level.Draw().
      // todo: gLevelIndex use here is evil.
      var zpt = MakeSplitsCount(gLevelIndex);
      if (exists(zpt)) {
        var t = T01(anim.lifespan0 - anim.life, anim.lifespan0 / 2);
        var zptT = Math.ceil(zpt * t);
        Cxdo(function () {
          gCx.fillStyle = RandomForColor(cyanSpec);
          DrawText("SPLIT ENERGY: ".concat(zptT), "center", gw(0.5), gh(0.95), gSmallerFontSizePt);
        });
      }
    }
  });
}
function MakeChargeUpMeterAnimation(timeout) {
  var lifespan = timeout;
  return new Animation({
    name: "gamestart",
    lifespan: lifespan,
    drawFn: function drawFn(anim) {
      // match: GameState.DrawMidLine().
      // todo: gLevelIndex use here is evil.
      var zpt = MakeSplitsCount(gLevelIndex);
      if (exists(zpt)) {
        var t = T01(anim.lifespan0 - anim.life, anim.lifespan0 / 2);
        var zptT = Math.ceil(zpt * t);
        var dashStep = gh() / (gMidLineDashCount * 2);
        var top = ForGameMode({
          regular: gYInset * 1.5,
          zen: gYInset
        }) + dashStep / 2;
        // match: Level.DrawText().
        var txo = gSmallFontSize;
        var bottom = gh() - gYInset * 1.05 - txo;
        var range = bottom - top;
        var e = zptT / zpt * range;
        var gotfat = false;
        Cxdo(function () {
          gCx.beginPath();
          for (var y = top; y < bottom; y += dashStep * 2) {
            var ox = gR.RandomCentered(0, 0.5);
            var fat = y - top >= range - e;
            if (fat) {
              var width = gMidLineDashWidth * 2;
              gCx.rect(gw(0.5) + ox - width / 2, y, width, dashStep);
            }
          }
          gCx.fillStyle = RandomGreen(0.5);
          gCx.fill();
        });
      }
    }
  });
}