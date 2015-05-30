
var normal_constant = Math.PI / 2;

function LetterBuilder(begin, step) {
  begin.corner = true;
  this.letter = {
    partition_middle: [],
    partition: [begin],
    step: step
  }
  this.letter.partition[0].corner = true;
}

LetterBuilder.prototype.getLetter = function() {
  return this.letter;
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
  return this;
}