class Plant extends createjs.Shape {

  /**
   * @param {String} id : the id of the object
   * @param {Vector} position : the position (in the center of the block)
   * @param {Number} radiusmin : closest to the center the leaves can be
   * @param {Number} radiusmax : furthest to the center the leaves can be
   */
  constructor(id, position, radiusmin, radiusmax) {
    super();

    this.id            = id;
    this.position      = position;
    this.radiusmin     = radiusmin;
    this.radiusmax     = radiusmax;
    this.shadow        = new Neon();
    this.isForeground  = true;
    this.points        = [];
    this.isPlant       = true;

    this.graphics.s("#EEE").f("#111");
    const nbPts = Math.randInt(25, 50);
    for (var i = 0; i < nbPts; i++) {
      var min, max;
      if (i % 2 === 0) {
        min = radiusmin;
        max = (radiusmax - radiusmin)/2;
      } else {
        min = (radiusmax - radiusmin)/2;
        max = radiusmax;
      }
      const pt = $V([0,Math.randFloat(min, max)])
                 .rotate(i * (2 * Math.PI / nbPts), Vector.Zero(2));
      this.points.length ? this.graphics.lt(pt.e(1), pt.e(2)) : this.graphics.mt(pt.e(1), pt.e(2));
      this.points.push(pt);
    }
    this.graphics.cp();
    this.set({ x: this.position.e(1), y: this.position.e(2) });
  }



}
Hikari.Plant = Plant;
