class FOV extends createjs.Shape {

  constructor() {
    super();

  }

  update (e) {
    const pos = game.player.position;
    const boxes = game.collidables.filter(c =>
      c.isBlock &&
      c.position.distanceFrom(game.background.position) + c.radius <= window.innerWidth / 2
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

    const visiblePts = [];
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
      ptIsSeen && visiblePts.push(pt);
    }

    const fovPts = [];
    for (var pt of visiblePts) {
      var angle = pt.angle;
      var spt = pt.toUnitVector().x(window.innerWidth/3);
      const ray = new SAT.Polygon(pos.toSAT(), [
        new SAT.V(),
        spt.toSAT()
      ]);
      var dist = spt.modulus();
      for (var box of boxes) {
        var colli = SAT.getCollisionPoint(ray, box.hitbox);
        if (colli && colli.distanceFrom(pos) < dist) {
          spt = colli.subtract(pos);
          dist = spt.modulus();
        }
      }
      // spt.angle = angle;
      fovPts.push(spt);
    }

    fovPts.forEach(p => {
      p.angle = p.angleFrom($V([1,0]));
      p.angle = p.e(2) < 0 ? p.angle : 2 * Math.PI - p.angle;
    })
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
