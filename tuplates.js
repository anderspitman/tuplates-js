const tuplateStartRe = /.*tuplate_start\((.+)\).*/g;
const tuplateEndRe = /.*tuplate_end\(\).*/g;

function doTuplate(filePath, text, tuplates) {
  const lines = text.split('\n');

  let replacing = false;
  let tuplateName;
  let numSpaces = 0;
  let outLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const startMatch = tuplateStartRe.exec(line);
    const endMatch = tuplateEndRe.exec(line);

    if (startMatch) {
      if (replacing) {
        throw new Error(`Line ${i+1} in ${filePath}: Expecting 'tuplate_end', found 'tuplate_start'`);
      }
      replacing = true;

      tuplateName = startMatch[1];

      for (ch of line) {
        if (ch === ' ') {
          numSpaces += 1;
        }
        else {
          break;
        }
      }

      outLines.push(line);
    }
    else if (endMatch) {
      if (!replacing) {
        throw new Error(`Line ${i+1} in ${filePath}: Unexpected 'tuplate_end' without 'tuplate_start' first`);
      }
      replacing = false;

      const endTemplateName = endMatch[1];

      for (let tupLine of tuplates[tuplateName].split('\n')) {
        for (let i = 0; i < numSpaces; i++) {
          tupLine = ' ' + tupLine;
        }
        outLines.push(tupLine);
      }
      tuplateName = '';
      numSpaces = 0;

      outLines.push(line);
    }
    else if (replacing) {
      // no-op
    }
    else {
      outLines.push(line);
    }
  }

  if (replacing) {
    throw new Error(`${filePath}: Missing closing 'tuplate_end'`);
  }

  console.log(outLines);
  return outLines.join('\n');
}

// taken from https://github.com/iliakan/detect-node/blob/563e0b838ec1dd9b169d843268cdb220b78ddd91/index.js#L2
function isNode() {
  return Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
}

(async() => {
  if (isNode()) {
    const fs = require('fs');
    const path = require('path');

    tuplateDir = 'tuplates';

    const tuplates = await buildTuplates(tuplateDir);
    console.log(tuplates);

    try {
      await walkReplace('./', tuplates);
    }
    catch (e) {
      console.error(e);
    }

    async function walkReplace(dirPath, tuplates) {

      const dir = await fs.promises.readdir(dirPath);

      for (filename of dir) {
        const childPath = path.join(dirPath, filename);
        if (childPath === tuplateDir) {
          continue;
        }
        const stats = await fs.promises.stat(childPath);

        if (stats.isFile()) {
          console.log(childPath);
          const fileText = await fs.promises.readFile(childPath, 'utf8');
          // TODO: stream the files
          const newText = doTuplate(childPath, fileText, tuplates);
          console.log(newText);
          await fs.promises.writeFile(childPath, newText);
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
  }
})();
