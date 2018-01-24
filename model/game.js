const tools = require("../tools");
const SAT = require("sat");
const Block = require("./block");
const Plant = require("./plant");
const Bullet = require('./bullet');

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
    this.bullets    = [];
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
        if (this.players.length >= 1) {
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
        const blocks = this.blocks.filter(b => !!b.hitbox); // TODO cache result
        for (var player of this.players) {
          for (var input of player.inputs) {//.inputs.filter(i => i.id === id)) {
            var near =  blocks.filter(c => player.position.distanceFrom(c.position) <= player.radius + c.radius);
            player.updateAndCollide(input, this, near);
            if (!player.force && player.position.distanceFrom($V(input.position)) > 2) {
              player.force = true;
            }
          }
          player.clearInput();
        }
        const collidables = this.blocks.filter(b => !!b.hitbox).concat(this.players); // TODO cache
        for (var bullet of this.bullets) {
          if (bullet.toDie) {
            this.bullets.splice(this.bullets.indexOf(bullet), 1);
            continue;
          }
          // var near =  collidables.filter(c => bullet.position.distanceFrom(c.position) <= bullet.speed * delta + c.radius);
          bullet.updateAndCollide(delta/1000, this, collidables);
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
   * @param {Player} object the object that updated (player, bullet ...)
   * @param {Array} collidables an array of objects with a hitbox property
   */
  collide (object, collidables) {
    for (var collidable of collidables) {
      const res = new SAT.Response();
      const test = "test" +
        (object.hitbox instanceof SAT.Circle ? "Circle" : "Polygon") +
        (collidable.hitbox instanceof SAT.Circle ? "Circle" : "Polygon");
      if (object.isPlayer) {
        if (SAT[test](object.hitbox, collidable.hitbox, res)) {
          object.position = object.position.subtract($V([res.overlapV.x, res.overlapV.y]));
          object.hitbox.pos = tools.toSAT(object.position);
        }
      } else if (object.isBullet && !object.toDie) {
        if (SAT[test](object.hitbox, collidable.hitbox) && collidable.id !== object.playerid) {
          console.log(collidable.id + " " + object.playerid);
          object.toDie = true;
          break;
        }
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
        this.players.forEach(p => p.force = false);
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
    player.setPos($V([
      tools.randInt(-this.dimensions[0]/2, this.dimensions[0]/2),
      tools.randInt(-this.dimensions[1]/2, this.dimensions[1]/2)
    ]));

    player.emit("createarena", {
      blocks: this.blocks.map(b => b.serialize()),
      dimensions: this.dimensions,
      players: this.players.map(p => p.serialize())
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
    this.players = this.players.filter(p => p.id !== player.id);
    this.io.to(this.id).emit("playerleave", { id: player.id });
  }

  fireBullet(data) {
    this.io.to(this.id).emit("firebullet", data);
    const b = new Bullet(data.position, data.direction, data.speed, data.playerid, data.sound);
    this.bullets.push(b);
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
