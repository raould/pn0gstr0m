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

function AssertNonNaN(...args) {
    args.forEach(arg => {
        if (Array.isArray(arg)) {
            arg.forEach(e => { AssertNonNaN(e); });
        }
        else {
            Assert(!isNaN(arg));
        }
    });
}
