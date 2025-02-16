/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

var k2Pi = Math.PI*2;
var kPi2 = Math.PI/2;

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

const gLogOnceMap = {};
function logOnce(key, msg) {
    if (!gLogOnceMap[key]) {
        console.log(msg);
        gLogOnceMap[key] = true;
    }
}

const gLogEveryMap = {};
function logEvery(key, v, count) {
    const oc = gLogEveryMap[key];
    const update = isU(oc) || (oc%count === 0);
    if (update) {
        console.log(key, v);
        gLogEveryMap[key] = gLogEveryMap[key] + 1;
    }
}

const gLogOnChangeMap = {};
function logOnChange(key, v, xmsg) {
    const ov = gLogOnChangeMap[key];
    const update = isU(ov) || ov != v;
    if (update) {
        if (exists(xmsg)) {
            console.log(key, v, xmsg);
        } else {
            console.log(key, v);
        }
        gLogOnChangeMap[key] = v;
    }
}

const gLogOnDeltaMap = {};
function logOnDelta(key, v, delta, xmsg) {
    const ov = gLogOnDeltaMap[key];
    const update = isU(ov) || Math.abs(v-ov) >= delta;
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
        return a[a.length-1];
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
    return isEven(n) ? n : n+1;
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
    if (sign == 0) { sign = 1; }
    return sign;
}

function AvoidZero(value, radius) {
    if (value > 0 && value < radius) { return radius; }
    if (value < 0 && value > radius) { return -radius; }
    return value;
}

function AvoidOne(value, radius) {
    if (value > 0) { return AvoidZero(value-1, radius); }
    if (value < 0) { return AvoidZero(value+1, radius); }
    return value;
}

function Trim(n, decimals) {
    const m = Math.pow(10, decimals ?? 2);
    return Math.floor(n*m)/m;
}

function Distance(x0, y0, x1, y1) {
    var d = Math.sqrt(Distance2(x0, y0, x1, y1));
    return d;
}

function Distance2(x0, y0, x1, y1) {
    var d = Math.pow(x1-x0,2) + Math.pow(y1-y0,2);
    return d;
}

function Pow2(v) {
    return Math.pow(v, 2);
}

function F(n, sd) {
    var dd = (sd == undefined) ? 100 : Math.pow(10, sd);
    return Math.floor(n*dd)/dd;
}

function FNP(n, singular, plural) {
    if (n === 1) { return singular; }
    return plural;
}

function Wrap(n, max) {
    Assert(max >= 0);
    if (max === 0) { return 0; }
    if (n > max) { return n % max; }
    if (n < 0) { return max + (n % max); }
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
        var tmp = min; min = max; max = tmp;
    }
    return Math.min(max, Math.max(min, n));
}

function Clip01(n) {
    return Clip(n, 0, 1);
}

function Clip01Signed(n) {
    if (n < 0) { return Clip(n, -1, 0); }
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
    return Clip01(1 - v/max);
}

function T10Signed(v, max) {
    max = max == 0 ? 1 : max;
    return Clip01Signed(1 - v/max);
}

// v expected to be in range [0, max].
// v = 0 -> return = 0.
// v = max -> return = 1.
function T01(v, max) {
    max = max == 0 ? 1 : max;
    return Clip01(v/max);
}

function T01Signed(v, max) {
    max = max == 0 ? 1 : max;
    return Clip01Signed(v/max);
}

// aesthetically "non linear".
// v expected to be in range [0, max].
function T01nl(v, max) {
    max = max == 0 ? 1 : max;
    return Clip01(
        Math.pow(
            v/max,
            3
        )
    );
}

function xyNudge(y, ysize, scale, side) {
    var ypos = y + ysize/2;
    var mid = gh(0.5);
    var factor = Clip01(Math.abs(mid - ypos)/mid);
    var xoff = (scale * factor) * ForSide(side, 1, -1);
    return xoff;
}

function update(o, s) {
    for (var [k,v] of Object.entries(s)) {
        o[k] = v;
    }
}

function easeOutExpo(n) {
    n = Clip01(n);
    return n >= 1 ? 1 : 1 - Math.pow(2, -10 * n);
}

/*class*/ function TimedElements({elements, duration}) {
    var self = this;

    self.Init = function() {
	self.elements = elements;
	self.duration = duration;
	self.lastTime = gGameTime;
	self.index = 0;
    };

    self.Current = function() {
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

var kAppleMobileHellPlatforms = [
    "ipad",
    "iphone",
    "ipod",
    "mac",
];
function supportsFullscreen() {
    const plc = navigator.platform.toLowerCase()
    const isAppleHell = kAppleMobileHellPlatforms.reduce(
        (h, p) => h || plc.includes(p),
        false
    );
    return !isAppleHell;
}
