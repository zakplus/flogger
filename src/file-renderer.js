import fs from 'fs';

export default class FileRenderer {
  constructor(options) {
    if (options) {
      if (options.path) {
        this.file = options.path;
      }
    }
  }

  render(level, origin, message) {
    const timeDate = new Date().toUTCString();
    const log = `${timeDate} - [${level}] ${origin}:\n${message}\n\n`;
    fs.appendFileSync(this.file, log);
  }
}
