const Weapon = require('./weapon');

class Shotgun extends Weapon {

  constructor() {
    super(8, 2000, 1700, 1.2, 0.13);
    this.fireSound = "Boup";
  }

  /**
   * @param {Player} player : the player firing the weapon
   * @param {Vector} direction : where the weapon is pointed at
   */
  fire (player, direction) {
    if (!this.isReloading && this.ammo > 0 && this.time >= 1000 / this.fireRate) {
      this.ammo--;
      this.time = 0;
    }
  }

}
module.exports = Shotgun;
