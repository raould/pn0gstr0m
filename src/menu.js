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
  to each other, and special cases, like how the Menu button
  can never have keyboard focus, or the menu needs to know
  when it closes, to reset the focusId.

  also? this code just kinda sucks by now, sorry.

  * on title screen, the Menu button is not hidden and can
  be clicked by pointer or via Menu key.
  * in-game, the Menu button should be hidden, so the menu
  can only be opened via Menu / pause keys / gamepad buttons,
  or by clicking/tapping on the pause icon. blimey.
  * in the menu, clicking/tapping on a button both focuses
  and immediately activates it, whereas with the keyboard
  or gamepad you navigate to a button and then have to
  seperately activate it.

  * (todo: combine stick and button states into a parent gamepad wrapper?)
  
  */

function MakeMenuButton({ OnClose }) {
    // esc button cannot ever have focus
    // because that was asymmetric and
    // thus possibly ugly or confusing,
    // but of course it can be 'clicked'.
    // also, purposefully has a different look
    // than the buttons in the menu.
    var w = sx(110);
    var bMenu = new Button({
        x: gw(0.5)-(w/2), y: gh(0.80),
        width: w, height: gReducedFontSize*1.4,
        radii: 0,
        margin: {x: sx1(10), y: sy1(10)},
        title: "",
        align: "center",
        color: rgba255s(greyDarkSpec.regular),
        font_size: gReducedFontSizePt,
        step_fn: (bself) => {
            let gameMode = " ";
            // theoretically in 2 player mode it cannot be
            // extra hard, and is secretly forced-zen behind the scenes.
            if (is1P()) {
                if (gGameMode === kGameModeHard) { gameMode = "*"; }
                if (gGameMode === kGameModeZen) { gameMode = "Z"; }
            }
            else {
                Assert(gGameMode === kGameMode2P);
            }
            bself.has_focus = false;
            bself.title = (is1P() ? "1p  " : "2pp ") +
                (gSfxMuted ? "  " : "m ") +
                (gMusicMuted ? " " : "o") +
                gameMode;
        },
        click_fn: (bself) => {
            bself.isOpen = !bself.isOpen; // see below.
            if (!bself.isOpen) {
                OnClose();
            }
        },
    });
    bMenu.isOpen = false; // see above.
    return bMenu;
}

/*class*/ function Menu({ showButton, OnClose, MakeNavigation }) {
    var self = this;

    self.Init = function() {
        self.showButton = showButton;
        self.OnClose = OnClose;
        self.bMenu = MakeMenuButton({ OnClose });
        self.spec = MakeNavigation(self);
        Assert(exists(self.spec));

        self.actionsPressed = {}; // prevent auto-repeat in menu.

        self.focusId = self.spec.focusId;
        var fb = self.Focused()?.button;
        Assert(exists(fb), "must have an initial focus, for keyboard nagivation");
        fb.has_focus = true;
    };

    self.Navigation = function() {
        return this.spec.navigation;
    };

    self.Spec = function(bId) {
        Assert(exists(self.Navigation()));
        return self.Navigation()[bId];
    };

    self.Focused = function() {
        return self.Spec(self.focusId);
    };

    self.Open = function() {
        self.bMenu.isOpen = true;
    };

    self.isOpen = function() {
        return self.bMenu.isOpen;
    };

    self.Step = function() {
        if (self.isOpen()) {
            var wants_focusId = undefined;
            Object.entries(self.Navigation()).forEach(
                e => {
                    var bid = e[0];
                    var bspec = e[1];
                    bspec.button.Step();
                    if (bspec.button.wants_focus) {
                        // unfortunately there can be only one,
                        // and here the 'last' one wins.
                        wants_focusId = bid;
                    }
                }
            );
        }

        if (self.isOpen() || self.showButton) {
            self.bMenu.Step();
        }

        if (exists(wants_focusId) && wants_focusId != self.focusId) {
            self.Focus(wants_focusId);
        }
    };

    self.Defocus = function() {
        var bspec = self.Focused();
        if (exists(bspec)) {
            bspec.button.Defocus();
        }
        self.focusId = undefined;
    };

    self.Focus = function(focusId) {
        var bspec = self.Spec(focusId);
        if (exists(bspec)) {
            self.Defocus();
            bspec.button.Focus();
            self.focusId = focusId;
        }
    };

    self.IsMenuButtonClick = function() {
        return self.bMenu.ProcessTarget();
    };

    self.ProcessOneInput = function(cmds) {
        var n, a, p1, p2;
        if (self.isOpen()) {
            n = self.ProcessNavigation();
            a = self.ProcessAccept(cmds);
        }
        if ((!n && !a) && (self.isOpen() || self.showButton)) {
            p1 = self.ProcessTarget(gP1Target);
            p2 = self.ProcessTarget(gP2Target);
        }
        return !!n || !!a || !!p1 || !!p2;
    };

    self.ProcessNavigation = function() {
        var wasUpPressed = !!self.actionsPressed["up"];
        if (wasUpPressed) {
            if (!(gP1Keys.$.up || gP2Keys.$.up || isGamepad1Up() || isGamepad2Up())) {
                self.actionsPressed["up"] = false;
            }
        }
        else if (gP1Keys.$.up || gP2Keys.$.up || isGamepad1Up() || isGamepad2Up()) {
            self.FocusDirection("up");
            self.actionsPressed["up"] = true;
            return true;
        }

        var wasDownPressed = !!self.actionsPressed["down"];
        if (wasDownPressed) {
            if (!(gP1Keys.$.down || gP2Keys.$.down || isGamepad1Down() || isGamepad2Down())) {
                self.actionsPressed["down"] = false;
            }
        }
        else if (gP1Keys.$.down || gP2Keys.$.down || isGamepad1Down() || isGamepad2Down()) {
            self.FocusDirection("down");
            self.actionsPressed["down"] = true;
            return true;
        }

        return false;
    };

    self.FocusDirection = function(dkey) {
        PlayBlip();
        var fId = self.FocusDirectionUnhidden(self.Focused(), dkey);
        self.Focus(fId);
    };

    // todo: fix going up from first entry bug.
    self.FocusDirectionUnhidden = function(cspec, dkey) {
        if (exists(cspec)) {
            var nid = cspec[dkey];
            var nspec = self.Spec(nid);
            if (exists(nspec)) {
                Assert(exists(nspec.button));
                return nspec.button.disabled ?
                    self.FocusDirectionUnhidden(nspec, dkey) :
                    nid;
            }
        }
    };

    self.ProcessAccept = function(cmds) {
        if (isAnyActivatePressed(cmds) && self.isOpen()) {
            var bspec = self.Focused();
            if (exists(bspec)) {
                bspec.button.Click();
                return true;
            }
            clearAnyActivatePressed();
        }
        return false;
    };

    self.ProcessTarget = function(target) {
        var hit = false;
        if (target.isDown()) {
            // the menu is open so check buttons.
            if (self.isOpen()) {
		// clicking on disabled button should do nothing:
		// no action, no closing the menu.
                var found = Object.entries(self.Navigation()).find(
                    e => e[1].button.ProcessTarget(target)
                );
                hit = exists(found);

                if (hit) {
		    if (!found[1].button.disabled) {
			if (found != self.bMenu) { self.Focus(found[0]); }
			found[1].button.Click();
		    }
                } else {
                    // touching outside the menu closes it.
                    self.bMenu.Click();
                    target.ClearPointer();
                    hit = true;
                }
            }
            // the menu is closed, check the Menu button hit.
            if (!hit && (self.isOpen() || self.showButton)) {
                hit = self.bMenu.ProcessTarget(target);
                if (hit) {
                    self.bMenu.Click();
                }
            }
        }
        return hit;
    };

    self.Draw = function() {
        // menu.
        if (self.isOpen()) {
            Cxdo(() => {
                if (gDebug) {
                    // fade buttons so i can watch stepping the game.
                    gCx.globalAlpha = 0.5;
                }
                else {
                    // fade the background a tad under the menu to not visually conflict.
                    gCx.globalAlpha = gDebug ? 0 : 0.8;
                    gCx.fillStyle = backgroundColorStr;
                    gCx.fillRect(0, 0, gw(1), gh(1));
                }
                Object.values(self.Navigation()).forEach(
                    bspec => bspec.button.Draw()
                );
            });
        }
        // esc.
        if (self.isOpen() || self.showButton) {
            self.bMenu.Draw();
        }
    };

    self.Init();
};
