exports.makePlayerSmall = function (player) {
  const data = {
    position: player.position.elements,
    speed: player.speed,
    score: player.score,
    id: player.id
  };
  return data;
}

exports.randInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
