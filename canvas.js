function include(url) {
        var script = document.createElement('script');
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    }
include("classMatrix.js");
var delta = 0;
var partition; 
var partition_middle;
var alpha = 0;
var gamma0 = 3;

function get_normal_coord(y, base)
{
	return base - y;
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

function is_value_diapason(value, diapason)
{
	if(value>diapason[0] && value<diapason[1])
		return true;
	else
		return false;
}
function get_color_by_value(value, diff_lim, phi_min)
{
	// var max_val = Math.max.apply(Math, value);
	// var min_val = Math.min.apply(Math, value);
	// diff_lim = (max_val-min_val)/15;
	var color = 0;
	var array_segments = new Array();
	for (var i=0; i<255; i++)
	{
		// array_segments.push({diapason: new Array(diff_lim*i, diff_lim*(i+1)-1), color: 17*i});
		if(((value>=(phi_min+diff_lim*i))) && (value<(phi_min+diff_lim*(i+1))))
			return 255 - i;
	}
	
}
function create_partitions(x, y, n0, n1, n2, step)
{
	var i = 1;
	var j = 1;
	var k = 1;
	var length_alpha = 0;
	partition = new Array({x: x, y: y});
	partition_middle = new Array();
	var s0 = {};
	s0.x = step;
	s0.y = 0;
	var s1  = {};
	s1.x = -step / Math.pow(2, 0.5);
	s1.y = -step / Math.pow(2, 0.5);
	var l = {};
	l.x0 = x;
	l.y0 = y;
	while(i <= n0)
	{
		x0 = x;
		y0 = y;
		x += s0.x;
		y += s0.y;
		partition.push({x: x, y: y});
		partition_middle.push({x: (x0+x)/2, y: (y0+y)/2, number: 1});
		i++;
	}
	l.x = x;
	l.y = y;
	length_alpha = length_line(l.x0, l.y0, l.x,  l.y);

	l.x0 = x;
	l.y0 = y;
	while(j <= n1)
	{
		x0 = x;
		y0 = y;
		x += s1.x; 
		y += s1.y;
		partition.push({x: x, y: y});
		partition_middle.push({x: (x0+x)/2, y: (y0+y)/2, number: 2});
		j++;
	}
	l.x = x;
	l.y= y;
	length_alpha += length_alpha = length_line(l.x0, l.y0, l.x,  l.y);;
	l.x0 = x;
	l.y0 = y;
	while(k <= n2)
	{
		x0 = x;
		y0 = y;
		x += s0.x;
		y += s0.y;
		partition.push({x: x, y: y});
		partition_middle.push({x: (x0+x)/2, y: (y0+y)/2, number: 3});
		k++;  
	}
	l.x = x;
	l.y= y;
	length_alpha += length_line(l.x0, l.y0, l.x,  l.y);
	// console.log(length_alpha);
	delta = (length_alpha)/(n0+n1+n2);
	// console.log(i, j, k);
}

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

function draw_letter(context) {
	//малюємо улюблену букву мого прізвища:)
	
	//задаємо колір для цієї красоти
	context.beginPath()
	context.strokeStyle = '#f00';
	context.lineWidth = 5;
	context.moveTo(partition[0].x * ratio, partition[0].y * ratio);
	for(var i = 1; i < partition.length; ++i) {
		context.lineTo(partition[i].x * ratio, partition[i].y * ratio);
	}
	context.stroke();
	context.closePath();
	
}

function calc_speed(gamma, big_part) {
	var result = [], v;
	for(var i = 0; i<big_part.length; i++)
	{
		v = calc_v(big_part[i].x, big_part[i].y, gamma, partition, alpha, delta);
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

function draw_phi(context, gamma, big_part) {
	arr_phi = new Array();
	for(var i = 0; i<big_part.length; i++)
	{
		arr_phi.push(calc_phi(big_part[i].x, big_part[i].y,gamma, partition, partition_middle, alpha, delta));
	}
	phi_max = Math.max.apply(Math, arr_phi);
	phi_min = Math.min.apply(Math, arr_phi);
	diff_lim = (phi_max - phi_min)/255;
	for(var i = 0; i<big_part.length; i++)
	{
		var color = get_color_by_value(arr_phi[i], diff_lim, phi_min);
		if (arr_phi[i])
		{
			context.fillStyle = 'rgb('+ color +','+ color+ ','+ color+')';
			context.fillRect(big_part[i].x * ratio, big_part[i].y * ratio, 20, 20);
		}
	}
}

function draw_psi(context, gamma, big_part) {
	arr_psi = new Array();
	for(var i = 0; i<big_part.length; i++)
	{
		arr_psi.push(calc_psi(big_part[i].x, big_part[i].y,gamma, partition, partition_middle, alpha, delta));
	}
	psi_max = Math.max.apply(Math, arr_psi);
	psi_min = Math.min.apply(Math, arr_psi);
	diff_lim = (psi_max - psi_min)/255;
	for(var i = 0; i<big_part.length; i++)
	{
		var color = get_color_by_value(arr_psi[i], diff_lim, psi_min);
		if (arr_psi[i])
		{
			context.fillStyle = 'rgb('+ color +','+ color+ ','+ color+')';
			context.fillRect(big_part[i].x * ratio, big_part[i].y * ratio, 20, 20);
		}
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
	diff_lim = (speed_max - speed_min)/255;
	for(var i = 0; i<big_part.length; i++)
	{
		var color = get_color_by_value(speed_abs[i], diff_lim, speed_min);
		if (speed_abs[i])
		{
			context.fillStyle = 'rgb('+ color +','+ color+ ','+ color+')';
			context.fillRect(big_part[i].x * ratio, big_part[i].y * ratio, 20, 20);
		}
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
	diff_lim = (pressure_max - pressure_min)/255;
	for(var i = 0; i<big_part.length; i++)
	{
		var color = get_color_by_value(pressure[i], diff_lim, pressure_min);
		if (pressure[i])
		{
			context.fillStyle = 'rgb('+ color +','+ color+ ','+ color+')';
			context.fillRect(big_part[i].x * ratio, big_part[i].y * ratio, 20, 20);
		}
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
	// create_partitions(0, 300,  2, 4, 2, 30);
	create_partitions(0, 0.5,  10, 15, 10, 0.07);

	var context = first_canvas.getContext('2d');
 	context.transform(1, 0, 0, -1, baseX, baseY);

	var gamma = solve_solution(partition, partition_middle, alpha, gamma0, delta);
	var big_part = big_partition(size.w / ratio, size.h / ratio, 20 / ratio);
	var speed = calc_speed(gamma, big_part);

 	draw_all = function() {
		draw_speed(context, speed, big_part);
	 	draw_axis(context, baseX, baseY, size, ratio);
	 	draw_letter(context);
	}
	window.drawer = {
		psi: function() {
		 	draw_psi(context, gamma, big_part);
		 	draw_all();
		},
		phi: function() {
		 	draw_phi(context, gamma, big_part);
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