/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

var k2Pi = Math.PI*2;

function isU(u) {
    return u == undefined;
}

function isntU(u) {
    return u != undefined;
}

function aorb(a, b) {
    return a != undefined ? a : b;
}

function noOp() {}

function Assert(result, msg) {
    if (!result) {
	console.error("ASSERTION FAILED", msg);
	debugger;
    }
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

// your fault if you don't pass an integer value.
function isEven(n) {
    return n%2 == 0 || n%2 == -0;
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
    if (Math.abs(value) < radius) {
	return radius * Sign(value);
    }
    return value;
}

function Trim(f, decimals) {
    const m = Math.pow(10, decimals ?? 2);
    return Math.floor(f*m)/m;
}

function Distance(x0, y0, x1, y1) {
    return Math.sqrt(Math.pow(x1-x0,2)+Math.pow(y1-y0,2));
}

function F(n) {
    return Math.floor(n*100)/100;
}

function Clip(f, min, max) {
    if (min > max) {
	var tmp = min; min = max; max = tmp;
    }
    return Math.min(max, Math.max(min, f));
}

function MinSigned(f, max) {
    var fm = Math.min(Math.abs(f), Math.abs(max));
    return Sign(f) * fm;
}

function Clip01(f) {
    return Clip(f, 0, 1);
}

function Clip255(f) {
    var i = Math.floor(f);
    return Clip(i, 0, 255);
}

function T01(v, max) {
    return Clip01(
	Math.pow(
	    v/(max==0?1:max),
	    3
	)
    );
}
