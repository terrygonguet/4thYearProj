class FOV extends createjs.Shape {

  constructor() {
    super();

  }

  update (e) {
    const pos = game.player.position;
    const boxes = game.collidables.filter(c =>
      c.isBlock &&
      c.position.distanceFrom(game.background.position) + c.radius <= window.innerWidth / 2 * Math.SQRT2
    );
    const ptsSAT = boxes.reduce((s, b) => {
      s.push(...b.hitbox.calcPoints.map(p => p.clone().add(b.hitbox.pos)));
      return s;
    }, []);
    const ptsSYL = ptsSAT.map(p => {
      const ret = p.toSylv().subtract(pos);
      ret.angle = ret.angleFrom($V([1,0]));
      ret.angle = ret.e(2) < 0 ? ret.angle : 2 * Math.PI - ret.angle;
      return ret;
    });
    const fovPts = [];

    for (var pt of ptsSYL) {
      const ray = new SAT.Polygon(pos.toSAT(), [
        new SAT.V(),
        pt.toSAT()
      ]);
      var ptIsSeen = true;
      for (var box of boxes) {
        var res = new SAT.Response();
        if (SAT.testPolygonPolygon(box.hitbox, ray, res) && res.overlap >= 0.001) {
          ptIsSeen = false;
          break;
        }
      }
      ptIsSeen && fovPts.push(pt);
    }
    fovPts.sort((a,b) => a.angle < b.angle ? -1 : 1);

    if (fovPts.length > 3) {
      this.graphics.c().s("#EEE").mt(...fovPts[0].elements);
      for (var i = 1; i < fovPts.length; i++) {
        this.graphics.lt(...fovPts[i].elements);
      }
      this.graphics.cp();
    }

    this.set({ x: game.player.x, y: game.player.y });

  }

}
