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
var newData = [
  {
    "firstName": "Tom",
    "lastName": "Zhang",
    "ext": "1001",
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

var createModifiedObj = function (oldObj, newObj, props) {
  var m = {}, isModified = false;

  props.forEach(function(prop) {
    if (newObj[prop] !== oldObj[prop]) {
      m[prop]= [newObj[prop], oldObj[prop]];
      isModified = true;
    } else {
      m[prop]= newObj[prop];
    }
  });

  return isModified? m : false;
};

function compare(oldData, newData) {
  var result = {
    added: [],
    deleted: [],
    modified: []
  };
  var old = oldData.slice();
  var props = Object.keys(newData[0]);

  newData.forEach(function(n) {
    var index = old.findIndex(function(o) {
      return n.email === o.email;
    });
    if(index < 0 ) {
      result.added.push(n);
    } else {
      var m = createModifiedObj(old[index], n, props);
      if(!!m) result.modified.push(m);
      old.splice(index, 1);
    }
  });
  result.deleted = old;
  return result;
 }

console.log(compare(oldData, newData));


