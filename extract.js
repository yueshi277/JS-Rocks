var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var url = 'http://web-aaronding.rhcloud.com/employee.html';
var employee = [];

request(url, function(error, response, html){

	if (!error) {

		var $ = cheerio.load(html);
    var obj = {};
		const keys = ['firstName', 'lastName', 'ext', 'cell', 'alt', 'title', 'email'];

		$('tr:not(:first-child)').filter(function(i, el) {
			var data = $(el).find('td');

      if(data.length) {
				data.each(function(i, el) {
					obj[keys[i]] = $(el).text();
				});

				employee.push(Object.assign({}, obj));
			}

		});

		fs.writeFile('output.json', JSON.stringify(employee, null, 4), function(err){
			console.log('File successfully written!');
		})
	}
});



