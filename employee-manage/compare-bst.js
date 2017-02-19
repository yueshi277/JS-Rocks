function Node(data, left, right) {
	this.data = data;
	this.left = left;
	this.right = right;
}

function BST() {
	this.root = null;
	this.insert = insert;
	this.find = find;
	this.remove = remove;
}

function insert(data) {
	var n = new Node(data, null, null);
	if (!this.root) {
		this.root = n;
	}
	else {
		var current = this.root;
		var parent;
		while (true) {
			parent = current;
			if (data.email < current.data.email) {
				current = current.left;
				if (!current) {
					parent.left = n;
					break;
				}
			}
			else {
				current = current.right;
				if (!current) {
					parent.right = n;
					break;
				}
			}
		}
	}
}

function find(data) {
	var current = this.root;
	while (current.data.email !== data) {
		if (data < current.data.email) {
			current = current.left;
		}
		else {
			current = current.right;
		}
		if (!current) {
			return null;
		}
	}
	return current;
}

function getSmallest(node) {
	if (!node.left) {
		return node;
	}
	else {
		return getSmallest(node.left);
	}
}

function remove(data) {
	root = removeNode(this.root, data);
}

function removeNode(node, data) {
	if (!node) {
		return null;
	}
	if (data === node.data.email) {

		if (!node.left  && !node.right) {
			return null;
		}

		if (!node.left) {
			return node.right;
		}

		if (!node.right) {
			return node.left;
		}

		var tempNode = getSmallest(node.right);
		node.data = tempNode.data;
		node.right = removeNode(node.right, tempNode.data.email);
		return node;
	}
	else if (data < node.data.email) {
		node.left = removeNode(node.left, data);
		return node;
	}
	else {
		node.right = removeNode(node.right, data);
		return node;
	}
}

var getModifiedObj = function(oldObj, newObj, props) {
	var m = {}, isModified = false;

	props.forEach(function(prop) {
		if (newObj[prop] !== oldObj[prop]) {
			m[prop]= oldObj[prop];
			isModified = true;
		}
	});

	return isModified? m : undefined;
};

function compare(oldData, newData) {
	var result = {
		added: [],
		deleted: [],
		modified: []
	};

	const props = Object.keys(newData[0]);
	var nodes = new BST();

	oldData.forEach(function(data) {
		nodes.insert(data);
	});

	newData.forEach(function(n) {
		var current = nodes.find(n.email);
		if (!current) {
			result.added.push(n);
		}
		else {
			var m = getModifiedObj(current.data, n, props);
			if (!!m) result.modified.push({
				'current': n,
				'diff': m
			});
			nodes.remove(current.data.email)
		}
	});

	function inOrder(node) {
		if (!!node) {
			inOrder(node.left);
			result.deleted.push(node.data);
			inOrder(node.right);
		}
	}

  inOrder(nodes.root);
	return result;
}

module.exports = compare;