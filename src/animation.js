/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// Animations that do not require access to the game state.
function Animation( props ) {
    var self = this;

    self.Init = function() {
        self.id = gNextID++;
        self.name = props.name;
        // undefined life means never ending.
        self.life = self.lifespan0 = props.lifespan;
        self.startFn = props.startFn; // ()
        self.animFn = props.animFn; // (anim.self, dt)
        self.endFn = props.endFn; // ()
        Assert(exists(props.drawFn), "props.drawFn");
        self.drawFn = props.drawFn; // (anim.self)
    };

    self.Draw = function() {
        props.drawFn(self);
    };

    self.Step = function(dt) {
        // start.
        exists(self.startFn) && self.startFn();
        self.startFn = undefined;

        // anim.
        if (isU(self.life) || self.life > 0) {
            exists(self.animFn) && self.animFn(self, dt);
        }

        if (exists(self.life)) {
            self.life -= dt;
        }

        // end.
        if (exists(self.life) && self.life <= 0) {
            exists(self.endFn) && self.endFn();
            self.endFn = undefined;
        }

        return exists(self.life) && self.life <= 0;
    };

    self.Init();
}
