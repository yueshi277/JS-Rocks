var cheerio = require('cheerio');
var rp = require('request-promise');

const url = 'http://web-aaronding.rhcloud.com/employee.html';

var options = {
  uri: url,
  transform: function (body) {
  	return cheerio.load(body);
  }
};

rp(options)
  .then(function ($) {
  	var obj = {};
  	var employee = [];
  	const keys = ['firstName', 'lastName', 'ext', 'cell', 'alt', 'title', 'email'];

  	$('tr:not(:first-child)').filter(function (i, el) {
  	  var data = $(el).find('td');

  	  if (data.length) {
  	    data.each(function (i, el) {
  	      obj[keys[i]] = $(el).text();
  	    });

  	    employee.push(Object.assign({}, obj));
  	  }
  	});
  	
  	console.log(employee);
  })
  .catch(function (err) {
  	console.error("%s; %s", err.error.message, err.options.url);
  });