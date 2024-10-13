/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

/*class*/ function Random(seed = 0xCAFECAFE) {
    var self = this;

    self.Init = function() {
        // todo: uh, can this really give us the full range including 0.0 and 1.0?
        self.next = function() {
            seed |= 0; seed = seed + 0x9e3779b9 | 0;
            var t = seed ^ seed >>> 16; t = Math.imul(t, 0x21f0aaad);
            t = t ^ t >>> 15; t = Math.imul(t, 0x735a2d97);
            return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
        };
    };

    self.RandomFloat = function(max=1) {
        return self.next() * max;
    };

    self.RandomBool = function(cutoff=0.5) {
        return self.next() < cutoff;
    };

    self.RandomSign = function(cutoff) {
        return self.RandomBool(cutoff) ? 1 : -1;
    };

    self.RandomChoice = function(a, b, chooseA) {
        return self.RandomBool(chooseA) ? a : b;
    };

    self.RandomChoices = function(choices) {
        return choices[ii(self.next() * (choices.length-1))];
    };

    // closed interval [min, max].
    self.RandomRange = function( min, max ) {
        if (min > max) {
            Swap(min, max);
        }
        var r = min + self.next()*(max-min);
        return r;
    };

    // closed interval [min, max].
    self.RandomRangeInt = function( min, max ) {
        var f = self.RandomRange(min, max);
        var i = Math.round(f);
        return Clip(i, min, max);
    };

    self.RandomCentered = function( center, halfRange, halfDeadZone=0 ) {
        var r = halfDeadZone + self.RandomRange(0, halfRange - halfDeadZone);
        var s = self.RandomSign();
        var v = center + s * r;
        return v;
    };

    self.RandomElement = function( array ) {
        if (exists(array) && array.length > 0) {
            var i = self.RandomRangeInt(0, array.length-1);
            return array[i];
        }
        return undefined;
    };

    self.Init();
}

/*class*/ function RandomLatch( chance, latchDuration ) {
    var self = this;

    self.Init = function() {
        self.latchedTime = undefined;
        self.chance = chance;
        self.latchDuration = latchDuration;
        self.R = new Random();
    };

    self.MaybeLatch = function(now) {
        if (exists(self.latchedTime)) {
            if (now - self.latchedTime > latchDuration) {
                self.latchedTime = undefined;
            }
        }
        else if (self.R.RandomBool(chance)) {
            self.latchedTime = now;
        }
        return exists(self.latchedTime);
    };

    self.Init();
}
