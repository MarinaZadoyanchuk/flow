
function Worker(params) {
  this.letter = params.letter;
  this.gamma0 = 1;
  this.alpha = params.angle || 0;

  this.whirls = [];

  this.gamma = this.findGamma();

  this.partitionSpeedFields = {};

  this.timeStep = 0.04;
}

Worker.prototype.findVj = function(p, discrete_p, delta)
{ 
  var max_length = Math.max(
    math.square(p.x - discrete_p.x) + math.square(p.y - discrete_p.y),
    math.square(0.5 * delta)
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

Worker.prototype.phiJ = function(p, discrete_p) {
  return 0.5 / (2 * Math.PI) * Math.atan2(p.y - discrete_p.y, p.x - discrete_p.x);
}

Worker.prototype.findPhi = function(p)
{
  var findPart = function(start, end) {
    var result = 0;
    var sumGamma = 0;
    for(var i = start; i < end - 1; i++)
    {
      sumGamma += this.gamma[i];
      var edgeNext = this.letter.partition[i + 1];
      var middle = this.letter.partition_middle[i];
      var edge = this.letter.partition[i];
      var s1 = (p.x - middle.x) * (edgeNext.y - edge.y) - (p.y - middle.y) * (edgeNext.x - edge.x);
      var s2 = math.max(math.square(this.letter.step), math.square(p.x - middle.x) + math.square(p.y - middle.y));
      result += (sumGamma * s1) / (2 * Math.PI * s2);
    }
    var last = this.letter.partition[end - 1];
    sumGamma += this.gamma[end - 1];

    result += sumGamma * this.phiJ(p, last);
    return result;
  };

  findPart = findPart.bind(this);

  var v = [Math.cos(this.alpha), Math.sin(this.alpha)];
  var phi = p.x * v[0] + p.y * v[1];
  if (this.letter.breakpoint) {
    phi += findPart(0, this.letter.breakpoint) + findPart(this.letter.breakpoint, this.gamma.length);
  } else {
    phi += findPart(0, this.gamma.length);
  }


  for(var i = 0; i < this.whirls.length; ++i) {
    phi += this.whirls[i].gamma * this.phiJ(p, this.whirls[i].location);
  }

  return phi;
}

Worker.prototype.psiJ = function(p, discrete_p) {
  var diff = [p.x - discrete_p.x, p.y - discrete_p.y];
  return 0.5 * Math.log(math.multiply(diff, diff)) / (2 * Math.PI);
}

Worker.prototype.findPsi = function(p)
{
  var findPart = function(start, end) {
    var result = 0;
    var sumGamma = 0;
    for(var i = start; i < end - 1; i++)
    {
      sumGamma += this.gamma[i];
      var edgeNext = this.letter.partition[i + 1];
      var middle = this.letter.partition_middle[i];
      var edge = this.letter.partition[i];
      var s1 = (p.x - middle.x) * (edgeNext.x - edge.x) + (p.y - middle.y) * (edgeNext.y - edge.y);
      var s2 = math.max(math.square(this.letter.step), math.square(p.x - middle.x) + math.square(p.y - middle.y));
      result += (sumGamma * s1) / (2 * Math.PI * s2);
    }
    var last = this.letter.partition[end - 1];
    sumGamma += this.gamma[end - 1];

    result += sumGamma * this.psiJ(p, last);
    return result;
  };

  findPart = findPart.bind(this);

  var v = [Math.cos(this.alpha), Math.sin(this.alpha)];
  var psi = p.y * v[0] - p.x * v[1];
  if (this.letter.breakpoint) {
    psi += findPart(0, this.letter.breakpoint) + findPart(this.letter.breakpoint, this.gamma.length);
  } else {
    psi += findPart(0, this.gamma.length);
  }

  for(var i = 0; i < this.whirls.length; ++i) {
    psi += this.whirls[i].gamma * this.psiJ(p, this.whirls[i].location);
  }

  return psi;
}

Worker.prototype.calcSpeed = function(partition) {
  return partition.map(this.findSpeed.bind(this));
}

Worker.prototype.getSpeedLines = function(partition) {
  this.requireSpeedCalc(partition);
  return this.partitionSpeedFields[partition.step];
}

Worker.prototype.getPhiField = function(partition) {
  return partition.map(this.findPhi.bind(this));
}

Worker.prototype.getPsiField = function(partition) {
  return partition.map(this.findPsi.bind(this));
}

Worker.prototype.getSpeedField = function(partition) {
  this.requireSpeedCalc(partition);
  return this.partitionSpeedFields[partition.step].map(function(pointSpeed){
    return math.sqrt(math.multiply(pointSpeed, pointSpeed));
  });
}

Worker.prototype.getPressureField = function(partition) {
  this.requireSpeedCalc(partition);
  var v_inf = [Math.cos(this.alpha), Math.sin(this.alpha)];
  var result = [];
  for (var i = 0; i < partition.length; ++i) {
    var pointSpeed = this.partitionSpeedFields[partition.step][i];
    result.push(
      1 - math.multiply(pointSpeed, pointSpeed) / math.multiply(v_inf, v_inf) -
      1 / math.multiply(v_inf, v_inf) * this.getPhiDeriv(partition[i])
    );
  }
  return result;
}

Worker.prototype.makeWhirls = function() {
  var whirls = [];
  for(var j = 0; j < this.letter.corners.length; ++j) {
    var i = this.letter.corners[j];
    var whirl = {
      gamma: this.gamma[i],
      location: {
        x: this.letter.partition[i].x,
        y: this.letter.partition[i].y
      },
      speed: this.findSpeed(this.letter.partition[i])
    };
    whirls.push(whirl);
    this.letter.partition[i].lastWhirl = whirl;
  }
  this.whirls = this.whirls.concat(whirls);
}

Worker.prototype.makeStep = function() {
  for(var i = 0; i < this.whirls.length; ++i) {
    var speed = this.findSpeed(this.whirls[i].location);
    if (this.letter.inBorder(this.whirls[i].location, this.letter.step)) {
      var newPoint = {
        x: this.whirls[i].location.x + speed[0] * this.timeStep,
        y: this.whirls[i].location.y + speed[1] * this.timeStep
      };
      if (this.letter.intersects([this.whirls[i].location, newPoint])) {
        
      } else {
        this.whirls[i].location = newPoint;
      }
    } else {
      this.whirls[i].location.x += speed[0] * this.timeStep;
      this.whirls[i].location.y += speed[1] * this.timeStep;
    }
  }
  
  this.previousGamma = this.gamma;
  this.gamma = this.findGamma();
  this.partitionSpeedFields = {};
}

Worker.prototype.requireSpeedCalc = function(partition) {
  if(!this.partitionSpeedFields[partition.step]) {
    this.partitionSpeedFields[partition.step] = this.calcSpeed(partition);
  }
}

Worker.prototype.getLetterWhirls = function() {
  var gamma = this.gamma;
  return this.letter.partition.map(function(point, i) {
    return {
      location: point,
      gamma: gamma[i]
    }
  });
}

Worker.prototype.getPhiDeriv = function(p) {
  return 0;
  if (this.whirls.length === 0) {
    return 0;
  }
  var findPart = function(start, end) {
    var result = 0;
    var sumGamma = 0;
    for(var i = start; i < end - 1; i++)
    {
      sumGamma += (this.gamma[i] - this.previousGamma[i]) / this.timeStep;
      var next = this.letter.partition[i + 1];
      var current = this.letter.partition[i];
      result += sumGamma * math.multiply(
        this.findVj(p, current, this.letter.step), 
        [next.x - current.x, next.y - current.y]
      );
    }
    return result;
  };

  findPart = findPart.bind(this);

  var result = 0;
  if (this.letter.breakpoint) {
    result += findPart(0, this.letter.breakpoint) + findPart(this.letter.breakpoint, this.gamma.length);
  } else {
    result += findPart(0, this.gamma.length);
  }

  for (var j = 0; j < this.letter.corners.length; ++j) {
    var i = this.letter.corners[j];
    var edgePoint = this.letter.partition[i];
    var whirl = edgePoint.lastWhirl;
    result += whirl.gamma / this.timeStep * math.multiply(
      this.findVj(p, edgePoint, this.letter.step),
      [whirl.location.x - edgePoint.x, whirl.location.y - edgePoint.y]
    );
  }
  result /= 2 * Math.PI;

  for (var i = 0; i < this.whirls.length; ++i) {
    result -= (this.whirls[i].gamma * math.multiply(this.findSpeed(this.whirls[i].location),
      this.findVj(p, this.whirls[i].location, this.letter.step)));
  }


  return result;
}
