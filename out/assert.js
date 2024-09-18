"use strict";

/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function Assert(result, msg) {
  if (!result) {
    console.error("ASSERTION FAILED", msg);
    debugger;
  }
}
function AssertNonNaN() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  args.forEach(function (arg) {
    if (Array.isArray(arg)) {
      arg.forEach(function (e) {
        AssertNonNaN(e);
      });
    } else {
      Assert(!isNaN(arg));
    }
  });
}