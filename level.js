/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

/*class*/ function Level(props) {

    var self = this;

    self.Init = function() {
	self.maxVX0 = props.maxVX;
	self.maxVX = self.maxVX0;
	self.speedupFactor = props.speedupFactor;
	self.speedupTimeout = props.speedupTimeout;
	self.puckCount = props.puckCount;
	self.alive = true;
	self.playerPowerups = new Powerups({
	    isPlayer: true,
	    paddle: props.playerPaddle,
	    side: ForSide(gPointerSide, "left", "right"),
	    specs: props.pills
	});
	self.playerPill = undefined;
	self.cpuPowerups = new Powerups({
	    isPlayer: false,
	    paddle: props.cpuPaddle,
	    side: ForSide(gPointerSide, "right", "left"),
	    specs: props.pills
	});
	self.cpuPill = undefined;
    };

    self.OnPuckLost = function() {
	self.puckCount = Math.max(0, self.puckCount-1);
	self.alive = self.puckCount > 0;
    };

    self.Step = function( dt ) {
	self.speedupTimeout -= dt;
	if (self.speedupTimeout <= 0) {
	    self.maxVX += self.speedupFactor * dt / kTimeStep;
	}
    };

    self.Draw = function( alpha ) {
	if (self.puckCount < 100) {
	    Cxdo(() => {
		gCx.fillStyle = gCx.strokeStyle = "magenta";
		DrawText(
		    self.puckCount.toString(),
		    "center",
		    WX(gw(0.5)), WY(gPucksTextY),
		    gSmallFontSizePt
		);
	    });
	}
	self.DrawPills( alpha );
    };

    self.DrawPills = function( alpha ) {
	if (exists(self.playerPill)) {
	    self.DrawPill(alpha, self.playerPill, gPointerSide, RandomMagenta(alpha));
	}
	if (exists(self.cpuPill)) {
	    self.DrawPill(alpha, self.cpuPill, ForOtherSide(gPointerSide, "left", "right"), RandomGrey(alpha));
	}
    };

    self.DrawPill = function( alpha, pill, side, color ) {
	pill.Draw( alpha );
	Cxdo(() => {
	    gCx.fillStyle = color;
	    var msg = `${pill.name.toUpperCase()} ${ii(pill.lifespan/1000)}`;
	    var x = ForSide(side, gw(0.25), gw(0.75));
	    DrawText(msg, "center", x, gPillTextY, gSmallestFontSizePt);
	});
    };

    self.Init();
}
