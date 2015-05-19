
var flowApp = angular.module('flow', []);


flowApp.controller('Main', ['$scope', MainController]);

function MainController(scope) {

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
    
    var segment = t;

    var gamma0 = 1;
    var alpha = 0;


    var gamma = find_gamma(segment, alpha, gamma0);
    var big_part = big_partition(canvas.width(), canvas.height(), 20 / canvas.ratio);
    var speed = calc_speed(segment, gamma, big_part, alpha);

    drawAll = function() {
        canvas.drawLines(getSpeedLines(speed, big_part));
        canvas.drawAxis();
        canvas.drawLetter(segment);
    }
    window.drawer = {
        psi: function() {
            canvas.drawField(big_part, getPsiField(gamma, big_part, segment, alpha));
            drawAll();
        },
        phi: function() {
            canvas.drawField(big_part, getPhiField(gamma, big_part, segment, alpha));
            drawAll();
        },
        speed: function() {
            canvas.drawField(big_part, getSpeedField(speed, big_part));
            drawAll();
        },
        pressure: function() {
            canvas.drawField(big_part, getPressureField(speed, big_part, alpha));
            drawAll();
        },
        none : function() {
            canvas.clear();
            drawAll();
        }
    }
    drawAll();

}