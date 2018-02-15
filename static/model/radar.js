class Radar extends createjs.Shape {

  constructor() {
    super();
    this.timeShown = 2000; // in ms
    this.cooldown  = 5000; // in ms
    this.time      = Infinity;

    input.on("radar", this.scan, this);
  }

  /**
   * @param {eventdata} e
   */
  scan(e) {
    // if the cooldown isn't finished
    if (this.time < this.cooldown) {
      createjs.Sound.play("RadarWrong");
    } else {
      createjs.Sound.play("RadarSearch");
      this.alpha = 1;
      this.time = 0;
      // draw the circle
      this.graphics.c()
      .s("#171")
      .dc(window.innerWidth/2, window.innerHeight/2, 0.35 * window.innerHeight);
      const bgrealpos = game.background.position; // shortcut
      for (var entid in game.entities) {
        const ent = game.entities[entid]; // shortcut
        if (!ent.isOnlinePlayer) continue; // only point at players

        if (bgrealpos.distanceFrom(ent.position) >= window.innerHeight / 2) {
          const direction = ent.position.subtract(bgrealpos).toUnitVector();
          const perp = direction.rotate(Math.PI/2, Vector.Zero(2));
          const arrowpos = game.screencenter.add(direction.x(0.4 * window.innerHeight));
          this.graphics
          .f(ent.color)
          .s("#171")
          .mt(...arrowpos.elements)
          .lt(...arrowpos.add(direction.x(-20).add(perp.x(10))).elements)
          .lt(...arrowpos.add(direction.x(-20).add(perp.x(-10))).elements)
          .cp();
        }
      }
    }

  }

  /**
   * @param {eventdata} e
   */
  update(e) {
    if ((this.time += e.delta) < this.timeShown) {
      this.alpha = 1 - this.time / this.timeShown;
    }
  }

}
Hikari.Radar = Radar;
