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
	self.pills = props.pills;
	self.alive = true;

	var pp = [];
	pp.push(MakeForcePushProps);
	pp.push(MakeDecimateProps);
	pp.push(MakeEngorgeProps);
	pp.push(MakeSplitProps);
	pp.push(MakeDefendProps);
	pp.push(MakeOptionProps);
	pp.push(MakeNeoProps);
	pp.push(MakeChaosProps);

	self.playerPowerups = new Powerups({
	    isPlayer: true,
	    paddle: props.playerPaddle,
	    side: ForSide(gPointerSide, "left", "right"),
	    specs: pp,
	});
	self.playerPill = undefined;
	self.cpuPowerups = new Powerups({
	    isPlayer: false,
	    paddle: props.cpuPaddle,
	    side: ForSide(gPointerSide, "right", "left"),
	    specs: [...pp, MakeDensityProps],
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

    self.Draw = function() {
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
    };

    self.Init();
}
