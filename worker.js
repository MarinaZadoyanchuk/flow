
function Worker(params) {
  this.letter = params.letter;
  this.partition = params.partition;
  this.gamma0 = 1;
  this.alpha = params.angle || 0;

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
  var uj = -(1.0 / (2 * Math.PI)) * ((p.y - discrete_p.y) / max_length);
  var vj = (1.0 / (2 * Math.PI)) * ((p.x - discrete_p.x) / max_length);
  // console.log(Math.pow(Math.pow(uj, 2) + Math.pow(vj, 2), 0.5))
  return [uj, vj];
}

Worker.prototype.findGamma = function()
{
  var free_terms = [];
  var worker = this;
  var v_inf = [Math.cos(this.alpha), Math.sin(this.alpha)];

  var system = this.letter.partition_middle.map(function(middle_point) {

    var normal = [middle_point.normal.x, middle_point.normal.y];

    var current_equation = worker.letter.partition.map(function(edge_point) {
      var vj = worker.findVj(edge_point, middle_point, worker.letter.step);
      return math.multiply(vj, normal);
    })

    free_terms.push(-math.multiply(v_inf, normal));
    return current_equation;
  })

  system.push(math.ones(this.letter.partition.length).toArray());
  free_terms.push(this.gamma0);

  return math.inv(math.matrix(system)).multiply(free_terms).toArray();
}

Worker.prototype.findSpeed = function(point)
{

  var v_inf = [Math.cos(this.alpha), Math.sin(this.alpha)];
  var result_vector = math.zeros(2);

  for(var i = 0; i < this.letter.partition.length; i++)
  {
    var vj = this.findVj(point, this.letter.partition[i], this.letter.step);
    result_vector = math.add(result_vector, math.multiply(vj, this.gamma[i]));

  }
  return math.subtract(v_inf, result_vector).toArray();
}

Worker.prototype.findPhi =function(point)
{
  var x = point.x, y = point.y;
  var s1 = 0;
  var s2 = 0;
  var result = 0;
  var count_gamma = this.gamma.length;
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
      sum_gamma +=this.gamma[k];
    }
    // console.log(i);
    s1 = (x - this.letter.partition_middle[i].x)*(this.letter.partition[i + 1].y - this.letter.partition[i].y) 
    - (y - this.letter.partition_middle[i].y)*(this.letter.partition[i + 1].x - this.letter.partition[i].x);
    s2 = Math.pow(x - this.letter.partition_middle[i].x, 2) + Math.pow(y - this.letter.partition_middle[i].y, 2);
    result += (sum_gamma*s1)/(2*Math.PI*s2);
  }
  for(var j = 0; j<count_gamma; j++)
  {
    sum_all_gamma += this.gamma[j];
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
  var count_gamma = this.gamma.length;
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
      sum_gamma +=this.gamma[k];
    }
    // console.log(i);
    s1 = (x - this.letter.partition_middle[i].x)*(this.letter.partition[i + 1].x - this.letter.partition[i].x) 
    + (y - this.letter.partition_middle[i].y)*(this.letter.partition[i + 1].y - this.letter.partition[i].y);
    s2 = Math.pow(x - this.letter.partition_middle[i].x, 2) + Math.pow(y - this.letter.partition_middle[i].y, 2);
    result += (sum_gamma*s1)/(2*Math.PI*s2);
  }
  for(var j = 0; j<count_gamma; j++)
  {
    sum_all_gamma += this.gamma[j];
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
    if(math.norm(v) > 10) {
      return [0, 0];
    }
    return math.multiply(v, 0.03);
  });
}

Worker.prototype.getPhiField = function() {
  return this.partition.map(this.findPhi.bind(this));
}

Worker.prototype.getPsiField = function() {
  return this.partition.map(this.findPsi.bind(this));
}

Worker.prototype.getSpeedField = function() {
  return this.speed.map(function(pointSpeed){
    return math.sqrt(math.multiply(pointSpeed, pointSpeed));
  });
}

Worker.prototype.getPressureField = function() {
  var v_inf = [Math.cos(this.alpha), Math.sin(this.alpha)];
  return this.speed.map(function(pointSpeed) {
    return 1 - math.multiply(pointSpeed, pointSpeed) / math.multiply(v_inf, v_inf);
  });
}
