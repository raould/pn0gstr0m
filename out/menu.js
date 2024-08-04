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

function MakeMenuButton(_ref) {
  var OnClose = _ref.OnClose;
  // esc button cannot ever have focus
  // because that was asymmetric and
  // thus possibly ugly or confusing,
  // but of course it can be 'clicked'.
  // also, purposefully has a different look
  // than the buttons in the menu.
  var w = sx(110);
  var bMenu = new Button({
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
  bMenu.isOpen = false; // see above.
  return bMenu;
}

/*class*/
function Menu(_ref2) {
  var isHidden = _ref2.isHidden,
    OnClose = _ref2.OnClose,
    navigation = _ref2.navigation,
    focusId = _ref2.focusId;
  var self = this;
  self.Init = function () {
    var _self$navigation$self;
    self.isHidden = isHidden;
    self.bMenu = MakeMenuButton({
      OnClose: OnClose
    });
    self.navigation = navigation;
    self.focusId = focusId;
    var fb = (_self$navigation$self = self.navigation[self.focusId]) == null ? void 0 : _self$navigation$self.button;
    Assert(exists(fb), "must have an initial focus, for keyboard nagivation");
    fb.has_focus = true;
  };
  self.isOpen = function () {
    return self.bMenu.isOpen;
  };
  self.Step = function () {
    if (self.bMenu.isOpen) {
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
    if (self.bMenu.isOpen || !self.isHidden) {
      self.bMenu.Step();
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
    if (self.bMenu.isOpen) {
      n = self.ProcessNavigation();
      a = self.ProcessAccept(cmds);
    }
    if (self.bMenu.isOpen || !self.isHidden) {
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
    if (isAnyActivatePressed(cmds) && self.bMenu.isOpen) {
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
      if (self.bMenu.isOpen) {
        var found = Object.entries(self.navigation).find(function (e) {
          return e[1].button.ProcessTarget(target);
        });
        if (exists(found)) {
          if (found != self.bMenu) {
            self.Focus(found[0]);
          }
          found[1].button.Click();
        }
        hit = exists(found);

        // touching outside the menu closes it.
        if (!hit) {
          self.bMenu.Click();
          target.ClearPointer();
          hit = true;
        }
      }
      // esc.
      if (!hit && (self.bMenu.isOpen || !self.isHidden)) {
        hit = self.bMenu.ProcessTarget(target);
        if (hit) {
          self.bMenu.Click();
        }
      }
    }
    return hit;
  };
  self.Draw = function () {
    // menu.
    if (self.bMenu.isOpen) {
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
    if (self.bMenu.isOpen || !self.isHidden) {
      self.bMenu.Draw();
    }
  };
  self.Init();
}
;