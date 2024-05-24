/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function Animation( props ) {
    var { lifespan, animFn, startFn, endFn } = props;
    var self = this;
    self.id = gNextID++;
    self.startMs = gGameTime;
    self.endMs = self.startMs + lifespan;
    self.Step = function( dt, gameState ) {
	if (isntU(startFn)) { startFn( gameState ); }
	startFn = undefined;
	if (gGameTime <= self.endMs) {
	    animFn( dt, gameState, self.startMs, self.endMs );
	    return false;
	}
	if (isntU(endFn)) { endFn( gameState ); }
	return true;
    };
}
