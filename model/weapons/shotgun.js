const Weapon = require('./weapon');

class Shotgun extends Weapon {

  constructor() {
    super({
      maxAmmo:8,
      reloadTime:2000,
      bulletSpeed:1700,
      fireRate:1.2,
      spread:0.13,
      fireSound:"Boup",
    });
  }

  /**
   * @param {Player} player : the player firing the weapon
   * @param {Vector} direction : where the weapon is pointed at
   */
  fire (direction) {
    if (!this.isReloading && this.ammo > 0 && this.time >= 1000 / this.fireRate) {
      this.ammo--;
      this.time = 0;
    }
  }

}
module.exports = Shotgun;
