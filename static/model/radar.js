class Radar extends createjs.Shape {

  constructor() {
    super();
    this.timeShown = 2000; // in ms
    this.cooldown  = 5000; // in ms
    this.time      = Infinity;

    input.on("radar", this.scan, this);
  }

  scan(e) {
    if (this.time < this.cooldown) {
      createjs.Sound.play("RadarWrong");
      return;
    }
    createjs.Sound.play("RadarSearch");
    this.alpha = 1;
    this.time = 0;
    this.graphics.c()
      .s("#171")
      .dc(window.innerWidth/2, window.innerHeight/2, 0.35 * window.innerHeight);
    const bgrealpos = game.background.position;
    for (var entid in game.entities) {
      const ent = game.entities[entid];
      if (!ent.isOnlinePlayer) continue;

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

  update(e) {
    if (this.alpha > 0) {
      this.alpha = (this.alpha - e.sdelta / (this.timeShown / 1000)).clamp(0,1);
    }
    this.time += e.delta;
  }

}
