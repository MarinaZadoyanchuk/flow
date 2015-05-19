
function Worker(letter, partition) {
  this.letter = letter;
  this.partition = partition;
  this.gamma0 = 1;
  this.alpha = 0;

  this.gamma = find_gamma(this.letter, this.alpha, this.gamma0);
  this.speed = this.calcSpeed();
}

Worker.prototype.calcSpeed = function() {
  return this.partition.map(function(point) {
    return calc_v(point.x, point.y, this.gamma, this.letter.partition, this.alpha, this.letter.step);
  }.bind(this));
}

Worker.prototype.getSpeedLines = function() {
  return this.speed.map(function(v, i) {
    v = v.mult_by_scalar(0.03);
    return [this.partition[i], {x: this.partition[i].x + v.v[0], y: this.partition[i].y + v.v[1]}];
  }.bind(this));
}

Worker.prototype.getPhiField = function() {
  return this.partition.map(function(point) {
    return calc_phi(
      point.x, 
      point.y,
      this.gamma, 
      this.letter.partition,
      this.letter.partition_middle,
      this.alpha,
      this.letter.step
    );
  }.bind(this));
}

Worker.prototype.getPsiField = function() {
  return this.partition.map(function(point) {
    return calc_psi(
      point.x,
      point.y,
      this.gamma,
      this.letter.partition,
      this.letter.partition_middle,
      this.alpha,
      this.letter.step
    );
  }.bind(this));
}

Worker.prototype.getSpeedField = function() {
  return this.speed.map(function(pointSpeed){
    return Math.sqrt(
      pointSpeed.v[0] * pointSpeed.v[0],
      pointSpeed.v[1] * pointSpeed.v[1]
    );
  }.bind(this));
}

Worker.prototype.getPressureField = function() {
  var v = [Math.cos(this.alpha), Math.sin(this.alpha)];
  return this.speed.map(function(point_speed) {
    return (1 - (point_speed.v[0] * point_speed.v[0] + point_speed.v[1] * point_speed.v[1]) /
      (v[0] * v[0] + v[1] * v[1]) );
  }.bind(this));
}
