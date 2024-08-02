/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function ii(v) { return Math.floor(0.5 + v); }
// "absolute" casling helpers to scale values based on actual canvas resolution.
// arbiraryily trying to consistently use sx() for symmetrics e.g. lineWidth.
function sxi(x) { return ii(sx(x)); }
function syi(y) { return ii(sy(y)); }
function sx(x) { return x * gWidth/kHtmlWidth; }
function sy(y) { return y * gHeight/kHtmlHeight; }
// some scaled values have more change of ever becoming zero than others,
// so these helpers can be used to avoid that if needed e.g. pixel widths.
function sx1(x) { return Math.max(1, sxi(x)); }
function sy1(y) { return Math.max(1, syi(y)); }
// "percent" scaling helpers.
function gw(x=1) { return ii(x * gWidth); }
function gh(y=1) { return ii(y * gHeight); }

// the game was designed based on this default aspect & resolution kindasorta.
var kAspectRatio = 16/9;
var kHtmlWidth = 512; // match: index.html
var kHtmlHeight = 288; // match: index.html
Assert(Math.abs(kHtmlWidth/kHtmlHeight - kAspectRatio) < 0.1, "unexpected html aspect ratio");

var gWidth = kHtmlWidth;
var gHeight = kHtmlHeight;
Assert(Math.abs(gWidth/gHeight - kAspectRatio) < 0.1, "unexpected g aspect ratio");

function getBorderFactor() {
    // giving portrait more buffer on left and right for thumbs also
    // because the overall playfield is visually smaller, has fewer pixels
    // than landscape does.
    return getWindowAspect() > 1 ? 0.8 : 0.7;
}
function getWindowAspect() {
    return window.innerWidth / window.innerHeight;
}

// as much as i'd like to draw exactly on pixels, that ends up making
// wiggles be too wild and ugly.
function WX( v ) {
    return v + sx(gR.RandomBool() ? 0 : (gR.RandomBool() ? 0.1 : -0.1));
}
function WY( v ) {
    return v + sy(gR.RandomBool() ? 0 : (gR.RandomBool() ? 0.1 : -0.1));
}
