const SAT = require("sat");
const sylvester = require("sylvester");
const tools = require("../tools");

class Block {

  /**
   * @param {String} id : the id of the object
   * @param {Vector} position : the position (in the center of the block)
   * @param {Vector} dimensions : Width and height of the Block
   * @param {Number} angle : rotation of the block in radians
   */
  constructor(id, position, dimensions, angle) {
    this.id           = id;
    this.position     = position;
    this.dimensions   = dimensions;
    this.angle        = angle;
    this.hitbox       = null;
    this.radius       = dimensions.max();
    this.isBlock      = true;

    // setup hitbox
    const points = [
      tools.toSAT(dimensions.x(0.5)),
      new SAT.V(dimensions.e(1) * -0.5, dimensions.e(2) * 0.5),
      tools.toSAT(dimensions.x(-0.5)),
      new SAT.V(dimensions.e(1) * 0.5, dimensions.e(2) * -0.5)
    ];
    this.hitbox = new SAT.Polygon(tools.toSAT(this.position), points);
    this.hitbox.setAngle(angle);
  }

  serialize() {
    return {
      position: this.position.elements,
      dimension: this.dimensions.elements,
      angle: this.angle,
      id: this.id,
      type: "Block"
    };
  }

}
module.exports = Block;
