function include(url) {
        var script = document.createElement('script');
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    }
include("classMatrix.js");

var normal_constant = Math.PI / 2;

function draw_axis(context, baseX, baseY, size, ratio){
 	context.beginPath();
 	//малюємо вісь Y
 	context.moveTo(0, baseY - size.rIndent);
 	context.lineTo(0, - baseY + size.rIndent);
 	//малюємо стрілку до вісі Y
 	context.moveTo(0, baseY - size.rIndent);
 	context.lineTo(0 - size.rIndent / 2, baseY - 2.5 * size.rIndent);
 	context.moveTo(0, baseY - size.rIndent);
 	context.lineTo(0 + size.rIndent / 2, baseY - 2.5 * size.rIndent);
 	//малюємо вісь X
 	context.moveTo(-baseX + size.lIndent, 0);
 	context.lineTo(baseX - size.lIndent, 0);

 	//малюємо стрілку для вісі X
 	context.moveTo(baseX - size.lIndent, 0);
 	context.lineTo(baseX - 2.5*size.lIndent, 0 - size.lIndent/2);
	context.moveTo(baseX - size.lIndent, 0);
	context.lineTo(baseX - 2.5*size.lIndent, 0 + size.lIndent/2);

	//добавляємо позначки на вісі
	count_markerX = ~~((size.w/2)/ratio);
	count_markerY = ~~((size.h/2)/ratio);
	smallMarker = ratio/10;

	for(var i = 0; i < count_markerX; i++)
	{
		moveToR = ratio * i;
		moveToL = -ratio * i;
		context.moveTo(moveToR, - size.rIndent);
		context.lineTo(moveToR, + size.rIndent);
		context.moveTo(moveToL, - size.rIndent);
		context.lineTo(moveToL, + size.rIndent);
		for(var k = 1; k < 10; k++)
		{
			context.moveTo(moveToR + k*smallMarker, - size.rIndent/2);
			context.lineTo(moveToR + k*smallMarker, + size.rIndent/2);
			context.moveTo(moveToL - k*smallMarker , - size.rIndent/2);
			context.lineTo(moveToL - k*smallMarker, + size.rIndent/2);
		}
		context.stroke();
	}
	for(var j = 0; j <= count_markerY; j++)
	{
		moveToU = - ratio*j;
		moveToD = + ratio*j;

		context.moveTo(- size.lIndent, moveToU);
		context.lineTo(+ size.lIndent, moveToU);

		context.moveTo(- size.lIndent, moveToD);
		context.lineTo(+ size.lIndent, moveToD);


		for(var k = 1; k < 10; k++)
		{
			context.moveTo(- size.lIndent/2, moveToU - k*smallMarker);
			context.lineTo(+ size.lIndent/2, moveToU - k*smallMarker);
			context.moveTo(- size.lIndent/2, moveToD + k*smallMarker);
			context.lineTo(+ size.lIndent/2, moveToD + k*smallMarker);
		}

		context.stroke();
	}
	context.closePath();
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

function get_color_by_value(value, min, max)
{
	return Math.floor((max - value) / (max - min) * 256);
}

function add_segment(n, alpha, x, y) {
	if (!(x && y) && !(x === 0)){
		var last = this.partition[this.partition.length - 1];
	} else {
		var last = {x : x, y: y};
		this.breakpoint = this.partition.length;
	}
	var s = {
		x : this.step * Math.cos(alpha),
		y : this.step * Math.sin(alpha)
	};
	var normal = {
		x : Math.cos(alpha + normal_constant),
		y : Math.sin(alpha + normal_constant)
	};
	for(var i = 0; i < n; ++i) {
		this.partition_middle.push({
			x : last.x + s.x / 2,
			y : last.y + s.y / 2,
			normal : normal
		});
		last = {
			x : last.x + s.x,
			y : last.y + s.y
		};
		this.partition.push(last);
	}
	return this;
}

function draw_letter(context, segment) {
	//малюємо улюблену букву мого прізвища:)
	
	//задаємо колір для цієї красоти
	context.beginPath()
	context.strokeStyle = '#f00';
	context.lineWidth = 5;
	context.moveTo(segment.partition[0].x * ratio, segment.partition[0].y * ratio);
	for(var i = 1; i < segment.partition.length; ++i) {
		if (segment.breakpoint && i === segment.breakpoint) {
			context.moveTo(segment.partition[i].x * ratio, segment.partition[i].y * ratio);
		} else {
			context.lineTo(segment.partition[i].x * ratio, segment.partition[i].y * ratio);
		}
	}
	context.stroke();
	context.closePath();
	
}

function calc_speed(segment, gamma, big_part, alpha) {
	var result = [], v;
	for(var i = 0; i<big_part.length; i++)
	{
		v = calc_v(big_part[i].x, big_part[i].y, gamma, segment.partition, alpha, segment.step);
		result.push(v);
	}
	return result;
}

function draw_speed(context, speed, big_part) {

	context.strokeStyle = '#000';
	context.lineWidth = 1;
	context.beginPath();

	for(var i = 0; i<speed.length; i++)
	{
		var v = speed[i];
		context.moveTo(big_part[i].x * ratio, big_part[i].y * ratio);
		v = v.mult_by_scalar(0.03)
		context.lineTo((big_part[i].x + v.v[0]) * ratio, (big_part[i].y + v.v[1]) * ratio);
	}
	context.stroke();
	context.closePath();
}

function draw_phi(context, gamma, big_part, segment, alpha) {
	arr_phi = new Array();
	for(var i = 0; i<big_part.length; i++)
	{
		arr_phi.push(
			calc_phi(
				big_part[i].x, 
				big_part[i].y,
				gamma, 
				segment.partition,
				segment.partition_middle,
				alpha,
				segment.step
				)
			);
	}
	phi_max = Math.max.apply(Math, arr_phi);
	phi_min = Math.min.apply(Math, arr_phi);
	for(var i = 0; i<big_part.length; i++)
	{
		var color = get_color_by_value(arr_phi[i], phi_min, phi_max);
		context.fillStyle = 'rgb('+ color +','+ color+ ','+ color+')';
		context.fillRect(big_part[i].x * ratio, big_part[i].y * ratio, 20, 20);
	}
}

function draw_psi(context, gamma, big_part, segment, alpha) {
	arr_psi = new Array();
	for(var i = 0; i<big_part.length; i++)
	{
		arr_psi.push(
			calc_psi(
				big_part[i].x,
				big_part[i].y,
				gamma,
				segment.partition,
				segment.partition_middle,
				alpha,
				segment.step
				)
			);
	}
	psi_max = Math.max.apply(Math, arr_psi);
	psi_min = Math.min.apply(Math, arr_psi);
	for(var i = 0; i<big_part.length; i++)
	{
		var color = get_color_by_value(arr_psi[i], psi_min, psi_max);
		context.fillStyle = 'rgb('+ color +','+ color+ ','+ color+')';
		context.fillRect(big_part[i].x * ratio, big_part[i].y * ratio, 20, 20);
	}
}

function draw_speed_field(context, speed, big_part) {
	var speed_abs = [];
	for(var i = 0; i < speed.length; ++i) {
		speed_abs.push(Math.sqrt(
			speed[i].v[0] * speed[i].v[0],
			speed[i].v[1] * speed[i].v[1]
			));
	}
	speed_max = Math.max.apply(Math, speed_abs);
	speed_min = Math.min.apply(Math, speed_abs);
	for(var i = 0; i<big_part.length; i++)
	{
		var color = get_color_by_value(speed_abs[i], speed_min, speed_max);
		context.fillStyle = 'rgb('+ color +','+ color+ ','+ color+')';
		context.fillRect(big_part[i].x * ratio, big_part[i].y * ratio, 20, 20);
	}
}

function draw_pressure(context, speed, big_part, alpha) {
	var v = [Math.cos(alpha), Math.sin(alpha)];
	var pressure = [];
	for(var i = 0; i < speed.length; ++i) {
		pressure.push(1 - (speed[i].v[0] * speed[i].v[0] + speed[i].v[1] * speed[i].v[1]) /
			(v[0] * v[0] + v[1] * v[1]) );
	}
	pressure_max = Math.max.apply(Math, pressure);
	pressure_min = Math.min.apply(Math, pressure);
	for(var i = 0; i<big_part.length; i++)
	{
		var color = get_color_by_value(pressure[i], pressure_min, pressure_max);
		context.fillStyle = 'rgb('+ color +','+ color+ ','+ color+')';
		context.fillRect(big_part[i].x * ratio, big_part[i].y * ratio, 20, 20);
	}
}

jQuery(document).ready(function(){
	first_canvas = document.getElementById("first_canvas");
	var size = {};
    size.lIndent = 10;
    size.rIndent = 10;
    size.w = first_canvas.width;
    size.h = first_canvas.height;
    baseY = size.h/2;
    baseX = size.w/2;
    ratio = 450;
	var context = first_canvas.getContext('2d');
 	context.transform(1, 0, 0, -1, baseX, baseY);

	// create_partitions(0, 300,  2, 4, 2, 30);
	// create_partitions(0, 0.5,  10, 15, 10, 0.07);
	// create_T(-0.5, 0.5, 20, 15, 0.05);
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
	var big_part = big_partition(size.w / ratio, size.h / ratio, 20 / ratio);
	var small_part = big_partition(size.w / ratio, size.h / ratio, 15 / ratio);
	var speed = calc_speed(segment, gamma, big_part, alpha);

 	draw_all = function() {
		draw_speed(context, speed, big_part);
	 	draw_axis(context, baseX, baseY, size, ratio);
	 	draw_letter(context, segment);
	}
	window.drawer = {
		psi: function() {
		 	draw_psi(context, gamma, big_part, segment, alpha);
		 	draw_all();
		},
		phi: function() {
		 	draw_phi(context, gamma, big_part, segment, alpha);
		 	draw_all();
		},
		speed: function() {
		 	draw_speed_field(context, speed, big_part);
		 	draw_all();
		},
		pressure: function() {
		 	draw_pressure(context, speed, big_part, alpha);
		 	draw_all();
		},
		none : function() {
			context.clearRect(-baseX, -baseY, size.w, size.h);
			draw_all();
		}
	}
	draw_all();

}) 