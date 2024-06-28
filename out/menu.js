"use strict";

/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

/*

 this is kind of complected because it is handling
 both the menu and the game states. :-\ software kinda
 sucks, coding is hard, there's just too much variation.
 also, because some of the keyboard input first gets
 handled in the *State in main.
 also, all the button positions are sorta hard-coded.
 also-also, there's too many things that need to refer
 to each other, and special cases, like how the esc button
 can never have keyboard focus, or the menu needs to know
 when it closes, to reset the focusId.

 * on title screen, the esc button is not hidden and can
   be clicked by pointer or via esc key.
 * in-game, the esc button should be hidden, so the menu
   can only be opened via esc / pause keys / gamepad buttons,
   or by clicking/tapping on the pause icon. blimey.
 * in the menu, clicking/tapping on a button both focuses
   and immediately activates it, whereas with the keyboard
   or gamepad you navigate to a button and then have to
   seperately activate it.

 * (todo: combine stick and button states into a parent gamepad wrapper?)
 
 */

function MenuConstants() {
  var by0 = gh(0.1);
  var bw = gw(0.2);
  var bh = gSmallFontSize * 1.7;
  var bl = gw(0.5) - bw / 2;
  var bs = bh * 1.5;
  var margin = {
    x: bw * 0.2,
    y: bh * 0.2
  };
  var font_size = gSmallFontSizePt;
  return {
    by0: by0,
    bw: bw,
    bh: bh,
    bl: bl,
    bs: bs,
    margin: margin,
    font_size: font_size
  };
}
function MakeEscButton(_ref) {
  var OnClose = _ref.OnClose;
  // esc button cannot ever have focus
  // because that was asymmetric and
  // thus possibly ugly or confusing,
  // but of course it can be 'clicked'.
  // also, purposefully has a different look
  // than the buttons in the menu.
  var w = sx(110);
  var besc = new Button({
    x: gw(0.5) - w / 2,
    y: gh(0.8),
    width: w,
    height: gReducedFontSize * 1.4,
    radii: 0,
    margin: {
      x: sx1(10),
      y: sy1(10)
    },
    title: "",
    align: "center",
    color: rgba255s(greyDarkSpec.regular),
    font_size: gReducedFontSizePt,
    step_fn: function step_fn(bself) {
      bself.has_focus = false;
      bself.title = (gSinglePlayer ? "1p  " : "2pp ") + (gSfxMuted ? "  " : "m ") + (gMusicMuted ? " " : "o");
    },
    click_fn: function click_fn(bself) {
      bself.isOpen = !bself.isOpen;
      if (!bself.isOpen) {
        OnClose();
      }
    }
  });
  besc.isOpen = false;
  return besc;
}
function MakePlayerButtons(_ref2) {
  var k = _ref2.constants,
    playerRadios = _ref2.playerRadios;
  return {
    bp1: new Button({
      x: k.bl,
      y: k.by0,
      width: k.bw,
      height: k.bh,
      margin: k.margin,
      title: "1 PLAYER",
      font_size: k.font_size,
      is_checkbox: true,
      step_fn: function step_fn(bself) {
        var was_checked = bself.is_checked;
        bself.is_checked = gSinglePlayer;
        bself.wants_focus = bself.is_checked && !was_checked;
      },
      click_fn: function click_fn(bself) {
        gSinglePlayer = true;
        playerRadios.OnSelect(bself);
      }
    }),
    bp2: new Button({
      x: k.bl,
      y: k.by0 + k.bs,
      width: k.bw,
      height: k.bh,
      title: "2 PLAYERS",
      margin: k.margin,
      font_size: k.font_size,
      is_checkbox: true,
      step_fn: function step_fn(bself) {
        var was_checked = bself.is_checked;
        bself.is_checked = !gSinglePlayer;
        bself.wants_focus = bself.is_checked && !was_checked;
      },
      click_fn: function click_fn(bself) {
        gSinglePlayer = false;
        playerRadios.OnSelect(bself);
      }
    })
  };
}
function MakeMuteButtons(_ref3) {
  var k = _ref3.constants;
  return {
    bsfx: new Button({
      x: k.bl,
      y: k.by0 + k.bs * 2.5,
      width: k.bw,
      height: k.bh,
      title: "SFX",
      margin: k.margin,
      font_size: k.font_size,
      is_checkbox: true,
      step_fn: function step_fn(bself) {
        bself.is_checked = !gSfxMuted;
      },
      click_fn: function click_fn(bself) {
        gSfxMuted = !gSfxMuted;
      }
    }),
    bmusic: new Button({
      x: k.bl,
      y: k.by0 + k.bs * 3.5,
      width: k.bw,
      height: k.bh,
      title: "MUSIC",
      margin: k.margin,
      font_size: k.font_size,
      is_checkbox: true,
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
function MakeMainMenuButtons() {
  var constants = new MenuConstants();
  var playerRadios = new Radios();
  var _MakePlayerButtons = MakePlayerButtons({
      constants: constants,
      playerRadios: playerRadios
    }),
    bp1 = _MakePlayerButtons.bp1,
    bp2 = _MakePlayerButtons.bp2;
  var _MakeMuteButtons = MakeMuteButtons({
      constants: constants
    }),
    bmusic = _MakeMuteButtons.bmusic,
    bsfx = _MakeMuteButtons.bsfx;
  playerRadios.AddButton(bp1);
  playerRadios.AddButton(bp2);
  return {
    focusId: gSinglePlayer ? "bp1" : "bp2",
    navigation: {
      bp1: {
        button: bp1,
        down: "bp2"
      },
      bp2: {
        button: bp2,
        up: "bp1",
        down: "bsfx"
      },
      bsfx: {
        button: bsfx,
        up: "bp2",
        down: "bmusic"
      },
      bmusic: {
        button: bmusic,
        up: "bsfx"
      }
    }
  };
}
function MakeQuitButton(_ref4) {
  var k = _ref4.constants,
    OnQuit = _ref4.OnQuit;
  return new Button({
    x: k.bl,
    y: k.by0 + k.bs,
    width: k.bw,
    height: k.bh,
    margin: k.margin,
    // leading spaces for alignment with checkboxes.
    title: "  QUIT",
    align: "left",
    font_size: k.font_size,
    is_checkbox: false,
    click_fn: function click_fn(bself) {
      OnQuit();
    }
  });
}
function MakeGameMenuButtons(_ref5) {
  var OnQuit = _ref5.OnQuit;
  var constants = new MenuConstants();
  var _MakeMuteButtons2 = MakeMuteButtons({
      constants: constants
    }),
    bsfx = _MakeMuteButtons2.bsfx;
  var bquit = MakeQuitButton({
    constants: constants,
    OnQuit: OnQuit
  });
  return {
    focusId: "bsfx",
    navigation: {
      bquit: {
        button: bquit,
        down: "bsfx"
      },
      bsfx: {
        button: bsfx,
        up: "bquit"
      }
    }
  };
}
;

/*class*/
function MenuBehavior(_ref6) {
  var isHidden = _ref6.isHidden,
    _OnClose = _ref6.OnClose,
    navigation = _ref6.navigation,
    focusId = _ref6.focusId;
  var self = this;
  self.Init = function () {
    var _self$navigation$self;
    self.isHidden = isHidden;
    self.besc = MakeEscButton({
      OnClose: function OnClose() {
        self.OnClose();
        _OnClose();
      }
    });
    self.navigation = navigation;
    self.focusId = focusId;
    var fb = (_self$navigation$self = self.navigation[self.focusId]) == null ? void 0 : _self$navigation$self.button;
    if (exists(fb)) {
      fb.has_focus = true;
    }
  };
  self.OnClose = function () {
    // reset everything!
    // don't you wish we were pure-functional / flux instead?
    // i sure kinda do.
    self.focusId = focusId;
    Object.entries(self.navigation).forEach(function (e) {
      e[0] == self.focusId ? e[1].button.Focus() : e[1].button.Defocus();
    });
  };
  self.Step = function () {
    if (self.besc.isOpen) {
      var wants_focusId = undefined;
      Object.entries(self.navigation).forEach(function (e) {
        var bid = e[0];
        var bspec = e[1];
        bspec.button.Step();
        if (bspec.button.wants_focus) {
          // unfortunately there can be only one,
          // and here the 'last' one wins.
          wants_focusId = bid;
        }
      });
    }
    if (self.besc.isOpen || !self.isHidden) {
      self.besc.Step();
    }
    if (exists(wants_focusId) && wants_focusId != self.focusId) {
      self.Focus(wants_focusId);
    }
  };
  self.Defocus = function () {
    var bspec = self.navigation[self.focusId];
    if (exists(bspec)) {
      bspec.button.Defocus();
    }
    self.focusId = undefined;
  };
  self.Focus = function (focusId) {
    self.Defocus();
    self.focusId = focusId;
    if (exists(self.focusId)) {
      var bspec = self.navigation[self.focusId];
      if (exists(bspec)) {
        bspec.button.Focus();
      }
    }
  };
  self.ProcessOneInput = function (cmds) {
    var n, a, p1, p2;
    if (self.besc.isOpen) {
      n = self.ProcessNavigation();
      a = self.ProcessAccept(cmds);
    }
    if (self.besc.isOpen || !self.isHidden) {
      p1 = self.ProcessTarget(gP1Target);
      p2 = self.ProcessTarget(gP2Target);
    }
    return !!n || !!a || !!p1 || !!p2;
  };
  self.ProcessNavigation = function () {
    if (gP1Keys.$.up || gP2Keys.$.up || isGamepad1Up() || isGamepad2Up()) {
      self.FocusDirection("up");
      return true;
    }
    if (gP1Keys.$.down || gP2Keys.$.down || isGamepad1Down() || isGamepad2Down()) {
      self.FocusDirection("down");
      return true;
    }
    return false;
  };
  self.FocusDirection = function (dkey) {
    var bspec = self.navigation[self.focusId];
    if (exists(bspec)) {
      var fId = bspec[dkey];
      if (exists(fId)) {
        if (self.focusId != fId) {
          PlayBlip();
        }
        self.Focus(fId);
      }
    }
  };
  self.ProcessAccept = function (cmds) {
    if (isAnyActivatePressed(cmds) && self.besc.isOpen) {
      var bspec = self.navigation[self.focusId];
      if (exists(bspec)) {
        bspec.button.Click();
        return true;
      }
      clearAnyActivatePressed();
    }
    return false;
  };
  self.ProcessTarget = function (target) {
    var hit = false;
    if (target.isDown()) {
      // menu.
      if (self.besc.isOpen) {
        var found = Object.entries(self.navigation).find(function (e) {
          return e[1].button.ProcessTarget(target);
        });
        if (exists(found)) {
          if (found != self.besc) {
            self.Focus(found[0]);
          }
          found[1].button.Click();
        }
        hit = exists(found);

        // touching outside the menu closes it.
        if (!hit) {
          self.besc.Click();
          hit = true;
        }
      }
      // esc.
      if (!hit && (self.besc.isOpen || !self.isHidden)) {
        hit = self.besc.ProcessTarget(target);
        if (hit) {
          self.besc.Click();
        }
      }
    }
    return hit;
  };
  self.Draw = function () {
    // menu.
    if (self.besc.isOpen) {
      Cxdo(function () {
        // fade the background a tad.
        gCx.globalAlpha = gDebug ? 0 : 0.8;
        gCx.fillStyle = backgroundColorStr;
        gCx.fillRect(0, 0, gw(1), gh(1));
        if (gDebug) {
          // so i can see the game and step it still.
          gCx.globalAlpha = 0.5;
        }
        Object.values(self.navigation).forEach(function (bspec) {
          return bspec.button.Draw();
        });
      });
    }
    // esc.
    if (self.besc.isOpen || !self.isHidden) {
      self.besc.Draw();
    }
  };
  self.Init();
}
;