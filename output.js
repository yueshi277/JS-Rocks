var compare = require('./compare');
var extract = require('./extract');

const url = 'http://web-aaronding.rhcloud.com/employee.html';
const oldData = require('./data/oldData.json');

extract(url).then(function(data) {
	const result = compare(oldData, data);
	console.log(result);
}, function(err) {
	console.error("%s; %s", err.message, url);
});
