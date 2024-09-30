/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function MakeGameStartAnimation() {
    var lifespan = 700;
    return new Animation({
        name: "gamestart",
        lifespan,
        drawFn: (anim) => {
            var t = T10(anim.lifespan, anim.lifespan0);
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
