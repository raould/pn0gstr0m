"use strict";

/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// note: even with these *MenuConstants,
// there is still a lot of hard-coding
// in the various Make*Buttons() below.

function GameMenuConstants() {
  var by0 = gh(0.2);
  var bw = gw(0.2);
  var bh = gSmallFontSizePt * 1.7;
  var bs = bh * 1.3;
  var ss = bh / 2;

  // all buttons are vertically aligned.
  var bl = gw(0.5) - bw / 2;
  var margin = {
    x: bw * 0.02,
    y: 0
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
function MakeMuteButton(_ref) {
  var k = _ref.constants;
  return new Button({
    x: k.bl,
    y: k.by0,
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
      SetSfxMuted(!gSfxMuted);
    }
  });
}
function MakeResumeButton(_ref2) {
  var k = _ref2.constants,
    OnResume = _ref2.OnResume;
  return new Button({
    x: k.bl,
    y: k.by0 + k.bs * 2,
    width: k.bw,
    height: k.bh,
    // leading spaces to align with sfx checkbox.
    title: " RESUME",
    align: "left",
    margin: k.margin,
    font_size: k.font_size,
    is_checkbox: false,
    click_fn: function click_fn(bself) {
      OnResume();
    }
  });
}
function MakeQuitButton(_ref3) {
  var k = _ref3.constants,
    OnQuit = _ref3.OnQuit;
  return new Button({
    x: k.bl,
    y: k.by0 + k.bs * 3,
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
function MakeGameMenuButtons(_ref4) {
  var OnResume = _ref4.OnResume,
    OnQuit = _ref4.OnQuit;
  var constants = new GameMenuConstants();
  var bQuit = MakeQuitButton({
    constants: constants,
    OnQuit: OnQuit
  });
  var bResume = MakeResumeButton({
    constants: constants,
    OnResume: OnResume
  });
  var bSfx = MakeMuteButton({
    constants: constants
  });
  return {
    focusId: "bResume",
    navigation: {
      bSfx: {
        button: bSfx,
        down: "bResume"
      },
      bResume: {
        button: bResume,
        up: "bSfx",
        down: "bQuit"
      },
      bQuit: {
        button: bQuit,
        up: "bResume"
      }
    }
  };
}
;