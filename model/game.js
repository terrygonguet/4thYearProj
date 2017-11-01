const tools = require("../tools");
const SAT = require("sat");
const Block = require("./block");
const Plant = require("./plant");

class Game {

  static nextID () {
    return Game.currentID++;
  }

  constructor(io) {
    this.id         = Game.nextID();
    this.type       = "deathmatch";
    this.players    = [];
    this.blocks     = [];
    this.dimensions = [5000,5000];
    this.io         = io;

    this.generateBlocks();
  }

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

  update(delta) {
    var data = {
      players: [],
      time: Date.now()
    }
    for (var player of this.players) {
      data.players.push(player.serialize());
    }
    this.io.to(this.id).emit("update", data);
  }

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
  }

  removePlayer(player) {
    player.leave(this.id);
    this.players.splice(this.players.indexOf(player), 1);
    this.io.to(this.id).emit("playerleave", { id: player.id });
  }

  addBlock(block) {
    this.blocks.push(block);
  }

}
Game.currentID = 0;

module.exports = Game;
