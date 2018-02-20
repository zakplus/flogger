"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  render: function render(level, origin, message) {
    var timeDate = new Date().toUTCString();
    console.log(timeDate + " - [" + level + "] " + origin + ":");
    console.log(message);
    console.log();
  }
};