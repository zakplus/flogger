import _ from 'lodash';
import consoleRenderer from './console-renderer';

// Adds a log function to the object
function addLogLevel(level, name) {
  this.levels[name] = level;
  this[`$${name}`] = (data) => {
    this.log(name, data);
  };
}

// Creates object default log functions and sets default log level
function setDefaultLogFunctions() {
  _(['trace', 'debug', 'info', 'warning', 'error']).forEach((name, index) => {
    addLogLevel.call(this, index, name);
  });
  this.setLevel('debug');
}

// Read constructor options
function readOptions(options) {
  if (options) {
    if (options.levels) {
      if (!(options.levels instanceof Array)) throw new Error('Option "levels" must be a string array');
      if (!_.every(options.levels, level => typeof level === 'string')) throw new Error('Option "levels" must be a string array');
      _.forEach(options.levels, (name, index) => {
        addLogLevel.call(this, index, name);
      });
    } else {
      setDefaultLogFunctions.call(this);
    }

    if (options.level) {
      if (typeof options.level !== 'string') throw new Error('Option "level" must be a string');
      if (this.levels[options.level] === undefined) throw new Error(`${options.level} is not a valid log level`);
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

export default class Flogger {
  constructor(options) {
    this.level = 0;
    this.levels = {};
    this.renderer = consoleRenderer;
    readOptions.call(this, options);
  }

  log(name, data) {
    const level = this.levels[name];
    if (level !== undefined && level >= this.level) {
      const origin = new Error().stack.split('\n')[3].trim();
      this.renderer.render(name, origin, data);
    }
  }

  setLevel(name) {
    const level = this.levels[name];
    if (level !== undefined) {
      this.level = level;
    } else {
      throw new Error(`${name} is not a valid log level`);
    }
  }

  getLevel() {
    const names = Object.keys(this.levels);
    for (let i = 0; i < names.length; i += 1) {
      const name = names[i];
      const level = this.levels[name];
      if (level === this.level) return names;
    }
    return undefined;
  }
}
