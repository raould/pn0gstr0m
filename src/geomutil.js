/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function isPointInRect( p, xywh, marginxy=0 ) {
    if (isU(p) || isU(xywh)) {
        return false;
    }
    var { x:mx=0, y:my=0 } = marginxy;
    var l = p.x >= xywh.x - mx;
    var r = p.x <= xywh.x + xywh.width + mx;
    var t = p.y >= xywh.y - my;
    var b = p.y <= xywh.y + xywh.height + my;
    return l && r && t && b;
}

function isPointInCircle( p, xyr, margin=0 ) {
    if (isU(p) || isU(xyr)) {
        return false;
    }
    var d2 = Distance2(p.x, p.y, xyr.x, xyr.y);
    var r2 = (xyr.r + margin) * (xyr.r + margin);
    return d2 < r2;
}

