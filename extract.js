var request = require('request');
var cheerio = require('cheerio');
var Promise = require("promise");

const url = 'http://web-aaronding.rhcloud.com/employee.html';

function getData(url) {

	return new Promise(function (resolve, reject) {
		request(url, function (error, response, html) {
			var employee = [];

			if (!error) {
				const $ = cheerio.load(html);
				const keys = ['firstName', 'lastName', 'ext', 'cell', 'alt', 'title', 'email'];
				var obj = {};

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

			} else {
				return reject(error);
			}
		});
	});
}

getData(url).then(function(data) {
	console.log(data);
}, function(err) {
	console.error("%s; %s", err.message, url);
});