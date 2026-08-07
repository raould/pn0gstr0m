/* Copyright (C) 2026 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function AddImageToCache(name, path, cache) {
    Assert(isU(cache[name]), name);
    var img = new Image();
    img.src = path;
    cache[name] = img;
}

const gImageCache = {};
AddImageToCache("forcepushL", "images/forcepushL.png", gImageCache);
AddImageToCache("forcepushR", "images/forcepushR.png", gImageCache);
AddImageToCache("decimate", "images/decimate.png", gImageCache);
AddImageToCache("engorge", "images/engorge.png", gImageCache);
AddImageToCache("split", "images/split.png", gImageCache);
AddImageToCache("barrier", "images/defend.png", gImageCache);
AddImageToCache("xtra", "images/xtra.png", gImageCache);
AddImageToCache("neo", "images/neo.png", gImageCache);
AddImageToCache("wildL", "images/chaosL.png", gImageCache);
AddImageToCache("wildR", "images/chaosR.png", gImageCache);
AddImageToCache("qr", "images/pn0g_qr.png", gImageCache);
AddImageToCache("dm1", "images/dm1.png", gImageCache);
AddImageToCache("dm2", "images/dm2.png", gImageCache);
AddImageToCache("dm3", "images/dm3.png", gImageCache);
AddImageToCache("dm4", "images/dm4.png", gImageCache);
AddImageToCache("yarsL", "images/yarsL.png", gImageCache);
AddImageToCache("yarsR", "images/yarsR.png", gImageCache);
