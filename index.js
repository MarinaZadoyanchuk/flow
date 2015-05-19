
function createPartition(w,h, step)
{
  var partition = new Array();
  var i = -w / 2;
  var j = -h / 2;

  while(i < w / 2)
  {
    j = -h / 2;
    while(j < h / 2)
    {
      partition.push({x: i, y:j});
      j = j+step;
    }
    i = i+step;
  }
  return partition;
}


function MainController() {

    var canvas = (new Canvas("first_canvas"));

    var z = (new LetterBuilder({x: 0, y: 0.5}, 0.07))
    .addSegment(10, 0)
    .addSegment(15, Math.PI * 5 / 4)
    .addSegment(10, 0)
    .getLetter();
    
    var t = (new LetterBuilder({x: -0.5, y: 0.5}, 0.05))
    .addSegment(5, Math.PI / 2)
    .addSegment(20, 0)
    .addSegment(5, -Math.PI / 2)
    .addSegment(20, -Math.PI / 2, 0, 0.8)
    .getLetter();
    
    var letter = t;
    var partition = createPartition(canvas.width(), canvas.height(), 20 / canvas.ratio);

    var worker = new Worker(letter, partition);
    var speedLines = worker.getSpeedLines()
    var field;

    var redraw = function() {
        canvas.clear()
        if (field) {
            canvas.drawField(partition, field);
        }
        if (speedLines) {
            canvas.drawLines(speedLines);
        }
        canvas.drawLines(worker.getSpeedLines());
        canvas.drawAxis();
        canvas.drawLetter(letter);
    }

    this.setField = function(fieldName) {
        if (fieldName) {
            var fieldGetter = worker['get' + fieldName[0].toUpperCase() + fieldName.slice(1) + 'Field'];
        }
        if (fieldGetter) {
            field = fieldGetter.call(worker);
        } else {
            field = null;
        }
        redraw();
    }
    
    redraw();
}