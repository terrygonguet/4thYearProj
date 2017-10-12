class WeaponPickup extends Pickup {

  /**
   * @param {String_Number} id
   * @param {Vector} position
   * @param {String} weaponclass : The name of the weapon class
   */
  constructor(id, position=$V([0,0]), weaponclass) {
    super(id, position, 6, "#EEE", e => e.setWeapon(new Hikari[weaponclass]()));
    this.weaponclass = weaponclass;
    this.graphics.c().f(this.color)
                 .mt(0,-this.radius)
                 .lt(this.radius, 0)
                 .lt(0, this.radius)
                 .lt(-this.radius,0)
                 .cp();
  }

  update(e) {
    super.update(e);
    this.rotation += e.sdelta * 60;
  }

}
Hikari.WeaponPickup = WeaponPickup;
