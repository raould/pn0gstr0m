"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* Copyright (C) 2011-2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

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
function MakeForceFieldHorizAnimation(props /* points: array of [x0,y0,x1,y1,x2,y2,...] */) {
  Assert(exists(props.points));
  Assert(props.points.length % 2 === 0);
  var isTop = props.points[1] < gh(0.5); // fugly.
  var seg_count = Math.floor(props.points.length / 2);
  var top_y0 = 0;
  var top_y1 = gYInset + gh(0.1);
  var bottom_y0 = gHeight - gYInset - gh(0.1);
  var bottom_y1 = gHeight;
  var path_props = {
    color: "cyan",
    steps: 50 / seg_count,
    range: sy1(2)
  };
  var anims = [];
  var _loop = function _loop(i) {
    anims.push(new GSAnimation({
      name: "force_field",
      lifespan: undefined,
      drawFn: function drawFn(self, gameState) {
        var t = isTop ? T10Range(gPuckYMin, top_y0, top_y1) : T01Range(gPuckYMax, bottom_y0, bottom_y1);
        AddLightningPath(_objectSpread(_objectSpread({}, path_props), {}, {
          alpha: t / 2,
          x0: props.points[i],
          y0: props.points[i + 1],
          x1: props.points[i + 2],
          y1: props.points[i + 3]
        }));
      }
    }));
  };
  for (var i = 0; i < props.points.length - 2; i += 2) {
    _loop(i);
  }
  return anims;
}