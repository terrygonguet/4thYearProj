/*
 * The main class handling updates and graphics
 */

class Game extends createjs.Stage {

  /**
   * @param {String} canvasName ID of the <canvas> element to wrap
   */
  constructor (canvasName) {
    super(canvasName);
    // createjs props
    this.tickEnabled  = false;

    // other props
    this.socket       = null;
    this.txtFps       = new QuickText({ x: 10, y: 10 });
    this.txtrendertime= new QuickText({ x: 10, y: 30 });
    this.txtping      = new QuickText({ x: 10, y: 50 });
    this.txtqwerty    = new QuickText({ x: 10, y: 70, text: debug ? "press K to switch to QWERTY, P to pause" : "" });
    this.entities     = {};
    this.collidables  = [];
    this.player       = null;
    this.dimension    = 5000;
    this.background   = new Background($V([this.dimension, this.dimension]));
    this.foreground   = new createjs.Container();
    this.netticktime  = 0;
    this.netrate      = 30;
    this.renderVals   = [];
    this.pingvals     = [];
    this.screencenter = $V([window.innerWidth/2, window.innerHeight/2]);

    this.setHandlers();

    this.foreground.cache(-this.dimension/2, -this.dimension/2, this.dimension, this.dimension);
    this.foreground.update = function (e) {
      this.set({ x: game.background.x, y: game.background.y });
    }

    this.addChild(this.background);
    this.addChild(this.foreground);
    this.addChild(this.txtFps);
    this.addChild(this.txtrendertime);
    this.addChild(this.txtping);
    this.addChild(this.txtqwerty);
    this.addChild(new Radar());
  }

  /**
   * To separate the handlers from the constructor
   */
  setHandlers () {
    createjs.Ticker.timingMode = createjs.Ticker.RAF ;
    createjs.Ticker.framerate = 60;
    createjs.Ticker.on("tick", this.update, this);

    input.enableMouseMouve();

    // Events stuff ----------------------------------------------------------------------
    this.on("nettick", this.netupdate, this);

    this.on("firebullet", e => {
      this.socket.emit("firebullet", e.data);
    });

    this.on("playerhit", e => {
      this.socket.emit("playerhit", e.data);
    });

    window.addEventListener("resize", e => this.screencenter = $V([window.innerWidth/2, window.innerHeight/2]));


    // Socket stuff ----------------------------------------------------------------------
    this.socket = io(location.origin);

    // only create and add player when we know the socket id
    this.socket.on("connect", () => {
      if (!this.player) {
        this.player = new Player(this.socket.id);
        this.addChild(this.player);
      } else if (this.player.id !== this.socket.id) {
        this.player.die();
        this.player = new Player(this.socket.id);
        this.addChild(this.player);
      }
    });

    this.socket.on("createblocks", data => {
      for (var b of data) {
        switch (b.type) {
          case "Block":
            game.addChild(new Block(b.id, $V(b.position), $V(b.dimension), b.angle));
            break;
          case "Plant":
            game.addChild(new Plant(b.id, $V(b.position), b.radiusmin, b.radiusmax));
            break;
        }
      }
      this.foreground.updateCache();
    });

    this.socket.on("update", data => {
      // update payload
      this.player.txtPoints.text = data.playerscore;
      for (var p in data.players) {
        !this.entities[p] && this.addChild(new OnlinePlayer(p));
        this.entities[p].moveTo($V(data.players[p].position), data.players[p].speed);
        this.entities[p].txtPoints.text = data.players[p].score;
      }
    });

    this.socket.on("firebullet", data => {
      this.addChild(new Bullet(
        $V(data.position), $V(data.direction), data.speed, data.playerid
      ));
      const volume = (2000 - game.player.position.distanceFrom($V(data.position)).clamp(0,2000)) / 2000;
      createjs.Sound.play("Pew", { volume });
    });

    this.socket.on("gethit", () => {
      createjs.Sound.play("Kick");
    });

    this.socket.on("playerleave", data => {
      this.entities[data.id] && this.entities[data.id].die();
      console.log("left " + data.id);
    });

    // input stuff -------------------------------------------------------------------------------
    input.on("pause", () => createjs.Ticker.paused = !createjs.Ticker.paused);
    input.on("debug", () => debug = !debug);
    input.bindings = JSON.parse(localStorage.getItem("bindings")) || {
      up      : ["z"],
      down    : ["s"],
      left    : ["q"],
      right   : ["d"],
      reload  : ["r"],
      pause   : ["p"],
      debug   : ["o"],
      radar   : ["Tab"],
      config  : ["Escape"]
    };

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
    !e.paused && this.children.forEach(c => c.update && c.update(e));
    super.update(e);
    game.rendertime += (performance.now() - time);
    this.renderVals.push(game.rendertime);
    if (this.renderVals.length > 100) this.renderVals.shift(); // render values smoother
    this.txtrendertime.text = (debug ? "render time " + (this.renderVals.reduce((a,b)=>a+b, 0)/100).toPrecision(3) + " ms" : "");
    if (this.pingvals.length > 100) this.pingvals.shift(); // ping values smoother
    this.txtping.text = (debug ? "ping " + Math.round(this.pingvals.reduce((a,b)=>a+b, 0)/100) : "");
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
    const now = Date.now();
    smthToSend && this.socket.emit("update", data, () => this.pingvals.push(Date.now() - now));
  }

  addChild (child) {
    if (child.isEntity) {
      if (this.entities[child.id]) return;
      this.entities[child.id] = child;
    }

    if (child.isCollidable && this.collidables.indexOf(child) === -1)
      this.collidables.push(child);

    if (child.isForeground) this.foreground.addChild(child);
    else {
      var i = this.getChildIndex(this.foreground);
      i !== -1 ? super.addChildAt(child, i) : super.addChild(child);
    }
  }

  removeChild (child) {
    super.removeChild(child);
    if (child.isEntity) delete this.entities[child.id];
    if (child.isForeground) this.foreground.removeChild(child);
    if (child.isCollidable) this.collidables.splice(this.collidables.indexOf(child), 1);
  }

}
