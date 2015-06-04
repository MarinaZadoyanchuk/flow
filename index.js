
function createPartition(w,h, step_w, step_h)
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
      j = j+step_h;
    }
    i = i+step_w;
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
    
    var partition = createPartition(canvas.width(), canvas.height(), 4 / canvas.ratio, 4 / canvas.ratio);
    var letter = letters['T'];
    var worker, speedLines, field, fieldGetter;
    var angle = 0;
    var drawSpeed = true;

    var recalc = function() {
        worker = new Worker({
            letter: letter,
            partition: partition,
            angle: angle
        });
        if (drawSpeed) {
            speedLines = worker.getSpeedLines();
        }
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
        recalcField();
        redraw();
    })

    var recalcField = function() {
        if (fieldGetter) {
            field = fieldGetter.call(worker);
        } else {
            field = null;
        }
    };

    this.setField = function(fieldName) {
        if (fieldName) {
            fieldGetter = worker['get' + fieldName[0].toUpperCase() + fieldName.slice(1) + 'Field'];
        } else {
            fieldGetter = null;
        }
        recalcField();
        redraw();
    }

    this.setLetter = function(letterName) {
        if (letters[letterName]) {
            letter = letters[letterName];
        }
        recalc();
        recalcField();
        redraw();
    }

    var actions = {
        tick: 0,
        whirlsPeriod: 12
    };
    var step = function() {
        if (actions.stop) {
            actions.stop = false;
            actions.running = false;
            return;
        }
        if (actions.whirls) {
            worker.makeWhirls();
            actions.whirls = false;
        } else if (actions.makingWhirls && actions.tick % actions.whirlsPeriod === 0) {
            worker.makeWhirls();
        }
        worker.makeStep();
        if (drawSpeed) {
            speedLines = worker.getSpeedLines();
        }
        recalcField();
        redraw();
        actions.tick++;
        setTimeout(step, 0);
    };
    this.makeWhirls = function() {
        actions.whirls = true;
    }
    this.stop = function() {
        actions.stop = true;
    }

    this.toggleMakingWhirls = function() {
        actions.makingWhirls = !actions.makingWhirls;
    }

    this.playPause = function() {
        if (actions.running){
            actions.stop = true;
        } else {
            actions.running = true;
            actions.stop = false;
            step();
        }
    }

    this.toggleSpeed = function() {
        drawSpeed = !drawSpeed;
        if (drawSpeed) {
            speedLines = worker.getSpeedLines();
        } else {
            speedLines = null;
        }
        redraw();
    }

    this.scale = function(sign) {
        var scale;
        if (sign === '-') {
            scale = -20;
        } else {
            scale = 20;
        }
        canvas.ratio += scale;
        console.log(canvas.ratio);
        partition = createPartition(canvas.width(), canvas.height(), 2 / canvas.ratio, 5 / canvas.ratio);
        recalc();
        recalcField();
        redraw();
    }


    recalc();
    redraw();
}