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
    this.txtFps       = new QuickText({ x: 10, y: 30 });
    this.txtrendertime= new QuickText({ x: 10, y: 50 });
    this.txtping      = new QuickText({ x: 10, y: 70 });
    this.txtqwerty    = new QuickText({ x: 10, y: 10, text: debug ? "Escape for the menu" : "" });
    this.player       = null;
    this.dimensions   = null;
    this.background   = null;
    this.foreground   = null;
    this.netticktime  = 0;
    this.netrate      = 15;
    this.maxDelta     = 150;
    this.renderVals   = [];
    this.pingvals     = [];

    this.setHandlers();
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

    // Socket stuff ----------------------------------------------------------------------
    this.socket = io(location.origin);

    this.socket.on("connect", () => {});

    this.socket.on("createarena", data => this.init(data));

    this.socket.on("gotomessage", data => {
      $("#game").hide();
      $("#messagebox").show();
      createjs.Ticker.paused = true;
      $("#title").text(data.title);
      $("#message").text(data.message);
    });

    this.socket.on("gotogame", data => {
      $("#game").show();
      $("#messagebox").hide();
      createjs.Ticker.paused = false;
    });

    this.socket.on("update", data => {
      // update payload
      for (var p of data.players) {
        if (p.id === this.player.id) {
          this.player.serverState = makeSettings({}, p);
          continue;
        }
        const settings = makeSettings({}, p);
        var ent = this.entities.find(e => e.id === settings.id);
        if (!ent) {
          ent = new OnlinePlayer(settings.id);
          this.addChild(ent);
        }
        ent.moveTo(settings.position, settings.speed);
        ent.setScore(settings.score);
      }
    });

    this.socket.on("firebullet", data => {
      if (data.playerid === this.player.id) return;
      const fireOne = (props) => {
        this.addChild(new Bullet(
          $V(props.position), $V(props.direction), props.speed, props.playerid, props.sound
        ));
      }
      if (data instanceof Array) {
        for (var b of data) {
          fireOne(b);
        }
      } else fireOne(data);
    });

    this.socket.on("gethit", () => {
      createjs.Sound.play("Kick");
    });

    this.socket.on("playerleave", data => {
      this.entities.find(e => e.id === data.id).die();
      console.log("left " + data.id);
    });

    this.socket.on("equipweapon", name => {
      this.player.setWeapon(new Hikari[name]());
    });

    this.socket.on("createobject", data => {
      console.log("created " + data.type);
      this.addChild(new Hikari[data.type](data.params));
    });

    // input stuff -------------------------------------------------------------------------------
    input.on("pause", () => createjs.Ticker.paused = !createjs.Ticker.paused);
    input.on("debug", () => debug = !debug);
  }

  get onlinePlayers() {
    return this.children.filter(c => c.isOnlinePlayer);
  }

  get collidables() {
    return this.children.filter(c => c.isCollidable).concat(this.foreground.children.filter(c => c.isCollidable));
  }

  get solids() {
    return this.children.filter(c => c.isSolid);
  }

  get entities() {
    return this.children.filter(c => c.isEntity);
  }

  get screencenter() {
    return $V([innerWidth/2, innerHeight/2]);
  }

  /**
   * Cleans up the Stage and builds everything according to the data supplied
   * @param {Object} data : the Object from the server
   */
  init (data) {
    this.removeAllChildren();
    this.dimensions   = $V(data.dimensions)
    this.background   = new Background(this.dimensions);
    this.foreground   = new Foreground(this.dimensions);
    this.player       = new Player(this.socket.id);

    this.addChild(this.background);
    this.addChild(this.foreground);
    this.addChildAt(this.txtFps, this.children.length);
    this.addChildAt(this.txtrendertime, this.children.length);
    this.addChildAt(this.txtping, this.children.length);
    this.addChildAt(this.txtqwerty, this.children.length);
    this.addChild(this.player);
    this.addChild(new Radar());
    // this.addChildAt(new FOV(), this.children.length);

    for (var b of data.blocks) {
      game.addChild(new Hikari[b.type](b.params));
    }

    for (var p of data.players) {
      const settings = makeSettings({}, p);
      if (p.id === this.player.id) {
        this.player.setPos(settings.position);
        this.player.setScore(settings.score);
      } else {
        const ent = new OnlinePlayer(settings);
        ent.setScore(settings.score);
        this.addChild(ent);
      }
    }
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    if (e.delta >= this.maxDelta) return ;
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
    if (this.player.consolidateInput()) {
      data.player = {
        inputs: this.player.inputHistory.slice()
      };
      this.player.inputHistory = [];
      smthToSend = true;
    }
    const now = Date.now();
    smthToSend && this.socket.emit("update", data, () => this.pingvals.push(Date.now() - now));
  }

  addChild (child) {
    if (child.isInForeground) this.foreground.addChild(child);
    else {
      var i = this.getChildIndex(this.foreground);
      i !== -1 ? super.addChildAt(child, i) : super.addChild(child);
    }
  }

  removeChild (child) {
    super.removeChild(child);
    if (child.isForeground) this.foreground.removeChild(child);
  }

}
Hikari.Game = Game;
