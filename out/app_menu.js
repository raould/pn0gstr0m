"use strict";

/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// note: even with these *MenuConstants,
// there is still a lot of hard-coding
// in the various Make*Buttons() below.

// todo: the interaction of 1 vs. 2 player and
// all the game modes regular, hard, zen, is
// very complected and stateful and easily buggy.
// e.g. if you were in 2 player and go to
// 1 player mode, what should happen to the
// optional zen & hard settings?
// make that less so somehow.

function AppMenuConstants() {
  var bw = gw(0.2);
  var bh = gSmallFontSizePt * 1.7;
  var bs = bh * 1.2;
  var ss = bh / 2;

  // hard coded assumption:
  // there are 3 groups of 2 buttons each.
  var bx0 = gw(0.5) - bw / 3 - bw / 2;
  var by0 = gh(0.05);
  var bx1 = gw(0.5) - bw / 2;
  var by1 = by0 + bs * 2 + ss;
  var bx2 = gw(0.5) + bw / 3 - bw / 2;
  var by2 = by1 + bs * 2 + ss;
  var margin = {
    x: bw * 0.2,
    y: bh * 0.2
  };
  var font_size = gSmallFontSizePt;
  return {
    bw: bw,
    bh: bh,
    bs: bs,
    ss: ss,
    bx0: bx0,
    by0: by0,
    bx1: bx1,
    by1: by1,
    bx2: bx2,
    by2: by2,
    margin: margin,
    font_size: font_size
  };
}
function MakePlayerButtons(_ref) {
  var k = _ref.constants,
    playerRadios = _ref.playerRadios;
  return {
    bp1: new Button({
      x: k.bx0,
      y: k.by0,
      width: k.bw,
      height: k.bh,
      margin: k.margin,
      title: "1 PLAYER",
      align: "left",
      font_size: k.font_size,
      is_checkbox: true,
      is_checked: is1P(),
      step_fn: function step_fn(bself) {
        var was_checked = bself.is_checked;
        bself.is_checked = is1P();
        bself.wants_focus = bself.is_checked && !was_checked;
      },
      click_fn: function click_fn(bself) {
        // match: TitleState.ProcessOneInput singlePlayer.
        gSinglePlayer = true;
        SetGameMode(kGameModeRegular);
        playerRadios.OnSelect(bself);
      }
    }),
    bp2: new Button({
      x: k.bx0,
      y: k.by0 + k.bs,
      width: k.bw,
      height: k.bh,
      title: "2 PLAYERS",
      align: "left",
      margin: k.margin,
      font_size: k.font_size,
      is_checkbox: true,
      is_checked: !is1P(),
      step_fn: function step_fn(bself) {
        var was_checked = bself.is_checked;
        bself.is_checked = !is1P();
        bself.wants_focus = bself.is_checked && !was_checked;
      },
      click_fn: function click_fn(bself) {
        // match: TitleState.ProcessOneInput doublePlayer.
        SetGameMode(kGameMode2P);
        playerRadios.OnSelect(bself);
      }
    })
  };
}
function MakeModeButtons(_ref2) {
  var k = _ref2.constants,
    modeRadios = _ref2.modeRadios;
  return {
    bHard: new Button({
      x: k.bx1,
      y: k.by1,
      width: k.bw,
      height: k.bh,
      title: "HARD MODE",
      align: "left",
      margin: k.margin,
      font_size: k.font_size,
      is_checkbox: true,
      is_checked: gGameMode === kGameModeHard,
      disabled: !is1P(),
      step_fn: function step_fn(bself) {
        if (is1P()) {
          var was_checked = bself.is_checked;
          bself.is_checked = gGameMode === kGameModeHard;
          bself.wants_focus = bself.is_checked && !was_checked;
          bself.disabled = false;
        } else {
          bself.wants_focus = false;
          bself.disabled = true;
        }
      },
      click_fn: function click_fn(bself) {
        SetGameMode(gGameMode === kGameModeHard ? kGameModeRegular : kGameModeHard);
        modeRadios.OnSelect(bself);
      }
    }),
    bZen: new Button({
      x: k.bx1,
      y: k.by1 + k.bs,
      width: k.bw,
      height: k.bh,
      title: "ZEN MODE",
      align: "left",
      margin: k.margin,
      font_size: k.font_size,
      is_checkbox: true,
      is_checked: gGameMode === kGameModeZen,
      disabled: !is1P(),
      step_fn: function step_fn(bself) {
        if (is1P()) {
          var was_checked = bself.is_checked;
          bself.is_checked = gGameMode === kGameModeZen;
          bself.wants_focus = bself.is_checked && !was_checked;
          bself.disabled = false;
        } else {
          bself.wants_focus = false;
          bself.disabled = true;
        }
      },
      click_fn: function click_fn(bself) {
        SetGameMode(gGameMode === kGameModeZen ? kGameModeRegular : kGameModeZen);
        modeRadios.OnSelect(bself);
      }
    })
  };
}
function MakeMuteButtons(_ref3) {
  var k = _ref3.constants;
  return {
    bSfx: new Button({
      x: k.bx2,
      y: k.by2,
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
    }),
    bMusic: new Button({
      x: k.bx2,
      y: k.by2 + k.bs,
      width: k.bw,
      height: k.bh,
      title: "MUSIC",
      align: "left",
      margin: k.margin,
      font_size: k.font_size,
      is_checkbox: true,
      is_checked: gMusicMuted,
      step_fn: function step_fn(bself) {
        bself.is_checked = !gMusicMuted;
      },
      click_fn: function click_fn(bself) {
        gMusicMuted = !gMusicMuted;
        gMusicMuted ? StopAudio() : BeginMusic();
      }
    })
  };
}
function MakeAppMenuButtons() {
  var constants = new AppMenuConstants();
  var playerRadios = new Radios();
  var modeRadios = new Radios();
  var _MakePlayerButtons = MakePlayerButtons({
      constants: constants,
      playerRadios: playerRadios
    }),
    bp1 = _MakePlayerButtons.bp1,
    bp2 = _MakePlayerButtons.bp2;
  playerRadios.AddButton(bp1);
  playerRadios.AddButton(bp2);
  var _MakeModeButtons = MakeModeButtons({
      constants: constants,
      modeRadios: modeRadios
    }),
    bHard = _MakeModeButtons.bHard,
    bZen = _MakeModeButtons.bZen;
  var _MakeMuteButtons = MakeMuteButtons({
      constants: constants
    }),
    bMusic = _MakeMuteButtons.bMusic,
    bSfx = _MakeMuteButtons.bSfx;
  return {
    focusId: is1P() ? "bp1" : "bp2",
    navigation: {
      bp1: {
        button: bp1,
        down: "bp2"
      },
      bp2: {
        button: bp2,
        up: "bp1",
        down: "bHard"
      },
      bHard: {
        button: bHard,
        up: "bp2",
        down: "bZen"
      },
      bZen: {
        button: bZen,
        up: "bHard",
        down: "bSfx"
      },
      bSfx: {
        button: bSfx,
        up: "bZen",
        down: "bMusic"
      },
      bMusic: {
        button: bMusic,
        up: "bSfx"
      }
    }
  };
}