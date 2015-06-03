
function Worker(params) {
  this.letter = params.letter;
  this.partition = params.partition;
  this.gamma0 = 1;
  this.alpha = params.angle || 0;

  this.whirls = [];

  this.gamma = this.findGamma();
  this.speed = this.calcSpeed();
}

Worker.prototype.findVj = function(p, discrete_p, delta)
{ 
  var max_length = Math.max(
    Math.pow(p.x - discrete_p.x, 2) + Math.pow(p.y - discrete_p.y, 2),
    Math.pow(0.5 * delta, 2)
    );
  var uj = -(1.0 / (2 * Math.PI)) * ((p.y - discrete_p.y) / max_length);
  var vj = (1.0 / (2 * Math.PI)) * ((p.x - discrete_p.x) / max_length);
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
    });

    var whirls_part = worker.whirls.map(function(whirl) {
      var vj = worker.findVj(whirl.location, middle_point, worker.letter.step);
      return math.multiply(vj, normal) * whirl.gamma;
    })

    free_terms.push(-math.multiply(v_inf, normal) - (whirls_part.length ? math.sum(whirls_part) : 0));
    return current_equation;
  })

  system.push(math.ones(this.letter.partition.length).toArray());
  var whirls_gammas = this.whirls.map(function(whirl) {
    return whirl.gamma;
  })
  free_terms.push(this.gamma0 - (whirls_gammas.length ? math.sum(whirls_gammas) : 0));

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
  for(var i = 0; i < this.whirls.length; ++i) {
    var vj = this.findVj(point, this.whirls[i].location, this.letter.step);
    result_vector = math.add(result_vector, math.multiply(vj, this.whirls[i].gamma));
  }


  return math.subtract(v_inf, result_vector).toArray();
}

Worker.prototype.findPhij = function(p, discrete_p) {
  return 1 / (2 * Math.PI) * Math.atan2(p.y - discrete_p.y, p.x - discrete_p.x);
}

Worker.prototype.findPhi =function(point)
{
  var v = [Math.cos(this.alpha), Math.sin(this.alpha)];

  var phi = math.multiply(v, [point.x, point.y]);

  for(var i = 0; i < this.letter.partition.length; ++i) {
    phi += this.gamma[i] * this.findPhij(point, this.letter.partition[i]);
  }

  for(var i = 0; i < this.whirls.length; ++i) {
    phi += this.whirls[i].gamma * this.findPhij(point, this.whirls[i].location);
  }

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
  return this.speed;
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

Worker.prototype.makeWhirls = function() {
  var whirls = [];
  for(var i = 0; i < this.letter.partition.length; ++i) {
    if (this.letter.partition[i].corner) {
      var whirl = {
        gamma: this.gamma[i],
        location: {
          x: this.letter.partition[i].x,
          y: this.letter.partition[i].y
        },
        speed: this.findSpeed(this.letter.partition[i])
      };
      whirls.push(whirl);
    }
  }
  this.whirls = this.whirls.concat(whirls);
}

Worker.prototype.makeStep = function() {
  for(var i = 0; i < this.whirls.length; ++i) {
    var speed = this.findSpeed(this.whirls[i].location);
    this.whirls[i].location.x += speed[0] / 30;
    this.whirls[i].location.y += speed[1] / 30;
  }

  this.gamma = this.findGamma();
  this.speed = this.calcSpeed();
}
