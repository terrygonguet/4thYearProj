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
  constructor(params={}) {
    const settings = tools.makeSettings({
      position: { x:0, y:0 },
      dimensions: { x:50, y:50 },
      angle: 0,
    }, params);
    this.id           = settings.id;
    this.position     = settings.position;
    this.dimensions   = settings.dimensions;
    this.angle        = settings.angle;
    this.hitbox       = null;
    this.radius       = settings.dimensions.x(0.5).modulus();
    this.isBlock      = true;

    // setup hitbox
    const points = [
      tools.toSAT(this.dimensions.x(0.5)),
      new SAT.V(this.dimensions.e(1) * -0.5, this.dimensions.e(2) * 0.5),
      tools.toSAT(this.dimensions.x(-0.5)),
      new SAT.V(this.dimensions.e(1) * 0.5, this.dimensions.e(2) * -0.5)
    ];
    this.hitbox = new SAT.Polygon(tools.toSAT(this.position), points);
    this.hitbox.setAngle(this.angle);
  }

  /**
   * Returns the JSON representation of the object
   */
  serialize() {
    return {
      type: "Block",
      params: {
        position: { x:this.position.e(1), y: this.position.e(2) },
        dimensions: { x:this.dimensions.e(1), y: this.dimensions.e(2) },
        angle: this.angle,
        id: this.id,
      }
    };
  }

}
module.exports = Block;
