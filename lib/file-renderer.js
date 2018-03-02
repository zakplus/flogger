'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MAX_ARCHIVES = 10000;

function getArchiveName(filePath, archiveNamesSorting) {
  var dir = _path2.default.dirname(filePath);
  var ext = _path2.default.extname(filePath);
  var name = _path2.default.basename(filePath, ext);

  // Checks if last archive name was used
  var lastArchiveNameAvail = false;
  var lastArchive = _path2.default.resolve(dir, name + '_' + MAX_ARCHIVES + ext);
  try {
    _fs2.default.openSync(lastArchive, 'r');
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Last archive file name is available
      lastArchiveNameAvail = true;
    } else {
      throw err;
    }
  }
  if (!lastArchiveNameAvail) throw new Error('No usable archive file name found. Please consider removing older logs.');

  // Descending order (newer archives gets higher suffix number)
  if (archiveNamesSorting === 'descending') {
    for (var i = 1; i <= MAX_ARCHIVES; i += 1) {
      var candidate = _path2.default.resolve(dir, name + '_' + i + ext);
      try {
        _fs2.default.openSync(candidate, 'r');
      } catch (err) {
        if (err.code === 'ENOENT') {
          // Available archive file name found
          return candidate;
        }
        throw err;
      }
    }
    throw new Error('No usable archive file name found. Please consider removing older logs.');
  } else {
    // AscendingOrder order (newer archives get lower suffix number)
    // Rename all archives
    for (var _i = MAX_ARCHIVES - 1; _i >= 1; _i -= 1) {
      var oldName = _path2.default.resolve(dir, name + '_' + _i + ext);
      var newName = _path2.default.resolve(dir, name + '_' + (_i + 1) + ext);

      // Renames file if exists
      try {
        _fs2.default.renameSync(oldName, newName);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          // Unexpected error
          throw err;
        }
      }
    }

    // Return new archive name
    return _path2.default.resolve(dir, name + '_' + 1 + ext);
  }
}

var FileRenderer = function () {
  function FileRenderer(options) {
    _classCallCheck(this, FileRenderer);

    this.path = null;
    this.fileSizeLimit = 0;
    this.fileSizeOverflowPolicy = 'archive';

    if (options) {
      // File path
      if (options.path) {
        if (typeof options.path !== 'string') throw new Error('options.path must be a string');
        this.path = options.path;
      }

      // File size limit
      if (options.fileSizeLimit) {
        if (!Number.isInteger(options.fileSizeLimit) || options.fileSizeLimit < 0) {
          throw new Error('options.fileSizeLimit must be a integer >= 0');
        }
        this.fileSizeLimit = options.fileSizeLimit;
      }

      // File size overflow policy
      if (options.fileSizeOverflowPolicy) {
        if (typeof options.fileSizeOverflowPolicy !== 'string') throw new Error('options.fileSizeOverflowPolicy must be a string');
        if (options.fileSizeOverflowPolicy === 'archive' || options.fileSizeOverflowPolicy === 'overwrite') {
          this.fileSizeOverflowPolicy = options.fileSizeOverflowPolicy;
        } else {
          throw new Error('"' + options.fileSizeOverflowPolicy + '" is not a legal options.fileSizeOverflowPolicy value');
        }
      }

      // Archive names sorting
      if (options.archiveNamesSorting) {
        if (typeof options.archiveNamesSorting !== 'string') throw new Error('options.archiveNamesSorting must be a string');
        if (options.archiveNamesSorting === 'ascending' || options.archiveNamesSorting === 'descending') {
          this.archiveNamesSorting = options.archiveNamesSorting;
        } else {
          throw new Error('"' + options.archiveNamesSorting + '" is not a legal options.archiveNamesSorting value');
        }
      }
    }
  }

  _createClass(FileRenderer, [{
    key: 'render',
    value: function render(level, origin, message) {
      var append = true;

      if (this.path) {
        var filePath = this.path;

        // If a file size limit is set
        if (this.fileSizeLimit > 0) {
          var fileSizeInBytes = 0;
          try {
            var stats = _fs2.default.statSync(filePath);
            fileSizeInBytes = stats.size;
          } catch (err) {}
          // ok, file does not exists


          // Checks if log file is too big
          if (fileSizeInBytes > this.fileSizeLimit) {
            if (this.fileSizeOverflowPolicy === 'archive') {
              try {
                // Rename log file to archive it
                var archiveName = getArchiveName(filePath, this.archiveNamesSorting);
                _fs2.default.renameSync(filePath, archiveName);
              } catch (err) {
                console.error(err);
                filePath = null;
              }
            } else {
              // Overwriting file
              append = false;
            }
          }
        }

        // Write or append the log entry to file
        if (filePath) {
          var timeDate = new Date().toUTCString();
          var log = timeDate + ' - [' + level + '] ' + origin + ':\n' + message + '\n\n';
          try {
            if (append) {
              _fs2.default.appendFileSync(filePath, log);
            } else {
              _fs2.default.writeFileSync(filePath, log);
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
  }]);

  return FileRenderer;
}();

exports.default = FileRenderer;