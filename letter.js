
var normal_constant = Math.PI / 2;

function LetterBuilder(begin, step) {
  begin.corner = true;
  this.letter = {
    partition_middle: [],
    partition: [begin],
    step: step
  }
  this.letter.partition[0].corner = true;
  this.refreshBorders(begin);
  
  this.letter.inBorder = function(point, delta) {
    return (
      (point.x > this.borders.left - delta)
      && (point.x < this.borders.right + delta)
      && (point.y < this.borders.top + delta)
      && (point.y > this.borders.bottom - delta)
    );
  };
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
  this.letter.partition[this.letter.partition.length - 1].corner = true;
  this.refreshBorders(last);

  return this;
}