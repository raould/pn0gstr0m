/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function Spark() {
    var self = this;

    self.Init = function() {
        self.id = gNextID++;
        self.alive = false;
    };

    self.PlacementInit = function(props) {
        self.x = props.x;
        self.y = props.y;
        self.prevX = self.x;
        self.prevY = self.y;
        self.width = gSparkWidth;
        self.height = gSparkHeight;
        self.vx = props.vx;
        self.vy = props.vy;
        self.frameCount = Math.ceil(gR.RandomCentered(kAvgSparkFrame, kAvgSparkFrame/4));
        self.alive = true;
        var r = gR.RandomFloat();
        self.colorSpec = r < 0.1 ?
            whiteSpec :
            (r < 0.2 ?
             yellowSpec :
             aub(props.colorSpec, redSpec)
            );
        AssertNonNaN(self.x, self.y, self.width, self.height, self.vx, self.vy);
    };

    self.Draw = function( alpha=1 ) {
        Cxdo(() => {
            var a = T01(self.frameCount, kAvgSparkFrame*(1+1/4));
            gCx.beginPath();
            gCx.rect( self.x, self.y, self.width, self.height );
            gCx.fillStyle = RandomForColor(self.colorSpec, a*alpha);
            gCx.fill();
        });
    };

    self.Step = function( dt ) {
        if (self.alive) {
	    dt = dt * kPhysicsStepScale;
            self.prevX = self.x;
            self.prevY = self.y;
            self.x += (self.vx * dt);
            self.y += (self.vy * dt);
            self.alive = self.frameCount > 0;
            self.frameCount--;
            AssertNonNaN(self.x, self.y, self.prevX, self.prevY, self.width, self.height, self.vx, self.vy);
        }
    };

    self.Init();
}
