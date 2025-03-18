"use strict";

/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function AddImageToCache(name, path, cache) {
  Assert(isU(cache[name]), name);
  var img = new Image();
  img.src = path;
  cache[name] = img;
}
var gImageCache = {};
AddImageToCache("forcepushL", "images/forcepushL.png", gImageCache);
AddImageToCache("forcepushR", "images/forcepushR.png", gImageCache);
AddImageToCache("decimate", "images/decimate.png", gImageCache);
AddImageToCache("engorge", "images/engorge.png", gImageCache);
AddImageToCache("split", "images/split.png", gImageCache);
AddImageToCache("defend", "images/defend.png", gImageCache);
AddImageToCache("xtra", "images/xtra.png", gImageCache);
AddImageToCache("neo", "images/neo.png", gImageCache);
AddImageToCache("chaos", "images/chaos.png", gImageCache);
AddImageToCache("qr", "images/pn0g_qr.png", gImageCache);