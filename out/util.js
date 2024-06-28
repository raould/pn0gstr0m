"use strict";

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

var k2Pi = Math.PI * 2;
var kPi2 = Math.PI / 2;
function Assert(result, msg) {
  if (!result) {
    console.error("ASSERTION FAILED", msg);
    debugger;
  }
}
function isU(u) {
  return u == undefined;
}
function exists(u) {
  return u != undefined;
}
function aorb(a, b) {
  return a != undefined ? a : b;
}
function noOp() {}
function SafeDiv(num, denom) {
  return num / (denom != 0 ? denom : 1);
}
function Peek(a) {
  if (Array.isArray(a) && a.length > 0) {
    return a[a.length - 1];
  }
  return undefined;
}
function ForCount(count, fn) {
  for (var i = 0; i < count; ++i) {
    fn(i);
  }
}

// away from zero by default.
function NearestEven(n) {
  return isEven(n) ? n : n + 1;
}

// your fault if you don't pass an integer value.
function isEven(n) {
  return Math.abs(n) % 2 == 0;
}
function isMultiple(v, m) {
  return Math.abs(v) % m == 0;
}
function Swap(a, b) {
  var tmp = a;
  a = b;
  b = tmp;
}
function Sign(value) {
  // someitmes i hate math.
  var sign = Math.sign(value);
  if (sign == 0) {
    sign = 1;
  }
  return sign;
}
function AvoidZero(value, radius) {
  if (Math.abs(value) < radius) {
    return radius * Sign(value);
  }
  return value;
}
function Trim(n, decimals) {
  var m = Math.pow(10, decimals != null ? decimals : 2);
  return Math.floor(n * m) / m;
}
function Distance(x0, y0, x1, y1) {
  var d = Math.sqrt(Distance2(x0, y0, x1, y1));
  return d;
}
function Distance2(x0, y0, x1, y1) {
  var d = Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2);
  return d;
}
function Pow2(v) {
  return Math.pow(v, 2);
}
function F(n) {
  return Math.floor(n * 100) / 100;
}
function Clip(n, min, max) {
  if (min > max) {
    var tmp = min;
    min = max;
    max = tmp;
  }
  return Math.min(max, Math.max(min, n));
}
function MinSigned(n, max) {
  var fm = Math.min(Math.abs(n), Math.abs(max));
  return Sign(n) * fm;
}
function Clip01(n) {
  return Clip(n, 0, 1);
}
function Clip255(n) {
  var i = Math.floor(n);
  return Clip(i, 0, 255);
}

// v expected to go from 0 to max.
function T10(v, max) {
  max = max == 0 ? 1 : max;
  return Clip01(1 - v / max);
}

// v expected to go from 0 to max.
function T01(v, max) {
  max = max == 0 ? 1 : max;
  return Clip01(v / max);
}

// v expected to go from 0 to max.
function T01nl(v, max) {
  max = max == 0 ? 1 : max;
  return Clip01(
  // aesthetically non linear hah.
  Math.pow(v / max, 3));
}
function xyNudge(y, ysize, scale, side) {
  var ypos = y + ysize / 2;
  var mid = gh(0.5);
  var factor = Clip01(Math.abs(mid - ypos) / mid);
  var xoff = scale * factor * ForSide(side, 1, -1);
  return xoff;
}
function update(o, s) {
  for (var _i = 0, _Object$entries = Object.entries(s); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      k = _Object$entries$_i[0],
      v = _Object$entries$_i[1];
    o[k] = v;
  }
}
function easeOutExpo(n) {
  n = Clip01(n);
  return n >= 1 ? 1 : 1 - Math.pow(2, -10 * n);
}