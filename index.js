var Discord = require('discord.io');
var express = require('express');
var bodyParser = require('body-parser')
var fs = require('fs');

require('dotenv').load();

var gays = JSON.parse(fs.readFileSync('./gays.json', 'utf8'));

const app = express();
app.use(bodyParser.json());

app.get('/gay', (req, res) => res.json(gays));

app.post('/gay', (req, res) => {
  gays = Object.assign(gays, req.body);
  console.log(req.body)
  res.json(gays);
});

app.get('/save', (req, res) => {
  save();
  res.sendStatus(200);
});

app.post('/message', (req, res) => {
  if (typeof req.body.to === 'undefined' || typeof req.body.message === 'undefined') {
    res.sendStatus(400);
  }
  else {
    send(req.body.message, req.body.to);
    res.json(req.body);
  }
});

app.listen(2000, () => console.log('Listening on port 2000'));

var bot = new Discord.Client({
   token: process.env.TOKEN,
   autorun: true
});

bot.on('ready', function (evt) {
  console.log('Connected');
  // bot.editUserInfo({
  //   avatar: fs.readFileSync('./Gir.png', 'base64')
  // }, () => console.log('Editted User Info'));
  bot.setPresence({
    game: { 
      name: "with your sexuality" 
    }
  });
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
  switch(message.substring(1, index).toLowerCase()) {
    case 'roll': roll(message, channelID); break;
    case 'gay': gay(message, user, channelID); break;
    case 'futa': send("Futanari is 0% gay", channelID); break;
    case 'traps': send("Traps are 100% gay", channelID); break;
  }
});

function send(message, channelID) {
  var options = {
    to: channelID,
    message: message
  };
  bot.sendMessage(options);
  console.log(options);
}

function rand(max) {
  return Math.floor(Math.random() * max) + 1;
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
    send(":smile:", channelID);
  }
}

function gay(message, user, channelID) {
  var name = message.length < 6 ? user : message.substring(4).trim();
  var key = name.toLowerCase();
  if (typeof gays[key] !== 'undefined') {
    var percent = gays[key];
  }
  else {
    var percent = rand(100);
    gays[key] = percent;
  }
  var plural = (name[name.length - 1] == 's') ? " are " : " is "; 
  send(name + plural + percent + "% gay", channelID);
}

function save() {
  fs.writeFileSync('./gays.json', JSON.stringify(gays, null, 2), 'utf8');
  console.log('Saved')
}

process.on('SIGINT', function() {
  save();
  process.exit();
});