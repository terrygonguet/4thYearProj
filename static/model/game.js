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
    this.netticktime  = 0;
    this.netrate      = 30;

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

    this.on("nettick", this.netupdate, this);

    // only create and add player when we know the socket id
    this.socket = io(location.origin);
    this.socket.on("connect", () => {
      this.player = new Player(this.socket.id);
      this.addChild(this.player);
      this.lastnetupdate = performance.now();
    });
    this.socket.on("update", data => {
      // update payload
      for (var p in data.players) {
        !this.entities[p] && this.addChild(new Entity(p));
        this.entities[p].moveTo($V(data.players[p].position), data.players[p].speed);
      }
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
    let time = performance.now(); // perf monitoring
    e.sdelta = e.delta / 1000; // shorthand
    this.txtFps.text = (debug ? createjs.Ticker.getMeasuredFPS().toFixed(0) + " FPS" : "");
    // net tick event
    if ((this.netticktime += e.delta) > (1000 / this.netrate)) {
      var netevent = new createjs.Event("nettick").set({ delta: this.netticktime });
      this.dispatchEvent(netevent);
      this.netticktime = 0;
    }
    // more perf monitoring
    this.rendertime = 0;
    super.update(e);
    game.rendertime += (performance.now() - time);
    this.txtrendertime.text = (debug ? "render time " + this.rendertime.toPrecision(3) + " ms" : "");
  }

  /**
   * Keeps the server up to date with our game
   * @param {neteventdata} e
   */
  netupdate (e) {
    if (!this.player) return;
    var data = { };
    var smthToSend = false;
    if (this.player.hasMoved) {
      data.player = {
        position: this.player.position.elements,
        speed: this.player.speed
      };
      smthToSend = true;
    }
    smthToSend && this.socket.emit("update", data);
  }

  addChild (child) {
    if (child.isEntity) {
      if (this.entities[child.id]) return;
      this.entities[child.id] = child;
    }
    super.addChild(child);
  }

  removeChild (child) {
    super.removeChild(child);
    if (child.isEntity) delete this.entities[child.id];
  }

}
