/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// sorry there are so many different ways of representing things here,
// though i do partially blame the utterly asinine canvas string based api.
// there really needs to be a cleanup of all this, like how spec.dark works.

const black = [0x0, 0x0, 0x0];
const blackSpec = { regular: black, strong: black };
const white = [0xFF, 0xFF, 0xFF];
const whiteSpec = { regular: [0xAA, 0xAA, 0xAA] , strong: white };

function MakeDark(spec) {
    return {
        strong: spec.regular,
        regular: spec.regular.map(c => Math.ceil(c/2)),
    };
}

const greySpec = { regular: [0xA0, 0xA0, 0xA0], strong: [0xA0, 0xA0, 0xA0] };
const greyDarkSpec = MakeDark(greySpec);
const greenSpec = { regular: [0x10, 0xE0, 0x00], strong: [0x00, 0xFF, 0x00] };
const greenDarkSpec = MakeDark(greenSpec);
const blueSpec = { regular: [0x05, 0x71, 0xB0], strong: [0x00, 0x00, 0xFF] };
const blueDarkSpec = MakeDark(blueSpec);
const redSpec = { regular: [0xB5, 0x19, 0x19], strong: [0xFF, 0x00, 0x00] };
const redDarkSpec = MakeDark(redSpec);
const cyanSpec = { regular: [0x57, 0xC4, 0xAD], strong: [0x00, 0xFF, 0xFF] };
const cyanDarkSpec = MakeDark(cyanSpec);
const yellowSpec = { regular: [0xED, 0xA2, 0x47], strong: [0xFF, 0xFF, 0x00] };
const yellowDarkSpec = MakeDark(yellowSpec);
const magentaSpec = { regular: [0xFF, 0x00, 0xFF], strong: [0xFF, 0x00, 0xFF] };
const magentaDarkSpec = MakeDark(magentaSpec);
const randomSpec = {
    get regular() {
        return [
            gR.RandomRangeInt(0, 255),
            gR.RandomRangeInt(0, 255),
            gR.RandomRangeInt(0, 255),
        ];
    },
    get strong() {
        return [
            gR.RandomRangeInt(128, 255),
            gR.RandomRangeInt(128, 255),
            gR.RandomRangeInt(128, 255),
        ];
    },
};

function makeRandomSpec() {
    var r = [
        gR.RandomRangeInt(0, 255),
        gR.RandomRangeInt(0, 255),
        gR.RandomRangeInt(0, 255),
    ];
    var bump = 255 - Math.max(r[0], r[1], r[2]);
    var s = [
        r[0] + bump,
        r[1] + bump,
        r[2] + bump,
    ];
    return { regular: r, strong: s };
};

const warningColorStr = "white";
const crtOutlineColorStr = "rgb(4, 32, 8)";
// match: index.html.
const backgroundColorStr = "black";
// match: backgroundColorStr, index.html
const scanlineColorStr = "rgba(0, 0, 0, 0.15)";
const puckColorStr = "cyan";

// meh! doubt/dunno that this does anything enough
// to reduce the sheer number of color strings
// such that javascript engines can optimize.
const kChannelQuantizeStep = 255/8;
function quantizeChannel(c) {
    if (c >= 255) { return 255; }
    if (c <= 0) { return 0; }
    return Math.floor( c / kChannelQuantizeStep ) * kChannelQuantizeStep;
}

// array channels are 0x0 - 0xFF, alpha is 0.0 - 1.0, like html/css.
const _tc = Array(4);
function rgba255s(array, alpha) {
    // detect any old style code that called this function.
    Assert(Array.isArray(array), "expected array as first parameter");

    _tc[0] = quantizeChannel(array[0]);
    _tc[1] = quantizeChannel(array[1]);
    _tc[2] = quantizeChannel(array[2]);

    // alpha is, in order of highest precedence:
    // array[4], or the 'alpha' argument, or the default value of 1.
    _tc[3] = alpha ?? 1;
    if (array.length == 4) {
        _tc[3] = array[3];
    }

    var joined = _tc.map((ch,i) => ((i < 3) ? Clip255(ch) : ch)).join(",");
    var str = ((array.length == 4 || exists(alpha)) ? "rgba(" : "rgb(") + joined + ")";
    return  str;
}

function lerp_channel(c0, c1, t) {
    return c0 + t * (c1-c0);
}

function lerp_rgba255s(src255, dst255, alpha, t) {
    Assert(exists(dst255));
    Assert(exists(src255));
    if (t < 0.01) {
        return rgba255s(src255, alpha);
    }
    if (t > 0.99) {
        return rgba255s(dst255, alpha);
    }
    else {
        return rgba255s(
            [lerp_channel(src255[0], dst255[0], t),
             lerp_channel(src255[1], dst255[1], t),
             lerp_channel(src255[2], dst255[2], t)],
            alpha
        );
    }
}

function ColorCycle(alpha=1, offset=0) {
    var r = Math.sin((offset+gGameTime) * 3 / 7000);
    var g = Math.sin((offset+gGameTime) * 11 / 7000);
    var b = Math.sin((offset+gGameTime) * 31 / 7000);
    if (r + g + b < 0.2) { g = 0.4; }
    return rgba255s(
        [Math.floor(r*255),
         Math.floor(g*255),
         Math.floor(b*255)],
        alpha
    );
}

function RandomColor(alpha=1) {
    return rgba255s(
        [
            gR.RandomRangeInt(0, 255),
            gR.RandomRangeInt(0, 255),
            gR.RandomRangeInt(0, 255),
            alpha
        ]
    );
}

function RandomForColor(spec, alpha=1) {
    if (gR.RandomBool(0.05)) {
        return rgba255s(spec.strong, alpha);
    }
    else {
        // "NTSC" ha ha.
        return rgba255s(
            spec.regular.map(ch => Clip(
                gR.RandomCentered(ch, 16),
                0,
                255
            )),
            alpha
        );
    }
}

function FadeIn(alpha, dstSpec=undefined) {
    if (gMonochrome) {
        // i.e. attract mode.
        return rgba255s(greenSpec.strong, alpha);
    }
    else {
        var t = GameTime01(kGreenFadeInMsec);
        // old behavior that was flickering.
        // todo: remove this and clean up any callers.
        if (isU(dstSpec)) {
            if (gR.RandomFloat() > t) {
                return rgba255s(
                    greenSpec.strong,
                    alpha
                );
            }
        }
        else {
            // new behavior that is lerping.
            // gradully go from green to color at game start.
            // note that other code relies on getting undefined at t=1.
            if (t > 0.99) {
                return undefined;
            }
            else {
                return lerp_rgba255s(
                    greenSpec.strong,
                    gR.RandomBool() ? dstSpec.regular : dstSpec.strong,
                    alpha,
                    t
                );
            }
        }
    }
    return undefined;
}

// everything starts off all green to harken back to pongy games,
// even if they weren't actually all on green screens, hah, 
// then gradually becomes the given color. 
function RandomForColorFadeIn(spec, alpha=1) {
    var faded = FadeIn(alpha, spec);
    if (exists(faded)) {
        return faded;
    }
    else {
        return RandomForColor(spec, alpha);
    }
}

function RandomZen(alpha) {
    return RandomForColorFadeIn(zenSpec, alpha);
}

function RandomGreySolid() {
    return RandomForColorFadeIn(greySpec, 1);
}
function RandomGrey(alpha) {
    return RandomForColorFadeIn(greySpec, alpha);
}

function RandomGreenSolid() {
    return RandomForColor(greenSpec, 1);
}
function RandomGreen(alpha) {
    return RandomForColor(greenSpec, alpha);
}

function RandomRedSolid() {
    return RandomForColorFadeIn(redSpec, 1);
}
function RandomRed(alpha) {
    return RandomForColorFadeIn(redSpec, alpha);
}

function RandomBlueSolid() {
    return RandomForColorFadeIn(blueSpec, 1);
}
function RandomBlue(alpha) {
    return RandomForColorFadeIn(blueSpec, alpha);
}

function RandomCyanSolid() {
    return RandomForColorFadeIn(cyanSpec, 1);
}
function RandomCyan(alpha) {
    return RandomForColorFadeIn(cyanSpec, alpha);
}

function RandomYellowSolid() {
    return RandomForColorFadeIn(yellowSpec, 1);
}
function RandomYellow(alpha) {
    return RandomForColorFadeIn(yellowSpec, alpha);
}

function RandomMagentaSolid() {
    return RandomForColorFadeIn(magentaSpec, 1);
}
function RandomMagenta(alpha) {
    return RandomForColorFadeIn(magentaSpec, alpha);
}
