class Pickup {

  constructor(position, name) {
    this.id       = require("../tools").randInt(0,100000);
    this.name     = name;
    this.position = position;
    this.radius   = 6;
  }

}
module.exports = Pickup;
