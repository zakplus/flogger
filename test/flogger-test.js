const test = require('tape');
const shell = require('shelljs');
const path = require('path');
const tmp = require('tmp');
const { Flogger, FileRenderer } = require('../lib/index');

// cleanup the temporary files even when an uncaught exception occurs
tmp.setGracefulCleanup();

// Testing log file archiviation
test('Testing FileRenderer log file archiviation', (t) => {
  const logsDirObj = tmp.dirSync({ unsafeCleanup: true });
  const logsDir = logsDirObj.name;

  const fileSizeLimit = 1000;

  const fileRenderer = new FileRenderer({
    path: path.resolve(logsDir, 'log.txt'),
    fileSizeLimit,
    fileSizeOverflowPolicy: 'archive',
  });

  const flog = new Flogger({ renderer: fileRenderer });
  const archivePath = path.resolve(logsDir, 'log_1.txt');

  for (let i = 0; i < 100; i += 1) {
    flog.$info('test');
    if (shell.test('-ef', archivePath)) {
      const archiveSize = shell.ls('-l', archivePath)[0].size;
      t.true(archiveSize > fileSizeLimit, 'Archive size should be greater than fileSizeLimit');
      t.end();
      return;
    }
  }

  t.fail('An archive file should be generated');
  t.end();
});

// Test for ascending ordered archived log files
test('Testing FileRenderer ascending archive test', (t) => {
  const logsDirObj = tmp.dirSync({ unsafeCleanup: true });
  const logsDir = logsDirObj.name;

  const fileRenderer = new FileRenderer({
    path: path.resolve(logsDir, 'log.txt'),
    fileSizeLimit: 1,
    fileSizeOverflowPolicy: 'archive',
    archiveNamesSorting: 'ascending',
  });

  const flog = new Flogger({ renderer: fileRenderer });

  flog.$info('one');
  flog.$info('two');
  flog.$info('three');

  const logPath = path.resolve(logsDir, 'log.txt');
  const log1Path = path.resolve(logsDir, 'log_1.txt');
  const log2Path = path.resolve(logsDir, 'log_2.txt');

  t.true(
    shell.test('-ef', logPath) &&
    shell.test('-ef', log1Path) &&
    shell.test('-ef', log2Path),
    'log.txt, log_1.txt, log_2.txt should be created',
  );

  const logTime = shell.ls('-l', logPath)[0].mtimeMs;
  const log1Time = shell.ls('-l', log1Path)[0].mtimeMs;
  const log2Time = shell.ls('-l', log2Path)[0].mtimeMs;

  t.true(logTime > log1Time && logTime > log2Time, 'log.txt should be the most recent file');
  t.true(log1Time > log2Time, 'log_1.txt should be more recent than log_2.txt');

  t.end();
});

// Test for descending ordered archived log files
test('Testing FileRenderer descending archive test', (t) => {
  const logsDirObj = tmp.dirSync({ unsafeCleanup: true });
  const logsDir = logsDirObj.name;

  const fileRenderer = new FileRenderer({
    path: path.resolve(logsDir, 'log.txt'),
    fileSizeLimit: 1,
    fileSizeOverflowPolicy: 'archive',
    archiveNamesSorting: 'descending',
  });

  const flog = new Flogger({ renderer: fileRenderer });

  flog.$info('one');
  flog.$info('two');
  flog.$info('three');

  const logPath = path.resolve(logsDir, 'log.txt');
  const log1Path = path.resolve(logsDir, 'log_1.txt');
  const log2Path = path.resolve(logsDir, 'log_2.txt');

  t.true(
    shell.test('-ef', logPath) &&
    shell.test('-ef', log1Path) &&
    shell.test('-ef', log2Path),
    'log.txt, log_1.txt, log_2.txt should be created',
  );

  const logTime = shell.ls('-l', logPath)[0].mtimeMs;
  const log1Time = shell.ls('-l', log1Path)[0].mtimeMs;
  const log2Time = shell.ls('-l', log2Path)[0].mtimeMs;

  t.true(logTime > log1Time && logTime > log2Time, 'log.txt should be the most recent file');
  t.true(log2Time > log1Time, 'log_1.txt should be more recent than log_2.txt');

  t.end();
});
