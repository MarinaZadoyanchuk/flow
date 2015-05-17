
var flowApp = angular.module('flow', []);


flowApp.controller('Main', ['$scope', MainController]);

function MainController(scope) {

    var canvas = (new Canvas("first_canvas"));

    var base = {
        partition_middle: [],
        partition: [{x: 0, y: 0.5}],
        step: 0.07,
        add_segment: add_segment
    };
    var z = base
    .add_segment(10, 0)
    .add_segment(15, Math.PI * 5 / 4)
    .add_segment(10, 0)
    ;
    base = {
        partition_middle: [],
        partition: [{x: -0.5, y: 0.5}],
        step: 0.05,
        add_segment: add_segment
    }
    var t = base
    .add_segment(5, Math.PI / 2)
    .add_segment(20, 0)
    .add_segment(5, -Math.PI / 2)
    .add_segment(20, -Math.PI / 2, 0, 0.8)
    ;
    var segment = t;

    var gamma0 = 1;
    var alpha = 0;


    var gamma = find_gamma(segment, alpha, gamma0);
    var big_part = big_partition(canvas.width(), canvas.height(), 20 / canvas.ratio);
    var small_part = big_partition(canvas.width(), canvas.height(), 15 / canvas.ratio);
    var speed = calc_speed(segment, gamma, big_part, alpha);

    draw_all = function() {
        draw_speed(canvas.context, speed, big_part);
        canvas.draw_axis();
        draw_letter(canvas.context, segment);
    }
    window.drawer = {
        psi: function() {
            draw_psi(canvas.context, gamma, big_part, segment, alpha);
            draw_all();
        },
        phi: function() {
            draw_phi(canvas.context, gamma, big_part, segment, alpha);
            draw_all();
        },
        speed: function() {
            draw_speed_field(canvas.context, speed, big_part);
            draw_all();
        },
        pressure: function() {
            draw_pressure(canvas.context, speed, big_part, alpha);
            draw_all();
        },
        none : function() {
            canvas.clear();
            draw_all();
        }
    }
    draw_all();

}