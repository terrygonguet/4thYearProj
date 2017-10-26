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
      var farPt = pt.toUnitVector().x(window.innerWidth/3);
      const ray = new SAT.Polygon(pos.toSAT(), [
        new SAT.V(),
        farPt.toSAT()
      ]);
      const collisions = [];
      for (var box of boxes) {
        var coll = SAT.getCollisionPoint(ray, box.hitbox);
        coll && collisions.push(coll);
      }
      var dist = Infinity;
      var closest = null;
      if (collisions.length === 1)
        closest = collisions[0];
      else
        collisions.forEach(c => {
          var d = c.distanceFrom(pos);
          if (d < dist) {
            d = dist;
            closest = c;
          }
        });
      if (closest) {
        closest = closest.subtract(pos);
        closest.angle = pt.angle;
        fovPts.push(closest);
      } else {
        farPt.angle = pt.angle;
        fovPts.push(farPt);
      }
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
