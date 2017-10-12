/* Loads all the necessary game files and handles loading screen */

/** Only globals allowed :
 *  game, input, queue, debug, config
 */
var game;
const queue = new createjs.LoadQueue();
var debug = true;
const Hikari = {}; // Namespace

(function () {
  queue.on("complete", handleComplete, this);
  queue.on("fileload", handleFileLoad, this);
  queue.on("fileerror", handleFileError, this);
  queue.installPlugin(createjs.Sound);

  // loading screen
  const stage = new createjs.Stage("game");
  const bar = new createjs.Shape();
  bar.graphics.ss(5);
  bar.set({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  });
  const txt = new createjs.Text("Loading", "50px Montserrat", "#EEE");
  txt.set({
    x: window.innerWidth / 2,
    y: window.innerHeight / 3,
    textAlign: "center"
  });
  let nbLoaded = 0;
  stage.canvas.width = window.innerWidth;
  stage.canvas.height = window.innerHeight;
  stage.addChild(bar);
  stage.addChild(txt);
  stage.update();

  // Files to load
  queue.manifest = [
    // Scripts ----------------------------------
    {id: "Tools", src:"tools/tools.js"},
    {id: "Input Manager", src:"tools/input.js"},
    {id: "Game", src:"model/game.js"},
    {id: "Config", src:"model/config.js"},
    {id: "Background", src:"model/displaystuff/background.js"},
    {id: "Foreground", src:"model/displaystuff/foreground.js"},
    {id: "Entity", src:"model/entities/entity.js"},
    {id: "Player", src:"model/entities/player.js"},
    {id: "OnlinePlayer", src:"model/entities/onlinePlayer.js"},
    {id: "Pickup", src:"model/entities/pickup.js"},
    {id: "WeaponPickup", src:"model/entities/weaponpickup.js"},
    {id: "Bullet", src:"model/weapons/bullet.js"},
    {id: "Weapon", src:"model/weapons/weapon.js"},
    {id: "Blaster", src:"model/weapons/blaster.js"},
    {id: "MachineGun", src:"model/weapons/machinegun.js"},
    {id: "Shotgun", src:"model/weapons/shotgun.js"},
    {id: "Block", src:"model/displaystuff/block.js"},
    {id: "Plant", src:"model/displaystuff/plant.js"},
    {id: "Noen", src:"model/displaystuff/neon.js"},
    {id: "Radar", src:"model/radar.js"},

    {id: "QuickText", src:"model/displaystuff/quickText.js"},

    // Sprites ----------------------------------------

    // Sounds ----------------------------------------
    {id: "Pew", src:"resources/sounds/pew.wav"},
    {id: "Boup", src:"resources/sounds/boup.wav"},
    {id: "Ping", src:"resources/sounds/ping.wav"},
    {id: "RadarSearch", src:"resources/sounds/radar.wav"},
    {id: "RadarWrong", src:"resources/sounds/radar_wrong.wav"},
    {id: "Kick", src:"resources/sounds/kick.wav"}

  ];
  queue.loadManifest(queue.manifest);

  function handleComplete() {
    console.log("Loading complete.");
    stage.removeChild(bar);
    stage.removeChild(txt);
    stage.update();
    game = new Game("game");
    resizeCanvas();
  }

  function handleFileLoad	(e) {
    nbLoaded ++;
    bar.graphics.s("#EEE").a(0, 0, 50, -Math.PI/2, (nbLoaded / queue.manifest.length) * (2 * Math.PI) - Math.PI/2).es();
    stage.update();
    console.log(e.item.id + " loaded.");
  }

  function handleFileError (e) {
    console.log(e.item.id + " failed.");
  }

  // to keep the canvas in full page size
  window.addEventListener('resize', resizeCanvas, false);
  function resizeCanvas() {
    if (!game) return;
    game.canvas.width = window.innerWidth;
    game.canvas.height = window.innerHeight;
  }
})();
