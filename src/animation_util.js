function GenerateLightningPath(props) {
    // props = { x0, y0, x1, y1, range, steps=5 }
    // i wish i had started off this thing in typescript, you know?
    var { x0, y0, x1, y1, range, steps=5 } = props;
    var points = [[O5(x0), O5(y0)]];
    if (isU(x0), isU(y0), isU(x1), isU(y1)) {
        Assert(false, "bad props");
        return points;
    }
    if (isU(range)) { range = Math.min(Math.abs((x1-x0)/10), Math.abs((y1-y0)/10)); }
    if (steps <= 0) { steps = 1; }
    var sx = ii((x1 - x0)/steps);
    var sy = ii((y1 - y0)/steps);

    for (var t = 1; t <= steps; ++t) {
        var px = points[t-1][0];
        var py = points[t-1][1];
        var rt = gR.RandomCentered(t, 0.1);
        var x = x0 + (sx*rt);
        var y = y0 + (sy*rt);
        var dx = x-px;
        var dy = y-py;
        var n = Math.sqrt(dx*dx+dy*dy);
        if (n == 0) { n = 1; }
        var nx = -dy/n;
        var ny = dx/n;
        var xo = x + (nx * gR.RandomCentered(0, range, range/2));
        var yo = y + (ny * gR.RandomCentered(0, range, range/2));
        points.push([O5(xo), O5(yo)]);
    }
    return points;
}

function AddLightningPath(props) {
    // props = { color, ...GenerateLightningPath.props }
    const { color, x0, y0, x1, y1 } = props;
    const points = GenerateLightningPath(props);
    Cxdo(() => {
	const ga = gCx.globalAlpha;

        gCx.strokeStyle = color;
        gCx.beginPath();
        gCx.moveTo(points[0][0], points[0][1]);
        points.forEach((p,i) => { if (i>0) { gCx.lineTo(p[0], p[1]); } });
        gCx.lineTo(x1, y1);
        gCx.lineWidth = 3;
        gCx.globalAlpha = ga * 0.5;
        gCx.stroke();

        gCx.beginPath();
        gCx.moveTo(points[0][0], points[0][1]);
        points.forEach((p,i) => { if (i>0) { gCx.lineTo(p[0], p[1]); } });
        gCx.lineTo(x1, y1);
        gCx.lineWidth = 1;
        gCx.globalAlpha = ga;
        gCx.stroke();

	gCx.globalAlpha = ga;
    });
}
