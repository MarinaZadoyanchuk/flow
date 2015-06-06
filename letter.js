
var normal_constant = Math.PI / 2;

var intersects = function(s0, s1) {
  v1 = (s1[1].x - s1[0].x) * (s0[0].y - s1[0].y) - (s1[1].y - s1[0].y) * (s0[0].x - s1[0].x);
  v2 = (s1[1].x - s1[0].x) * (s0[1].y - s1[0].y) - (s1[1].y - s1[0].y) * (s0[1].x - s1[0].x);
  v3 = (s0[1].x - s0[0].x) * (s1[0].y - s0[0].y) - (s0[1].y - s0[0].y) * (s1[0].x - s0[0].x);
  v4 = (s0[1].x - s0[0].x) * (s1[1].y - s0[0].y) - (s0[1].y - s0[0].y) * (s1[1].x - s0[0].x);
  return (v1 * v2 < 0) && (v3 * v4 < 0);
};

function LetterBuilder(begin, step) {
  this.letter = {
    partition_middle: [],
    partition: [begin],
    step: step,
    segments: [],
    corners: [0]
  }
  this.refreshBorders(begin);

  this.letter.inBorder = function(point, delta) {
    return (
      (point.x > this.borders.left - delta)
      && (point.x < this.borders.right + delta)
      && (point.y < this.borders.top + delta)
      && (point.y > this.borders.bottom - delta)
    );
  };

  this.letter.intersects = function(segment) {
    for(var i = 0; i < this.segments.length; ++i) {
      if (intersects(segment, this.segments[i])) {
        return true;
      }
    }
    return false;
  }
}

LetterBuilder.prototype.getLetter = function() {
  return this.letter;
}

LetterBuilder.prototype.refreshBorders = function(point) {
  if (!this.letter.borders) {
    this.letter.borders = {
      top: point.y,
      bottom: point.y,
      left: point.x,
      right: point.x
    };
  } else {
    this.letter.borders = {
      top: Math.max(this.letter.borders.top, point.y),
      bottom: Math.min(this.letter.borders.bottom, point.y),
      right: Math.max(this.letter.borders.right, point.x),
      left: Math.min(this.letter.borders.left, point.x)
    };
  }
}

LetterBuilder.prototype.addSegment = function(n, alpha, x, y) {
  if (!(x && y) && !(x === 0)){
    var last = this.letter.partition[this.letter.partition.length - 1];
  } else {
    var last = {x : x, y: y};
    this.letter.breakpoint = this.letter.partition.length;
  }
  var segment = [last];
  var s = {
    x : this.letter.step * Math.cos(alpha),
    y : this.letter.step * Math.sin(alpha)
  };
  var normal = {
    x : Math.cos(alpha + normal_constant),
    y : Math.sin(alpha + normal_constant)
  };
  for(var i = 0; i < n; ++i) {
    this.letter.partition_middle.push({
      x : last.x + s.x / 2,
      y : last.y + s.y / 2,
      normal : normal
    });
    last = {
      x : last.x + s.x,
      y : last.y + s.y
    };
    this.letter.partition.push(last);
  }
  this.letter.corners.push(this.letter.partition.length - 1);
  this.refreshBorders(last);
  segment.push(last);
  this.letter.segments.push(segment);

  return this;
}