const cheerio = require('cheerio');
const request = require('request');
const Promise = require('promise');
const fs = require('fs');
const jsonfile = require('jsonfile');

const url = 'http://web-aaronding.rhcloud.com/employee.html';
const keys = ['firstName', 'lastName', 'ext', 'cell', 'alt', 'title', 'email'];
const oldDataPath = './data/oldData.json';

let getModifiedObj = (oldObj, newObj, keys) => {
  let m = {}, isModified = false;

  keys.forEach((prop) => {
    if (newObj[prop] !== oldObj[prop]) {
    m[prop]= oldObj[prop];
    isModified = true;
  }
})

  return isModified? m : undefined;
};

let compare = (oldData, newData) => {
  let result = {
    added: [],
    deleted: null,
    modified: []
  };

  let old = oldData.slice();
  const key = 'email';

  newData.forEach((n) => {
    let index = old.findIndex((o) => {
        return n[key] === o[key];
});

  if (index < 0) {
    result.added.push(n);
  } else {
    const m = getModifiedObj(old[index], n, keys);
    if (m) result.modified.push({
      'current': n,
      'diff': m
    });

    old.splice(index, 1);
  }
});

  result.deleted = old;
  return result;
};

let extract = (url, keys) => {

  return new Promise((resolve, reject) => {
    request(url, (err, res, html) => {
      var employee = [];
      var obj = {};

      if (err) {
        return reject(err);
      } else if (res.statusCode !== 200) {
        err = new Error("Unexpected status code: " + res.statusCode);
        err.res = res;
        return reject(err);
      }

      const $ = cheerio.load(html);

      $('tr:not(:first-child)').filter((i, el) => {
        var data = $(el).find('td');

        if (data.length) {
          data.each(function (i, el) {
            obj[keys[i]] = $(el).text();
          });

          employee.push(Object.assign({}, obj));
        }
      });

      resolve(employee);

    }).pipe(fs.createWriteStream('./data/newData.json'));
  });
}

extract(url, keys).then((data) => {
  jsonfile.readFile(oldDataPath, (err, old) => {
    console.log(compare(old, data));
  });
}, (err) => {
  console.error(err);
});
