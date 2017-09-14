/*
 * The main class handling updates and graphics
 */

class Game extends createjs.Stage {

  /*
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

    this.setHandlers();

    this.addChild(this.map);
    this.addChild(this.txtFps);
    this.addChild(this.txtrendertime);
  }

  setHandlers () {
    createjs.Ticker.timingMode = createjs.Ticker.TIMEOUT ;
    createjs.Ticker.framerate = 30;
    createjs.Ticker.on("tick", this.update, this);

    // only create and add player when we know the socket id
    this.socket = io(location.origin);
    this.socket.on("connect", () => {

    });

  }

  /*
   * @param e { eventdata }
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
  }

  removeChild (child) {
    super.removeChild(child);
  }

}
