class OnlinePlayer extends Player {

  constructor(params={}) {
    super(params);
    this.isOnlinePlayer = true;
    this.name           = params.name;
    this.reloadBar = new QuickText({
      text: this.name,
      textAlign: "center"
    });
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    if (this.realpos.distanceFrom(this.position) >= this.speed * e.sdelta) {
      const direction = this.realpos.subtract(this.position).toUnitVector();
      this.position = this.position.add(direction.x(this.speed * e.sdelta));
    } else
      this.position = this.realpos.dup();

    this.reloadBar.position = this.position.add($V([0,-30]));
    this.hitbox.pos = this.realpos.toSAT();
  }

}
Hikari.OnlinePlayer = OnlinePlayer
