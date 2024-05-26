/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

var black = [0x0, 0x0, 0x0];
var grey = { regular: [0xA0, 0xA0, 0xA0], strong: [0xA0, 0xA0, 0xA0] };
var green = { regular: [0x89, 0xCE, 0x00], strong: [0x00, 0xFF, 0x00] };
var blue = { regular: [0x05, 0x71, 0xB0], strong: [0x00, 0x00, 0xFF] };
var red = { regular: [0xB5, 0x19, 0x19], strong: [0xFF, 0x00, 0x00] };
var cyan = { regular: [0x57, 0xC4, 0xAD], strong: [0x00, 0xFF, 0xFF] };
var yellow = { regular: [0xED, 0xA2, 0x47], strong: [0xFF, 0xFF, 0x00] };
var magenta = { regular: [0xFF, 0x00, 0xFF], strong: [0xFF, 0x00, 0xFF] };
var backgroundColor = "black"; // match: index.html background color.
var warningColor = "grey";

// array channels are 0-255, alpha is 0-1, like html/css.
var _tc = Array(4);
function rgb255s(array, alpha) {
    // detect any old style code that called this function.
    Assert(Array.isArray(array), "expected array as first parameter");
    _tc[0] = array[0];
    _tc[1] = array[1];
    _tc[2] = array[2];
    _tc[3] = alpha ?? 1;
    if (array.length == 4) {
	_tc[3] = array[3];
    }
    var joined = _tc.map((ch,i) => ((i < 3) ? Clip255(ch) : ch)).join(",");
    var str = ((array.length == 4 || notU(alpha)) ? "rgba(" : "rgb(") + joined + ")";
    return  str;
}

function RandomColor(alpha) {
    return rgb255s(
	[
	    RandomRange(0, 255),
	    RandomRange(0, 255),
	    RandomRange(0, 255),
	    alpha ?? 1
	]
    );
}

function RandomForColor(color, alpha) {
    if (alpha == undefined) { alpha = 1; }
    if (RandomBool(0.8)) {
	// some aesthetic flickers of strong color.
	return rgb255s(color.strong, alpha);
    }
    else {
	// slightly varied color.
	return rgb255s(
	    color.regular.map(ch => RandomCentered(ch, 20)),
	    alpha
	);
    }
}

function RandomForColorFadein(color, alpha) {
    if (alpha == undefined) { alpha = 1; }
    if (gMonochrome) {
	// i.e. attract mode.
	return rgb255s(green.strong, alpha);
    }
    else if (gRandom() > GameTime01(kFadeInMsec)) {
	// gradully go from green to color at game start.
	return rgb255s(green.strong, alpha);
    }
    else {
	return RandomForColor(color, alpha);
    }
}

function RandomGreySolid() {
    return RandomForColorFadein(grey, 1);
}
function RandomGrey(alpha) {
    return RandomForColorFadein(grey, alpha);
}

function RandomGreenSolid() {
    return RandomForColorFadein(green, 1);
}
function RandomGreen(alpha) {
    return RandomForColorFadein(green, alpha);
}

function RandomRedSolid() {
    return RandomForColorFadein(red, 1);
}
function RandomRed(alpha) {
    return RandomForColorFadein(red, alpha);
}

function RandomBlueSolid() {
    return RandomForColorFadein(blue, 1);
}
function RandomBlue(alpha) {
    return RandomForColorFadein(blue, alpha);
}

function RandomCyanSolid() {
    return RandomForColorFadein(cyan, 1);
}
function RandomCyan(alpha) {
    return RandomForColorFadein(cyan, alpha);
}

function RandomYellowSolid() {
    return RandomForColorFadein(yellow, 1);
}
function RandomYellow(alpha) {
    return RandomForColorFadein(yellow, alpha);
}

function RandomMagentaSolid() {
    return RandomForColorFadein(magenta, 1);
}
function RandomMagenta(alpha) {
    return RandomForColorFadein(magenta, alpha);
}
