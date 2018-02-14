const SAT = require("sat");
const sylvester = require("sylvester");
const _ = require('lodash');

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

/**
 * clamp
 * @param {Number} number the number to clamp
 * @param {Number} min
 * @param {Number} max
 */
exports.clamp = function (number, min, max) {
  return Math.min(Math.max(number, min), max);
};

/**
 * Restricts the vector to a box of specified dimensions with 0,0 in the center
 * @param {Vector} vector the vector to clamp
 * @param {Array} dimensions the dimensions of the box
 */
exports.clampVect = function (vector, dimensions) {
  return $V(vector.elements.map((e, i) => exports.clamp(e, -dimensions[i]/2, dimensions[i]/2)));
};

exports.makeSettings = function (defaults, params) {
  const ret = _.assign(defaults, params);
  _.forOwn(ret, (v, k) => {
    if (_.xor(_.keys(v), ["x", "y"]).length === 0) {
      ret[k] = $V([v.x, v.y]);
    }
  });
  return ret;
};
