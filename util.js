module.exports.rand = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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