const Weapon = require('./weapon');
class Blaster extends Weapon {

  constructor() {
    super(Infinity, 0, 1500, 3, 0.05);
  }

}
module.exports = Blaster;
