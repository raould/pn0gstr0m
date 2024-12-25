"use strict";

/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// note: Animations are hardcoded to only work in GameState.

// "Game State" Animations, require access to the game state.
function GSAnimation(props) {
  var self = this;
  self.Init = function () {
    self.id = gNextID++;
    self.name = props.name;
    // undefined lifespan means never ending.
    self.life = self.lifespan0 = props.lifespan;
    self.startFn = props.startFn; // ( gameState )
    self.animFn = props.animFn; // ( anim.self, dt, gameState )
    self.endFn = props.endFn; // ( gameState )
    Assert(exists(props.drawFn), "props.drawFn");
    self.drawFn = props.drawFn; // ( anim.self, gameState )
  };
  self.Draw = function (gameState) {
    props.drawFn(self, gameState);
  };
  self.Step = function (dt, gameState) {
    // start.
    exists(self.startFn) && self.startFn(gameState);
    self.startFn = undefined;

    // anim.
    if (isU(self.life) || self.life > 0) {
      exists(self.animFn) && self.animFn(self, dt, gameState);
    }
    if (exists(self.life)) {
      self.life -= dt;
    }

    // end.
    if (exists(self.life) && self.life <= 0) {
      exists(self.endFn) && self.endFn(gameState);
      self.endFn = undefined;
    }
    return exists(self.life) && self.life <= 0;
  };
  self.Init();
}