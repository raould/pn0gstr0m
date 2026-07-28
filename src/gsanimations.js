/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function MakeEngorgeAnimation(props) {
    var { lifespan, paddle, endFn } = props;
    var ph0 = paddle.height;
    var t10 = 1;
    return new GSAnimation({
        name: "engorge",
        lifespan,
        animFn: (self, dt, gameState) => {
            t10 = T10(self.lifespan0-self.life, self.lifespan0);
        },
        drawFn: () => {
            AddLightningPath({
                color: RandomColor(),
                x0: paddle.GetMidX(), y0: paddle.y,
                x1: paddle.GetMidX(), y1: paddle.y + paddle.height,
                range: Math.max(sx1(1), paddle.width * 2 * t10)
            });
        },
        startFn: (gameState) => {
            paddle.BeginEngorged();
        },
        endFn: (gameState) => {
            paddle.EndEngorged();
            if (exists(endFn)) { endFn(gameState); }
        }
    });
}

function MakeForceFieldHorizAnimation( props /* points: array of [x0,y0,x1,y1,x2,y2,...] */ ) {
    Assert(exists(props.points));
    Assert(props.points.length % 2 === 0);
    const isTop = props.points[1] < gh(0.5); // fugly.
    const seg_count = Math.floor(props.points.length/2);
    const top_y0 = 0;
    const top_y1 = gYInset + gh(0.1);
    const bottom_y0 = gHeight - gYInset - gh(0.1);
    const bottom_y1 = gHeight;
    var path_props = {
	color: "cyan",
	steps: 50/seg_count,
	range: sy1(2),
    };
    var anims = [];
    for (let i = 0; i < props.points.length - 2; i += 2) {
	anims.push(new GSAnimation({
	    name: "force_field",
	    lifespan: undefined,
	    drawFn: (self, gameState) => {
		const t = isTop ?
		      T10Range(gPuckYMin, top_y0, top_y1) :
		      T01Range(gPuckYMax, bottom_y0, bottom_y1)
		AddLightningPath({
		    ...path_props,
		    alpha: t/2,
		    x0: props.points[i],
		    y0: props.points[i+1],
		    x1: props.points[i+2],
		    y1: props.points[i+3]
		});
	    }
	}));
    }
    return anims;
}
