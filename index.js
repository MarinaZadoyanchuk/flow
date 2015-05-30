
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

    var letters = {};
    letters['Z'] = (new LetterBuilder({x: -0.3, y: 0.7}, 0.14))
    .addSegment(5, 0)
    .addSegment(7, Math.PI * 5 / 4)
    .addSegment(5, 0)
    .getLetter();
    
    letters['T'] = (new LetterBuilder({x: -0.45, y: 0.45}, 0.15))
    .addSegment(2, Math.PI / 2)
    .addSegment(6, 0)
    .addSegment(2, -Math.PI / 2)
    .addSegment(7, -Math.PI / 2, 0, 0.75)
    .getLetter();
    
    var partition = createPartition(canvas.width(), canvas.height(), 20 / canvas.ratio);
    var letter = letters['T'];
    var worker, speedLines, field;
    var angle = 0;


    var recalc = function() {
        worker = new Worker({
            letter: letter,
            partition: partition,
            angle: angle
        });
        speedLines = worker.getSpeedLines();
    }

    var redraw = function() {
        canvas.clear()
        if (field) {
            canvas.drawField(partition, field);
        }
        if (speedLines) {
            canvas.drawLines(partition, speedLines);
        }
        canvas.drawAxis();
        canvas.drawWhirls(worker.whirls);
        canvas.drawLetter(letter);
    }

    window.addEventListener('anglechange', function(e) {
        angle = e.detail;
        recalc();
        redraw();
    })

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

    this.setLetter = function(letterName) {
        if (letters[letterName]) {
            letter = letters[letterName];
        }
        field = null;
        recalc();
        redraw();
    }

    var actions = {};
    this.makeWhirls = function() {
        actions.whirls = true;
    }
    this.stop = function() {
        actions.stop = true;
    }

    this.start = function() {
        if (actions.running) return;
        actions.running = true;
        actions.stop = false;
        var step = function() {
            if (actions.stop) {
                actions.stop = false;
                actions.running = false;
                return;
            }
            if (actions.whirls) {
                worker.makeWhirls();
                actions.whirls = false;
            }
            worker.makeStep();
            speedLines = worker.getSpeedLines();
            redraw();
            setTimeout(step, 0);
        }
        step();
    }
    recalc();
    redraw();
}