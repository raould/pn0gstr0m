"use strict";

/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

/*class*/
function Pool(size, allocDeadFn) {
  var self = this;
  self.Init = function () {
    self.array = Array(size);
    for (var i = 0; i < size; ++i) {
      self.array[i] = allocDeadFn();
    }
  };

  // new things do not overwrite existing ones;
  // if there is no room, this returns undefined.
  self.Alloc = function () {
    return self.array.find(function (e) {
      Assert(exists(e));
      return !e.alive;
    });
  };

  // note: as long as e.alive gets set to false somewhere, it
  // can be recycled and Free() doesn't have to be called.
  self.Free = function (e) {
    e.alive = false;
  };
  self.Init();
}

// sorry this interface is unergonomic.
// voodoo, but empirically just having this seems
// at least in some browsers to reduce hitchiness
// that i naively guess is gc pauses.
/*class*/
function ReuseArray(initialCapacity) {
  var self = this;
  self.Init = function () {
    self.length = 0;
    self.array = Array(initialCapacity);
    self.metadata = {};
  };
  self.clear = function () {
    // note: admittedly this prevents
    // the gc'ing of whatever is in self.array,
    // which (hopefully) isn't a big deal for our use cases.
    self.length = 0;
  };
  self.read = function (index) {
    Assert(index < self.length);
    Assert(index < self.array.length);
    return self.array[index];
  };
  self.pop = function () {
    if (self.length > 0) {
      self.length--;
      var elem = self.array[self.length];
      self.array[self.length] = undefined;
      return elem;
    }
    return undefined;
  };
  self.push = function (v) {
    Assert(exists(v));
    if (self.length < self.array.length) {
      self.array[self.length] = v;
    } else {
      // actually really trying to avoid any resizing of self.array.
      Assert(false);
      self.array.push(v);
    }
    ++self.length;
  };
  self.pushAll = function (a) {
    a.forEach(function (e) {
      self.push(e);
    });
  };
  self.map = function (mfn) {
    var acc = [];
    for (var i = 0; i < self.length; ++i) {
      acc.push(mfn(self.array[i], i));
    }
    return acc;
  };
  self.filter = function (ffn) {
    var acc = [];
    for (var i = 0; i < self.length; ++i) {
      var e = self.array[i];
      if (ffn(e, i)) {
        acc.push(e);
      }
    }
    return acc;
  };
  self.reduce = function (rfn, zero) {
    var z = zero;
    for (var i = 0; i < self.length; ++i) {
      z = rfn(z, self.array[i]);
    }
    return z;
  };
  self.forEach = function (cb) {
    for (var i = 0; i < self.length; ++i) {
      cb(self.array[i], i, self.array);
    }
  };
  self.revEach = function (cb) {
    for (var i = self.length - 1; i >= 0; --i) {
      cb(self.array[i], i, self.array);
    }
  };
  self.Init();
}