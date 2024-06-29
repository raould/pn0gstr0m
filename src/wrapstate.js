/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

/*class*/ function WrapState(props) {
    var self = this;

    self.Init = function() {
        self.debug = aorb(props.debug, false);
        self.Reset();
        self.dlog("-Init");
    };

    self.dlog = function() {
        if (!!self.debug) {
            console.log.apply(null, arguments);
        }
    };

    // note: you can use Get() or just read state.$ directly.
    self.Get = function() {
        return self.$;
    };

    self.Reset = function() {
        self.$ = props.resetFn();
        self.dlog("Reset", self.$);
    };

    self.Set = function(state) {
        self.$ = {...state};
        self.dlog("Set", self.$);
    };

    self.Update = function(state) {
        self.$ = {...self.$, ...state};
        self.dlog("Update", state, self.$);
    };

    self.Delete = function(key) {
        delete self.$[key];
        self.dlog("Delete", key, self.$);
    };

    self.Init();
};
