var axios = require('axios');
var util = require('./util');

module.exports.blacklist = process.env.BLACKLIST.split(' ') || [];

module.exports.futa = async () => {
  var retry = 0;
  while (retry < 3) {
    try {
      switch (util.rand(0, 1)) {
        case 0: var url = await danbooru(process.env.FSTRING, 30); break;
        case 1: var url = await imgur(process.env.FALBUM); break;
      }
      if (url) 
      {
        return url;
      }
    }
    catch (err) {
      console.error(err);
    }
    retry++;
  }
  return null;
}

module.exports.trap = async () => {
  var retry = 0;
  while (retry < 3) {
    try {
      var result = await danbooru(process.env.TSTRING, 30);
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

module.exports.girl = async () => {
  var retry = 0;
  while (retry < 3) {
    try {
      var result = await safebooruPopular();
      if (result) {
        return result;
      }
    }
    catch (err) {
      console.error(err);
    }
  }
  return null;
}

async function danbooru(tags, pages) {
  var page = util.rand(1, pages);
  var result = await axios.default.get(`https://danbooru.donmai.us/posts.json?tags=${tags}&page=${page}`, {
    headers: { "Authorization": process.env.DANBOORU_AUTH }
  });
  return filterImage(result);
}

async function safebooruPopular() {
  var now = new Date();
  var year = util.rand(2017, now.getFullYear());
  var month = util.rand(1, year === now.getFullYear() ? now.getMonth() : 12);
  var day = util.rand(1, (month === now.getMonth() && year === now.getFullYear()) ? now.getDay() : util.daysPerMonth(month, year));
  var result = await axios.default.get(`https://safebooru.donmai.us/explore/posts/popular.json?date=${year}-${month}-${day}&scale=day`, {
    headers: { "Authorization": process.env.DANBOORU_AUTH }
  });
  return filterImage(result);
}

function filterImage(result) {
  if (typeof result.data.success === 'boolean' && result.data.success === false) {
    return null;
  }
  var filter = result.data.filter(i => {
    if (typeof i.file_url === 'undefined') {
      return false;
    }
    if (typeof i.tag_string_meta !== 'undefined') {
      if (i.tag_string_meta.includes('animated')) {
        return false;
      }
    }
    if (i.tag_string.split(' ').some((s) => module.exports.blacklist.includes(s))) {
      return false;
    }
    return true;
  })
  if (filter.length === 0) {
    return null;
  }
  var image = filter[util.rand(0, filter.length - 1)];
  if (image) {
    return image.file_url;
  }
  else {
    return null;
  }
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