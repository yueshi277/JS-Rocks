let getModifiedObj = (oldObj, newObj, props) => {
  let m = {}, isModified = false;

  props.forEach((prop) => {
    if (newObj[prop] !== oldObj[prop]) {
      m[prop]= oldObj[prop];
      isModified = true;
    }
  })

  return isModified? m : undefined;
};

let compare = (oldData, newData) => {
  let result = {
    added: [],
    deleted: null,
    modified: []
  };

  let old = oldData.slice();
  const key = 'email';
  const props = ['firstName', 'lastName', 'ext', 'cell', 'alt', 'title', 'email'];

  newData.forEach((n) => {
    let index = old.findIndex((o) => {
      return n[key] === o[key];
    });

    if (index < 0) {
      result.added.push(n);
    } else {
      const m = getModifiedObj(old[index], n, props);
      if (m) result.modified.push({
        'current': n,
        'diff': m
      });

      old.splice(index, 1);
    }
  });

  result.deleted = old;
  return result;
 };

module.exports = compare;