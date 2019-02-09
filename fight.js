var util = require('./util');

var moves = [
  'slides',
  'thrusts',
  'pounds',
  'sneaks',
  'manoeuvres',
  'sinks',
  'rides',
  'buries',
  'weaves'
];

var cocks = [
  'dick',
  'cock',
  'dingus',
  'lance',
  'spear',
  'meat',
  'drill',
  'hot dog',
  'sausage',
  'member',
  'shaft'
];

var butts = [
  'butt',
  'ass',
  'bum',
  'back door',
  'booty'
];

var adjectives = [
  'erect',
  'throbbing',
  'quivering',
  'big',
  'fat',
  'hungry',
  'angry'
];

var fights = [
  "{w} {m} {p} {a} {c} into {l}'s {b}"
];

module.exports.message = function(winner, loser, pronoun, percent) {
  var message = util.randArr(fights);
  message = message.replace('{m}', util.randArr(moves));
  message = message.replace('{c}', util.randArr(cocks));
  message = message.replace('{b}', util.randArr(butts));
  message = message.replace('{a}', util.randArr(adjectives))
  message = message.replace('{p}', pronoun);
  message = message.replace('{w}', winner);
  message = message.replace('{l}', loser);
  message += ". " + percent + "% penetration!";
  return message;
}