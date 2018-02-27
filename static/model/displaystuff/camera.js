class Camera extends createjs.EventDispatcher {

  constructor() {
    super();
    this.center       = $V([0,0]);
    this.centerDiams  = { max: 0.3, min: 0.05, cur: 0.3 }; // in % of smaller side
  }

  get smallSide() {
    return innerWidth < innerHeight ? innerWidth : innerHeight;
  }

  get bigSide() {
    return innerWidth > innerHeight ? innerWidth : innerHeight;
  }

  update(e) {
    if (!game.player) return;
    const playerPos = game.player.position.dup();
    const dist = this.center.distanceFrom(playerPos);
    const d = this.centerDiams; // shorthand
    if (dist > d.max * this.bigSide) {
      var evt = new createjs.Event("camerasnap");
      evt.camera = this;
      this.dispatchEvent(evt);
      this.center = playerPos;
    } else if (dist > d.cur * this.smallSide) {
      var diff = playerPos.subtract(this.center);
      this.center = this.center.add(diff.toUnitVector().x(dist - d.cur * this.smallSide));
      d.cur = (d.cur - e.sdelta * 0.1).clamp(d.min, d.max);
    } else
      d.cur = (d.cur + e.sdelta * 0.2).clamp(d.min, d.max);

    for (var child of game.children) {
      if (child.position) {
        var screenPos = this.localToGlobal(child.position);
        child.set({
          x: screenPos.e(1), y: screenPos.e(2)
        });
      }
    }
  }

  globalToLocal(pos) {
    return pos.add(this.center).subtract($V([ innerWidth/2, innerHeight/2 ]));
  }

  localToGlobal(pos) {
    return $V([ innerWidth/2, innerHeight/2 ]).subtract(this.center).add(pos);
  }

}
