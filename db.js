var fs = require('fs');

const gays = fs.existsSync('./gays.json') ? JSON.parse(fs.readFileSync('./gays.json', 'utf8')) : {};

module.exports.gays = gays

module.exports.save = function() {
  fs.writeFileSync('./gays.json', JSON.stringify(gays, null, 2), 'utf8');
  console.log('Saved')
}