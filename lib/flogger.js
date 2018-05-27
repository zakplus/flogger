'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _consoleRenderer = require('./console-renderer');

var _consoleRenderer2 = _interopRequireDefault(_consoleRenderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Adds a log function to the object
function addLogLevel(level, name) {
  var _this = this;

  this.levels[name] = level;
  this['$' + name] = function (data) {
    _this.log(name, data);
  };
}

// Creates object default log functions and sets default log level
function setDefaultLogFunctions() {
  var _this2 = this;

  (0, _lodash2.default)(['trace', 'debug', 'info', 'warning', 'error']).forEach(function (name, index) {
    addLogLevel.call(_this2, index, name);
  });
  this.setLevel('debug');
}

// Read constructor options
function readOptions(options) {
  var _this3 = this;

  if (options) {
    if (options.levels) {
      if (!(options.levels instanceof Array)) throw new Error('Option "levels" must be a string array');
      if (!_lodash2.default.every(options.levels, function (level) {
        return typeof level === 'string';
      })) throw new Error('Option "levels" must be a string array');
      _lodash2.default.forEach(options.levels, function (name, index) {
        addLogLevel.call(_this3, index, name);
      });
    } else {
      setDefaultLogFunctions.call(this);
    }

    if (options.level) {
      if (typeof options.level !== 'string') throw new Error('Option "level" must be a string');
      if (this.levels[options.level] === undefined) throw new Error(options.level + ' is not a valid log level');
      this.setLevel(options.level);
    }

    if (options.renderer) {
      if (typeof options.renderer.render !== 'function') throw new Error('Option "renderer" must be a object exposing a "render" function');
      this.renderer = options.renderer;
    }
  } else {
    setDefaultLogFunctions.call(this);
  }
}

var Flogger = function () {
  function Flogger(options) {
    _classCallCheck(this, Flogger);

    this.level = 0;
    this.levels = {};
    this.renderer = _consoleRenderer2.default;
    readOptions.call(this, options);
  }

  _createClass(Flogger, [{
    key: 'log',
    value: function log(name, data) {
      var level = this.levels[name];
      if (level !== undefined && level >= this.level) {
        var origin = new Error().stack.split('\n')[3].trim();
        this.renderer.render(name, origin, data);
      }
    }
  }, {
    key: 'setLevel',
    value: function setLevel(name) {
      var level = this.levels[name];
      if (level !== undefined) {
        this.level = level;
      } else {
        throw new Error(name + ' is not a valid log level');
      }
    }
  }, {
    key: 'getLevel',
    value: function getLevel() {
      var names = Object.keys(this.levels);
      for (var i = 0; i < names.length; i += 1) {
        var name = names[i];
        var level = this.levels[name];
        if (level === this.level) return names;
      }
      return undefined;
    }
  }]);

  return Flogger;
}();

exports.default = Flogger;