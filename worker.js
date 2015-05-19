
function Worker(letter, partition) {
  this.letter = letter;
  this.partition = partition;
  this.gamma0 = 1;
  this.alpha = 0;

  this.gamma = this.findGamma();
  this.speed = this.calcSpeed();
}

Worker.prototype.findVj = function(p, discrete_p, delta)
{ 
  var max_length = Math.max(
    Math.pow(p.x - discrete_p.x, 2) + Math.pow(p.y - discrete_p.y, 2),
    Math.pow(0.5 * delta, 2)
    );
  // max_length = Math.sqrt(max_length);
  var uj = (1.0 / (2 * Math.PI)) * ((discrete_p.y - p.y) / max_length);
  var vj = (1.0 / (2 * Math.PI)) * ((p.x - discrete_p.x) / max_length);
  // console.log(Math.pow(Math.pow(uj, 2) + Math.pow(vj, 2), 0.5))
  return [uj, vj];
}

Worker.prototype.findGamma = function()
{
  var system = [];
  var current_equation;
  var i, j;
  var v_inf = new Vector(2);
  var vj = new Vector(2);
  var normal = new Vector(2);
  v_inf.v = [Math.sin(this.alpha), Math.cos(this.alpha)];
  for(i = 0; i < this.letter.partition_middle.length; ++i) {
    normal.v = [this.letter.partition_middle[i].normal.x, this.letter.partition_middle[i].normal.y];
    current_equation = []
    for(j = 0; j < this.letter.partition.length; ++j) {
      vj.v = this.findVj(this.letter.partition_middle[i], this.letter.partition[j], this.letter.step);
      current_equation.push(vj.scalar(normal));
    }
    current_equation.push(-v_inf.scalar(normal))
    system.push(current_equation);
  }
  current_equation = [];
  for(j = 0; j < this.letter.partition.length; ++j) {
    current_equation.push(1);
  }
  current_equation.push(this.gamma0);
  system.push(current_equation);


  var m = new Matrix({m: this.letter.partition.length + 1, n: this.letter.partition_middle.length + 1});
  m.a = system;
  result = Gaus_method(m);

  return result;
}

Worker.prototype.findSpeed = function(point)
{
  // if (x > 0 && y > 300)
  // debugger
  var v = new Vector(2);
  v.v = [Math.cos(this.alpha), Math.sin(this.alpha)];
  var M = this.gamma.v.length;
  var result_vector = new Vector(2);
  var vj = new Vector(2);
  // var sum_gamma = 0;
  for(var i = 0; i<M; i++)
  {
    vj.v = this.findVj(point, this.letter.partition[i], this.letter.step);
    result_vector = result_vector.add(vj.mult_by_scalar(this.gamma.v[i]));
    // sum_gamma += this.gamma.v[i];
  }
  // console.log(sum_gamma);
  return v.substr(result_vector);
}

Worker.prototype.findPhi =function(point)
{
  var x = point.x, y = point.y;
  var s1 = 0;
  var s2 = 0;
  var result = 0;
  var count_gamma = this.gamma.v.length;
  // console.log(count_gamma, this.letter.partition_middle.length);
  var sum_all_gamma = 0;
  var log = 0;
  var result = 0;
  var sum_gamma;
  var phi;
  var v = [Math.cos(this.alpha), Math.sin(this.alpha)];
  for(var i = 0; i<count_gamma-1; i++)
  {
    sum_gamma = 0;
    for(var k = 0; k<=i; k++)
    {
      sum_gamma +=this.gamma.v[k];
    }
    // console.log(i);
    s1 = (x - this.letter.partition_middle[i].x)*(this.letter.partition[i + 1].y - this.letter.partition[i].y) 
    - (y - this.letter.partition_middle[i].y)*(this.letter.partition[i + 1].x - this.letter.partition[i].x);
    s2 = Math.pow(x - this.letter.partition_middle[i].x, 2) + Math.pow(y - this.letter.partition_middle[i].y, 2);
    result += (sum_gamma*s1)/(2*Math.PI*s2);
  }
  for(var j = 0; j<count_gamma; j++)
  {
    sum_all_gamma += this.gamma.v[j];
  }
  // log = Math.pow(Math.log(Math.pow(x - this.letter.partition[count_gamma-1].x, 2)+Math.pow(y - this.letter.partition[count_gamma-1].y, 2)), 0.5);
  atan = Math.atan2(
    (y - this.letter.partition[this.letter.partition.length - 1].y) ,
    (x - this.letter.partition[this.letter.partition.length - 1].x)
    );
  // atan = 1;
  phi = x*v[0] + y*v[1] + result +(sum_all_gamma*atan)/(2*Math.PI);
  return phi;
}

Worker.prototype.findPsi = function(point)
{
  var x = point.x, y = point.y;
  var s1 = 0;
  var s2 = 0;
  var result = 0;
  var count_gamma = this.gamma.v.length;
  var sum_all_gamma = 0;
  var log = 0;
  var result = 0;
  var sum_gamma;
  var psi;
  var v = [Math.cos(this.alpha), Math.sin(this.alpha)];
  for(var i = 0; i<count_gamma-1; i++)
  {
    sum_gamma = 0;
    for(var k = 0; k<=i; k++)
    {
      sum_gamma +=this.gamma.v[k];
    }
    // console.log(i);
    s1 = (x - this.letter.partition_middle[i].x)*(this.letter.partition[i + 1].x - this.letter.partition[i].x) 
    + (y - this.letter.partition_middle[i].y)*(this.letter.partition[i + 1].y - this.letter.partition[i].y);
    s2 = Math.pow(x - this.letter.partition_middle[i].x, 2) + Math.pow(y - this.letter.partition_middle[i].y, 2);
    result += (sum_gamma*s1)/(2*Math.PI*s2);
  }
  for(var j = 0; j<count_gamma; j++)
  {
    sum_all_gamma += this.gamma.v[j];
  }
  log = 0.5 * Math.log(
    Math.pow(x - this.letter.partition[this.letter.partition.length - 1].x, 2)
    + Math.pow(y - this.letter.partition[this.letter.partition.length - 1].y, 2)
    );
  // log = 1;
  psi = y*v[0] - x*v[1] + result +(sum_all_gamma*log)/(2*Math.PI);
  return psi;
}

Worker.prototype.calcSpeed = function() {
  return this.partition.map(this.findSpeed.bind(this));
}

Worker.prototype.getSpeedLines = function() {
  return this.speed.map(function(v, i) {
    v = v.mult_by_scalar(0.03);
    return [this.partition[i], {x: this.partition[i].x + v.v[0], y: this.partition[i].y + v.v[1]}];
  }.bind(this));
}

Worker.prototype.getPhiField = function() {
  return this.partition.map(this.findPhi.bind(this));
}

Worker.prototype.getPsiField = function() {
  return this.partition.map(this.findPsi.bind(this));
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
