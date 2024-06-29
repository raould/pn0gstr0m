"use strict";

/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// tap vs. move (?) due to history
var gPointerTapTimeout = 350;

/*class*/
function MoveTarget(props) {
  var self = this;
  self.Init = function () {
    self.name = props.name;
    self.ClearSide();
  };
  self.ClearPointer = function () {
    var _self$timestamp;
    self.pointerId = undefined;
    self.position = {
      x: undefined,
      y: undefined
    };
    self.timestamp = {
      start: (_self$timestamp = self.timestamp) == null ? void 0 : _self$timestamp.start,
      end: undefined
    };
  };
  self.ClearSide = function () {
    self.ClearPointer();
    self.side = undefined;
    self.isGlobal = undefined;
  };
  self.ClearY = function () {
    self.position.y = undefined;
  };
  self.SetSide = function (side, isSinglePlayer, midX) {
    self.side = side;
    self.isGlobal = isSinglePlayer;
    if (isSinglePlayer) {
      self.min_x = -Number.MAX_VALUE;
      self.max_x = Number.MAX_VALUE;
    } else {
      self.min_x = ForSide(self.side, -Number.MAX_VALUE, midX);
      self.max_x = ForSide(self.side, midX, Number.MAX_VALUE);
    }
  };
  self.Hit = function (x, y) {
    var hit = false;
    if (isU(self.pointerId)) {
      if (exists(self.isGlobal) && self.isGlobal) {
        hit = true;
      } else {
        hit = x >= self.min_x && x < self.max_x;
      }
    }
    return hit;
  };
  self.OnDown = function (pid, x, y) {
    var hit = self.Hit(x, y);
    if (hit) {
      self.pointerId = pid;
      self.position = {
        x: x,
        y: y
      };
      self.timestamp = {
        start: gGameTime,
        end: undefined
      };
    }
  };
  self.OnMove = function (pid, x, y) {
    if (self.doesMatchPid(pid) && isU(self.timestamp.end)) {
      self.position = {
        x: x,
        y: y
      };
    }
  };
  self.OnUp = function (pid) {
    if (self.doesMatchPid(pid)) {
      self.timestamp.end = gGameTime;
      self.pointerId = undefined;
    }
  };
  self.doesMatchPid = function (pid) {
    return pid == self.pointerId;
  };
  self.isEnabled = function () {
    var is = exists(self.timestamp.start);
    return is;
  };
  self.isDown = function () {
    var is = self.isEnabled() && isU(self.timestamp.end) && exists(self.pointerId);
    return is;
  };
  self.DrawDebug = function () {
    var _self$position, _self$position2;
    var x = (_self$position = self.position) == null ? void 0 : _self$position.x;
    var y = (_self$position2 = self.position) == null ? void 0 : _self$position2.y;
    if (exists(x) && exists(y)) {
      Cxdo(function () {
        gCx.beginPath();
        gCx.rect(x - 5, y - 5, 10, 10);
        gCx.fillStyle = RandomColor();
        gCx.fill();
      });
    }
  };
  self.Init();
}
;