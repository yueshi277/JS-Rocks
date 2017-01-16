var request = require('request');
var cheerio = require('cheerio');
var express = require('express');

var app     = express();

app.get('/', function(req, res) {

	const url = 'http://web-aaronding.rhcloud.com/employee.html';

	request(url, function(error, response, html){
		var employee = [];

		if (!error) {

			const $ = cheerio.load(html);
			const keys = ['firstName', 'lastName', 'ext', 'cell', 'alt', 'title', 'email'];
			var obj = {};

			$('tr:not(:first-child)').filter(function(i, el) {
				var data = $(el).find('td');

				if(data.length) {
					data.each(function(i, el) {
						obj[keys[i]] = $(el).text();
					});

					employee.push(Object.assign({}, obj));
				}

			});

			res.send(employee);
		}
	});
});

app.listen('8000');