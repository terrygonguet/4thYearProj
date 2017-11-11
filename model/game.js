const tools = require("../tools");
const SAT = require("sat");
const Block = require("./block");
const Plant = require("./plant");

class Game {

  /**
   * @return {Number} the next unique ID
   */
  static nextID () {
    return Game.currentID++;
  }

  /**
   * @param {IO} io
   */
  constructor(io) {
    this.id         = Game.nextID();
    this.type       = "deathmatch";
    this.players    = [];
    this.blocks     = [];
    this.dimensions = [5000,5000];
    this.io         = io;
    this.countdown  = 0;
    this.ingame     = false;
    this.state      = "waiting"; // enum : { "waiting", "starting", "running", "ending" }
    this.states     = {
      waiting: {
        type: "message",
        title: "Waiting for players",
        message: "<players> in game"
      },
      starting: {
        type: "message",
        title: "Starting in",
        message: "<countdown>"
      },
      running: {
        type: "game"
      },
      ending: {
        type: "message",
        title: "Game Over",
        message: "<name> won !"
      }
    };

    this.generateBlocks();
  }

  /**
   * Creates blocks and bushes at random
   * @param {Number} nbBlocks : Number of objects
   * @param {Number} bushChance : Proportion of bushes [0,1]
   */
  generateBlocks(nbBlocks=150, bushChance=0.2) {
    for (var i = 0; i < nbBlocks; i++) {
      if (Math.random() < bushChance)
        this.addBlock(new Plant(
          "p"+i,
          $V([
            tools.randInt(-this.dimensions[0]/2, this.dimensions[0]/2),
            tools.randInt(-this.dimensions[1]/2, this.dimensions[1]/2)
          ]),
          Math.random() * 5 + 10,
          Math.random() * 20 + 60
        ));
      else
        this.addBlock(new Block(
          "b"+i,
          $V([
            tools.randInt(-this.dimensions[0]/2, this.dimensions[0]/2),
            tools.randInt(-this.dimensions[1]/2, this.dimensions[1]/2)
          ]),
          $V([ tools.randInt(20, 200), tools.randInt(20, 200) ]),
          Math.random() * Math.PI * 2
        ));
    }
  }

  /**
   * Updates the game state
   * @param {Number} delta : the number of ms since last update
   */
  update(delta) {
    switch (this.state) {
      case "waiting":
        if (this.players.length >= 3) {
          this.state = "starting";
          this.countdown = 5;
        }
        break;
      case "starting":
        if ((this.countdown -= (delta/1000)) <= 0) {
          this.state = "running";
          this.countdown = 60;
        }
        break;
      case "running":
        if ((this.countdown -= (delta/1000)) <= 0) {
          this.state = "ending";
          this.countdown = 5;
          this.ingame = false;
        }
        const collidables = this.blocks.filter(b => !!b.hitbox);
        for (var player of this.players) {
          var id;
          player.inputs[0] && (id = player.inputs[0].id);
          for (var input of player.inputs.filter(i => i.id === id)) {
            player.position = player.position.add($V(input.direction).x(input.speed * input.delta / 1000));
            player.hitbox.pos = tools.toSAT(player.position);
            this.collide(player, collidables.filter(c => player.position.distanceFrom(c.position) <= player.radius + c.radius));
            player.position = tools.clampVect(player.position, this.dimensions);
          }
          player.inputs = player.inputs.filter(i => i.id !== id);
          player.currentID = id;
        }
        break;
      case "ending":
        if ((this.countdown -= (delta/1000)) <= 0) {
          this.state = "waiting";
          this.io.to(this.id).emit("gotomessage", {
            title: this.states["waiting"].title,
            message: this.states["waiting"].message.replace("<players>", this.players.length)
          });
        }
        break;
    }
  }

  // TODO
  switchToState(state) {
    this.state = state;
    switch (this.states[state].type) {
      case "message":

        break;
    }
  }

  // TODO
  updateState() {

  }

  /**
   * collides player with the collidables
   * @param {Player} player
   * @param {Array} collidables an array of objects with a hitbox property
   */
  collide (player, collidables) {
    for (var collidable of collidables) {
      const res = new SAT.Response();
      const test = (collidable.hitbox instanceof SAT.Circle ? SAT.testCircleCircle : SAT.testCirclePolygon);
      if (test(player.hitbox, collidable.hitbox, res)) {
        player.position = player.position.subtract($V([res.overlapV.x, res.overlapV.y]));
        player.hitbox.pos = tools.toSAT(player.position);
      }
    }
  }

  /**
   * Transmits the game state to the players
   * @param {Number} delta : the number of ms since last update
   */
  netupdate(delta) {

    switch (this.state) {
      case "waiting":

        break;
      case "starting":
        this.io.to(this.id).emit("gotomessage", {
          title: this.states["starting"].title,
          message: this.states["starting"].message.replace("<countdown>", parseInt(this.countdown))
        });
        break;
      case "running":
        if (!this.ingame) {
          this.ingame = true;
          this.io.to(this.id).emit("gotogame");
        }
        var data = {
          players: [],
          time: Date.now()
        }
        for (var player of this.players) {
          data.players.push(player.serialize());
        }
        this.io.to(this.id).emit("update", data);
        break;
      case "ending":
        this.io.to(this.id).emit("gotomessage", {
          title: this.states["ending"].title,
          message: this.states["ending"].message.replace("<name>", "someone")
        });
        break;
    }
  }

  /**
   * Make the player join this room and sends him the arena
   * @param {Player} player
   */
  addPlayer(player) {
    this.players.push(player);
    player.game && player.game.removePlayer(player);
    player.join(this.id);
    player.game = this;

    player.emit("createarena", {
      blocks: this.blocks.map(b => b.serialize()),
      dimensions: this.dimensions,
      players: this.players.map(p => p.serialize())
    });
    player.position = $V([
      tools.randInt(-this.dimensions[0]/2, this.dimensions[0]/2),
      tools.randInt(-this.dimensions[1]/2, this.dimensions[1]/2)
    ]);
    player.force = true;
    player.emit("update", {
      players: [ player.serialize() ],
      time: Date.now()
    });

    switch (this.state) {
      case "waiting":
        this.io.to(this.id).emit("gotomessage", {
          title: this.states["waiting"].title,
          message: this.states["waiting"].message.replace("<players>", this.players.length)
        });
        break;
      case "starting":
        break;
      case "running":
        player.emit("gotogame");
        break;
      case "ending":
        break;
    }
  }

  /**
   * Make player leave and cleans up
   * @param {Player} player
   */
  removePlayer(player) {
    player.leave(this.id);
    this.players.splice(this.players.indexOf(player), 1);
    this.io.to(this.id).emit("playerleave", { id: player.id });
  }

  /**
   * Adds a block to the Arena
   * @param {Block|Plant} block
   */
  addBlock(block) {
    this.blocks.push(block);
  }

}
Game.currentID = 0;

module.exports = Game;
