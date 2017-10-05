class Neon extends createjs.Shadow {

  /**
   * @param {HTMLColor} color : an HTML color string, if omitted the color will be randomized
   */
  constructor(color, size = 7) {
    var c;
    if (color) c = color;
    else {
      do {
        c = "#" + (Math.random() < 0.5 ? "1" : "E") + (Math.random() < 0.5 ? "1" : "E") + (Math.random() < 0.5 ? "1" : "E");
      } while (c === "#111");
    }
    super(c, 0, 0, size);
  }

}
