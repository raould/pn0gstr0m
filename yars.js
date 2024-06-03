/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

var /*const*/ kRowCount = 20;

/*class*/ function Yars( props ) {
    var self = this;

    self.Init = function() {
	self.x = props.x;
	self.width = props.width;
	self.blocks = [Array(kRowCount).fill(1), Array(kRowCount).fill(1)],
	self.blockWidth = ii(self.width/2);
	self.blockHeight = sy1(gHeight/(kRowCount));
	self.yoff = 0;
    };

    self.Step = function( dt, gameState) {
	self.yoff = ii(self.yoff + (dt / 10)) % gHeight;
	return self;
    };

    self.Draw = function( dt ) {
	Cxdo(() => {
	    gCx.beginPath();
	    for (var ix = 0; ix < 2; ++ix) {
		for (var iy = 0; iy < kRowCount; ++iy) {
		    if (self.blocks[ix][iy] > 0) {
			var yo = (iy * self.blockHeight + self.yoff) % gHeight;
			var x = self.x + (ix*self.blockWidth) + sx1(2);
			var y = yo + sy1(2);
			var w = self.blockWidth-sx1(4);
			var h = self.blockHeight-sy1(4);
			gCx.rect(x, y, w, h);
			var ywrap = yo + self.blockHeight - gHeight;
			if (ywrap > 0) {
			    gCx.rect(x, -y, w, h);
			}

		    }
		}
	    }
	    gCx.fillStyle = "red";
	    gCx.fill();
	});
    };

    self.Init();
}
