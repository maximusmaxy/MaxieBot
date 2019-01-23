require('dotenv').load();
var bot = require ('./bot.js');
var api = require('./api.js');

api.start();
bot.start();

process.on('uncaughtException', (err) => {
  console.error(err);
});