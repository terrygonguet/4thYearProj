/*
 * The element displaying the Background textures
 */

class Background extends createjs.Container {

  /**
   * @param {String} type : enum {"sea", "island"} defaults to sea if invalid
   */
  constructor(type = "sea", dimension) {
    super();
    this.type         = type;
    this.position     = $V([0,0]);
    this.width        = dimension.e(1);
    this.height       = dimension.e(2);
    this.blockSize    = 100;
    this.centerRadius = { max: 0.3, min: 0.05, cur: 0.3 };

    const halfW = Math.ceil(this.width/2);
    const halfH = Math.ceil(this.height/2);
    for (var i = -halfW; i <= halfW; i+=this.blockSize) {
      for (var j = -halfH; j <= halfH; j+=this.blockSize) {
        var sprite = new createjs.Shape();
        sprite.graphics.s("#babf2f").f("#111").r(0,0,this.blockSize,this.blockSize);
        sprite.set({
          x: i, y: j
        });
        this.addChild(sprite);
      }
    }
    this.cache(-halfW, -halfH, this.width, this.height);
    this.on("tick", this.update, this);
    this.set({
      x: window.innerWidth/2, y: window.innerHeight/2
    });
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
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

    const pos = this.position.x(-1).add(game.screencenter);
    this.set({ x: pos.e(1), y: pos.e(2) });
  }

  move (movement) {
    this.position = this.position.add(movement);
  }

}
