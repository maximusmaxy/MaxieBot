var Discord  = require('discord.js');
var bot = new Discord.Client();
var db = require('./db.js');

module.exports.start = function() {
  bot.login(process.env.TOKEN);
}

bot.once('ready', function() {
  console.log('Connected to discord');
  setPresence("with your sexuality !gayhelp for commands");
});

bot.on('message', (message) => {
  if (message.author.bot) {
    return;
  }

  if (message.guild === null) {
    sendTo(message.author.username + " sent DM: \"" + message.content + "\"", process.env.MENTION_CHANNEL);
  }
  else if (message.isMentioned(bot.user)) {
    sendTo(message.author.username + " said: \"" + message.content + "\" in " +
           message.guild.name + "#" + message.channel.name, process.env.MENTION_CHANNEL);
  }

  if (message.content[0] !== "!") {
    return;
  }

  var text = message.content.trim();
  var index = text.indexOf(" ");
  if (index == -1) {
    index = text.length;
  }

  var command = text.substring(1, index).toLowerCase();

  switch(command) {
    case 'gayhelp': help(message.author); break;
    case 'real': send("<@396378092974637056> is the real Maxie ✓", message.channel); break;
    case 'roll': roll(text, message.channel); break;
    case 'gay': gay(text, message, command); break;
    case 'regay': regay(text, message, command); break;
    case 'futa': send("Futanari is 0% gay", message.channel); break;
    case 'traps': send("Traps are 100% gay", message.channel); break;
  }
});

function send(text, channel) {
  channel.send(text);
  console.log({
    to: channel.id,
    message: text
  });
}

function sendTo(text, id) {
  bot.channels.get(id).send(text);
  console.log({
    to: id,
    message: text
  });
}
module.exports.sendTo = sendTo;

function setPresence(presence) {
  bot.user.setPresence({
    status: "online",
    game: {
      name: presence
    }
  });
}
module.exports.setPresence = setPresence;

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function help(user) {
  user.createDM().then((channel) => {
    channel.send("Hiya " + user.username + "\n" +
    "!gay - Find out how gay you are\n" +
    "!gay (name) - Find out how gay someone else is\n" + 
    "!regay - Reroll for gayness once per hour\n" + 
    "!roll - Roll some dice eg. !roll d20, !roll 3d6 + 5")
  });
}

function roll(message, channel) {
  var match = /(\d{0,3})\s*[dD]\s*(\d{1,3})(?:\s*(\+|\-)\s*(\d{1,3}))?/.exec(message);
  if (match != null) {
    var dice = parseInt(match[1]) || 1;
    var side = parseInt(match[2]);
    var mod = parseInt(match[3] + match[4]) || 0;
    if (dice == 1) {
      var roll = rand(1, side);
      var response = "You rolled a " + (roll + mod);
      if (side == 20) {
        if (roll == 20) { 
          response += ", Crit!";
        }
        else if (roll == 1) {
          response += ", Fail!";
        }
      }
    }
    else {
      var response = "You rolled ";
      var total = 0;
      for (var i = 0; i < dice; i++) {
        var roll =  rand(1, side);
        response += roll;
        if (i != dice - 1) {
          response += " + "
        }
        total += roll;
      }
      if (mod != 0) {
        response += (mod < 0 ? " - " : " + ") + Math.abs(mod);
        total += mod;
      }
      response += " = " + total;
    }
    send(response, channel);
  }
  else {
    send("Try !roll d6, !roll 1d20, !roll 6d6+6", channel);
  }
}

async function gay(text, message, command) {
  var name = text.length < command.length + 2 ? message.author.username : text.substring(command.length + 1).trim();
  if (name.length > 40) {
    name = name.substring(0, 40);
  }
  var key = name.toLowerCase();
  if (message.mentions.users.size > 0) {
    key = message.mentions.users.first().username.toLowerCase();
    console.log(key);
  }
  var user = await db.users.findOne({ key: key });
  if (user) {
    var percent = user.value;
  }
  else {
    var percent = rand(0, 100);
    await db.users.insertOne({
      key: key,
      value: percent,
      time: 0
    });
  }
  var plural = (name[name.length - 1] == 's') ? " are " : " is "; 
  var gayword = (!user || typeof user.word === 'undefined') ? 'gay' : user.word;
  var gaywords = typeof percent === 'number' ? percent + '% ' + gayword : percent;
  send(name + plural + gaywords, message.channel);
}

async function regay(text, message, command) {
  if (text.length > command.length + 1) {
    send("Can't " + command + " other people.", message.channel);
    return;
  }
  var key = message.author.username.toLowerCase();
  var user = await db.users.findOne({key: key});
  if (user) {
    var percent = user.value;
    var time = Date.now()
    var cooldown = user.time + 3600000;
    var gayword = user.word === 'undefined' ? 'gay' : user.word;
    if (time > cooldown) {
      var rig = (await db.rigs.findOneAndDelete({ key: key })).value;
      if (rig) {
        var newPercent = rig.value;
      }
      else {
        var newPercent = rand(0, 100);
      }
      var wasNumber = typeof percent === 'number';
      var nowNumber = typeof newPercent === 'number';
      var wasWords = wasNumber ? percent + "% " + gayword : percent;
      var nowWords = nowNumber ? newPercent + "% " + gayword : newPercent;
      var response = message.author.username + " was " + wasWords + " and is now " + nowWords + ".";
      if (wasNumber && nowNumber) {
        if (newPercent < percent) {
          response += " That's " + (percent - newPercent) + "% less " + gayword + ".";
        } else if (newPercent > percent) {
          response += " That's " + (newPercent - percent) + "% more " + gayword + ".";
        } else {
          response += " You are still gay.";
        }
      }
      await db.users.update({ key: key }, {
        $set: {
          value: newPercent,
          time: time
        }
      });
      send(response, message.channel);
    }
    else {
      var minutes = Math.floor((cooldown - time) / 60000 + 1);
      var plural = minutes == 1 ? " minute" : " minutes";
      var gaywords = typeof percent === 'number' ? percent + '% ' + gayword : percent;
      send(message.author.username + " is still " + gaywords + ". " + minutes + plural + " until next " + command  + ".", message.channel);
    }
  }
  else {
    send(message.author.username + " isn't gay yet.", message.channel);
  }
}