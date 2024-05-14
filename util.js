/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function Assert(result, msg) {
    if (!result) {
	console.error("ASSERTION FAILED", msg);
    }
}

function JsonStringToArrayWorkaround(json_str) {
    try {
	json = JSON.parse(json_str);
	if (typeof json == "string") {
	    // oh my gosh wait ?!?!@?!?!?!?!?@@!#!@#!@#!@
	    // https://stackoverflow.com/questions/710586/json-stringify-array-bizarreness-with-prototype-js
	    json = JSON.parse(json);
	    Assert(typeof json == "object");
	}
	return json;
    }
    catch (err) {
	console.error(err);
	return [];
    }
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
