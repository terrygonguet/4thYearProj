/*
 * The element displaying the Background textures
 */

class Background extends createjs.Shape {

  /**
   * @param {String} type : enum {"sea", "island"} defaults to sea if invalid
   */
  constructor(dimension) {
    super();
    this.position     = $V([0,0]);
    this.width        = dimension.e(1);
    this.height       = dimension.e(2);
    this.blockSize    = 100;
    this.color        = neonColor();
    this.turbofunk    = false;
    this.time         = 0;
    this.centerRadius = { max: 0.3, min: 0.05, cur: 0.3 }; // in % of window.innerHeight

    const halfW = Math.ceil(this.width/2);
    const halfH = Math.ceil(this.height/2);
    this.drawLines();
    this.cache(-halfW, -halfH, this.width, this.height);

    this.on("tick", this.update, this);
    this.set({
      x: window.innerWidth/2, y: window.innerHeight/2
    });

    input.on("konami", e => {
      this.turbofunk = !this.turbofunk;
      // can't update the cache this fast so uncache
      if (this.turbofunk) this.uncache();
      else this.cache(-halfW, -halfH, this.width, this.height);
    });
  }

  drawLines () {
    const halfW = Math.ceil(this.width/2);
    const halfH = Math.ceil(this.height/2);
    this.graphics.s(this.color);
    for (var i = -halfW; i <= halfW; i+=this.blockSize) {
      this.graphics.mt(i, -halfH).lt(i, halfH);
    }
    for (var i = -halfH; i <= halfH; i+=this.blockSize) {
      this.graphics.mt(-halfH, i).lt(halfH, i);
    }
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    if (!game.player) return;

    const distFromCenter = game.player.position.distanceFrom(this.position);
    if (distFromCenter > this.centerRadius.cur * window.innerHeight) {
      this.centerRadius.cur = (this.centerRadius.cur - e.sdelta / 10)
                              .clamp(this.centerRadius.min, this.centerRadius.max);
      const movement = game.player.position
                      .subtract(this.position)
                      .toUnitVector().x(distFromCenter - this.centerRadius.cur * window.innerHeight);
      this.move(movement);
    } else {
      this.centerRadius.cur = (this.centerRadius.cur + e.sdelta / 5)
                              .clamp(this.centerRadius.min, this.centerRadius.max);
    }

    if (this.turbofunk && (this.time += e.delta) > 100) {
      this.time = 0;
      this.color = neonColor();
      this.drawLines();
    }

    const pos = this.position.x(-1).add(game.screencenter);
    this.set({ x: pos.e(1), y: pos.e(2) });
  }

  move (movement) {
    this.position = this.position.add(movement);
  }

}
