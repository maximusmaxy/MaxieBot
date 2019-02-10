module.exports.rand = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.randArr = function(arr) {
  return arr[module.exports.rand(0, arr.length - 1)];
}

module.exports.weighting = function(map) {
  var obj = {};
  var max = 0;
  for (let v of map.values()) {
    max += v;
  }
  obj.map = map
  obj.size = max;
  return obj;
}

module.exports.descendingWeighting = function(size) {
  arr = [];
  for (let i = 1; i <= size; i++) {
    arr.push([i, size - i + 1]);
  }
  return module.exports.weighting(new Map(arr));
}

module.exports.randWeighting = function (weighting) {
  var rand = module.exports.rand(0, weighting.size - 1);
  var increment = 0;
  for (let [key, value] of weighting.map) {
    increment += value;
    if (rand < increment) {
      return key;
    }
  }
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