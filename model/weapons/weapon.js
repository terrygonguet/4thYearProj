const tools = require('../../tools');
const seedrandom = require('seedrandom');
const sylvester = require('sylvester');
const Bullet = require('../bullet');

class Weapon {

  /**
   * @param {Number} maxAmmo
   * @param {Number} reloadTime in ms
   * @param {Number} bulletSpeed in unit/second
   * @param {Number} fireRate in Hz
   * @param {Number} spread in radians
   */
  constructor(params={}) {
    const settings = tools.makeSettings({
      maxAmmo: Infinity,
      reloadTime: 0,
      bulletSpeed: 1500,
      fireRate: 3,
      spread: 0.05,
      fireSound: "Pew",
    }, params);
    this.maxAmmo     = settings.maxAmmo;
    this.reloadTime  = settings.reloadTime;
    this.bulletSpeed = settings.bulletSpeed;
    this.fireRate    = settings.fireRate;
    this.time        = 0;
    this.spread      = settings.spread;
    this.isReloading = false;
    this.fireSound   = settings.fireSound;
    this.rng         = null;
    this.player      = null;

    this.ammo        = this.maxAmmo;
  }

  /**
   * @param {Vector} direction : where the weapon is pointed at
   */
  fire(direction) {
    if (!this.isReloading && this.ammo > 0 && this.time >= 1000 / this.fireRate) {
      this.ammo--;
      this.time = 0;
      const realdir = direction.rotate(tools.randFloat(-this.spread/2, this.spread/2, this.rng), $V([0,0]));
      this.player.game.addChild(new Bullet({
        position: this.player.position,
        direction: realdir,
        speed: this.bulletSpeed,
        playerid: this.player.id,
        sound: this.fireSound
      }));
    }
  }

  /**
   * @param {Player} player the player to equip the weapon to
   */
  equip(player) {
    this.player = player;
    this.rng = new seedrandom(player.id);
    player.weapon = this;
  }

  /**
   * start reloading if not already reloading
   */
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
