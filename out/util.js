"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
var _marked = /*#__PURE__*/_regeneratorRuntime().mark(range);
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
function logOnce(key, msg) {
  if (!gLogOnceMap[key]) {
    console.log(msg);
    gLogOnceMap[key] = true;
  }
}
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
function SafeDiv(num, denom) {
  return num / (denom != 0 ? denom : 1);
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
  if (value > 0 && value < radius) {
    return radius;
  }
  if (value < 0 && value > radius) {
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
  var _m;
  m = (_m = m) != null ? _m : Magnitude(x, y);
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
  if (max === 0) {
    return 0;
  }
  if (n > max) {
    return n % max;
  }
  if (n < 0) {
    return max + n % max;
  }
  return n;
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
    var tmp = min;
    min = max;
    max = tmp;
  }
  return Math.min(max, Math.max(min, n));
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
function T10(v, max) {
  max = max == 0 ? 1 : max;
  return Clip01(1 - v / max);
}
function T10Signed(v, max) {
  max = max == 0 ? 1 : max;
  return Clip01Signed(1 - v / max);
}

// v expected to be in range [0, max].
// v = 0 -> return = 0.
// v = max -> return = 1.
function T01(v, max) {
  max = max == 0 ? 1 : max;
  return Clip01(v / max);
}
function T01Signed(v, max) {
  max = max == 0 ? 1 : max;
  return Clip01Signed(v / max);
}

// aesthetically "non linear".
// v expected to be in range [0, max].
function T01nl(v, max) {
  var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3;
  max = max == 0 ? 1 : max;
  return Clip01(Math.pow(v / max, p));
}
function T10nl(v, max) {
  var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3;
  return 1 - T01nl(v, max, p);
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
  var up, cur;
  return _regeneratorRuntime().wrap(function range$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        up = start <= end;
        step = up ? 1 : -1;
        cur = start;
      case 3:
        if (!(up ? cur < end : cur > end)) {
          _context.next = 9;
          break;
        }
        _context.next = 6;
        return cur;
      case 6:
        cur += step;
        _context.next = 3;
        break;
      case 9:
      case "end":
        return _context.stop();
    }
  }, _marked);
}