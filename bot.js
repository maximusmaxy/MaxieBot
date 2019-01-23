var Discord  = require('discord.js');
var bot = new Discord.Client();
var db = require('./db.js');
var rest = require('./rest.js');
var util = require('./util.js');

var rankings = [
  'opposite',
  'not really',
  'kinda',
  '',
  'super',
  'ultimate',
  'big',
  'god',
  'super saiyan god super saiyan'
]

var oppositeRank = new Map([
  ['gay', 'straight'],
  ['weeb', 'a respectable member of society'],
  ['bot', 'human'],
  ['gaybot', 'gayhuman'],
  ['gayi', 'straighti'],
  ['fake Maxie', 'real Maxie'],
  ['attracted to pans', 'attracted to humans'],
  ['heckin lesbo', 'heckin straight'],
  ['negative gay', 'negative straight'],
  ['toxic', 'humble']
]);

module.exports.start = function() {
  bot.login(process.env.TOKEN);
}

bot.once('ready', function() {
  console.log('Connected to discord');
  setPresence("with your sexuality !gayhelp for commands");
});

bot.on('error', function(err) {
  console.error(err);
  module.exports.restart();
});

bot.on('message', (message) => {
  if (message.author.bot) {
    return;
  }

  if (message.guild === null) {
    sendTo(message.author.username + " sent DM: \"" + message.content + "\" in channel " + message.channel.id, process.env.MENTION_CHANNEL);
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
    //gay
    case 'gayhelp': help(message.author); break;
    case 'gaytrade': trade(text, message, command); break;
    case 'gaycancel': cancel(message); break;
    case 'gay': gay(text, message, command); break;
    case 'regay': regay(text, message, command); break;
    case 'upgay': upgay(message); break;
    case 'downgay': downgay(message); break;
    //image
    case 'girl': image(message, command, true, rest.girl); break;
    case 'futa': image(message, command, true, rest.futa); break;
    case 'trap': image(message, command, true, rest.trap); break;
    //other
    case 'roll': roll(text, message.channel); break;
    case 'real': send("<@396378092974637056> is the real Maxie ✓", message.channel); break;
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

function help(user) {
  user.createDM().then((channel) => {
    channel.send("Hiya " + user.username + "! Here's my commands!" +
    "\n" + 
    "\n -- Gay -- " +
    "\n!gay - Find out how gay you are" +
    "\n!gay (name) - Find out how gay someone else is" + 
    "\n!regay - Reroll for gayness once per hour" + 
    "\n!upgay - Promote your level of gayness if 100% gay" +
    "\n!downgay - Demote your level of gayness if 0% gay" +
    "\n!gaytrade (name) - Trade your gayness with someone else" +
    "\n!gaycancel - Cancel your !gaytrade" +
    "\n" +
    "\n -- Images, DM me ;)-- " +
    "\n!girl - Random anime girl (Probably lewd)" +
    "\n!futa - NSFW channels only" +
    "\n!trap - NSFW channels only" +
    "\n" + 
    "\n -- Games -- " +
    "\n!roll - Roll some dice eg. !roll d20, !roll 3d6 + 5"
    )
  });
}

function roll(message, channel) {
  var match = /(\d{0,3})\s*[dD]\s*(\d{1,3})(?:\s*(\+|\-)\s*(\d{1,3}))?/.exec(message);
  if (match != null) {
    var dice = parseInt(match[1]) || 1;
    var side = parseInt(match[2]);
    var mod = parseInt(match[3] + match[4]) || 0;
    if (dice == 1) {
      var roll = util.rand(1, side);
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
        var roll =  util.rand(1, side);
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
  }
  var user = await db.users.findOne({ key: key });
  if (user) {
    var percent = user.value;
  }
  else {
    var percent = util.rand(0, 100);
    await db.users.insertOne({
      key: key,
      value: percent,
      time: 0
    });
  }
  var plural = (name[name.length - 1] == 's') ? " are " : " is "; 
  var rank = (!user || typeof user.rank === 'undefined') ? '' : user.rank;
  var word = (!user || typeof user.word === 'undefined') ? 'gay' : user.word;
  var words = typeof percent === 'number' ? percent + '% ' + rankword(rank, word) : percent;
  send(name + plural + words, message.channel);
}

async function regay(text, message, command) {
  if (text.length > command.length + 1) {
    send("Can't " + command + " other people.", message.channel);
    return;
  }
  var key = message.author.username.toLowerCase();
  var user = await db.users.findOne({key: key});
  if (user == null) {
    send(message.author.username + " isn't gay yet.", message.channel);
    return;
  }
  var percent = user.value;
  var time = Date.now()
  var cooldown = user.time + 1800000;
  var rank = typeof user.rank === 'undefined' ? '' : user.rank;
  var word = typeof user.word === 'undefined' ? 'gay' : user.word;
  var gayword = rankword(rank, word);
  if (time > cooldown) {
    var rig = (await db.rigs.findOneAndDelete({ key: key })).value;
    if (rig) {
      var newPercent = rig.value;
    }
    else {
      var newPercent = util.rand(0, 100);
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
        response += " You are still " + gayword + ".";
      }
    }
    if (newPercent === 100) {
      response += " Type !upgay to raise your " + gayword + "ness!";
    }
    else if (newPercent === 0) {
      response += " Type !downgay to lower your " + gayword + "ness!";
    }
    await db.users.updateOne({ key: key }, {
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

async function upgay(message) {
  var key = message.author.username.toLowerCase();
  var user = await db.users.findOne({key: key});
  if (user == null) {
    send(message.author.username + " isn't gay yet", message.channel);
    return;
  }
  if (typeof user.value !== 'number') {
    send(message.author.username + " cannot get any more " + user.value, message.channel);
    return
  }
  var word = typeof user.word === 'undefined' ? 'gay': user.word;
  if (user.value !== 100) {
    send(message.author.username + " isn't " + word + " enough to upgay. 100% " + word + "ness required.", message.channel);
    return;
  }
  var rank = typeof user.rank === 'undefined' ? '' : user.rank;
  var index = rankings.indexOf(rank);
  if (index === -1 || index + 1 >= rankings.length) {
    send(message.author.username + " cannot get any more " + rankword(rank, word), message.channel);
    return;
  }
  var percent = util.rand(0, 100);
  var newRank = rankings[index + 1];
  await db.users.updateOne({ key: key }, {
    $set: {
      value: percent,
      time: 0,
      rank: newRank
    }
  });
  send("Congratulations! " + message.author.username + " is now " + percent + "% " + rankword(newRank, word) + ".", message.channel);
}

async function downgay(message) {
  var key = message.author.username.toLowerCase();
  var user = await db.users.findOne({key: key});
  if (user == null) {
    send(message.author.username + " isn't gay yet", message.channel);
    return;
  }
  if (typeof user.value !== 'number') {
    send(message.author.username + " cannot get any less " + user.value, message.channel);
    return
  }
  var word = typeof user.word === 'undefined' ? 'gay' : user.word;
  if (user.value !== 0) {
    send(message.author.username + " is too " + word + " to downgay. 0% " + word + "ness required.", message.channel);
    return;
  }
  var rank = typeof user.rank === 'undefined' ? '' : user.rank;
  var index = rankings.indexOf(rank);
  if (index === -1 || index - 1 < 0) {
    send(message.author.username + " cannot get any less " + rankword(rank, word), message.channel);
    return;
  }
  var percent = util.rand(0, 100);
  var newRank = rankings[index - 1];
  await db.users.updateOne({ key: key }, {
    $set: {
      value: percent,
      time: 0,
      rank: newRank
    }
  });
  send("Congratulations! " + message.author.username + " is now " + percent + "% " + rankword(newRank, word) + ".", message.channel);
}

async function trade(text, message, command) {
  if (text.length < command.length + 2) {
    send('Type !gaytrade (name) to trade your gayness with someone else!', message.channel);
    return;
  } 

  var key = message.author.username.toLowerCase();
  var user = await db.users.findOne({ key: key });
  if (user == null) {
    send(message.author.username + " isn't gay yet", message.channel);
    return;
  }

  var otherName = text.substring(command.length + 1).trim();
  if (otherName.length > 40) {
    otherName = otherName.substring(0, 40);
  }
  if (message.mentions.users.size > 0) {
    var otherKey = message.mentions.users.first().username.toLowerCase();
  }
  else {
    var otherKey = otherName.toLowerCase();
  }
  var otherUser = await db.users.findOne({ key: otherKey });
  if (otherUser == null) {
    send(otherName + " isn't gay yet", message.channel);
    return;
  }

  var trade = await db.trades.findOne({ key: otherKey });
  if (trade == null) {
    await db.trades.updateOne({ key: key }, {
      $set: {
        key: key,
        other: otherKey
      }
    }, { upsert: true });
    send("Tell " + otherName + " to type \"!gaytrade " + message.author.username + "\" to accept the trade", message.channel);
  }
  else {
    if (trade.other === key) {
      var valueCopy = user.value;
      user.value = otherUser.value
      otherUser.value = valueCopy;
      await db.trades.deleteOne({ key: otherKey });
      await db.users.updateOne({ key: key }, { $set: user });
      await db.users.updateOne({ key: otherKey }, { $set: otherUser });
      var rank = typeof user.rank === 'undefined' ? '' : user.rank;
      var word = typeof user.word === 'undefined' ? 'gay' : user.word;
      var words = typeof user.value === 'number' ? user.value + "% " + rankword(rank, word) : user.value;
      var otherRank = typeof otherUser.rank === 'undefined' ? '' : otherUser.rank;
      var otherWord = typeof otherUser.word === 'undefined' ? 'gay' : otherUser.word;
      var otherWords = typeof otherUser.value === 'number' ? otherUser.value + "% " + rankword(otherRank, otherWord) : otherUser.value;
      send("Trade accepted. " + message.author.username + " is now " + words + ". " + otherName + " is now " + otherWords + ".", message.channel);
    }
    else {
      send(otherName + " is trading with someone else. Tell them to !gaycancel their trade.", message.channel);
    }
  }
}

async function cancel(message) {
  var key = message.author.username.toLowerCase();
  var trade = await db.trades.findOne({key: key});
  if (trade == null) {
    send(message.author.username + " doesn't have a trade to cancel.", message.channel);
    return;
  }
  await db.trades.deleteOne({ key: key });
  send(message.author.username + " has cancelled their trade with " + trade.other, message.channel);
}

function rankword(rank, word) {
  if (rank === 'opposite') {
    if (oppositeRank.has(word)) {
      return oppositeRank.get(word);
    }
    else {
      return 'not ' + word;
    }
  }
  var space = rank.length === 0 ? '' : ' ';
  return rank + space + word;
}

async function image(message, command, nsfw, func) {
  if (message.guild === null || (nsfw && message.channel.nsfw)) {
    var url = await func();
    send(url || 'Woops, try again.', message.channel);
  }
  else {
    send("This channel isn't NSFW. No " + command + " for you!", message.channel);
  }
}

module.exports.restart = async function() {
  process.exit(1);
  // await bot.destroy();
  // bot.login(process.env.TOKEN);
}