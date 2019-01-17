require('dotenv').load();
var bot = require ('./bot.js');
var api = require('./api.js');
var db = require('./db.js');

api.start();
bot.start();

process.on('SIGINT', function() {
  db.save();
  process.exit();
});