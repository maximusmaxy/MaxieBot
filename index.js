var bot = require ('./bot.js');
var api = require('./api.js');
var db = require('./db.js');

require('dotenv').load();

api.start();
bot.start();

process.on('SIGINT', function() {
  db.save();
  process.exit();
});