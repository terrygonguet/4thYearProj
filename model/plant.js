const SAT = require("sat");
const sylvester = require("sylvester");
const tools = require("../tools");

class Plant {

  /**
   * @param {String} id : the id of the object
   * @param {Vector} position : the position (in the center of the block)
   * @param {Number} radiusmin : closest to the center the leaves can be
   * @param {Number} radiusmax : furthest to the center the leaves can be
   */
  constructor(params={}) {
    const settings = tools.makeSettings({
      position: { x:0, y:0 },
      radiusmin: 5,
      radiusmax: 25,
    }, params);
    this.id            = settings.id;
    this.position      = settings.position;
    this.radiusmin     = settings.radiusmin;
    this.radiusmax     = settings.radiusmax;
  }

  /**
   * Returns the JSON representation of the object
   */
  serialize() {
    return {
      type: "Plant",
      params: {
        position: { x:this.position.e(1), y: this.position.e(2) },
        radiusmin: this.radiusmin,
        radiusmax: this.radiusmax,
        id: this.id,
      }
    };
  }

}
module.exports = Plant;
