const tools = require("../../tools");
const SAT = require("sat");
const Block = require("../block");
const Plant = require("../plant");
const Bullet = require('../bullet');
const Pickup = require('../pickup');
const Game = require('./game');

class Deathmatch extends Game {
  /**
   * @param {IO} io+
   */
  constructor(io) {
    super({
      io,
      type: 'Deathmatch',
      maxplayers: 8,
      dimensions: [5000,5000],
      states: {
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
      },
    });
    this.countdown         = 0;
    this.winner            = null;

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
        this.addChild(new Plant({
          id:tools.nextID(),
          position: {
            x: tools.randInt(-this.dimensions[0]/2, this.dimensions[0]/2),
            y: tools.randInt(-this.dimensions[1]/2, this.dimensions[1]/2)
          },
          radiusmin: Math.random() * 5 + 10,
          radiusmax: Math.random() * 20 + 60
        }));
      else
        this.addChild(new Block({
          id:tools.nextID(),
          position: {
            x: tools.randInt(-this.dimensions[0]/2, this.dimensions[0]/2),
            y: tools.randInt(-this.dimensions[1]/2, this.dimensions[1]/2)
          },
          dimensions: {
            x: tools.randInt(20, 200),
            y: tools.randInt(20, 200)
          },
          angle: Math.random() * Math.PI * 2,
        }));
    }
  }

  /**
   * Updates the game state
   * @param {Number} delta : the number of ms since last update
   */
  update(delta) {
    super.update(delta);
    switch (this.state) {
      case "waiting":
        if (this.players.length >= 2) {
          this.state = "starting";
          this.countdown = 3.5;
        }
        break;
      case "starting":
        if ((this.countdown -= (delta/1000)) <= 0) {
          this.state = "running";
        }
        break;
      case "running":
        this.winner = this.players.filter(p => p.score !== 0);
        if (this.winner.length === 1) {
          this.state = "ending";
          this.countdown = 3;
          this.ingame = false;
        }
        this.objects = this.objects.filter(o => !o.toDie);
        const collidables = this.objects.filter(b => !!b.hitbox).concat(this.players);
        this.objects.forEach(o => {
          if (o.updateAndCollide)
            o.updateAndCollide(delta, this, collidables);
          else if (o.update)
            o.update(delta);
        });
        for (var player of this.players) {
          for (var input of player.inputs) {
            var near =  collidables.filter(c => player.position.distanceFrom(c.position) <= player.radius + c.radius);
            player.updateAndCollide(input, this, near);
            if (!player.force && player.position.distanceFrom($V(input.position)) > 2) {
              player.force = true;
              break;
            }
          }
          player.clearInput();
        }
        if (this.objects.filter(o => o instanceof Pickup).length <= 10 &&  Math.random()<0.001) {
          var p = new Pickup({
            id: "pickup" + tools.nextID(),
            position: {
              x: tools.randInt(-this.dimensions[0]/2, this.dimensions[0]/2),
              y: tools.randInt(-this.dimensions[1]/2, this.dimensions[1]/2)
            },
            name: "MachineGun"
          });
          this.addChild(p);
          // this.io.to(this.id).emit("createobject", p.serialize());
        }
        break;
      case "ending":
        if ((this.countdown -= (delta/1000)) <= 0) {
          this.state = "waiting";
          this.io.to(this.id).emit("gotomessage", {
            title: this.states["waiting"].title,
            message: this.states["waiting"].message.replace("<players>", this.players.length)
          });
          this.reset(null, this.generateBlocks.bind(this));
        }
        break;
    }
  }

  /**
   * collides player with the collidables
   * @param {Player} object the object that updated (player, bullet ...)
   * @param {Array} collidables an array of objects with a hitbox property
   */
  collide (object, collidables) {
    super.collide(object, collidables);
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
          message: this.states["ending"].message.replace("<name>", this.winner[0].name)
        });
        break;
    }
  }

  /**
   * Make the player join this room and sends him the arena
   * @param {Player} player
   */
  addPlayer(player) {
    super.addPlayer(player);
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

}

module.exports = Deathmatch;
