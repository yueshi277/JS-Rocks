
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

var compare = function(oldData, newData) {
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
    }
    else {
      var m = createModifiedObj(old[index], n, props);
      if(!!m) result.modified.push(m);
      old.splice(index, 1);
    }
  });

  result.deleted = old;
  return result;
 };

module.exports = compare;






