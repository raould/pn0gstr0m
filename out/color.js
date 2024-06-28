"use strict";

/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// sorry there are so many different ways of representing things here,
// though i do partially blame the utterly asinine canvas string based api.
// there really needs to be a cleanup of all this, like how spec.dark works.

var black = [0x0, 0x0, 0x0];
var white = [0xFF, 0xFF, 0xFF];
function MakeDark(spec) {
  return {
    strong: spec.regular,
    regular: spec.regular.map(function (c) {
      return Math.ceil(c / 2);
    })
  };
}
var greySpec = {
  regular: [0xA0, 0xA0, 0xA0],
  strong: [0xA0, 0xA0, 0xA0]
};
var greyDarkSpec = MakeDark(greySpec);
var greenSpec = {
  regular: [0x10, 0xE0, 0x00],
  strong: [0x00, 0xFF, 0x00]
};
var greenDarkSpec = MakeDark(greenSpec);
var blueSpec = {
  regular: [0x05, 0x71, 0xB0],
  strong: [0x00, 0x00, 0xFF]
};
var blueDarkSpec = MakeDark(blueSpec);
var redSpec = {
  regular: [0xB5, 0x19, 0x19],
  strong: [0xFF, 0x00, 0x00]
};
var redDarkSpec = MakeDark(redSpec);
var cyanSpec = {
  regular: [0x57, 0xC4, 0xAD],
  strong: [0x00, 0xFF, 0xFF]
};
var cyanDarkSpec = MakeDark(cyanSpec);
var yellowSpec = {
  regular: [0xED, 0xA2, 0x47],
  strong: [0xFF, 0xFF, 0x00]
};
var yellowDarkSpec = MakeDark(yellowSpec);
var magentaSpec = {
  regular: [0xFF, 0x00, 0xFF],
  strong: [0xFF, 0x00, 0xFF]
};
var magentaDarkSpec = MakeDark(magentaSpec);
var warningColorStr = "white";
var crtOutlineColorStr = "rgb(16, 64, 16)";
// match: index.html.
var backgroundColorStr = "black";
// match: backgroundColorStr, index.html
var scanlineColorStr = "rgba(0, 0, 0, 0.15)";

// array channels are 0x0 - 0xFF, alpha is 0.0 - 1.0, like html/css.
var _tc = Array(4);
function rgba255s(array, alpha) {
  // detect any old style code that called this function.
  Assert(Array.isArray(array), "expected array as first parameter");
  _tc[0] = array[0];
  _tc[1] = array[1];
  _tc[2] = array[2];
  _tc[3] = alpha != null ? alpha : 1;
  if (array.length == 4) {
    _tc[3] = array[3];
  }
  var joined = _tc.map(function (ch, i) {
    return i < 3 ? Clip255(ch) : ch;
  }).join(",");
  var str = (array.length == 4 || exists(alpha) ? "rgba(" : "rgb(") + joined + ")";
  return str;
}
function RandomColor(alpha) {
  return rgba255s([RandomRange(0, 255), RandomRange(0, 255), RandomRange(0, 255), alpha != null ? alpha : 1]);
}
function RandomForColor(spec, alpha) {
  if (alpha == undefined) {
    alpha = 1;
  }
  if (RandomBool(0.05)) {
    return rgba255s(spec.strong, alpha);
  } else {
    // NTSC.
    return rgba255s(spec.regular.map(function (ch) {
      return RandomCentered(ch, 16);
    }), alpha);
  }
}

// evil globals herein.
// everything starts off all green to harken back to pongy games,
// even if they weren't actually all on green screens, hah, 
// then gradually flickers into the given color. 
function RandomForColorFadeIn(color, alpha) {
  if (alpha == undefined) {
    alpha = 1;
  }
  if (gMonochrome) {
    // i.e. attract mode.
    return rgba255s(greenSpec.strong, alpha);
  } else if (gRandom() > GameTime01(kGreenFadeInMsec)) {
    // gradully go from green to color at game start.
    return rgba255s(greenSpec.strong, alpha);
  } else {
    // even more fading in, to go along with MakeGameStartAnimation.
    alpha = Math.min(alpha, Clip01(GameTime01(kAlphaFadeInMsec)));
    return RandomForColor(color, alpha);
  }
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