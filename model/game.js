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
    const collidables = this.blocks.filter(b => !!b.hitbox);
    for (var player of this.players) {
      var deplacement = player.inputs.reduce((d,i) => d.add($V(i.direction).x(i.speed * i.delta / 1000)), $V([0,0]));
      player.inputs = [];
      player.position = player.position.add(deplacement);
      player.hitbox.pos = tools.toSAT(player.position);

      for (var collidable of collidables) {
        if (player.position.distanceFrom(collidable.position) > player.radius + collidable.radius) continue;
        const res = new SAT.Response();
        const test = (collidable.hitbox instanceof SAT.Circle ? SAT.testCircleCircle : SAT.testCirclePolygon);
        if (test(player.hitbox, collidable.hitbox, res)) {
          player.position = player.position.subtract($V([res.overlapV.x, res.overlapV.y]));
          player.hitbox.pos = tools.toSAT(player.position);
        }
      }
    }
  }

  /**
   * Transmits the game state to the players
   * @param {Number} delta : the number of ms since last update
   */
  netupdate(delta) {
    var data = {
      players: [],
      time: Date.now()
    }
    for (var player of this.players) {
      data.players.push(player.serialize());
    }
    this.io.to(this.id).emit("update", data);
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
