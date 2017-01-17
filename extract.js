var request = require('request');
var cheerio = require('cheerio');
var Promise = require("promise");

const url = 'http://web-aaronding.rhcloud.com/employee.html';

function getData(url) {

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
			
			resolve(employee);

		});
	});
}

getData(url).then(function(data) {
	console.log(data);
}, function(err) {
	console.error("%s; %s", err.message, url);
});