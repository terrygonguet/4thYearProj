class WeaponPickup extends Pickup {

  /**
   * @param {String_Number} id
   * @param {Vector} position
   */
  constructor(params={}) {
    const settings = makeSettings({
      position: { x:0, y:0 },
      radius: 9,
      color: "#EEE",
    }, (typeof params !== "object" ? { id: params } : params));
    super(settings);
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
