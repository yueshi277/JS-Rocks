var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var url = 'http://web-aaronding.rhcloud.com/employee.html';
var employee = [];

request(url, function(error, response, html){

	if(!error){

		var $ = cheerio.load(html);

		var i = 0;
		var json = { firstName: "", lastName: "", ext: "", cell: "", alt: "", title : "", email: ""} ;

		$('tr td').filter(function(){
			var data = $(this);
			var value = data.text();

			i++;
			switch(i) {
				case 1: json.firstName = value;
					break;
				case 2: json.lastName = value;
					break;
				case 3: json.ext = value;
					break;
				case 4: json.cell = value;
					break;
				case 5: json.alt = value;
					break;
				case 6: json.title = value;
					break;
				case 7: json.email = value;
					break;
			}

			if(i == 7) {
				employee.push(Object.assign({}, json));
				i = 0
			}
		});

		fs.writeFile('output.json', JSON.stringify(employee, null, 4), function(err){
			console.log('File successfully written!');
		})
	}
});



