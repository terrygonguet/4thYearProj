/*
 * The main class handling updates and graphics
 */

class Game extends createjs.Stage {

  /**
   * @param canvasName { String } ID of the <canvas> element to wrap
   */
  constructor (canvasName) {
    super(canvasName);
    // createjs props
    this.tickEnabled  = true;

    // other props
    this.socket       = null;
    this.txtFps       = new QuickText({ x: 10, y: 10 });
    this.txtrendertime= new QuickText({ x: 10, y: 30 });
    this.entities     = {};
    this.player       = null;
    this.background   = new Background();

    this.setHandlers();

    this.addChild(this.background);
    this.addChild(this.txtFps);
    this.addChild(this.txtrendertime);
  }

  /**
   * To separate the handlers from the constructor
   */
  setHandlers () {
    createjs.Ticker.timingMode = createjs.Ticker.TIMEOUT ;
    createjs.Ticker.framerate = 30;
    createjs.Ticker.on("tick", this.update, this);

    // only create and add player when we know the socket id
    this.socket = io(location.origin);
    this.socket.on("connect", () => {
      this.player = new Player(this.socket.id);
      this.addChild(this.player);
    });
    this.socket.on("playerjoin", data => {
      const e = new Entity(data.id);
      this.addChild(e);
      console.log("joined " + data.id);
    });
    this.socket.on("playerleave", data => {
      this.entities[data.id] && this.removeChild(this.entities[data.id]);
      console.log("left " + data.id);
    });


  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    let time = performance.now();
    e.sdelta = e.delta / 1000;
    this.txtFps.text = (debug ? createjs.Ticker.getMeasuredFPS().toFixed(0) + " FPS" : "");
    this.rendertime = 0;
    super.update(e);
    game.rendertime += (performance.now() - time);
    this.txtrendertime.text = (debug ? "render time " + this.rendertime.toPrecision(3) + " ms" : "");
  }

  addChild (child) {
    super.addChild(child);
    if (child.isEntity) this.entities[child.id] = child;
  }

  removeChild (child) {
    super.removeChild(child);
    if (child.isEntity) delete this.entities[child.id];
  }

}
