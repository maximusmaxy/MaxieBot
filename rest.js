var axios = require('axios');
var util = require('./util');

var whitelist = new Set(process.env.WHITELIST.split(' '));
var blacklist = new Set(process.env.BLACKLIST.split(' '));

var popularYearWeighting = util.weighting(new Map([
  [2015, 3],
  [2016, 4],
  [2017, 5],
  [2018, 6],
  [2019, 1]
]));

var redditYearWeighting = util.weighting(new Map([
  [2017, 5],
  [2018, 5],
  [2019, 1]
]));

var futaWeighting = util.weighting(new Map([
  [0, 2],
  [1, 8]
]));

var thirtyWeighting = util.descendingWeighting(30);
var fiftyWeighting = util.descendingWeighting(50);

module.exports.futa = async () => {
  return await retry(async () => {
    switch (util.randWeighting(futaWeighting)) {
      case 0: var url = await danbooru(process.env.FSTRING, thirtyWeighting); break;
      case 1: var url = await imgur(process.env.FALBUM); break;
    }
    if (url) 
    {
      return url;
    }
  }, 3);
}

module.exports.girl = async () => {
  return await retry(danbooruPopular, 3, 'safebooru');
}

module.exports.lewd = async() => {
  return await retry(danbooruPopular, 3, 'danbooru', 's', whitelist);
}

module.exports.neko = async () => {
  return await retry(danbooru, 3, process.env.NSTRING, fiftyWeighting)
}

module.exports.kpopfap = async() => {
  return await retry(reddit, 3, 'kpopfap', 'gfycat');
}

async function retry(func, times, ...args) {
  var retry = 0;
  while (retry < times) {
    try {
      var result = await func(...args);
      if (result) {
        return result;
      }
    }
    catch (err) {
      console.error(err);
    }
    retry++;
  }
  return null;
}

async function danbooru(tags, weighting) {
  var page = util.randWeighting(weighting);
  var result = await axios.default.get(`https://danbooru.donmai.us/posts.json?tags=${tags}&page=${page}`, {
    headers: { "Authorization": process.env.DANBOORU_AUTH }
  });
  return filterImage(result);
}

async function danbooruPopular(domain, rating = null, whitelist = null) {
  var now = new Date();
  var year = util.randWeighting(popularYearWeighting);
  var month = util.rand(1, year === now.getFullYear() ? now.getMonth() + 1 : 12);
  var day = util.rand(1, (month === now.getMonth() + 1 && year === now.getFullYear()) ? now.getDate() : util.daysPerMonth(month, year));
  var result = await axios.default.get(`https://${domain}.donmai.us/explore/posts/popular.json?date=${year}-${month}-${day}&scale=day`, {
    headers: { "Authorization": process.env.DANBOORU_AUTH }
  });
  return filterImage(result, rating, whitelist) + ` ${year}-${month}-${day}`;
}

function filterImage(result, rating = null, whitelist = null) {
  if (typeof result.data.success === 'boolean' && result.data.success === false) {
    return null;
  }
  var filter = result.data.filter(i => {
    if (typeof i.file_url === 'undefined') {
      return false;
    }
    if (rating && i.rating === rating) {
      return false;
    }
    if (typeof i.tag_string_meta !== 'undefined') {
      if (i.tag_string_meta.includes('animated')) {
        return false;
      }
    }
    var tags = i.tag_string.split(' ');
    if (tags.some((s) => blacklist.has(s))) {
      return false;
    }
    if (whitelist) {
      if (tags.some((s) => whitelist.has(s))) {
        return true;
      }
      return false;
    }
    return true;
  });
  if (filter.length === 0) {
    return null;
  }
  var image = util.randArr(filter);
  if (image) {
    return image.file_url;
  }
  return null;
}

async function imgur(album) {
  var result = await axios.default.get(`https://api.imgur.com/3/album/${album}/images`, {
    "headers": {
      "Authorization": "Client-ID " + process.env.IMGUR_CLIENT_ID
    }
  });
  var images = result.data.data;
  var image = images[util.rand(0, images.length - 1)];
  return image.link;
}

async function reddit(sub, domain = null) {
  var now = new Date();
  var year = util.randWeighting(redditYearWeighting);
  var month = util.rand(1, year === now.getFullYear() ? now.getMonth() + 1 : 12);
  var after = new Date(year, month, 1).getTime() / 1000;
  var before = new Date(year, month, util.daysPerMonth(month)).getTime() / 1000;
  var result = await axios.default.get(`https://api.pushshift.io/reddit/search/submission/?q=&after=${after}&before=${before}&subreddit=${sub}&author=&aggs=&metadata=true&frequency=hour&advanced=false&sort=desc&domain=&sort_type=score&size=10`);
  var filter = result.data.data.filter((r) => {
    if (typeof r.url === 'undefined') {
      return false;
    }
    if (domain && !r.url.includes(domain)) {
      return false;
    }
    return true;
  });
  if (filter.length > 0) {
    return util.randArr(filter).url;
  }
  return null;
}