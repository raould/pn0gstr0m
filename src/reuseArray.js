/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// sorry this interface is unergonomic.
// voodoo, but empirically just having this seems
// at least in some browsers to reduce hitchiness
// that i naively guess is gc pauses.
function ReuseArray( initialCapacity ) {
    var self = this;
    self.length = 0;
    self.array = Array( initialCapacity );

    self.clear = function() {
        self.length = 0;
    };

    self.read = function( index ) {
        Assert(index < self.length);
        Assert(index < self.array.length);
        return self.array[ index ];
    };

    self.push = function( v ) {
        if (self.length < self.array.length) {
            self.array[self.length] = v;
        }
        else {
            self.array.push(v);
        }
        ++self.length;
    };

    self.pushAll = function( a ) {
        a.forEach(e => { self.push(e); });
    };

    self.map = function(mfn) {
        var acc = [];
        for( var i = 0; i < self.length; ++i ) {
            acc.push(mfn(self.array[i], i));
        }
        return acc;
    };

    self.filter = function(ffn) {
        var acc = [];
        for( var i = 0; i < self.length; ++i ) {
            var e = self.array[i];
            if(ffn(e, i)) {
                acc.push(e);
            }
        }
        return acc;
    };

    self.reduce = function(rfn, zero) {
        var z = zero;
        for( var i = 0; i < self.length; ++i ) {
            z = rfn(z, self.array[i]);
        }
        return z;
    };

    self.forEach = function( cb ) {
        for( var i = 0; i < self.length; ++i ) {
            cb(self.array[i], i, self.array);
        }
    };
}

