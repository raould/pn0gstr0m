"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

/*class*/
function WrapState(props) {
  var self = this;
  self.Init = function () {
    self.debug = aorb(props.debug, false);
    self.Reset();
    if (self.debug) {
      console.log("-Init");
    }
  };

  // note: you can use Get() or just read state.$ directly.
  self.Get = function () {
    return self.$;
  };
  self.Reset = function () {
    self.$ = props.resetFn();
    if (self.debug) {
      console.log("Reset", self.$);
    }
  };
  self.Set = function (state) {
    self.$ = _objectSpread({}, state);
    if (self.debug) {
      console.log("Set", self.$);
    }
  };
  self.Update = function (state) {
    self.$ = _objectSpread(_objectSpread({}, self.$), state);
    if (self.debug) {
      console.log("Update", state, self.$);
    }
  };
  self.Delete = function (key) {
    delete self.$[key];
    if (self.debug) {
      console.log("Delete", key, self.$);
    }
  };
  self.Init();
}
;