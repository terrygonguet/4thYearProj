/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 */
Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

/**
 * Rounds the number to the desired precision
 *
 * @param {Number} precision
 * @returns number
 */
Number.prototype.roundPres = function(precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = this * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
};

/**
 * Returns a random integer in the range.
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 */
Math.randInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Returns a random float in the range.
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 */
Math.randFloat = function (min, max) {
  return Math.random() * (max - min) + min;
}

// http://codereview.stackexchange.com/questions/83717/filter-out-duplicates-from-an-array-and-return-only-unique-value
function unique (xs) {
  var seen = {};
  return xs.filter(function(x) {
    if (seen[x])
      return;
    seen[x] = true;
    return x;
  });
}

// http://stackoverflow.com/questions/21646738/convert-hex-to-rgba
function hexToRgbA(hex, alpha){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
}
