
var normal_constant = Math.PI / 2;

function big_partition(w,h, step)
{
  var big_partition = new Array();
  var i = -w / 2;
  var j = -h / 2;

  while(i < w / 2)
  {
    j = -h / 2;
    while(j < h / 2)
    {
      big_partition.push({x: i, y:j});
      j = j+step;
    }
    i = i+step;
  }
  return big_partition;
}

function add_segment(n, alpha, x, y) {
  if (!(x && y) && !(x === 0)){
    var last = this.partition[this.partition.length - 1];
  } else {
    var last = {x : x, y: y};
    this.breakpoint = this.partition.length;
  }
  var s = {
    x : this.step * Math.cos(alpha),
    y : this.step * Math.sin(alpha)
  };
  var normal = {
    x : Math.cos(alpha + normal_constant),
    y : Math.sin(alpha + normal_constant)
  };
  for(var i = 0; i < n; ++i) {
    this.partition_middle.push({
      x : last.x + s.x / 2,
      y : last.y + s.y / 2,
      normal : normal
    });
    last = {
      x : last.x + s.x,
      y : last.y + s.y
    };
    this.partition.push(last);
  }
  return this;
}

function drawLetter(canvas, segment) {
  canvas.style('#f00', 5);
  if (segment.breakpoint) {
    canvas.drawLine(segment.partition.slice(0, segment.breakpoint));
    canvas.drawLine(segment.partition.slice(segment.breakpoint, segment.partition.length));
  } else {
    canvas.drawLine(segment.partition);
  }
}

function calc_speed(segment, gamma, big_part, alpha) {
  var result = [], v;
  for(var i = 0; i<big_part.length; i++)
  {
    v = calc_v(big_part[i].x, big_part[i].y, gamma, segment.partition, alpha, segment.step);
    result.push(v);
  }
  return result;
}

function drawSpeed(canvas, speed, big_part) {

  canvas.style('#000', 1);

  canvas.drawLines(speed.map(function(v, i) {
    v = v.mult_by_scalar(0.03);
    return [big_part[i], {x: big_part[i].x + v.v[0], y: big_part[i].y + v.v[1]}];
  }));
}

function drawPhi(canvas, gamma, big_part, segment, alpha) {
  arr_phi = big_part.map(function(point) {
    return calc_phi(
      point.x, 
      point.y,
      gamma, 
      segment.partition,
      segment.partition_middle,
      alpha,
      segment.step
    );
  });
  canvas.drawField(big_part, arr_phi);
}

function drawPsi(canvas, gamma, big_part, segment, alpha) {
  arr_psi = big_part.map(function(point) {
    return calc_psi(
      point.x,
      point.y,
      gamma,
      segment.partition,
      segment.partition_middle,
      alpha,
      segment.step
    );
  });
  canvas.drawField(big_part, arr_psi);
}

function drawSpeedField(canvas, speed, big_part) {
  var speed_abs = speed.map(function(pointSpeed){
    return Math.sqrt(
      pointSpeed.v[0] * pointSpeed.v[0],
      pointSpeed.v[1] * pointSpeed.v[1]
    );
  });
  canvas.drawField(big_part, speed_abs);
}

function drawPressure(canvas, speed, big_part, alpha) {
  var v = [Math.cos(alpha), Math.sin(alpha)];
  var pressure = speed.map(function(point_speed) {
    return (1 - (point_speed.v[0] * point_speed.v[0] + point_speed.v[1] * point_speed.v[1]) /
      (v[0] * v[0] + v[1] * v[1]) );
  })
  canvas.drawField(big_part, pressure);
}
