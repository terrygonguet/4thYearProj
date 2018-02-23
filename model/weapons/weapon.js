const tools = require('../../tools');

class Weapon {

  /**
   * @param {Number} maxAmmo
   * @param {Number} reloadTime in ms
   * @param {Number} bulletSpeed in unit/second
   * @param {Number} fireRate in Hz
   * @param {Number} spread in radians
   */
  constructor(maxAmmo, reloadTime, bulletSpeed, fireRate, spread) {
    this.maxAmmo     = maxAmmo;
    this.reloadTime  = reloadTime;
    this.bulletSpeed = bulletSpeed;
    this.fireRate    = fireRate;
    this.time        = 0;
    this.spread      = spread;
    this.isReloading = false;
    this.fireSound   = "Pew";

    this.ammo        = this.maxAmmo;
  }

  /**
   * @param {Player} player : the player firing the weapon
   * @param {Vector} direction : where the weapon is pointed at
   */
  fire(player, direction) {
    if (!this.isReloading && this.ammo > 0 && this.time >= 1000 / this.fireRate) {
      this.ammo--;
      this.time = 0;
      const realdir = direction.rotate(tools.randFloat(-this.spread/2, this.spread/2), Vector.Zero(2));
      // const b = new Bullet(player.position, realdir, this.bulletSpeed, player.id, this.fireSound);
      // game.addChild(b);
    }
  }

  reload() {
    if (!this.isReloading && this.reloadTime > 0) {
      this.isReloading = true;
      this.time        = 0;
      this.reloadBar   = 0;
    }
  }

  /**
   * @param {eventdata} e
   */
  update(e) {
    this.time += e.delta;
    if (this.isReloading) {
      if (this.time >= this.reloadTime) {
        this.isReloading = false;
        this.ammo = this.maxAmmo;
      } else {
        this.reloadBar = this.time / this.reloadTime;
      }
    }
  }

}
module.exports = Weapon;
