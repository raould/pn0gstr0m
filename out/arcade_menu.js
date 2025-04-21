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

function ArcadeMenuConstants() {
  var bw = gw(0.2);
  var bh = gSmallFontSizePt * 1.7;
  var bs = bh * 1.3;
  var ss = bh;

  // hard coded assumption:
  // 1 & 2 player grouped
  // space,
  // then the Start button,
  // all centered.
  var bx0 = gw(0.5) - bw / 2;
  var by0 = gh(0.3);
  var bx1 = gw(0.5) - bw / 2;
  var by1 = by0 + bs * 2 + ss;
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
function MakeStartButtons(_ref2) {
  var k = _ref2.constants,
    OnStart = _ref2.OnStart;
  return {
    bStart: new Button({
      x: k.bx1,
      y: k.by1,
      width: k.bw,
      height: k.bh,
      title: "START",
      align: "center",
      margin: k.margin,
      font_size: k.font_size,
      step_fn: function step_fn(bself) {},
      click_fn: function click_fn(bself) {
        OnStart();
      }
    })
  };
}
function MakeArcadeMenuButtons(_ref3) {
  var OnStart = _ref3.OnStart;
  var constants = new ArcadeMenuConstants();
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
  var _MakeStartButtons = MakeStartButtons({
      constants: constants,
      OnStart: OnStart
    }),
    bStart = _MakeStartButtons.bStart;
  return {
    focusId: "bp1",
    navigation: {
      bp1: {
        button: bp1,
        down: "bp2"
      },
      bp2: {
        button: bp2,
        up: "bp1",
        down: "bStart"
      },
      bStart: {
        button: bStart,
        up: "bp2"
      }
    }
  };
}