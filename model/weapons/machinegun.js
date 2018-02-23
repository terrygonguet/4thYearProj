const Weapon = require('./weapon');
class MachineGun extends Weapon {

  constructor() {
    super(30, 1400, 3000, 8, 0.12);
  }

}
module.exports = MachineGun;
