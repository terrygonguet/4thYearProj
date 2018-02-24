const Weapon = require('./weapon');
class MachineGun extends Weapon {

  constructor() {
    super({
      maxAmmo:30,
      reloadTime:1400,
      bulletSpeed:3000,
      fireRate:8,
      spread:0.12,
    });
  }

}
module.exports = MachineGun;
