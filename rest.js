var axios = require('axios');
var util = require('./util');

module.exports.blacklist = process.env.BLACKLIST.split(' ') || [];

module.exports.futa = async () => {
  try {
    switch (util.rand(0, 1)) {
      case 0: var url = await danbooru(process.env.FSTRING, 70); break;
      case 1: var url = await imgur(process.env.FALBUM); break;
    }
    return url;
  }
  catch (err) {
    console.error(err);
    return null;
  }
}

module.exports.trap = async () => {
  try {
    return await danbooru(process.env.TSTRING, 50);
  }
  catch (err) {
    console.error(err);
    return null;
  }
}

async function danbooru(tags, pages) {
  var page = util.rand(1, pages);
  var result = await axios.default.get(`https://danbooru.donmai.us/posts.json?tags=${tags}&page=${page}`, {
    headers: { "Authorization": process.env.DANBOORU_AUTH }
  });
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