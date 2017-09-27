/*
 * The element displaying the Background textures
 */

class Background extends createjs.Container {

  /**
   * @param {String} type : enum {"sea", "island"} defaults to sea if invalid
   */
  constructor(type = "sea", dimension) {
    super();
    this.type     = type;
    this.position = $V([0,0]);
    this.width    = dimension.e(1);
    this.height   = dimension.e(2);

    const halfW = Math.ceil(this.width/2);
    const halfH = Math.ceil(this.height/2);
    for (var i = -halfW; i <= halfW; i+=50) {
      for (var j = -halfH; j <= halfH; j+=50) {
        var sprite = new createjs.Shape();
        sprite.graphics.s("#babf2f").f("#111").r(0,0,50,50);
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
    const pos = this.position.add(game.screencenter);
    this.set({ x: pos.e(1), y: pos.e(2) });
  }

  move (movement) {
    this.position = this.position.subtract(movement);
  }

}
