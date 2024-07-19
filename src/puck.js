/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function Puck(props) {
    /* props = { x, y, vx, vy, ur=true, forced=false, maxVX } */

    var self = this;

    self.Init = function() {
        self.id = gNextID++;
        self.x = props.x;
        self.y = props.y;
        self.prevX = self.x;
        self.prevY = self.y;
        self.width = gPuckWidth;
        self.height = gPuckHeight;
        self.midX = self.x + self.width/2;
        self.midY = self.y + self.height/2;
        // tweak max vx a tad to avoid everything being too visually lock-step.
        self.vx = gR.RandomCentered(props.vx, props.vx/10);
        self.vy = AvoidZero(props.vy, 0.1);
        self.alive = true;
        self.startTime = !!props.ur ? -Number.MAX_SAFE_INTEGER : gGameTime;
        self.splitColor = aub(props.forced, false) ? "yellow" : "white";
        self.isLocked = false;
    };

    self.Draw = function( alpha ) {
        // scal size: more total pucks -> smaller size.
        var countScale = 1 + T10(gPucks.A.length, kEjectCountThreshold) * 0.4;

        // slight crt distortion of size based on horizontal position.
        var crtScale = T10( Math.abs(self.x-gw(0.5)), gw(0.5)) * 0.5 + 1;
        var width = self.width * countScale * crtScale;
        var dw = width - self.width;
        var height = self.height * countScale * crtScale;
        var dh = height - self.height;

        var wx = self.x - dw/2;
        var wy = self.y - dh/2;

        // fade things that aren't close and coming toward you.
        var avx = 0.8;
        var avxt = 1-avx;
        var mid = gw(0.5);
        var range = gw(0.5) - gXInset;
        var t = 0;
        var vt = 0;
        if (Sign(self.vx) < 0 && wx < mid) {
            vt = wx - gXInset;
            t = easeOutExpo( T10(vt, range) );
            avx += t * avxt;
        }
        else if (Sign(self.vx) > 0 && wx >= mid) {
            vt = wx - gXInset - mid;
            t = easeOutExpo( T01(vt, range) );
            avx += t * avxt;
        }

        // young pucks (from paddle splits or powerups) render another color briefly.
        var dt = GameTime01(1000, self.startTime);
        var regularStyle = (gR.RandomFloat() > dt) ? self.splitColor : RandomCyan();
        var lostStyle = RandomYellow(0.7);
        var isLost = (self.x+self.width < gXInset || self.x > gw(1)-gXInset);
        var style = isLost ? lostStyle : regularStyle;

        Cxdo(() => {
            // a thin outline keeps things crisp when there are lots of pucks.
            gCx.beginPath();
            gCx.rect( wx-1, wy-1, width+2, height+2 );
            gCx.lineWidth = sx1(1);
            gCx.strokeStyle = "black";
            gCx.stroke();
            
            gCx.beginPath();
            gCx.globalAlpha = alpha * avx;
            gCx.rect( wx, wy, width, height );
            gCx.fillStyle = style;
            gCx.fill();

            if (gDebug) {
                gCx.beginPath();
                var oy = self.vx > 0 ? -1 : self.height+1;
                gCx.strokeStyle = self.vx > 0 ? "magenta" : "pink";
                gCx.moveTo(self.prevX+self.width/2, self.prevY+oy);
                gCx.lineTo(self.midX, self.y+oy);
                gCx.stroke();
            }
        });
    };

    self.Step = function( dt ) {
        if( self.alive && !self.isLocked ) {
            dt = kMoveStep * (dt/kTimeStep);
            self.prevX = self.x;
            self.prevY = self.y;
            self.x += (self.vx * dt);
            self.y += (self.vy * dt);
            var xout = self.x < 0 || self.x+self.width >= gWidth;
            var yout = self.y < 0 || self.y+self.height >= gHeight;
            self.alive = !(xout || yout);
            self.midX = self.x + self.width/2;
            self.midY = self.y + self.height/2;
            // note: no clipping or adjusting done here, see collision routines.
        }
    };

    self.SplitPuck = function({ forced=false, isSuddenDeath=false, maxVX }) {
        let np = undefined;
        const count = gPucks.A.length;
        const dosplit = forced || (count < ii(kEjectCountThreshold*0.7) || (count < kEjectCountThreshold && gR.RandomBool(1.05-Clip01(Math.abs(self.vx/maxVX)))));

        // sometimes force ejection to avoid too many pucks.
        // if there are already too many pucks to allow for a split-spawned-puck,
        // then we also want to sometimes eject the existing 'self' puck
        // to avoid ending up with just a linear stream of pucks.
        const r = gR.RandomFloat();
        const countFactor = Clip01(count/kEjectSpeedCountThreshold);
        const ejectCountFactor = Math.pow(countFactor, 3);
        const doejectCount = (count > kEjectCountThreshold) && (r < 0.1);
        const doejectSpeed = (self.vx > maxVX*0.9) && (r < ejectCountFactor);
        const doeject = doejectCount || doejectSpeed;

        if (!forced && !dosplit) { // i cry here.
            if (doeject) {
                self.vy *= 1.1;
            }
            PlayBlip();
        }
        else {
            // i'm sure this set of heuristics is clearly genius.
            // but i no longer have any idea what/why they do what they do.
            const slowCountFactor = Math.pow(countFactor, 1.5);
            // keep a few of the fast ones around?
            const slow = !doejectSpeed && (self.vx > maxVX*0.7) && (gR.RandomFloat() < slowCountFactor);
            const nvx = self.vx * (slow ? gR.RandomRange(0.8, 0.9) : gR.RandomRange(1.01, 1.1));
            let nvy = self.vy;
            nvy = self.vy * (AvoidZero(0.5, 0.1) + 0.3);
            np = new Puck({ x: self.x, y: self.y, vx: nvx, vy: nvy, ur: false, forced, maxVX });
            PlayExplosion();

            // fyi because SplitPuck is called during MovePucks,
            // we return the new puck to go onto the B list, whereas
            // MoveSparks happens after so it goes onto the A list.
            AddSparks({x:self.x, y:self.y, vx:self.vx, vy:self.vy});
        }

        // speed up all pucks over time to force the level to end some day.
        const nvx = MinSigned(
            self.vx * (isSuddenDeath ? 1.1 : 1.01),
            maxVX
        );
        console.log("puck vx updated", F(maxVX), F(self.vx), "->", F(nvx));
        self.vx = nvx;

        return np;
    };

    self.CollisionTest = function( xywh, blockvx ) {
        if( self.alive && !self.isLocked ) {
            if (isU(blockvx) || Sign(self.vx) == blockvx) {
                // !? assuming small enough simulation stepping !?

                // currently overlapping?
                var xRight = self.x >= xywh.x+xywh.width;
                var xLeft = self.x+self.width < xywh.x;
                var xSafe = xRight || xLeft;
                var xOverlaps = !xSafe;
                var yTop = self.y >= xywh.y+xywh.height;
                var yBottom = self.y+self.height < xywh.y;
                var ySafe = yTop || yBottom;
                var yOverlaps = !ySafe;

                // check if we seemed to have passed over xywh.
                // not going to require prevx from xywh so just use x
                // on the assumption they don't move at all, or not too fast anyway.
                var preSign = Sign(self.prevX - xywh.x);
                var postSign = Sign(self.x - xywh.x);
                var dxOverlaps = preSign != postSign;
                if (dxOverlaps) { console.log("x skipped over collision"); }

                return yOverlaps && (xOverlaps || dxOverlaps);
            }
        }
        return false;
    };

    self.AdjustAndBounceX = function( xywh ) {
        if( self.vx > 0 ) {
            self.x = xywh.x - self.width;
        }
        else {
            self.x = xywh.x + xywh.width;
        }
        self.vx *= -1;
    };

    self.ApplyEnglish = function( paddle, englishFactor ) {
        // smallest bit of vertical english.
        // too much means you never get to 'streaming'.
        // too little means you maybe crash the machine :-)
        // note that englishFactor increases as level ends.
        var dy = self.midY - paddle.GetMidY();
        var mody = gR.RandomFloat() * 0.02 * Math.abs(dy) * englishFactor;

        // try to avoid getting boringly stuck at top or bottom.
        // but don't want to utterly lose 'streaming'.
        var oy = 1;
        if (gR.RandomBool(0.1)) {
            var t01 = T01(Math.abs(self.x - gh(0.5)), gh(0.5));
            var ty = Math.pow( t01, 3 );
            oy = 1 + ty * 1;
        }

        if( self.midY < paddle.GetMidY() ) {
            self.vy -= mody * oy;
        }
        else if( self.midY > paddle.GetMidY() ) {
            self.vy += mody * oy;
        }
    };

    self.PaddleCollision = function( paddle, englishFactor, isSuddenDeath, maxVX ) {
        var newPuck = undefined;
        var hit = self.CollisionTest( paddle, paddle.blockvx );
        if ( hit ) {
            paddle.OnPuckHit();
            self.AdjustAndBounceX( paddle ); // todo: bounceY too?
            self.ApplyEnglish( paddle, englishFactor );
            // explicitly not calling PlayBlip(), gets too noisy.
            if (paddle.isSplitter) {
                newPuck = self.SplitPuck({ isSuddenDeath, maxVX });
            }
        }
        return newPuck;
    };

    self.AllPaddlesCollision = function(paddles, englishFactor, isSuddenDeath, maxVX ) {
        var spawned = [];
        if (self.alive && !self.isLocked) {
            paddles.forEach( paddle => {
                var np = self.PaddleCollision(paddle, englishFactor, isSuddenDeath, maxVX);
                if( exists(np) ) {
                    spawned.push( np );
                }
            } );
        }
        return spawned;
    };

    self.BarriersCollision = function(barriers) {
        if (self.alive && !self.isLocked && exists(barriers)) {
            barriers.forEach( barrier => {
                var hit = self.CollisionTest( barrier, ForSide(barrier.side, -1,1) );
                if (hit) {
                    barrier.OnPuckHit();
                    PlayBlip();
                    self.AdjustAndBounceX( barrier );
                }
            } );
        }
    };
    
    self.OptionsCollision = function(options) {
        if (self.alive && !self.isLocked && exists(options)) {
            options.forEach( function(option) {
                var hit = self.CollisionTest( option, ForSide(gP1Side, -1,1) );
                if (hit) {
                    option.OnPuckHit();
                    PlayBlip();
                    self.AdjustAndBounceX( option );
                }
            } );
        }
    };

    self.NeoCollision = function(neo) {
        if (self.alive && !self.isLocked && exists(neo)) {
            var hit = puck.CollisionTest( neo );
            if (hit) {
                neo.OnPuckHit();
                PlayBlip();
                // no bounce, get stuck instead.
                self.isLocked = true;
            }
        }
    };

    self.WallsCollision = function( maxVX ) {
        if (self.alive && !self.isLocked) {
            self.WallsBounce();
            self.WallsRepel( maxVX );
        }
    };

    self.WallsBounce = function() {
        var did = false;
        if( self.y < gYInset ) {
            did = true;
            self.y = gYInset;
        }
        if( self.y+self.height > gHeight - gYInset ) {
            did = true;
            self.y = gHeight - gYInset - self.height;
        }
        if (did) {
            self.vy *= -1;
            PlayBlip();
        }
    };

    self.WallsRepel = function( maxVX ) {
        var zone = gh(0.1);
        // if the puck is not moving slowly, repel vertically away from walls
        // in order to try to prevent the user from just leaving their paddle
        // at the wall indefinitely and not moving yet not losing pucks.
        if (Math.abs(self.vx) > maxVX * 0.5) {
            if (self.y - gYInset < zone && self.vy < 0) {
                self.vy -= 0.005;
            }
            if (gh(1) - gYInset - self.y < zone && self.vy > 0) {
                self.vy += 0.005;
            }
        }
    };

    self.Init();
}
