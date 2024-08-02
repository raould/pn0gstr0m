"use strict";

/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function Spark() {
  var self = this;
  self.Init = function () {
    self.id = gNextID++;
    self.alive = false;
  };
  self.PlacementInit = function (props) {
    self.x = props.x;
    self.y = props.y;
    self.prevX = self.x;
    self.prevY = self.y;
    self.width = gSparkWidth;
    self.height = gSparkHeight;
    self.vx = props.vx;
    self.vy = props.vy;
    // randomize lifespan a little for visual variety.
    self.frameCount = gR.RandomRange(0, 5);
    self.alive = true;
  };
  self.Draw = function (alpha) {
    Cxdo(function () {
      gCx.beginPath();
      gCx.rect(self.x, self.y, self.width, self.height);
      gCx.fillStyle = RandomRed(alpha);
      gCx.fill();
    });
    self.frameCount++;
  };
  self.Step = function (dt) {
    if (self.alive) {
      dt = kMoveStep * (dt / kTimeStep);
      self.prevX = self.x;
      self.prevY = self.y;
      self.x += self.vx * dt;
      self.y += self.vy * dt;
      self.alive = self.frameCount < kMaxSparkFrame;
    }
  };
  self.Init();
}