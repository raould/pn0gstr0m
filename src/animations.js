/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function MakeWipedownAnimation() {
    var lifespan = 700;
    return new Animation({
        name: "gamestart",
        lifespan,
        drawFn: (self) => {
            var t = T10(self.life, self.lifespan0);
            var h = gh(0.05);
            var c = 10;
            var ybase  = -(h*c);
            var yrange = gHeight + 2*(h*c);
            var y = ybase + t * yrange;
            Cxdo(() => {
                var lastY = y;
                for (var i = 0; i < ii(c/2); ++i) { // top bars
                    var yo = y + i*h;
                    gCx.beginPath();
                    gCx.rect(0, yo, gWidth, h*0.8);
                    gCx.fillStyle = RandomForColor(greenSpec, 1/c*i);
                    gCx.fill();
                    lastY = yo+h*0.8;
                }
                gCx.beginPath(); // shutter effect.
                gCx.rect(0, lastY, gWidth, gHeight-lastY);
                gCx.fillStyle = backgroundColorStr;
                gCx.fill();
                for (var i = ii(c/2); i < c; ++i) { // bottom bars.
                    var yo = y + i*h;
                    gCx.beginPath();
                    gCx.rect(0, yo, gWidth, h*0.8);
                    gCx.fillStyle = RandomForColor(greenSpec, 1-1/c*i);
                    gCx.fill();
                }
            });
        }
    });
}

function MakeChargeUpTextAnimation(duration) {
    var lifespan = duration;
    return new Animation({
        name: "chargeup_text",
        lifespan,
        drawFn: (self) => {
	    // match: Level.Draw().
	    // todo: gLevelIndex use here is evil.
            var zpt = MakeSplitsCount(gLevelIndex);
	    if (exists(zpt)) {
		// match: MakeChargeUpMeterAnimation t.
		var t = T01(self.lifespan0-self.life, self.lifespan0 * 0.6);
		var zptT = Math.ceil(zpt * t);
		Cxdo(() => {
		    gCx.fillStyle = RandomForColor(cyanSpec);
                    DrawText(`SPLIT ENERGY: ${zptT}`,
			     "center",
			     gw(0.5), gh(0.95),
			     gSmallerFontSizePt);
		});
	    }
	}
    });
}

function MakeChargeUpMeterAnimation(duration) {
    var lifespan = duration;
    return new Animation({
        name: "chargeup_meter",
        lifespan,
        drawFn: (self) => {
	    // match: GameState.DrawMidLine().
	    // todo: gLevelIndex use here is evil.
            var zpt = MakeSplitsCount(gLevelIndex);
	    if (exists(zpt)) {
		// match: MakeChargeUpTextAnimation t.
		var t = T01(self.lifespan0-self.life, self.lifespan0 * 0.6);
		var zptT = Math.ceil(zpt * t);
		var dashStep = gh() / (gMidLineDashCount*2);
		var top = ForGameMode({regular: gYInset*1.5, zen: gYInset}) + dashStep/2;
		// match: Level.DrawText().
		var txo = gSmallFontSizePt;
		var bottom = gh() - gYInset*1.05 - txo;
		var range = bottom - top;
		var e = (zptT / zpt) * range;
		var gotfat = false;
		Cxdo(() => {
		    gCx.beginPath();
		    for( var y = top; y < bottom; y += dashStep*2 ) {
			var ox = gR.RandomCentered(0, 0.5);
			var fat = y-top >= (range-e);
			var width = fat ? gMidLineDashWidth*3 : gMidLineDashWidth;
			gCx.rect( gw(0.5)+ ox -(width/2), y, width, dashStep );
		    }
		    gCx.fillStyle = RandomGreen(0.5);
		    gCx.fill();
		});
	    }
	}
    });
}

function MakeLastPuckWonAnimation(duration, cx) {
    var lifespan = duration;
    return new Animation({
	name: "lastpuckwon",
	lifespan,
	drawFn: (self) => {
	    var t = T01(self.lifespan0-self.life, self.lifespan0 * 0.6);
	    Cxdo(() => {
		gCx.fillStyle = RandomForColor(yellowSpec, easeOutExpo(1-t));
		DrawText(`+${kScoreLastPuckIncrement} LAST PUCK!`,
			 "center",
			 cx, gh(1) - t * gh(0.3),
			 gSmallFontSizePt);
	    });
	}
    });
}
