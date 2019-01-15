var Discord  = require('discord.io');
var db = require('./db.js');

var bot;

module.exports.start = function() {
  bot = new Discord.Client({
    token: process.env.TOKEN,
    autorun: true
  });

  bot.on('ready', function (evt) {
    console.log('Connected');
    // bot.editUserInfo({
    //   avatar: fs.readFileSync('./Gir.png', 'base64')
    // }, () => console.log('Editted User Info'));
    setPresence("with your sexuality");
  });
  
  bot.on('message', function (user, userID, channelID, message, evt) {
    if (message[0] !== "!") {
      return;
    }
    message = message.trim();
    var index = message.indexOf(" ");
    if (index == -1) {
      index = message.length;
    }
    var command = message.substring(1, index).toLowerCase();
    switch(command) {
      case 'help': help(user, userID); break;
      case 'real': send("<@396378092974637056> is the real Maxie ✓", channelID); break;
      case 'roll': roll(message, channelID); break;
      case 'gay': gay(message, user, channelID, command, "gay"); break;
      case 'lesbo': gay(message, user, channelID, command, "lesbian"); break;
      case 'regay': regay(message, user, channelID, command, "gay"); break;
      case 'relesbo': regay(message, user, channelID, command, "lesbian"); break;
      case 'futa': send("Futanari is 0% gay", channelID); break;
      case 'traps': send("Traps are 100% gay", channelID); break;
      // case 'test': send("Test", channelID); break;
    }
  });
}

function send(message, channelID) {
  var options = {
    to: channelID,
    message: message
  };
  bot.sendMessage(options);
  console.log(options);
}
module.exports.send = send;

function setPresence(presence) {
  bot.setPresence({
    game: { 
      name: presence
    }
  });
}
module.exports.setPresence = setPresence;

function rand(max) {
  return Math.floor(Math.random() * max) + 1;
}

function help(user, userID) {
  bot.createDMChannel(userID, (err, res) => {
    if (err) {
      console.log(err);
    }
    else {
      send("Hiya " + user + "\n" +
            "!gay - Find out how gay you are\n" +
            "!gay (name) - Find out how gay someone else is\n" + 
            "!lesbo - Same as gay but for the ladies.\n" +
            "!regay - Reroll for gayness once per hour\n" + 
            "!roll - Roll some dice eg. !roll d20, !roll 3d6 + 5\n", res.id);
    }
  });
}

function roll(message, channelID) {
  var match = /(\d{0,3})\s*[dD]\s*(\d{1,3})(?:\s*(\+|\-)\s*(\d{1,3}))?/.exec(message);
  if (match != null) {
    var dice = parseInt(match[1]) || 1;
    var side = parseInt(match[2]);
    var mod = parseInt(match[3] + match[4]) || 0;
    if (dice == 1) {
      var roll = rand(side);
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
        var roll =  rand(side);
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
    send(response, channelID);
  }
  else {
    send("Try !roll d6, !roll 1d20, !roll 6d6+6", channelID);
  }
}

function gay(message, user, channelID, command, gayword) {
  var name = message.length < command.length + 2 ? user : message.substring(command.length + 1).trim();
  if (name.length > 40) {
    name = name.substring(0, 40);
  }
  var key = name.toLowerCase();
  if (typeof db.gays[key] !== 'undefined') {
    var percent = db.gays[key].g;
  }
  else {
    var percent = rand(100);
    db.gays[key] = {
      g: percent,
      t: 0
    };
  }
  var plural = (name[name.length - 1] == 's') ? " are " : " is "; 
  send(name + plural + percent + "% " + gayword, channelID);
}

function regay(message, user, channelID, command, gayword) {
  if (message.length > command.length + 1) {
    send("Can't regay other people.", channelID);
    return;
  }
  var key = user.toLowerCase();
  if (typeof db.gays[key] !== 'undefined') {
    var percent = db.gays[key].g;
    var time = Date.now()
    var cooldown = db.gays[key].t + 3600000;
    if (time > cooldown) {
      var newPercent = rand(100);
      var response = user + " was " + percent + "% " + gayword + " and is now " + newPercent + "% " + gayword + ". ";
      if (newPercent < percent) {
        response += "That's " + (percent - newPercent) + "% less " + gayword + ".";
      } else if (newPercent > percent) {
        response += "That's " + (newPercent - percent) + "% more " + gayword + ".";
      } else {
        response += "You are still gay.";
      }
      db.gays[key] = {
        g: newPercent,
        t: time
      }
      send(response, channelID);
    }
    else {
      send(user + " is still " + percent + "% gay. " + Math.floor((cooldown - time) / 60000 + 1) + " minutes until next regay.", channelID);
    }
  }
  else {
    send(user + " isn't gay yet.", channelID);
  }
}