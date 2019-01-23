require('dotenv').load();

var Discord  = require('discord.js');
var bot = new Discord.Client();
var fs = require('fs');

bot.login(process.env.TOKEN);

bot.once('ready', function() {
  fetch();
});

async function fetch() {
  var user = await bot.fetchUser('227020633626640384');
  var dm =  await user.createDM();
  fs.writeFileSync('./messages.json', dm.messages);
}