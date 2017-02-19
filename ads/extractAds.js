const fs = require('fs'),
	path = require('path'),
	request = require('request'),
	mkdirp = require('mkdirp'),
	Promise = require('promise'),
	osmosis = require('osmosis');

const BASE_URL = {
	"ca51": "http://www.51.ca/service/",
	"yorkbbs": "http://info.yorkbbs.ca"
};

const categories = [
	{
		site: "ca51",
		category: "画廊画框",
		url: "servicedisplay.php?serviceid=140",
		list: []
	}, {
		site: "ca51",
		category: "工具出租",
		url: "servicedisplay.php?serviceid=132",
		list: []
	}, {
		site: "yorkbbs",
		category: "画廊画框",
		url: "/default/hualang",
		list: []
	}, {
		site: "yorkbbs",
		category: "房屋保险",
		url: "/default/HomeIns",
		list: []
	}
];

let getBaseUrl = item => {
	return item.site === 'ca51'? BASE_URL.ca51 : BASE_URL.yorkbbs;
};

let getCategoryAdsList = item => {
  const base = getBaseUrl(item);
	let result = Object.assign({}, item);

	return new Promise((resolve, reject) => {
		osmosis
			.get(base + item.url)
			.find('ol > li')
			.set({
				'name': 'h3 a, h2 a',
				'link': 'h3 a@href, h2 a@href'
			})
			.data((list) =>{
				list.link = base + list.link.replace(/s=.*&/, '');
				list.name = list.name.replace(/\//g, '|');
				result.list.push(list);
				resolve(result);
			});
	});
};

let getCategoriesAdList = (categories) => {
	let promises = categories.map(getCategoryAdsList);
	return Promise.all(promises);
};

let getAdDetails = (ad) => {
	return new Promise((resolve, reject) => {
		osmosis
			.get(ad.link)
			.find('#MainColumn, .views')
			.set({
				'contact': '#PostBox tr:nth-child(5) td:first-child, .item-views-cont em:first-child a',
				'tel': '#PostBox tr:nth-child(5) td:nth-child(2), .item-cont-bigphone font',
				'address': '#PostBox tr:nth-child(9), .views-bigphone-address',
				'intro': '#FontPlus, .views-detail-text',
				'images': ['.attachlist img@src, .views-detail-text img@src']
			})
			.data(list => {
				ad.contact = list.contact.replace(/【联系人】/, '');
				ad.tel = list.tel.replace(/【联系电话】/, '');
				ad.address = list.address.replace(/【具体位置】/, '');
				if (list.images.length > 0) {
					let pics = [], pic = {};
					list.images.map(img => {
						pic.src = img;
						pics.push(Object.assign({}, pic));
					});
					ad.images = pics
				}
				resolve(ad);
			});
	});
};

let getListAdDetails = (item) =>  {
	let promises = item.list.map(getAdDetails);
	return Promise.all(promises);
};

let appendDetails = (item) => {
	return new Promise((resolve, reject) => {
		getListAdDetails(item).then(info => {
			item.list = info;
			resolve(item);
    });
	});
};

let getAdsDetails = (ads) => {
	let promises = ads.map(appendDetails);
	return Promise.all(promises);
};

let getFilename = (src) => {
	let patt = new RegExp("(?=[^\/]*$).*");
	return patt.exec(src);
};

let addImagesLocalPath = (ads) => {
	return new Promise((resolve, reject) => {
		ads.map(item => {
			item.list.map(list => {
				if (list.images) {
					list.images.map(img => {
						const dir = `results/images/${item.site}/${item.category}/${list.name}/${getFilename(img.src)}`;
						img.local = path.join(__dirname, dir);
					});
				}
			});
		});
		resolve(ads);
	});
};

let createDir = (ads) => {
	return new Promise((resolve, reject) => {
		ads.map(item => {
			item.list.map(list => {
				if (list.images) {
					const dir = `results/images/${item.site}/${item.category}/${list.name}/`;
					mkdirp(path.join(__dirname, dir), (err) => {
						if (err) { console.error(err); }
						else { console.log('pow!'); }
					});
				}
			});
		});
		resolve(ads);
	});
};

let download = (uri, filename, callback) => {
	request.head(uri, (err, res, body) => {
		request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
	});
};

let downloadImgs = ads => {
	return new Promise((resolve, reject) => {
		ads.map(item => {
			item.list.map(list => {
				if (list.images) {
					list.images.map(img => {
						download(img.src, img.local, function () {
							console.log('downloaded');
						})
					})
				}
			})
		});
		resolve(ads);
	});
};

let run = (categories) => {
	getCategoriesAdList(categories).then(getAdsDetails).then(addImagesLocalPath).then(createDir).then(downloadImgs).then(result => {
		mkdirp(path.join(__dirname, 'results'), (err) => {
			if (err) { console.error(err); }
			else { console.log('results dir'); }
		});
		const jsonpath = path.join(__dirname, 'results/results.json');

		fs.writeFile(jsonpath, JSON.stringify(result), err => {
			if (err) return console.log(err);
		});

	}, err => {
		console.log(err);
	});
};

run(categories);