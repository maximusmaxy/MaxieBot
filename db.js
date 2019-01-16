var fs = require('fs');

module.exports.gays = read('./gays.json');
module.exports.rig = read('./rig.json');

module.exports.save = function() {
  try {
    write('./gays.json', module.exports.gays);
    write('./rig.json', module.exports.rig);
    console.log('Saved')
    return true;
  }
  catch (err) {
    console.error(err);
  }
  return false;
}

function read(path) {
  return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf8')) : {};
}

function write(path, obj) {
  fs.writeFileSync(path, JSON.stringify(obj, null, 2), 'utf8');
}