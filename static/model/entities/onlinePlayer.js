class OnlinePlayer extends Player {

  constructor(id, position = $V([0,0])) {
    super(id, position);
    this.isOnlinePlayer = true;
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    if (this.realpos.distanceFrom(this.position) >= this.speed * e.sdelta) {
      const direction = this.position.subtract(this.realpos).toUnitVector();
      this.realpos = this.realpos.add(direction.x(this.speed * e.sdelta));
    } else
      this.realpos = this.position;

    const pos = this.position.subtract(game.background.position).add(game.screencenter);

    this.set({ x: pos.e(1), y: pos.e(2) });
    this.txtPoints.set({ x: pos.e(1), y: pos.e(2) });

    this.hitbox.pos = this.position.toSAT();
  }

}
Hikari.OnlinePlayer = OnlinePlayer
