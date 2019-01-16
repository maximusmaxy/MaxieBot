var Discord  = require('discord.js');
var bot = new Discord.Client();
var db = require('./db.js');

module.exports.start = function() {
  bot.login(process.env.TOKEN);
}

bot.once('ready', function() {
  console.log('Connected');
  setPresence("with your sexuality");
});

bot.on('message', (message) => {
  if (message.content[0] !== "!" ||
      message.author.bot) {
    return;
  }

  var text = message.content.trim();
  var index = text.indexOf(" ");
  if (index == -1) {
    index = text.length;
  }

  var command = text.substring(1, index).toLowerCase();

  switch(command) {
    case 'help': help(message.author); break;
    case 'real': send("<@396378092974637056> is the real Maxie ✓", message.channel); break;
    case 'roll': roll(text, message.channel); break;
    case 'gay': gay(text, message.author.username, message.channel, command, "gay"); break;
    case 'lesbo': gay(text, message.author.username, message.channel, command, "lesbian"); break;
    case 'regay': regay(text, message.author.username, message.channel, command, "gay"); break;
    case 'relesbo': regay(text, message.author.username, message.channel, command, "lesbian"); break;
    case 'futa': send("Futanari is 0% gay", message.channel); break;
    case 'traps': send("Traps are 100% gay", message.channel); break;
    // case 'test': send("Test", channelID); break;
  }
});

function send(message, channel) {
  channel.send(message);
  console.log({
    to: channel.id,
    message: message
  });
}

function sendTo(message, id) {
  bot.channels.get(id).send(message);
  console.log({
    to: id,
    message: message
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
    "!lesbo - Same as gay but for the ladies.\n" +
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

async function gay(message, user, channel, command, gayword) {
  var name = message.length < command.length + 2 ? user : message.substring(command.length + 1).trim();
  if (name.length > 40) {
    name = name.substring(0, 40);
  }
  var key = name.toLowerCase();
  var mention = /^<@(\d+)>$/.exec(key);
  if (mention) {
    user = await bot.fetchUser(mention[1]);
    key = user.username.toLowerCase();
  }
  if (typeof db.gays[key] !== 'undefined') {
    var percent = db.gays[key].g;
  }
  else {
    var percent = rand(0, 100);
    db.gays[key] = {
      g: percent,
      t: 0
    };
  }
  var plural = (name[name.length - 1] == 's') ? " are " : " is "; 
  var gaywords = typeof percent === 'number' ? percent + '% ' + gayword : percent;
  send(name + plural + gaywords, channel);
}

function regay(message, user, channel, command, gayword) {
  if (message.length > command.length + 1) {
    send("Can't " + command + " other people.", channel);
    return;
  }
  var key = user.toLowerCase();
  if (typeof db.gays[key] !== 'undefined') {
    var percent = db.gays[key].g;
    var time = Date.now()
    var cooldown = db.gays[key].t + 3600000;
    if (time > cooldown) {
      if (typeof db.rig[key] !== 'undefined') {
        var newPercent = db.rig[key];
        delete db.rig[key];
      }
      else {
        var newPercent = rand(0, 100);
      }
      var wasNumber = typeof percent === 'number';
      var nowNumber = typeof newPercent === 'number';
      var wasWords = wasNumber ? percent + "% " + gayword : percent;
      var nowWords = nowNumber ? newPercent + "% " + gayword : newPercent;
      var response = user + " was " + wasWords + " and is now " + nowWords + ".";
      if (wasNumber && nowNumber) {
        if (newPercent < percent) {
          response += " That's " + (percent - newPercent) + "% less " + gayword + ".";
        } else if (newPercent > percent) {
          response += " That's " + (newPercent - percent) + "% more " + gayword + ".";
        } else {
          response += " You are still gay.";
        }
      }
      db.gays[key] = {
        g: newPercent,
        t: time
      }
      send(response, channel);
    }
    else {
      var minutes = Math.floor((cooldown - time) / 60000 + 1);
      var plural = minutes == 1 ? " minute" : " minutes";
      var gaywords = typeof percent === 'number' ? percent + '% ' + gayword : percent;
      send(user + " is still " + gaywords + ". " + minutes + plural + " until next " + command  + ".", channel);
    }
  }
  else {
    send(user + " isn't " + gayword + " yet.", channel);
  }
}