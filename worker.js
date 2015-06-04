
function Worker(params) {
  this.letter = params.letter;
  this.partition = params.partition;
  this.gamma0 = 1;
  this.alpha = params.angle || 0;

  this.whirls = [];

  this.gamma = this.findGamma();
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

Worker.prototype.findPsij = function(p, discrete_p, delta) {
  var diff = [p.x - discrete_p.x, p.y - discrete_p.y];
  return Math.log(Math.max(delta, math.sqrt(math.multiply(diff, diff))));
}

Worker.prototype.findPsi = function(point)
{
  var v = [Math.cos(this.alpha), Math.sin(this.alpha)];

  var psi = point.y * v[0] - point.x * v[1];
  for(var i = 0; i < this.letter.partition.length; ++i) {
    psi -= this.gamma[i] * this.findPsij(this.letter.partition[i], point, this.letter.step * 0.5);
   }

   for(var i = 0; i < this.whirls.length; ++i) {
     psi -= this.whirls[i].gamma * this.findPsij(this.whirls[i].location, point, this.letter.step * 0.5);
   }
  // for(var i = 0; i < this.letter.partition.length; ++i) {
  //   psi -= this.gamma[i] * this.findPsij(point, this.letter.partition[i], this.letter.step * 0.5);
  // }

  // for(var i = 0; i < this.whirls.length; ++i) {
  //   psi -= this.whirls[i].gamma * this.findPsij(point, this.whirls[i].location, this.letter.step * 0.5);
  // }

  return psi;
}

Worker.prototype.calcSpeed = function() {
  return this.partition.map(this.findSpeed.bind(this));
}

Worker.prototype.getSpeedLines = function() {
  this.requireSpeedCalc();
  return this.speed;
}

Worker.prototype.getPhiField = function() {
  return this.partition.map(this.findPhi.bind(this));
}

Worker.prototype.getPsiField = function() {
  return this.partition.map(this.findPsi.bind(this));
}

Worker.prototype.getSpeedField = function() {
  this.requireSpeedCalc();
  return this.speed.map(function(pointSpeed){
    return math.sqrt(math.multiply(pointSpeed, pointSpeed));
  });
}

Worker.prototype.getPressureField = function() {
  this.requireSpeedCalc();
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
  var timeCoeff = 30;
  for(var i = 0; i < this.whirls.length; ++i) {
    var speed = this.findSpeed(this.whirls[i].location);
    if (this.letter.inBorder(this.whirls[i].location, this.letter.step)) {
      var newPoint = {
        x: this.whirls[i].location.x + speed[0] / timeCoeff,
        y: this.whirls[i].location.y + speed[1] / timeCoeff
      };
      if (this.letter.intersects([this.whirls[i].location, newPoint])) {
        this.whirls[i].location = {
          x: this.whirls[i].location.x - speed[0] / timeCoeff,
          y: this.whirls[i].location.y - speed[1] / timeCoeff
        };
      } else {
        this.whirls[i].location = newPoint;
      }
    } else {
      this.whirls[i].location.x += speed[0] / timeCoeff;
      this.whirls[i].location.y += speed[1] / timeCoeff;
    }
  }

  this.gamma = this.findGamma();
  this.speed = null;
}

Worker.prototype.requireSpeedCalc = function() {
  if(!this.speed) {
    this.speed = this.calcSpeed();
  }
}