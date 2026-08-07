"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
var _marked = /*#__PURE__*/_regenerator().m(range);
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

var k2Pi = Math.PI * 2;
var kPi2 = Math.PI / 2;
function round(n) {
  return Math.floor(n + 0.5);
}
function mod(n, m) {
  // history is a b*tch.
  return (n % m + m) % m;
}
function isBadNumber(n) {
  return n === undefined || isNaN(n);
}
function isU(u) {
  return u == undefined;
}
function exists(u) {
  return u != undefined;
}
function aub(a, b) {
  return a != undefined ? a : b;
}
function noOp() {}
var gLogOnceMap = {};
function forgetLogOnceAll() {
  gLogOnceMap = {};
}
function forgetLogOnce(key) {
  delete gLogOnceMap[key];
}
function logOnce(key, msg) {
  if (!gLogOnceMap[key]) {
    console.log(key, msg);
    gLogOnceMap[key] = true;
  }
}
// todo: logOncePerLevel(), logOncePerGame().

var gLogEveryMap = {};
function logEvery(key, v, count) {
  var oc = gLogEveryMap[key];
  var update = isU(oc) || oc % count === 0;
  if (update) {
    console.log(key, v);
    gLogEveryMap[key] = 0;
  }
  gLogEveryMap[key]++;
}
var gLogOnChangeMap = {};
function logOnChange(key, v, xmsg) {
  var ov = gLogOnChangeMap[key];
  var update = isU(ov) || ov != v;
  if (update) {
    if (exists(xmsg)) {
      console.log(key, v, xmsg);
    } else {
      console.log(key, v);
    }
    gLogOnChangeMap[key] = v;
  }
}
var gLogOnDeltaMap = {};
function logOnDelta(key, v, delta, xmsg) {
  var ov = gLogOnDeltaMap[key];
  var update = isU(ov) || Math.abs(v - ov) >= delta;
  if (update) {
    if (exists(xmsg)) {
      console.log(key, v, xmsg);
    } else {
      console.log(key, v);
    }
    gLogOnDeltaMap[key] = v;
  }
}
function SafeDiv1(num, denom) {
  if (denom == 0) {
    return 1;
  }
  return num / denom;
}
function SafeDiv0(num, denom) {
  if (denom == 0) {
    return 0;
  }
  return num / denom;
}

// not the best name if you ask me (now).
function PeekLast(a) {
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

// you have to pass an integer value, really.
function isEven(n) {
  Assert(Number.isInteger(n), n);
  return isMultiple(n, 2);
}

// you have to pass integer values, really.
function isMultiple(v, m) {
  Assert(Number.isInteger(v), v);
  Assert(Number.isInteger(m), m);
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
  if (value >= 0 && value < radius) {
    return radius;
  }
  if (value <= 0 && value > radius) {
    return -radius;
  }
  return value;
}
function AvoidOne(value, radius) {
  if (value > 0) {
    return AvoidZero(value - 1, radius);
  }
  if (value < 0) {
    return AvoidZero(value + 1, radius);
  }
  return value;
}
function Trim(n, decimals) {
  var m = Math.pow(10, decimals != null ? decimals : 2);
  return Math.floor(n * m) / m;
}
function FromTo(x0, y0, x1, y1) {
  return {
    x: x1 - x0,
    y: y1 - y0
  };
}
function Distance(x0, y0, x1, y1) {
  var d = Math.sqrt(Distance2(x0, y0, x1, y1));
  return d;
}
function Distance2(x0, y0, x1, y1) {
  var d = Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2);
  return d;
}
function Magnitude(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}
function Norm(x, y, m) {
  m = m != null ? m : Magnitude(x, y);
  if (m === 0) {
    m = 1;
  }
  return {
    x: x / m,
    y: y / m
  };
}
function Pow2(v) {
  return Math.pow(v, 2);
}
function F(n, sd) {
  var dd = sd == undefined ? 100 : Math.pow(10, sd);
  return Math.floor(n * dd) / dd;
}
function FNP(n, singular, plural) {
  if (n === 1) {
    return singular;
  }
  return plural;
}
function Wrap(n, max) {
  Assert(max >= 0);
  return mod(n, max);
}
function MinSigned(n, max) {
  var fm = Math.min(Math.abs(n), Math.abs(max));
  return Sign(n) * fm;
}
function MaxSigned(n, max) {
  var fm = Math.max(Math.abs(n), Math.abs(max));
  return Sign(n) * fm;
}
function Clip(n, min, max) {
  if (min > max) {
    return Math.min(min, Math.max(max, n));
  } else {
    return Math.min(max, Math.max(min, n));
  }
}
function Clip01(n) {
  return Clip(n, 0, 1);
}
function Clip01Signed(n) {
  if (n < 0) {
    return Clip(n, -1, 0);
  }
  return Clip(n, 0, 1);
}
function Clip255(n) {
  var i = Math.floor(n);
  return Clip(i, 0, 255);
}

// v expected to go from 0 to max.
// v = 0 -> return = 1.
// v = max -> return = 0.
function T10Range(v, min, max) {
  var t = T10(Clip(v, min, max) - min, max - min);
  Assert(!isBadNumber(t), "t");
  return t;
}

// v expected to go from 0 to max.
// v = 0 -> return = 1.
// v = max -> return = 0.
function T10(v, max) {
  max = max == 0 ? 1 : max;
  var t = Clip01(1 - v / max);
  Assert(!isBadNumber(t), "t");
  return t;
}
function T10Signed(v, max) {
  max = max == 0 ? 1 : max;
  var t = Clip01Signed(1 - v / max);
  Assert(!isBadNumber(t), "t");
  return t;
}

// v expected to be in range [0, max].
// v = 0 -> return = 0.
// v = max -> return = 1.
function T01Range(v, min, max) {
  var t = T01(Clip(v, min, max) - min, max - min);
  Assert(!isBadNumber(t), "t");
  return t;
}

// v expected to be in range [0, max].
// v = 0 -> return = 0.
// v = max -> return = 1.
function T01(v, max) {
  max = max == 0 ? 1 : max;
  var t = Clip01(v / max);
  Assert(!isBadNumber(t), "t");
  return t;
}
function T01Signed(v, max) {
  max = max == 0 ? 1 : max;
  var t = Clip01Signed(v / max);
  Assert(!isBadNumber(t), "t");
  return t;
}

// aesthetically "non linear".
// v expected to be in range [0, max].
function T01nl(v, max) {
  var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3;
  max = max == 0 ? 1 : max;
  var t = Clip01(Math.pow(v / max, p));
  Assert(!isBadNumber(t), "t");
  return t;
}
function T10nl(v, max) {
  var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3;
  var t = 1 - T01nl(v, max, p);
  Assert(!isBadNumber(t), "t");
  return t;
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

/*class*/
function TimedElements(_ref) {
  var elements = _ref.elements,
    duration = _ref.duration;
  var self = this;
  self.Init = function () {
    self.elements = elements;
    self.duration = duration;
    self.lastTime = gGameTime;
    self.index = 0;
  };
  self.Current = function () {
    // todo: this probably doesn't respect pause.
    var diff = gGameTime - self.lastTime;
    if (diff > self.duration) {
      self.index = (self.index + 1) % self.elements.length;
      self.lastTime = gGameTime;
    }
    return self.elements[self.index];
  };
  self.Init();
}
var kAppleMobileHellPlatforms = ["ipad", "iphone", "ipod", "mac"];
function supportsFullscreen() {
  if (!kAppMode) {
    return false;
  }
  var plc = navigator.platform.toLowerCase();
  var isAppleHell = kAppleMobileHellPlatforms.reduce(function (h, p) {
    return h || plc.includes(p);
  }, false);
  return !isAppleHell;
}

// [start, end) or [end, start)
function range(start, end) {
  var up, step, cur;
  return _regenerator().w(function (_context) {
    while (1) switch (_context.n) {
      case 0:
        up = start <= end;
        step = up ? 1 : -1;
        cur = start;
      case 1:
        if (!(up ? cur < end : cur > end)) {
          _context.n = 3;
          break;
        }
        _context.n = 2;
        return cur;
      case 2:
        cur += step;
        _context.n = 1;
        break;
      case 3:
        return _context.a(2);
    }
  }, _marked);
}
function tryStringify(data) {
  try {
    return JSON.stringify(data);
  } catch (err) {
    console.error("tryStringify", err);
  }
}
function uniq(arr) {
  var h = new Map();
  for (var i = 0; i < arr.length; ++i) {
    h.set(i, arr[i]);
  }
  var uniq = [];
  for (var _i2 = 0; _i2 < arr.length; ++_i2) {
    if (h.has(_i2)) {
      uniq.push(h.get(_i2));
    }
  }
  return uniq;
}