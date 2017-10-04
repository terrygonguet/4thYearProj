class MachineGun extends createjs.EventDispatcher {

  constructor() {
    super();

    this.maxAmmo     = 31;
    this.reloadTime  = 1200; // ms
    this.bulletSpeed = 5000; // pixel/second
    this.fireRate    = 10; // bullets/second
    this.time        = 0; // ms
    this.spread      = 0.05; // radians
    this.isReloading = false;

    this.ammo        = this.maxAmmo;
    this.reloadBar   = 0;
  }

  fire(player, direction) {
    if (!this.isReloading && this.ammo > 0 && this.time >= 1000 / this.fireRate) {
      this.ammo--;
      this.time = 0;
      const realdir = direction.rotate(Math.randFloat(-this.spread/2, this.spread/2), Vector.Zero(2));
      const b = new Bullet(player.position, realdir, this.bulletSpeed, player.id);
      game.addChild(b);
      this.dispatchEvent(new createjs.Event("fire"));
      createjs.Sound.play("Pew");

      const e = new createjs.Event("firebullet");
      e.data = {
        position: player.position.elements,
        direction: direction.elements,
        speed: this.bulletSpeed,
        playerid: player.id
      };
      game.dispatchEvent(e);
    }
  }

  reload() {
    if (!this.isReloading) {
      this.isReloading = true;
      this.time        = 0;
      this.reloadBar   = 0;
      this.dispatchEvent(new createjs.Event("reloadstart"));
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
        this.dispatchEvent(new createjs.Event("reloadend"));
      } else {
        this.reloadBar = this.time / this.reloadTime;
        this.dispatchEvent(new createjs.Event("reloadtick"));
      }
    }
  }

}
