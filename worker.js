
function Worker(canvas, letter) {

}


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

function calc_speed(letter, gamma, big_part, alpha) {
  var result = [], v;
  for(var i = 0; i<big_part.length; i++)
  {
    v = calc_v(big_part[i].x, big_part[i].y, gamma, letter.partition, alpha, letter.step);
    result.push(v);
  }
  return result;
}

function getSpeedLines(speed, big_part) {

  return speed.map(function(v, i) {
    v = v.mult_by_scalar(0.03);
    return [big_part[i], {x: big_part[i].x + v.v[0], y: big_part[i].y + v.v[1]}];
  });
}

function getPhiField(gamma, big_part, letter, alpha) {
  return big_part.map(function(point) {
    return calc_phi(
      point.x, 
      point.y,
      gamma, 
      letter.partition,
      letter.partition_middle,
      alpha,
      letter.step
    );
  });
}

function getPsiField(gamma, big_part, letter, alpha) {
  return big_part.map(function(point) {
    return calc_psi(
      point.x,
      point.y,
      gamma,
      letter.partition,
      letter.partition_middle,
      alpha,
      letter.step
    );
  });
}

function getSpeedField(speed, big_part) {
  return speed.map(function(pointSpeed){
    return Math.sqrt(
      pointSpeed.v[0] * pointSpeed.v[0],
      pointSpeed.v[1] * pointSpeed.v[1]
    );
  });
}

function getPressureField(speed, big_part, alpha) {
  var v = [Math.cos(alpha), Math.sin(alpha)];
  return speed.map(function(point_speed) {
    return (1 - (point_speed.v[0] * point_speed.v[0] + point_speed.v[1] * point_speed.v[1]) /
      (v[0] * v[0] + v[1] * v[1]) );
  })
}
