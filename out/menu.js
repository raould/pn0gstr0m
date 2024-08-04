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

  also? this code just kinda sucks by now, sorry.

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
  // note: even with these calculations,
  // there is still a lot of hard-coding
  // in the various Make*Buttons() below.
  var by0 = gh(0.05);
  var bw = gw(0.2);
  var bh = gSmallFontSize * 1.7;
  var bl = gw(0.5) - bw / 2;
  var bs = bh * 1.3;
  var ss = bh / 2;
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
    ss: ss,
    margin: margin,
    font_size: font_size
  };
}
function MakeMenuButton(_ref) {
  var OnClose = _ref.OnClose;
  // esc button cannot ever have focus
  // because that was asymmetric and
  // thus possibly ugly or confusing,
  // but of course it can be 'clicked'.
  // also, purposefully has a different look
  // than the buttons in the menu.
  var w = sx(110);
  var bmenu = new Button({
    x: gw(0.5) - w / 2,
    y: gh(0.80),
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
      var gameMode = " ";
      if (gGameMode === kGameModeHard) {
        gameMode = "*";
      }
      if (gGameMode === kGameModeZen) {
        gameMode = "Z";
      }
      bself.has_focus = false;
      bself.title = (gSinglePlayer ? "1p  " : "2pp ") + (gSfxMuted ? "  " : "m ") + (gMusicMuted ? " " : "o") + gameMode;
    },
    click_fn: function click_fn(bself) {
      bself.isOpen = !bself.isOpen; // see below.
      if (!bself.isOpen) {
        OnClose();
      }
    }
  });
  bmenu.isOpen = false; // see above.
  return bmenu;
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
function MakeModeButtons(_ref3) {
  var k = _ref3.constants,
    modeRadios = _ref3.modeRadios;
  return {
    bHard: new Button({
      x: k.bl,
      y: k.by0 + k.bs * 2 + k.ss,
      width: k.bw,
      height: k.bh,
      title: "HARD MODE",
      margin: k.margin,
      font_size: k.font_size,
      is_checkbox: true,
      step_fn: function step_fn(bself) {
        var was_checked = bself.is_checked;
        bself.is_checked = gGameMode === kGameModeHard;
        bself.wants_focus = bself.is_checked && !was_checked;
      },
      click_fn: function click_fn(bself) {
        setGameMode(gGameMode === kGameModeHard ? kGameModeRegular : kGameModeHard);
        modeRadios.OnSelect(bself);
      }
    }),
    bZen: new Button({
      x: k.bl,
      y: k.by0 + k.bs * 3 + k.ss,
      width: k.bw,
      height: k.bh,
      title: "ZEN MODE",
      margin: k.margin,
      font_size: k.font_size,
      is_checkbox: true,
      step_fn: function step_fn(bself) {
        var was_checked = bself.is_checked;
        bself.is_checked = gGameMode === kGameModeZen;
        bself.wants_focus = bself.is_checked && !was_checked;
      },
      click_fn: function click_fn(bself) {
        setGameMode(gGameMode === kGameModeZen ? kGameModeRegular : kGameModeZen);
        modeRadios.OnSelect(bself);
      }
    })
  };
}
function MakeMuteButtons(_ref4) {
  var k = _ref4.constants;
  return {
    bSfx: new Button({
      x: k.bl,
      y: k.by0 + k.bs * 4 + k.ss * 2,
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
    bMusic: new Button({
      x: k.bl,
      y: k.by0 + k.bs * 5 + k.ss * 2,
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
  var modeRadios = new Radios();
  var _MakePlayerButtons = MakePlayerButtons({
      constants: constants,
      playerRadios: playerRadios
    }),
    bp1 = _MakePlayerButtons.bp1,
    bp2 = _MakePlayerButtons.bp2;
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
        down: "bHard"
      },
      bHard: {
        button: bHard,
        up: "up2",
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
function MakeQuitButton(_ref5) {
  var k = _ref5.constants,
    OnQuit = _ref5.OnQuit;
  return new Button({
    x: k.bl,
    y: k.by0 + k.bs * 2,
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
function MakeGameMenuButtons(_ref6) {
  var OnQuit = _ref6.OnQuit;
  var constants = new MenuConstants();
  var _MakeMuteButtons2 = MakeMuteButtons({
      constants: constants
    }),
    bSfx = _MakeMuteButtons2.bSfx;
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

/*class*/
function MenuBehavior(_ref7) {
  var isHidden = _ref7.isHidden,
    OnClose = _ref7.OnClose,
    navigation = _ref7.navigation,
    focusId = _ref7.focusId;
  var self = this;
  self.Init = function () {
    var _self$navigation$self;
    self.isHidden = isHidden;
    self.bmenu = MakeMenuButton({
      OnClose: OnClose
    });
    self.navigation = navigation;
    self.focusId = focusId;
    var fb = (_self$navigation$self = self.navigation[self.focusId]) == null ? void 0 : _self$navigation$self.button;
    if (exists(fb)) {
      fb.has_focus = true;
    }
  };
  self.isOpen = function () {
    return self.bmenu.isOpen;
  };
  self.Step = function () {
    if (self.bmenu.isOpen) {
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
    if (self.bmenu.isOpen || !self.isHidden) {
      self.bmenu.Step();
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
    if (self.bmenu.isOpen) {
      n = self.ProcessNavigation();
      a = self.ProcessAccept(cmds);
    }
    if (self.bmenu.isOpen || !self.isHidden) {
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
    if (isAnyActivatePressed(cmds) && self.bmenu.isOpen) {
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
      if (self.bmenu.isOpen) {
        var found = Object.entries(self.navigation).find(function (e) {
          return e[1].button.ProcessTarget(target);
        });
        if (exists(found)) {
          if (found != self.bmenu) {
            self.Focus(found[0]);
          }
          found[1].button.Click();
        }
        hit = exists(found);

        // touching outside the menu closes it.
        if (!hit) {
          self.bmenu.Click();
          target.ClearPointer();
          hit = true;
        }
      }
      // esc.
      if (!hit && (self.bmenu.isOpen || !self.isHidden)) {
        hit = self.bmenu.ProcessTarget(target);
        if (hit) {
          self.bmenu.Click();
        }
      }
    }
    return hit;
  };
  self.Draw = function () {
    // menu.
    if (self.bmenu.isOpen) {
      Cxdo(function () {
        if (gDebug) {
          // fade buttons so i can watch stepping the game.
          gCx.globalAlpha = 0.5;
        } else {
          // fade the background a tad under the menu to not visually conflict.
          gCx.globalAlpha = gDebug ? 0 : 0.8;
          gCx.fillStyle = backgroundColorStr;
          gCx.fillRect(0, 0, gw(1), gh(1));
        }
        Object.values(self.navigation).forEach(function (bspec) {
          return bspec.button.Draw();
        });
      });
    }
    // esc.
    if (self.bmenu.isOpen || !self.isHidden) {
      self.bmenu.Draw();
    }
  };
  self.Init();
}
;