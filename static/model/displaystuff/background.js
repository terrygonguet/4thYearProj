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
    this.goto80s      = false;
    this.time1        = 0;
    this.time2        = 0;
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

    input.on("goto80s", e => {
      this.goto80s = !this.goto80s;
      if (!this.goto80s) $("#game").css("background", "#111");
    });
  }

  /**
   * Draws the grid in the background
   */
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

    // Cheat codes
    if (this.turbofunk && (this.time1 += e.delta) > 100) {
      this.time1 = 0;
      this.color = neonColor();
      this.drawLines();
    }

    if (this.goto80s) {
      this.time2 += e.sdelta;
      var colors = [
        "rgba(214, 202, 120, 1) " + 0 + "%",
        "rgba(255, 221, 123, 1) " + 10 + "%",
        "rgba(254, 203, 111, 1) " + 20 + "%",
        "rgba(252, 155, 112, 1) " + 32 + "%",
        "rgba(237, 106, 111, 1) " + 45 + "%",
        "rgba(203, 78, 108, 1) " + 59 + "%",
        "rgba(140, 65, 104, 1) " + 72 + "%",
        "rgba(81, 60, 99, 1) " + 87 + "%",
        "rgba(57, 59, 98, 1) " + 100 + "%"
      ];
      var angle = (this.time2 * 40) % 360;
      var gradient = `linear-gradient(${angle}deg, ${colors.join(", ")})`;
      $("#game").css("background", gradient);
    }

    const pos = this.position.x(-1).add(game.screencenter);
    this.set({ x: pos.e(1), y: pos.e(2) });
  }

  /**
   * Move the background
   */
  move (movement) {
    this.position = this.position.add(movement);
  }

}
Hikari.Background = Background;
