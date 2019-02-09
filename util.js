var random = require('random');

module.exports.rand = function(min, max) {
  return random.int(min, max);
}

module.exports.randArr = function(arr) {
  return arr[random.int(0, arr.length - 1)];
}

module.exports.daysPerMonth = function(month, year) {
  switch (month) {
    case 1: return 31;
    case 2: return year % 4 === 0 ? 28 : 29;
    case 3: return 31;
    case 4: return 30;
    case 5: return 31;
    case 6: return 30;
    case 7: return 31;
    case 8: return 31;
    case 9: return 30;
    case 10: return 31;
    case 11: return 30;
    case 12: return 31;
  }
}