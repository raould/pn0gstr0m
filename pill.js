/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// the props is { name, x, y, w, h, vx, vy, lifespan, label, ylb, testFn, boomFn, drawFn, endFn }
// don't you wish this was all in typescript now?
function Pill( props ) {
    var self = this;

    self.Init = function() {
	Assert(exists(props), "no props");
	self.id = gNextID++;
	self.name = props.name;
	self.x = props.x;
	self.y = props.y;
	self.prevX = self.x;
	self.prevY = self.y;
	self.width = props.width;
	self.height = props.height;
	self.vx = props.vx;
	self.vy = props.vy;
	self.lifespan = props.lifespan;
	self.alive = self.lifespan > 0;
	self.label = props.label;
	self.ylb = props.ylb;
	self.fontSize = props.fontSize;
	self.boomFn = props.boomFn;
	self.drawFn = props.drawFn;
	self.endFn = props.endFn;

	if (self.x >= gw(0.5)) {
	    self.leftBound = gw(0.5);
	    self.rightBound = gw(1);
	}
	else {
	    self.leftBound = 0;
	    self.rightBound = gw(0.5);
	}
	self.topBound = 0;
	self.bottomBound = gHeight;
    };

    self.Draw = function( alpha ) {
	self.drawFn( self, alpha );
    };

    self.Step = function( dt, gameState ) {
	self.Move( dt );
	self.alive = self.lifespan > 0;
	if (!self.alive) {
	    gameState.AddAnimation(
		MakePoofAnimation(
		    self.x + self.width/2,
		    self.y + self.height/2,
		    25
		)
	    );
	    if (exists(self.endFn)) {
		self.endFn();
		self.endFn = undefined;
	    }
	}
	self.lifespan -= dt;
	return self.alive ? self : undefined;
    };

    self.Move = function( dt ) {
	dt = kMoveStep * (dt/kTimeStep);
	self.prevX = self.x;
	self.prevY = self.y;
	self.x += (self.vx * dt);
	self.y += (self.vy * dt);
	if (self.x <= self.leftBound) {
	    self.vx = Math.abs(self.vx);
	    self.x = self.leftBound + 1;
	}
	else if (self.x + self.width >= self.rightBound) {
	    self.vx = -1 * Math.abs(self.vx);
	    self.x = self.rightBound - self.width - 1;
	}
	if (self.y <= self.topBound) {
	    self.vy = Math.abs(self.vy);
	    self.y = self.topBound + 1;
	}
	else if (self.y + self.height >= self.bottomBound) {
	    self.vy = -1 * Math.abs(self.vy);
	    self.y = self.bottomBound - self.height - 1;
	}
    };

    // todo: reuse collision xywh code.
    self.PaddleCollision = function( paddle ) {
	// !? assuming small enough simulation stepping !?
	// current step overlap?
	var xRight = self.x >= paddle.x+paddle.width;
	var xLeft = self.x+self.width < paddle.x ;
	var xOverlaps = ! ( xRight || xLeft );
	var yTop = self.y >= paddle.y+paddle.height;
	var yBottom = self.y+self.height < paddle.y;
	var yOverlaps = ! ( yTop || yBottom );

	// did previous step overlap?
	// also trying to see which direction?
	var pxRight = self.prevX >= paddle.prevX+paddle.width;
	var pxLeft = self.prevX+self.width < paddle.prevX;
	var pxOverlaps = ! ( pxRight || pxLeft );

	// did it pass over the paddle? (paranoid check.)
	var dxOverlaps = Sign(self.prevX - paddle.prevX) != Sign(self.x - paddle.x);

	return (dxOverlaps || xOverlaps) && yOverlaps;
    };
    
    self.AllPaddlesCollision = function( gameState, paddles ) {
	var nextSelf = self;
	paddles.forEach( function(paddle) {
	    var hit = self.PaddleCollision(paddle);
	    if( hit ) {
		self.boomFn(gameState);
		nextSelf = undefined;
	    }
	} );
	return nextSelf;
    };

    self.Init();
}
