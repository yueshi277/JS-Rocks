var oldData = [
	{
		"firstName": "Tom",
		"lastName": "Zhang",
		"ext": "1001",
		"cell": "416-000-0000",
		"alt": "",
		"title": "Manager",
		"email": "tomz@jsrocks.com"
	},
	{
		"firstName": "Peter",
		"lastName": "Wang",
		"ext": "1003",
		"cell": "647-222-2222",
		"alt": "416-333-3333",
		"title": "QA",
		"email": "peterw@jsrocks.com"
	},
	{
		"firstName": "Simon",
		"lastName": "Lee",
		"ext": "1004",
		"cell": "647-111-1111",
		"alt": "416-1111-1111",
		"title": "QA",
		"email": "simonl@jsrocks.com"
	}
];
var	newData = [
	{
		"firstName": "Tom",
		"lastName": "Zhang",
		"ext": "1006",
		"cell": "416-000-0002",
		"alt": "416-456-4566",
		"title": "Manager",
		"email": "tomz@jsrocks.com"
	},
	{
		"firstName": "Peter",
		"lastName": "Wang",
		"ext": "1003",
		"cell": "647-222-2222",
		"alt": "416-333-3333",
		"title": "QA",
		"email": "peterw@jsrocks.com"
	},
	{
		"firstName": "Kate",
		"lastName": "Wang",
		"ext": "1004",
		"cell": "647-111-1111",
		"alt": "",
		"title": "Developer",
		"email": "katew@jsrocks.com"
	}
];


 function compare(oldData, newData) {
	 var result = {
		 added: [],
		 deleted: [],
		 modified: []
	 };
	 var old = oldData;
	 newData.forEach(function(n) {
		 var index = old.findIndex(function(o){
			 return n.firstName === o.firstName && n.lastName === o.lastName;
		 });

		 if(index < 0 ) {
			 result.added.push(n);
		 } else {
			 if (JSON.stringify(oldData[index]) !== JSON.stringify(n)) {
				 result.modified.push(n);
			 }
			 old.splice(index, 1);
		 }
	 });

	 result.deleted = old;
	 return result;
 }

console.log(compare(oldData, newData));