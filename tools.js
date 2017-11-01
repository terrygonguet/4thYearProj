const SAT = require("sat");
const sylvester = require("sylvester");

exports.randInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

exports.toSAT = function (vector) {
  return new SAT.V(vector.e(1), vector.e(2));
};

exports.toSylv = function (vector) {
  return $V([vector.x, vector.y]);
};
