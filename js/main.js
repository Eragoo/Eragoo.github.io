let encoded;
let relativeRanges = [];

document.getElementById('encode').onclick = function () {
  let content = document.getElementById('text').value;
  encoded = encode(content);
  document.getElementById('output').innerText = encoded;
}

document.getElementById('decode').onclick = function () {
  let content = document.getElementById('text').value;
  document.getElementById('output').innerText = decode(content, relativeRanges);
}

function decode(code, relativeRanges)  {
  code = code / Math.pow(2, 24);

  let resp = '';
  let matchIndex = 0;
  for (let i = 0; i < relativeRanges.length; i++) {
    for (let j = 0; j < relativeRanges.length; j++) {
      if (relativeRanges[j][1][0] <= code && code <= relativeRanges[j][1][1]) {
        resp += relativeRanges[i][0];
        matchIndex = j;
        continue;
      }
    }
    code = (code - relativeRanges[matchIndex][1][0])/(relativeRanges[matchIndex][1][1]-relativeRanges[matchIndex][1][0]);
  }

  console.log(resp);
  return resp;
}

function encode(str) {
  let wp = getWp(str);

  let wpHtml = '<tr>' +
    '      <th>Х</th>' +
    '      <th>P</th>' +
    '    </tr>'
  wp.forEach((v, k) => wpHtml += '<tr>' +'<th>' + k +'</th>'+'<th>' + v +'</th>' + '</tr>')
  document.getElementById('wp').innerHTML = wpHtml


  console.log(wp.toString());

  //початкові абсолютні границі
  let absoluteRanges = getAbsoluteRanges(wp, str);
  let arHtml = '<tr>' +
    '      <th>Х</th>' +
    '      <th>P</th>' +
    '    </tr>'
  absoluteRanges.forEach((v, k) => arHtml += '<tr>' +'<th>' + v[0] +'</th>'+'<th>' + v[1] +'</th>' + '</tr>')
  document.getElementById('ar').innerHTML = arHtml
  //відносні границі що враховують попередні дані
  relativeRanges = getRelativeRanges(absoluteRanges, str);
  let rrHtml = '<tr>' +
    '      <th>Х</th>' +
    '      <th>P</th>' +
    '    </tr>'
  relativeRanges.forEach((v, k) => rrHtml += '<tr>' +'<th>' + v[0] +'</th>'+'<th>' + v[1] +'</th>' + '</tr>')
  document.getElementById('rr').innerHTML = rrHtml


  let code24bit1 = code24bit(relativeRanges[relativeRanges.length - 1][1][0], relativeRanges[relativeRanges.length - 1][1][1]);
  code24bit1 = Math.round(code24bit1);
  console.log("Code 24 bit: " + Math.round(code24bit1));

  console.log("Code length: 24 bit");
  console.log("Avg code length: " + 24/str.length + " bit/let");

  return code24bit1;
}

function code24bit(low, hi) {
  console.log("Pure code: " + (hi + low)/2);
  document.getElementById('raw_code').innerText = 'Код у чистому вигляді: ' + ((hi + low)/2);

  return ((hi + low) / 2) * Math.pow(2, 24);
}

function getRelativeRanges(absoluteRanges, ph) {
  console.log("Відносні границі:");
  let relative = absoluteRanges;

  let oldLow = 0;
  let oldHigh = 1;

  for (i = 0; i < absoluteRanges.length; i++) {
    lowRange = relative[i][1][0];
    highRange = relative[i][1][1];

    newLow = oldLow + (oldHigh - oldLow) * lowRange;
    newHigh = oldLow + (oldHigh - oldLow) * highRange;

    relative[i] = [ph.charAt(i), [newLow, newHigh]];

    oldLow = newLow;
    oldHigh = newHigh;

    console.log(ph.charAt(i) +" = [" + oldLow + "; " + oldHigh + "]");
  }

  return relative;
}

function getAbsoluteRanges(wp, phrase) {
  console.log("Абсолютні границі:");

  let right = 1;

  let r = [];

  for (let i = 0; i < phrase.length; i++) {
    let currentP = wp.get(phrase.charAt(i));

    r[i] = [phrase.charAt(i), [(right - currentP), right]];

    right = right - currentP;

    console.log(phrase.charAt(i) + " = [" + r[i][0] +";"+ r[i][1] + "]");
  }

  return r;
}

function getWp(word) {
  let wp = new Map();

  for (let i = 0; i < word.length; i++) {
    let current = word.charAt(i);
    let num = 1;
    for (j = i+1; j < word.length; j++) {
      if (current === (word.charAt(j))) {
        num++;
      }
    }

    if (!wp.has(current)) {
      wp.set(current, num/word.length);
    }
  }

  return wp;
}
