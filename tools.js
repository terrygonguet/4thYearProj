const SAT = require("sat");
const sylvester = require("sylvester");

/**
 * Random integer between the bounds
 * @param {Number} min
 * @param {Number} max
 */
exports.randInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Swaps vector from sylvester to SAT
 * @param {Vector} vector
 */
exports.toSAT = function (vector) {
  return new SAT.V(vector.e(1), vector.e(2));
};

/**
 * Swaps vector from SAT to sylvester
 * @param {SAT.V} vector
 */
exports.toSylv = function (vector) {
  return $V([vector.x, vector.y]);
};
