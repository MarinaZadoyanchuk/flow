
var constants = {
    whirlsPeriod: 12,
    smallPartitionStep: 3,
    bigPartitionStep: 20,
    startAngle: 0,
    scaleStep: 20
}

function MainController() {

    var canvas = new Canvas();

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
    
    letters['slash'] = (new LetterBuilder({x: -9, y: 8}, 0.1))
    .addSegment(10, Math.PI / 4)
    .getLetter();
    var letter = letters['T'];
    
    var partitions = {};
    var currentPartitionStep = constants.bigPartitionStep;
    var worker;
    var angle = constants.startAngle;
    var layers = {
        field: {
            recalc: function(){}
        },
        speed: {
            recalc: function(){}
        }
    };

    var recalc = function() {
        worker = new Worker({
            letter: letter,
            angle: angle
        });
        partitions[constants.smallPartitionStep] = canvas.getPartition(constants.smallPartitionStep);
        partitions[constants.bigPartitionStep] = canvas.getPartition(constants.bigPartitionStep);
        layers.speed.recalc();
    };

    var redraw = function() {
        canvas.clear()
        if (layers.field.field) {
            canvas.drawField(partitions[layers.field.partitionStep], layers.field.field);
        }
        if (layers.speed.lines) {
            canvas.drawLines(partitions[layers.speed.partitionStep], layers.speed.lines);
        }
        canvas.drawAxis();
        canvas.drawLetter(letter);
        canvas.drawWhirls(worker.whirls.concat(worker.getLetterWhirls()));
    };

    window.addEventListener('anglechange', function(e) {
        angle = e.detail;
        recalc();
        layers.field.recalc();
        redraw();
    })


    this.setField = function(fieldName) {
        if (fieldName) {
            layers.field = {
                field: null,
                partitionStep: currentPartitionStep,
                fieldName: fieldName,
                recalc: function() {
                    var fieldGetter = worker['get' + fieldName[0].toUpperCase() + fieldName.slice(1) + 'Field'];
                    if (fieldGetter) {
                        this.field = fieldGetter.call(worker, partitions[this.partitionStep]);
                    } else {
                        this.field = null;
                    }
                }
            };
            layers.field.recalc();
        } else {
            layers.field = {
                recalc: function() {}
            }
        }
        redraw();
    }

    this.setLetter = function(letterName) {
        if (letters[letterName]) {
            letter = letters[letterName];
        }
        recalc();
        layers.field.recalc();
        redraw();
    }

    var actions = {
        tick: 0,
        stop: false,
        running: false,
        whirls: false,
        makingWhirls: false
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
        } else if (actions.makingWhirls && actions.tick % constants.whirlsPeriod === 0) {
            worker.makeWhirls();
        }
        worker.makeStep();
        layers.speed.recalc();
        layers.field.recalc();
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
        if (!layers.speed.lines) {
            layers.speed = {
                lines: null,
                partitionStep: currentPartitionStep,
                recalc: function() {
                    this.lines = worker.getSpeedLines(partitions[this.partitionStep])
                }
            }
            layers.speed.recalc();
        } else {
            layers.speed = {
                recalc: function(){}
            }
        }
        redraw();
    }

    this.scale = function(sign) {
        var scale;
        if (sign === '-') {
            scale = -constants.scaleStep;
        } else {
            scale = constants.scaleStep;
        }
        canvas.ratio += scale;
        recalc();
        layers.field.recalc();
        redraw();
    }

    this.changePartitionStep = function(step) {
        if (step === 'big') {
            currentPartitionStep = constants.bigPartitionStep;
        } else {
            currentPartitionStep = constants.smallPartitionStep;
        }
    }


    recalc();
    redraw();
}