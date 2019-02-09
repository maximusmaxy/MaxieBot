var Discord  = require('discord.js');
var bot = new Discord.Client();
var db = require('./db.js');
var rest = require('./rest.js');
var util = require('./util.js');
var fight = require('./fight.js');

try {
  var secret = require('./secret.js');
}
catch (err) {
  var secret = {
    message: (bot, message) => {}
  }
}

module.exports.client = bot;

var rankings = [
  '',
  'super',
  'ultimate',
  'big',
  'god',
  'galaxy',
  'super saiyan',
  'super saiyan god super saiyan'
];

var inbetweenRank = [
  'not really',
  'kinda'
];

var oppositeRank = new Map([
  ['gay', 'straight'],
  ['weeb', 'a respectable member of society'],
  ['bot', 'human'],
  ['gaybot', 'gayhuman'],
  ['gayi', 'straighti'],
  ['fake Maxie', 'real Maxie'],
  ['attracted to pans', 'attracted to humans'],
  ['heckin lesbo', 'heckin straight'],
  ['heckin lesbian', 'heckin straight'],
  ['negative gay', 'negative straight'],
  ['toxic', 'humble'],
  ['high', 'low'],
  ['spotted chungus', 'striped chungus'],
  ['big fan', 'small fan']
]);

module.exports.start = function() {
  bot.login(process.env.TOKEN);
};

bot.once('ready', function() {
  console.log('Connected to discord');
  setPresence("with your sexuality !gayhelp for commands");
  var nicks = process.env.NICKS.split(' ') || []
  for (let i = 0; i < nicks.length; i++) {
    setNick(nicks[i], 'Alice~');
  }
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

  secret.message(message);

  if (message.content[0] !== "!") {
    return;
  }

  var text = message.content.trim();
  var index = text.indexOf(" ");
  if (index === -1) {
    index = text.length;
  }

  var command = text.substring(1, index).toLowerCase();

  //test
  // if(command[0] !== 't') {
  //   return;
  // }
  // switch(command.substring(1)) {
  switch(command) {
    //gay
    case 'gayhelp': help(message.author); break;
    case 'gaytrade': trade(text, message, command); break;
    case 'gayfight': gayfight(text, message, command); break;
    case 'gaycancel': cancel(message); break;
    case 'gayboy': gayboy(message); break;
    case 'gaygirl': gaygirl(message); break;
    case 'gaytier': gaytier(message); break;
    case 'gaychange': gaychange(text, message); break;
    case 'gay': gay(text, message, command); break;
    case 'regay': regay(text, message, command); break;
    case 'upgay': upgay(message); break;
    case 'downgay': downgay(message); break;
    //image
    case 'girl': image(message, command, true, rest.girl); break;
    case 'futa': image(message, command, true, rest.futa); break;
    case 'neko': image(message, command, true, rest.neko); break;
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
module.exports.send = send;

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

async function directMessage(text, id) {
  var user = await bot.fetchUser(id);
  var channel = await user.createDM();
  channel.sendMessage(text);
}
module.exports.directMessage = directMessage;

async function setNick(id, name) {
  try {
    await bot.guilds.get(id).members.get(bot.user.id).setNickname(name);
    console.log("Nickname set for channel " + id);
  }
  catch (err) {
    console.log("Couldn't set nickname " + id + ": " + err);
  }
}

function help(user) {
  user.createDM().then((channel) => {
    channel.send("Hiya " + user.username + "! Here's my commands!" +
    "\n" + 
    "\n -- Gay -- " +
    "\n!gay - Find out how gay you are" +
    "\n!gay (name) - Find out how gay someone else is" + 
    "\n!regay - Reroll your gayness once every 30 minutes" + 
    "\n!upgay - Promote your level of gayness if 100% gay" +
    "\n!downgay - Demote your level of gayness if 0% gay" +
    "\n!gaytrade (name) - Trade your gayness with someone else" +
    "\n!gayfight (name) - Fight for gayness with someone else" +
    "\n!gaycancel - Cancel your !gaytrade or !gayfight" +
    "\n!gayboy - Genders yourself a boy. Removes custom tags" +
    "\n!gaygirl - Genders yourself a girl. Removes custom tags" + 
    "\n!gaytier - Find out the current tier list" +
    "\n!gaychange (@name) (words) - Change the gay words of someone else (Requires manage server permission)" +
    "\n" +
    "\n -- Images, DM me ;) -- " +
    "\n!girl - Random anime girl (Probably lewd)" +
    "\n!futa - Random futa NSFW channels only" +
    "\n!neko - Random catgirl NSFW channels only" +
    "\n" + 
    "\n -- Games -- " +
    "\n!roll - Roll some dice eg. !roll d20, !roll 3d6 + 5" +
    "\n" +
    "\nContact my creator <@396378092974637056> at maxwelllittlejohn@gmail.com"
    )
  });
}

function roll(message, channel) {
  var match = /(\d{0,3})\s*[dD]\s*(\d{1,3})(?:\s*(\+|\-)\s*(\d{1,3}))?/.exec(message);
  if (match != null) {
    var dice = parseInt(match[1]) || 1;
    var side = parseInt(match[2]);
    var mod = parseInt(match[3] + match[4]) || 0;
    if (dice === 1) {
      var roll = util.rand(1, side);
      var response = "You rolled a " + (roll + mod);
      if (side === 20) {
        if (roll === 20) { 
          response += ", Crit!";
        }
        else if (roll === 1) {
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
  if (text.length < command.length + 2) {
    var member = message.member;
    var name = memberName(member);
  }
  else {
    var name = text.substring(command.length + 1).trim();
    var member = findMember(message, name.toLowerCase());
  }

  if (member === null) {
    send("Couldn't find " + name + ". Are you sure they exist?", message.channel);
    return;
  }

  var user = await findUser(member.id);

  if (user === null) {
    var user = {
      id: member.id,
      value: util.rand(0, 100),
      time: 0
    }
    await db.users.insertOne(user);
  }

  send(name + " is " + rankwords(user), message.channel);
}

async function regay(text, message, command) {
  if (text.length > command.length + 1) {
    send("Can't " + command + " other people.", message.channel);
    return;
  }

  var member = message.member;
  var user = await findUser(member.id);

  if (user === null) {
    send(memberName(member) + " isn't gay yet.", message.channel);
    return;
  }

  var time = Date.now();
  var cooldown = user.time + 1800000; //30 mins

  if (time < cooldown) {
    var minutes = Math.floor((cooldown - time) / 60000 + 1);
    var plural = minutes === 1 ? " minute" : " minutes";
    send(memberName(member) + " is still " + rankwords(user) + ". " + minutes + plural + " until next " + command  + ".", message.channel);
    return;
  }

  var newUser = { ...user };
  var rig = (await db.rigs.findOneAndDelete({ key: user.id })).value;
  newUser.value = rig ? rig.value : util.rand(0, 100);
  newUser.time = time;

  var response = memberName(member) + " was " + rankwords(user) + " and is now " + rankwords(newUser) + ".";
  var word = oppositeWord(newUser);

  if (typeof user.value === 'number' && typeof newUser.value === 'number') {
    if (newUser.value < user.value) {
      response += " That's " + (user.value - newUser.value) + "% less " + word + ".";
    } else if (newUser.value > user.value) {
      response += " That's " + (newUser.value - user.value) + "% more " + word + ".";
    } else {
      response += " You are still " + word + ".";
    }
  }  
  
  response += notification(newUser, member, word);

  await db.users.updateOne({ id: newUser.id }, { $set: newUser });

  send(response, message.channel);
}

async function upgay(message) {
  var member = message.member;
  var user = await findUser(member.id);

  if (user === null) {
    send(memberName(member) + " isn't gay yet", message.channel);
    return;
  }

  if (typeof user.value !== 'number') {
    send(memberName(member) + " cannot get any more " + user.value, message.channel);
    return;
  }

  if (user.value !== 100) {
    var word = oppositeWord(user);
    if (user.type === 'opposite') {
      send(memberName(member) + " is too " + word + " to upgay. 100% " + word + "ness required.", message.channel);
    } else {
      send(memberName(member) + " is not " + word + " enough to upgay. 100% " + word + "ness required.", message.channel);
    }
    return;
  }
 
  var rank = typeof user.rank === 'undefined' ? '' : user.rank;
  var newRank = null;
  var type = typeof user.type === 'undefined' ? '' : user.type;
  var newType = type;
  switch (type) {
    case '': 
      var index = rankings.indexOf(rank);
      if (index !== -1 && index + 1 < rankings.length) {
        newRank = rankings[index + 1];
      }
      break;
    case 'opposite': 
      var index = rankings.indexOf(rank);
      if (index === 0) {
        var newRank = inbetweenRank[0];
        var newType = 'inbetween';
      }
      else if (index !== -1) {
        newRank = rankings[index - 1];
      }
      break;
    case 'inbetween': 
      var index = inbetweenRank.indexOf(rank);
      if (index === inbetweenRank.length - 1) {
        var newRank = rankings[0];
        var newType = '';
      }
      else if (index !== -1) { 
        var newRank = inbetweenRank[index + 1];
      }
      break;
  }

  if (newRank === null) {
    var more = type === 'opposite' ? 'less' : 'more';
    send(memberName(member) + " cannot get any " + more + " " + oppositeWord(user), message.channel);
    return;
  }

  user.value = util.rand(0, 100);
  user.time = 0;
  user.rank = newRank;
  user.type = newType;
  await db.users.updateOne({ id: user.id }, { $set: user });

  var response = "Congratulations! " + memberName(member) + " is now " + rankwords(user) + ".";

  if (newType === '' && newRank === rankings[rankings.length - 1]) {
    response += " You have achieved a level of " + oppositeWord(user) + "ness beyond mere mortals.";
  }

  send(response, message.channel);
}

async function downgay(message) {
  var member = message.member;
  var user = await findUser(member.id);

  if (user === null) {
    send(memberName(member) + " isn't gay yet", message.channel);
    return;
  }

  if (typeof user.value !== 'number') {
    send(memberName(member) + " cannot get any less " + user.value, message.channel);
    return;
  }

  if (user.value !== 0) {
    var word = oppositeWord(user);
    if (user.type === 'opposite') {
      send(memberName(member) + " isn't " + word + " enough to downgay. 0% " + word + "ness required.", message.channel);
    } else {
      send(memberName(member) + " is too " + word + " to downgay. 0% " + word + "ness required.", message.channel);
    }
    return;
  }
  
  var rank = typeof user.rank === 'undefined' ? '' : user.rank;
  var newRank = null;
  var type = typeof user.type === 'undefined' ? '' : user.type;
  var newType = type;
  switch (type) {
    case '': 
      var index = rankings.indexOf(rank);
      if (index === 0) {
        var newRank = inbetweenRank[inbetweenRank.length - 1];
        var newType = 'inbetween';
      }
      else if (index !== -1) {
        newRank = rankings[index - 1];
      }
      break;
    case 'opposite': 
      var index = rankings.indexOf(rank);
      if (index !== -1 && index + 1 < rankings.length) {
        newRank = rankings[index + 1];
      }
      break;
    case 'inbetween': 
      var index = inbetweenRank.indexOf(rank);
      if (index === 0) {
        var newRank = rankings[0];
        var newType = 'opposite';
      }
      else if (index !== -1) { 
        var newRank = inbetweenRank[index - 1];
      }
      break;
  }

  if (newRank === null) {
    var more = type === 'opposite' ? 'more' : 'less';
    send(memberName(member) + " cannot get any " + more + " " + rankwords(user), message.channel);
    return;
  }

  user.value = util.rand(0, 100);
  user.time = 0;
  user.rank = newRank;
  user.type = newType;
  await db.users.updateOne({ id: user.id }, { $set: user });

  var response = "Congratulations! " + memberName(member) + " is now " + rankwords(user) + ".";

  if (newType === 'opposite' && newRank === rankings[rankings.length - 1]) {
    response += " You have achieved a level of " + oppositeWord(user) + "ness beyond mere mortals.";
  }

  send(response, message.channel);
}

async function trade(text, message, command) {
  if (text.length < command.length + 2) {
    send('Type !gaytrade (name) to trade your gayness with someone else!', message.channel);
    return;
  }

  var member = message.member;
  var user = await findUser(member.id);
  if (user == null) {
    send(memberName(member) + " isn't gay yet", message.channel);
    return;
  }

  var otherName = text.substring(command.length + 1).trim();
  var otherMember = findMember(message, otherName.toLowerCase());

  if (otherMember === null) {
    send("Couldn't find " + otherName + ". Are you sure they exist?", message.channel);
    return;
  }


  if (member.id === otherMember.id) {
    send("You can't trade with yourself.", message.channel);
    return;
  }

  var otherUser = await findUser(otherMember.id);
  if (otherUser === null) {
    send(memberName(otherMember) + " isn't gay yet", message.channel);
    return;
  }

  var trade = await db.trades.findOne({ key: otherMember.id });
  if (trade === null) {
    await db.trades.updateOne({ key: member.id }, {
      $set: {
        key: user.id,
        other: otherUser.id,
        type: 'trade'
      }
    }, { upsert: true });
    send("Tell " + memberName(otherMember) + " to type \"!gaytrade " + memberName(member) + "\" to accept the trade", message.channel);
    return;
  }

  if (trade.other !== user.id) {
    var tradeWord = trade.type === 'trade' ? 'trade' : 'fight';
    var tradeWording = trade.type === 'trade' ? 'trading' : 'fighting';
    send(memberName(otherMember) + " is " + tradeWording + " with someone else. Tell them to !gaycancel their " + tradeWord + ".", message.channel);
    return;
  }

  if (trade.type !== 'trade') {
    var tradeWord = trade.type === 'trade' ? 'trade' : 'fight';
    var tradeWording = trade.type === 'trade' ? 'trading' : 'fighting';
    send(memberName(otherMember) + " is trying to " + tradeWord + " with you. Tell them to !gaycancel their " + tradeWord + ".", message.channel);
    return;
  }

  var valueCopy = user.value;
  user.value = otherUser.value
  otherUser.value = valueCopy;

  await db.trades.deleteOne({ key: otherUser.id });
  await db.users.updateOne({ id: user.id }, { $set: user });
  await db.users.updateOne({ id: otherUser.id }, { $set: otherUser });

  send("Trade accepted. " + memberName(member) + " is now " + rankwords(user) + ". " + memberName(otherMember) + " is now " + rankwords(otherUser) + ".", message.channel); 
}

async function gayfight(text, message, command) {
  if (text.length < command.length + 2) {
    send('Type !gayfight (name) to fight for your gayness!', message.channel);
    return;
  } 

  var member = message.member;
  var user = await findUser(member.id);
  if (user == null) {
    send(memberName(member) + " isn't gay yet", message.channel);
    return;
  }

  if (typeof user.value !== 'number') {
    send(memberName(member) + " cannot fight.", message.channel);
    return;
  }
  
  var time = Date.now();
  var cooldown = typeof user.fight === 'number' ? user.fight + 900000 : 0; //15 minutes
  if (time < cooldown) {
    var minutes = Math.floor((cooldown - time) / 60000 + 1);
    var plural = minutes == 1 ? " minute" : " minutes";
    send(memberName(member) + " cannot fight. " + minutes + plural + " until next " + command  + ".", message.channel);
    return;
  }

  var otherName = text.substring(command.length + 1).trim();
  var otherMember = findMember(message, otherName.toLowerCase());

  if (otherMember === null) {
    send("Couldn't find " + otherName + ". Are you sure they exist?", message.channel);
    return;
  }

  if (member.id === otherMember.id) {
    send("You can't fight with yourself.", message.channel);
    return;
  }

  var otherUser = await findUser(otherMember.id);
  if (otherUser === null) {
    send(memberName(otherMember) + " isn't gay yet", message.channel);
    return;
  }

  if (typeof otherUser.value !== 'number') {
    send(otherName + " cannot fight.", message.channel);
    return;
  }

  var otherCooldown = typeof otherUser.fight === 'number' ? otherUser.fight + 900000 : 0; //15 minutes
  if (time < otherCooldown) {
    var minutes = Math.floor((otherCooldown - time) / 60000 + 1);
    var plural = minutes == 1 ? " minute" : " minutes";
    send(memberName(otherMember) + " cannot fight. " + minutes + plural + " until next " + command  + ".", message.channel);
    return;
  }

  var trade = await db.trades.findOne({ key: otherUser.id });

  if (trade == null) {
    await db.trades.updateOne({ key: user.id }, {
      $set: {
        key: user.id,
        other: otherUser.id,
        type: 'fight'
      }
    }, { upsert: true });
    send("Tell " + memberName(otherMember) + " to type \"!gayfight " + memberName(member) + "\" to accept the fight", message.channel);
    return;
  }

  if (trade.other !== user.id) {
    var tradeWord = trade.type === 'trade' ? 'trade' : 'fight';
    var tradeWording = trade.type === 'trade' ? 'trading' : 'fighting';
    send(memberName(otherMember) + " is " + tradeWording + " with someone else. Tell them to !gaycancel their " + tradeWord + ".", message.channel);
    return;
  }

  if (trade.type !== 'fight') {
    var tradeWord = trade.type === 'trade' ? 'trade' : 'fight';
    var tradeWording = trade.type === 'trade' ? 'trading' : 'fighting';
    send(memberName(otherMember) + " is trying to " + tradeWord + " with you. Tell them to !gaycancel their " + tradeWord + ".", message.channel);
    return;
  }
  
  var percent = util.rand(1,5);
  var winNumber = util.rand(0,1);

  var winner = winNumber === 0 ? user : otherUser;
  var winnerMember = winNumber === 0 ? member : otherMember;
  var loser = winNumber === 0 ? otherUser: user;
  var loserMember = winNumber === 0 ? otherMember: member;

  var gain = Math.min(winner.value + percent, 100) - winner.value;
  var loss = Math.max(loser.value - percent, 0) + loser.value;
  var min = Math.min(gain, loss);
  
  winner.value += min;
  loser.value -= min;

  await db.trades.deleteOne({ key: otherUser.id });
  await db.users.updateOne({ id: winner.id }, { $set: winner });
  await db.users.updateOne({ id: loser.id }, { $set: loser });
  
  var pronoun = typeof winner.pronoun === 'undefined' ? 'his' : winner.pronoun;
  var winnerName = memberName(winnerMember);
  var loserName = memberName(loserMember);

  var response = fight.message(winnerName, loserName, pronoun, min);
  response += "\n" + winnerName + " is now " + rankwords(winner) + ". " 
  response += notification(winner, winnerMember, oppositeWord(winner));
  response += " " + loserName + " is now " + rankwords(loser) + ".";
  response += notification(loser, loserMember, oppositeWord(loser));

  send(response, message.channel);
}

async function cancel(message) {
  var user = await findUser(message.member.id);
  var trade = await db.trades.findOne({ key: user.id });
  if (trade === null) {
    send(memberName(message.member) + " doesn't have a trade or fight to cancel.", message.channel);
    return;
  }
  await db.trades.deleteOne({ key: user.id });
  send(memberName(message.member) + " has cancelled their " + trade.type, message.channel);
}

async function gayboy(message) {
  var member = message.member;
  var user = await findUser(member.id)
  if (user == null) {
    send(memberName(member) + " isn't gay yet.", message.channel);
    return;
  }

  user.word = 'gay';
  user.pronoun = 'his';

  await db.users.updateOne({ id: user.id }, { $set: user });
  send(memberName(member) + " is now a " + oppositeWord(user) + " boy.", message.channel);
}

async function gaygirl(message) {
  var member = message.member;
  var user = await findUser(member.id)
  if (user == null) {
    send(memberName(member) + " isn't gay yet.", message.channel);
    return;
  }

  user.word = 'heckin lesbian';
  user.pronoun = 'her';

  await db.users.updateOne({ id: user.id }, { $set: user });
  send(memberName(member) + " is now a " + oppositeWord(user) + " girl.", message.channel);
}

function gaytier(message) {
  var response = ["The current tiers are: "];
  for (let i = 1; i < rankings.length; i++) {
    response.push("\n" + rankings[i]);
  }
  send(response.join(''), message.channel)
}

async function gaychange(text, message) {
  if (!message.member.hasPermission(32)) {
    send("You do not have permission to use this command", message.channel);
    return;
  }

  if (message.mentions.users.size !== 1) {
    send("Please @mention the person you want to gaychange eg. !gaychange @Maxiebot lesbot", message.channel);
    return;
  }

  text = text.replace(/\s+/g, ' ');
  var index = text.indexOf(" ", text.indexOf(" ") + 1);

  if (index === -1) {
    send('Type !gaychange (@mention) (words) to change the gay words of someone else eg. !gaychange @Maxiebot lesbot', message.channel);
    return;
  }

  var member = message.mentions.members.first();
  var user = await findUser(member.id);
  if (user == null) {
    send(memberName(member) + " isn't gay yet", message.channel);
    return;
  }

  var words = text.substring(index).trim();
  if (words.length > 20) {
    words = words.substring(0, 20);
  }

  user.word = words;
  await db.users.updateOne({ id: user.id }, { $set: user });
  
  send(memberName(member) + " is now " + oppositeWord(user), message.channel);
}

function findMember(message, name) {
  if (message.mentions.members.size === 1) {
    return message.mentions.members.first();
  }
  var member = message.guild.members.find((u) => {
    return (u.user.username.toLowerCase() === name);
  });
  if (member !== null) {
    return member
  }
  return message.guild.members.find((u) => {
    return (u.nickname && u.nickname.toLowerCase() === name);
  });
}

async function findUser(id) {
  return await db.users.findOne({
    $or: [
      { id: id },
      { alias: id }
    ]
  });
}

function memberName(member) {
  return member.nickname || member.user.username;
}

function oppositeWord(user) {
  var word = typeof user.word === 'undefined' ? 'gay' : user.word;
  if (user.type === 'opposite') {
    if (oppositeRank.has(word)) {
      return oppositeRank.get(word);
    }
    else {
      return 'not ' + word;
    }
  }
  return word;
}

function rankwords(user) {
  var percent = typeof user.value === 'undefined' ? '' : user.value;
  if (typeof percent !== 'number') {
    return percent;
  }
  var rank = typeof user.rank === 'undefined' ? '' : user.rank;
  var word = typeof user.word === 'undefined' ? 'gay' : user.word;
  var type = typeof user.type === 'undefined' ? '' : user.type;
  if (type === 'opposite') {
    if (oppositeRank.has(word)) {
      word = oppositeRank.get(word);
    }
    else {
      word = 'not ' + word;
    }
  }
  var space = rank.length === 0 ? '' : ' ';
  return percent + '% ' + rank + space + word;
}

function notification(user, member, word) {
  if (user.value === 100) {
    if (user.type === 'opposite') {
      return " Type !upgay to lower your " + word + "ness!";
    }
    else {
      return " Type !upgay to raise your " + word + "ness!";
    }
  } else if (user.value === 0) {
    if (user.type === 'opposite') {
      return " Type !downgay to raise your " + word + "ness!";
    }
    else {
      return " Type !downgay to lower your " + word + "ness!";
    }
  } else if (user.value === 69) {
    user.time = 0;
    user.fight = 0;
    return " 69 damn that's fine. " + memberName(member) + "'s cooldowns are refreshed.";
  }
  return "";
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
}