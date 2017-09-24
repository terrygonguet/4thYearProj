/*
 * The element displaying the Background textures
 */

class Background extends createjs.Container {

  /**
   * @param {String} type : enum {"sea", "island"} defaults to sea if invalid
   */
  constructor(type = "sea") {
    super();
    this.type     = type;
    this.position = $V([window.innerWidth/2, window.innerHeight/2]);
    this.width    = Math.ceil(window.innerWidth / 50);
    this.height   = Math.ceil(window.innerHeight / 50);

    const halfW = Math.ceil(this.width/2);
    const halfH = Math.ceil(this.height/2);
    for (var i = -halfW; i <= halfW; i++) {
      for (var j = -halfH; j <= halfH; j++) {
        var sprite = new createjs.Shape();
        sprite.graphics.s("#babf2f").f("#111").r(0,0,50,50);
        sprite.set({
          x: i*50, y: j*50
        });
        this.addChild(sprite);
      }
    }
    this.cache(-halfW * 50, -halfH * 50, halfW * 100, halfH * 100);
    this.on("tick", this.update, this);
    this.set({
      x: this.position.e(1), y: this.position.e(2)
    });
  }

  /**
   * @param {eventdata} e
   */
  update (e) {

  }

}
