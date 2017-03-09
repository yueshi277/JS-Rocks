const fs = require('fs'),
  Rx = require('rxjs/Rx'),
  osmosis = require('osmosis'),
  path = require('path'),
  request = require('request'),
  mkdirp = require('mkdirp'),
  jsonfile = require('jsonfile');

const categories = [
  {
    site: "ca51",
    category: "画廊画框",
    url: "servicedisplay.php?serviceid=140"
  }, {
    site: "ca51",
    category: "窗帘缝纫",
    url: "servicedisplay.php?serviceid=77"
  }, {
    site: "ca51",
    category: "工具出租",
    url: "servicedisplay.php?serviceid=132"
  }, {
    site: "yorkbbs",
    category: "画廊画框",
    url: "/default/hualang"
  }, {
    site: "yorkbbs",
    category: "上网电视",
    url: "/default/tv"
  }
];

const BASE_URL = {
  "ca51": "http://www.51.ca/service/",
  "yorkbbs": "http://info.yorkbbs.ca"
};

let getBaseUrl = item => {
  return item.site === 'ca51'? BASE_URL.ca51 : BASE_URL.yorkbbs;
};

let getCategoryAdsList = item => {
  const base = getBaseUrl(item);
  const obj = Object.assign({}, item);

  return new Rx.Observable(observer => {
    osmosis
      .get(base + item.url)
      .find('ol > li')
      .set({
        'name': 'h3 a, h2 a',
        'url': 'h3 a@href, h2 a@href',
        'language': '.contactname i, .item_cont_lg'
      })
      .data(list => {
        list.url = base + list.url.replace(/s=.*&/, '');
        list.name = list.name.replace(/\//g, '|');
        delete obj.url;
        observer.next(Object.assign({}, obj, list));
      });
  });
};

let handleEmail = (email) => {
  let s, j, r, c, id;
  if (email.includes('email-protection')) {
    try {
      let patt = new RegExp('\\w+$');
      id = patt.exec(email)[0];
      console.log(id);
      s = '';
      r = parseInt(id.substr(0, 2), 16);
      for (j = 2; id.length - j; j += 2) {
        c = parseInt(id.substr(j, 2), 16) ^ r;
        s += String.fromCharCode(c);
      }
      return s;
    } catch(e) {}
  } else {
    return email.replace(/mailto:/, '');
  }
};

let getAdDetails = (ad) => {
  return new Rx.Observable(observer => {
    osmosis
      .get(ad.url)
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
        list.contact = list.contact ? list.contact.replace(/【联系人】/, '') : '' ;
        list.phone = list.phone.replace(/【联系电话】/, '');
        list.phone2 = list.phone2 ? list.phone2.replace(/【其他电话】/, '') : '';
        list.email = list.email ? handleEmail(list.email) : '';
        list.serviceArea = list.serviceArea ? list.serviceArea.replace(/【服务地区】/, '') : '';
        list.address = list.address.replace(/【具体位置】/, '');
        list.tags = list.tags.toString();
        observer.next(Object.assign({}, ad, list));
      });
  });
};

let getFilename = (src) => {
  const patt = new RegExp('(?=[^\/]*$).*');
  return patt.exec(src);
};

let download = (uri, filename, callback) => {
  request.head(uri, (err, res, body) => {
    try {
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    } catch (err) {
      request().write(err.message);
      request().end();
    }
  });
};

let downloadImages = item => {
  return new Rx.Observable(observer => {
    if (item.images.length > 0) {
      const dir = `results/images/${item.site}/${item.category}/${item.name}/`;
      mkdirp(path.join(__dirname, dir), (err) => {
        if (err) { console.error(err); }
        else {
          item.images.forEach(img => {
            const fileName = getFilename(img);
            const patt = new RegExp('.*\\.[a-zA-Z]+');
            if (patt.test(fileName) && !fileName.includes('no-img')) {
              const local = path.join(__dirname, `${dir}${fileName}`);
              download(img, local, () => {
                console.log(`${img} downloaded`);
              });
            }
          });
        }
      });
    }
    observer.next(item);
  });
};

let run = () => {
  let result = [];

  Rx.Observable.from(categories)
    .mergeMap(val => getCategoryAdsList(val))
    .flatMap(val => getAdDetails(val))
    .flatMap(ad => downloadImages(ad))
    .subscribe(val => {
      result.push(val);
      const jsonpath = path.join(__dirname, 'results/results.json');
      jsonfile.writeFile(jsonpath, result);
  });
};

run();