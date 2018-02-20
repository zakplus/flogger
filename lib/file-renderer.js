'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileRenderer = function () {
  function FileRenderer(options) {
    _classCallCheck(this, FileRenderer);

    if (options) {
      if (options.path) {
        this.file = options.path;
      }
    }
  }

  _createClass(FileRenderer, [{
    key: 'render',
    value: function render(level, origin, message) {
      var timeDate = new Date().toUTCString();
      var log = timeDate + ' - [' + level + '] ' + origin + ':\n' + message + '\n\n';
      try {
        _fs2.default.appendFileSync(this.file, log);
      } catch (err) {
        console.error(err);
      }
    }
  }]);

  return FileRenderer;
}();

exports.default = FileRenderer;