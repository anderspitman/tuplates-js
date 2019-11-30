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

      if (tuplates[tuplateName]) {
        for (let tupLine of tuplates[tuplateName].split('\n')) {
          for (let i = 0; i < numSpaces; i++) {
            tupLine = ' ' + tupLine;
          }
          outLines.push(tupLine);
        }
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

  return outLines.join('\n');
}

module.exports = doTuplate;
