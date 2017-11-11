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

/**
 * @returns {String} a random RGB CSS value
 */
Math.randomRGB = function () {
  return "rgb(" + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ")";
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

/**
 * return a color between { #11E, #1E1, #E11, #EE1, #E1E, #1EE, #EEE }
 */
function neonColor () {
  var c;
  do {
    c = "#" + (Math.random() < 0.5 ? "1" : "E") + (Math.random() < 0.5 ? "1" : "E") + (Math.random() < 0.5 ? "1" : "E");
  } while (c === "#111");
  return c;
}

/**
 * Transform a sylvester vector into a SAT Vector
 * @return {SAT.V} the same vector but from SAT
 */
Vector.prototype.toSAT = function () {
  return new SAT.V(this.e(1), this.e(2));
};

/**
 * Restricts the vector to a box of specified dimensions with 0,0 in the center
 * @param {Array} dimensions the dimensions of the box
 */
Vector.prototype.clamp = function (dimensions) {
  return $V(this.elements.map((e, i) => e.clamp(-dimensions[i]/2, dimensions[i]/2)));
}

/**
 * Transform a SAT vector into a sylvester Vector
 * @return {Vector} the same vector but from sylvester
 */
SAT.Vector.prototype.toSylv = function () {
  return $V([this.x, this.y]);
};

/**
 * Returns the next unique ID (only unique for this instance)
 * In its own namespace so that id isn't accessible
 */
var nextID = null;
(function () {
  var id = 0;
  nextID = function () {
    return id++;
  }
})();

/**
 * Finds the point of contact between a line and a Polygon closest to the line's anchor
 * @param {SAT.Polygon} line : the ray
 * @param {SAT.Polygon} poly : the polygon to test
 * @param {SAT.Response} res : details of the collision will be stored in here if provided
 * @param {Boolean} noCheck : set to true to skip the collision check
 * @return {Vector} the point of collision closest to the line's anchor or null if no collision
 */
SAT.getCollisionPoint = function (line, poly, res, noCheck=false) {
  res = res || new SAT.Response();
  if (!noCheck || SAT.testPolygonPolygon(line, poly, res)) {
    const makeline = (p1, p2) => {
      sp1 = p1.toSylv(); sp2 = p2.toSylv();
      var l = $L(sp1, sp2.subtract(sp1));
      l.length = sp1.distanceFrom(sp2);
      l.p1 = sp1; l.p2 = sp2;
      return l;
    };
    const ray = makeline(
      line.calcPoints[0].clone().add(line.pos),
      line.calcPoints[1].clone().add(line.pos)
    );
    const sides = [];
    for (var i = 0; i < poly.calcPoints.length; i++) {
      sides.push(makeline(
        poly.calcPoints[i].clone().add(poly.pos),
        poly.calcPoints[(i+1===poly.calcPoints.length ? 0 : i+1)].clone().add(poly.pos)
      ));
    }
    const intersections = [];
    for (var side of sides) {
      var inter = side.intersectionWith(ray);
      inter && (inter = $V([inter.e(1), inter.e(2)]));
      if (inter && inter.distanceFrom(side.p1) <= side.length && inter.distanceFrom(side.p2) <= side.length)
        intersections.push(inter);
    }
    var min = Infinity;
    var closest = null;
    if (intersections.length === 1)
      closest = intersections[0];
    else
      intersections.forEach(i => {
        var dist = i.distanceFrom(line.pos.toSylv());
        if (dist < min) {
          min = dist;
          closest = i;
        }
      });
    return closest;
  } else {
    return null;
  }
}
