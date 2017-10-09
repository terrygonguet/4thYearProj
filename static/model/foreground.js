class Foreground extends createjs.Container {

  /**
   * @param {Vector} dimensions : the dimensions of the arena
   */
  constructor (dimensions) {
    super();
    this.dimensions = dimensions;
    this.isdirty    = false;
    this.turbofunk  = false;
    this.time       = 0;

    this.cache(-this.dimensions.e(1)/2, -this.dimensions.e(2)/2, this.dimensions.e(1), this.dimensions.e(2));
    input.on("turbofunk", e => {
      this.turbofunk = !this.turbofunk;
      // can't update the cache this fast so uncache
      if (this.turbofunk) this.uncache();
      else this.cache(-this.dimensions.e(1)/2, -this.dimensions.e(2)/2, this.dimensions.e(1), this.dimensions.e(2));
    });
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    this.set({ x: game.background.x, y: game.background.y });
    this.isdirty && (this.isdirty = !!this.updateCache());

    if (this.turbofunk && (this.time += e.delta) > 400) {
      this.time = 0;
      for (var child of this.children) {
        child.shadow && (child.shadow = new Neon());
      }
    }
  }

  addChild (child) {
    super.addChild(child);
    this.isdirty = true;
  }

}
