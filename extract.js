var cheerio = require('cheerio');
var request = require('request');
var Promise = require('promise');
var fs = require('fs');

const url = 'http://web-aaronding.rhcloud.com/employee.html';

function extract(url) {

  return new Promise(function (resolve, reject) {
    request(url, function (err, res, html) {
      var employee = [];
      var obj = {};
      const keys = ['firstName', 'lastName', 'ext', 'cell', 'alt', 'title', 'email'];

      if (err) {
        return reject(err);
      } else if (res.statusCode !== 200) {
        err = new Error("Unexpected status code: " + res.statusCode);
        err.res = res;
        return reject(err);
      }

      const $ = cheerio.load(html);

      $('tr:not(:first-child)').filter(function (i, el) {
        var data = $(el).find('td');

        if (data.length) {
          data.each(function (i, el) {
            obj[keys[i]] = $(el).text();
          });

          employee.push(Object.assign({}, obj));
        }
      });

      fs.writeFile('./data/newData.json', JSON.stringify(employee, null, 4), function(err){
        console.log('File successfully written!');
      });
      resolve(employee);

    });
  });
}

module.exports = extract;
