import fs from 'fs';
import path from 'path';

const MAX_ARCHIVES = 10000;

function getArchiveName(filePath, archiveNamesSorting) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const name = path.basename(filePath, ext);

  // Checks if last archive name was used
  let lastArchiveNameAvail = false;
  const lastArchive = path.resolve(dir, `${name}_${MAX_ARCHIVES}${ext}`);
  try {
    fs.openSync(lastArchive, 'r');
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
    for (let i = 1; i <= MAX_ARCHIVES; i += 1) {
      const candidate = path.resolve(dir, `${name}_${i}${ext}`);
      try {
        fs.openSync(candidate, 'r');
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
    for (let i = MAX_ARCHIVES - 1; i >= 1; i -= 1) {
      const oldName = path.resolve(dir, `${name}_${i}${ext}`);
      const newName = path.resolve(dir, `${name}_${i + 1}${ext}`);

      // Renames file if exists
      try {
        fs.renameSync(oldName, newName);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          // Unexpected error
          throw err;
        }
      }
    }

    // Return new archive name
    return path.resolve(dir, `${name}_${1}${ext}`);
  }
}

export default class FileRenderer {
  constructor(options) {
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
        if (
          options.fileSizeOverflowPolicy === 'archive' ||
          options.fileSizeOverflowPolicy === 'overwrite'
        ) {
          this.fileSizeOverflowPolicy = options.fileSizeOverflowPolicy;
        } else {
          throw new Error(`"${options.fileSizeOverflowPolicy}" is not a legal options.fileSizeOverflowPolicy value`);
        }
      }

      // Archive names sorting
      if (options.archiveNamesSorting) {
        if (typeof options.archiveNamesSorting !== 'string') throw new Error('options.archiveNamesSorting must be a string');
        if (
          options.archiveNamesSorting === 'ascending' ||
          options.archiveNamesSorting === 'descending'
        ) {
          this.archiveNamesSorting = options.archiveNamesSorting;
        } else {
          throw new Error(`"${options.archiveNamesSorting}" is not a legal options.archiveNamesSorting value`);
        }
      }
    }
  }

  render(level, origin, message) {
    let append = true;

    if (this.path) {
      let filePath = this.path;

      // If a file size limit is set
      if (this.fileSizeLimit > 0) {
        let fileSizeInBytes = 0;
        try {
          const stats = fs.statSync(filePath);
          fileSizeInBytes = stats.size;
        } catch (err) {
          // ok, file does not exists
        }

        // Checks if log file is too big
        if (fileSizeInBytes > this.fileSizeLimit) {
          if (this.fileSizeOverflowPolicy === 'archive') {
            try {
              // Rename log file to archive it
              const archiveName = getArchiveName(filePath, this.archiveNamesSorting);
              fs.renameSync(filePath, archiveName);
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
        const timeDate = new Date().toUTCString();
        const log = `${timeDate} - [${level}] ${origin}:\n${message}\n\n`;
        try {
          if (append) {
            fs.appendFileSync(filePath, log);
          } else {
            fs.writeFileSync(filePath, log);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
}
