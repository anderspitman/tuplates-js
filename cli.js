#!/usr/bin/env node

const path = require('path');
const doTuplate = require('./tuplates.js');

(async() => {
  const fs = require('fs');
  const path = require('path');

  tuplateDir = 'tuplates';

  const tuplates = await buildTuplates(tuplateDir);

  try {
    await walkReplace('./', tuplates);
  }
  catch (e) {
    console.error(e);
  }

  async function walkReplace(dirPath, tuplates) {

    const baseName = path.basename(dirPath);
    if (baseName.startsWith('.') && baseName !== '.') {
      return;
    }

    const dir = await fs.promises.readdir(dirPath);

    for (filename of dir) {
      const childPath = path.join(dirPath, filename);

      if (childPath === tuplateDir) {
        continue;
      }
      const stats = await fs.promises.stat(childPath);

      if (stats.isFile()) {
        if (isValidType(childPath)) {
          const fileText = await fs.promises.readFile(childPath, 'utf8');
          // TODO: stream the files
          const newText = doTuplate(childPath, fileText, tuplates);
          await fs.promises.writeFile(childPath, newText);
        }
      }
      else {
        walkReplace(childPath, tuplates);
      }
    }
  }

  async function buildTuplates(tuplateDir) {

    const dir = await fs.promises.readdir(tuplateDir);

    const tuplates = {};

    for (filename of dir) {
      const childPath = path.join(tuplateDir, filename);
      const stats = await fs.promises.stat(childPath);

      if (stats.isFile()) {
        const fileText = await fs.promises.readFile(childPath, 'utf8');
        tuplates[filename] = fileText;
      }
    }

    return tuplates;
  }
})();

const validExts = [
  '.js', '.html', '.css'
];

function isValidType(filePath) {
  return -1 !== validExts.indexOf(path.extname(filePath));
}
