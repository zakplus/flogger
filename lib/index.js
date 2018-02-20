'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileRenderer = exports.consoleRenderer = exports.Flogger = undefined;

var _flogger = require('./flogger');

var _flogger2 = _interopRequireDefault(_flogger);

var _consoleRenderer = require('./console-renderer');

var _consoleRenderer2 = _interopRequireDefault(_consoleRenderer);

var _fileRenderer = require('./file-renderer');

var _fileRenderer2 = _interopRequireDefault(_fileRenderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Flogger = _flogger2.default;
exports.consoleRenderer = _consoleRenderer2.default;
exports.FileRenderer = _fileRenderer2.default;
exports.default = _flogger2.default;