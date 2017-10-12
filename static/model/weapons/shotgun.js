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
      this.dispatchEvent(new createjs.Event("fire"));

      const e = new createjs.Event("firebullet");
      e.data = [];
      for (var i = 0; i < 8; i++) {
        const sound = i === 0 ? this.fireSound : null;
        const realdir = direction.rotate(Math.randFloat(-this.spread/2, this.spread/2), Vector.Zero(2));
        const b = new Bullet(player.position, realdir, this.bulletSpeed, player.id, sound);
        game.addChild(b);
        e.data.push({
          position: player.position.elements,
          direction: direction.elements,
          speed: this.bulletSpeed + Math.randFloat(-50,50),
          playerid: player.id,
          sound
        })
      }
      game.dispatchEvent(e);
    }
  }

}
Hikari.Shotgun = Shotgun;
