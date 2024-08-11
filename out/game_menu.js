"use strict";

/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// note: even with these *MenuConstants,
// there is still a lot of hard-coding
// in the various Make*Buttons() below.

function GameMenuConstants() {
  var by0 = gh(0.4);
  var bw = gw(0.2);
  var bh = gSmallFontSize * 1.7;
  var bs = bh * 1.3;
  var ss = bh / 2;

  // all buttons are vertically aligned.
  var bl = gw(0.5) - bw / 2;
  var margin = {
    x: bw * 0.2,
    y: bh * 0.2
  };
  var font_size = gSmallFontSizePt;
  return {
    by0: by0,
    bw: bw,
    bh: bh,
    bs: bs,
    ss: ss,
    bl: bl,
    margin: margin,
    font_size: font_size
  };
}
function MakeQuitButton(_ref) {
  var k = _ref.constants,
    OnQuit = _ref.OnQuit;
  return new Button({
    x: k.bl,
    y: k.by0,
    width: k.bw,
    height: k.bh,
    margin: k.margin,
    // leading spaces to align with sfx checkbox.
    title: "  QUIT",
    align: "left",
    font_size: k.font_size,
    is_checkbox: false,
    click_fn: function click_fn(bself) {
      OnQuit();
    }
  });
}
function MakeMuteButton(_ref2) {
  var k = _ref2.constants;
  return new Button({
    x: k.bl,
    y: k.by0 + k.bs * 2,
    width: k.bw,
    height: k.bh,
    title: "SFX",
    align: "left",
    margin: k.margin,
    font_size: k.font_size,
    is_checkbox: true,
    is_checked: gSfxMuted,
    step_fn: function step_fn(bself) {
      bself.is_checked = !gSfxMuted;
    },
    click_fn: function click_fn(bself) {
      gSfxMuted = !gSfxMuted;
    }
  });
}
function MakeGameMenuButtons(_ref3) {
  var OnQuit = _ref3.OnQuit;
  var constants = new GameMenuConstants();
  var bSfx = MakeMuteButton({
    constants: constants
  });
  var bQuit = MakeQuitButton({
    constants: constants,
    OnQuit: OnQuit
  });
  return {
    focusId: "bSfx",
    navigation: {
      bQuit: {
        button: bQuit,
        down: "bSfx"
      },
      bSfx: {
        button: bSfx,
        up: "bQuit"
      }
    }
  };
}
;