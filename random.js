/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function MakeRandom(a) {
    return function() {
	a |= 0; a = a + 0x9e3779b9 | 0;
	var t = a ^ a >>> 16; t = Math.imul(t, 0x21f0aaad);
        t = t ^ t >>> 15; t = Math.imul(t, 0x735a2d97);
	return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    };
}

function RandomBool(cutoff=0.5) {
    return gRandom() < cutoff;
}

function RandomSign(cutoff) {
    return RandomBool() ? 1 : -1;
}

function RandomChoice(a, b, chooseA) {
    return RandomBool(chooseA) ? a : b;
}

// closed interval [min, max].
function RandomRange( min, max ) {
    if (min > max) {
	Swap(min, max);
    }
    var r = min + gRandom()*(max-min);
    return r;
}

// closed interval [min, max].
function RandomRangeInt( min, max ) {
    return Math.round(RandomRange(min,max));
}

function RandomCentered( center, halfRange, halfDeadZone=0 ) {
    var r = halfDeadZone + RandomRange(0, halfRange - halfDeadZone);
    var s = RandomSign();
    var v = center + s * r;
    return v;
}

function RandomLatch( chance, latchDuration ) {
    var latchedTime = undefined;
    return {
	MaybeLatch: function(now) {
	    if (exists(latchedTime)) {
		if (now - latchedTime > latchDuration) {
		    latchedTime = undefined;
		}
	    }
	    else if (RandomBool(chance)) {
		latchedTime = now;
	    }
	    return exists(latchedTime);
	},
    };
}
