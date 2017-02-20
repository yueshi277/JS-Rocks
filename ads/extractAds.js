const fs = require('fs'),
  path = require('path'),
  request = require('request'),
  mkdirp = require('mkdirp'),
  Promise = require('promise'),
  jsonfile = require('jsonfile'),
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
    category: "窗帘缝纫",
    url: "servicedisplay.php?serviceid=77",
    list: []
  }, {
    site: "ca51",
    category: "工具出租",
    url: "servicedisplay.php?serviceid=132",
    list: []
  }
  , {
    site: "yorkbbs",
    category: "画廊画框",
    url: "/default/hualang",
    list: []
  }, {
    site: "yorkbbs",
    category: "上网电视",
    url: "/default/tv",
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
        'link': 'h3 a@href, h2 a@href',
        'language': '.contactname i, .item_cont_lg'
      })
      .data(list => {
        list.link = base + list.link.replace(/s=.*&/, '');
        list.name = list.name.replace(/\//g, '|');
        let patt = new RegExp('\\d+$');
        list.id = patt.exec(list.link)[0];
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
        'contact': '//*[@id="PostBox"]//tr[5]/td[1]|//*[text()="联系人"]/following-sibling::span[1]',
        'avartar': '.ContentTab div:nth-child(2) img@src',
        'phone': '#PostBox tr:nth-child(5) td:nth-child(2), .item-cont-bigphone font',
        'phone2': '#PostBox tr:nth-child(6) td:nth-child(2)',
        'email': '#PostBox tr:nth-child(6) td:nth-child(1) a@href, .item-views-cont-email a@href',
        'serviceArea': '#PostBox tr:nth-child(8) td:nth-child(1)',
        'coordinates': '#PostBox tr:nth-child(8) td:nth-child(2) a@href',
        'address': '#PostBox tr:nth-child(9), .views-bigphone-address',
        'tags': ['.item-cont-tags a'],
        'desc': '#FontPlus, .views-detail-text',
        'images': ['.attachlist img@src,.views-detail-text img@src']
      })
      .data(list => {
        ad.contact = list.contact? list.contact.replace(/【联系人】/, '') : '' ;
        ad.avartar = list.avartar;
        ad.phone = list.phone.replace(/【联系电话】/, '');
        ad.phone2 = list.phone2? list.phone2.replace(/【其他电话】/, '') : '';
        ad.email = list.email? list.email.replace(/mailto:/, '') : '';
        ad.serviceArea = list.serviceArea? list.serviceArea.replace(/【服务地区】/, '') : '';
        ad.coordinates = list.coordinates;
        ad.address = list.address.replace(/【具体位置】/, '');
        ad.tags = list.tags.toString();
        ad.desc = list.desc;
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
  let patt = new RegExp('(?=[^\/]*$).*');
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
            else { console.log(`create dir ${dir}`); }
          });
        }
      });
    });
    resolve(ads);
  });
};

let download = (uri, filename, callback) => {
  if (uri.indexOf('no-img') <= -1) {
    request.head(uri, (err, res, body) => {
      try{
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
      } catch (err) {
        request().write(err.message);
        request().end();
      }
    });
  }
};

let downloadImgs = ads => {
  return new Promise((resolve, reject) => {
    ads.map(item => {
      item.list.map(list => {
        if (list.images) {
          list.images.map(img => {
            download(img.src, img.local, () => {
              console.log(`${img.src} downloaded`);
            });
          });
        }
      });
    });
    resolve(ads);
  });
};

let run = (categories) => {
  getCategoriesAdList(categories).then(getAdsDetails).then(addImagesLocalPath).then(createDir).then(downloadImgs).then(result => {
    mkdirp(path.join(__dirname, 'results'), (err) => {
      if (err) { console.error(err); }
      else {
        console.log(result);
        const jsonpath = path.join(__dirname, 'results/results.json');
        jsonfile.writeFile(jsonpath, result );
      }
    });
  }, err => {
    console.log(err);
  });
};

run(categories);