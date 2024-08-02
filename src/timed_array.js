/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

/*class*/ function TimedArray(props) {
    var self = this;

    self.Init = function() {
        Assert(props.values?.length > 0, props.values);
        self.values = props.values;
        self.timeStep = props.timeStep;
        self.prevTime = 0;
        self.index = 0;
    };

    self.Get = function() {
        return self.values[self.index];
    };

    self.Step = function() {
        if (gGameTime - self.prevTime > self.timeStep) {
            self.prevTime = gGameTime;
            self.index = (self.index + 1) % self.values.length;
        }
    };

    self.Init();
}
