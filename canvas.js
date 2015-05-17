
var normal_constant = Math.PI / 2;
var ratio = 450;

function Canvas(canvasId) {

    this.canvas = document.getElementById(canvasId);
    this.size = {};
    this.size.lIndent = 10;
    this.size.rIndent = 10;
    this.size.w = this.canvas.width;
    this.size.h = this.canvas.height;
    this.baseY = this.size.h/2;
    this.baseX = this.size.w/2;
    this.ratio = 450;

    this.context = this.canvas.getContext('2d');
    this.context.transform(1, 0, 0, -1, this.baseX, this.baseY);

    this.width = function() {
    	return this.size.w / this.ratio;
    }

    this.height = function() {
    	return this.size.h / this.ratio;
    }
}

Canvas.prototype.clear = function() {
    this.context.clearRect(-this.baseX, -this.baseY, this.size.w, this.size.h);
}

Canvas.prototype.draw_axis = function(){
    baseY = this.size.h/2;
    baseX = this.size.w/2;

 	this.context.beginPath();
 	//малюємо вісь Y
 	this.context.moveTo(0, baseY - this.size.rIndent);
 	this.context.lineTo(0, - baseY + this.size.rIndent);
 	//малюємо стрілку до вісі Y
 	this.context.moveTo(0, baseY - this.size.rIndent);
 	this.context.lineTo(0 - this.size.rIndent / 2, baseY - 2.5 * this.size.rIndent);
 	this.context.moveTo(0, baseY - this.size.rIndent);
 	this.context.lineTo(0 + this.size.rIndent / 2, baseY - 2.5 * this.size.rIndent);
 	//малюємо вісь X
 	this.context.moveTo(-baseX + this.size.lIndent, 0);
 	this.context.lineTo(baseX - this.size.lIndent, 0);

 	//малюємо стрілку для вісі X
 	this.context.moveTo(baseX - this.size.lIndent, 0);
 	this.context.lineTo(baseX - 2.5*this.size.lIndent, 0 - this.size.lIndent/2);
	this.context.moveTo(baseX - this.size.lIndent, 0);
	this.context.lineTo(baseX - 2.5*this.size.lIndent, 0 + this.size.lIndent/2);

	//добавляємо позначки на вісі
	count_markerX = ~~((this.size.w/2)/this.ratio);
	count_markerY = ~~((this.size.h/2)/this.ratio);
	smallMarker = this.ratio/10;

	for(var i = 0; i < count_markerX; i++)
	{
		moveToR = this.ratio * i;
		moveToL = -this.ratio * i;
		this.context.moveTo(moveToR, - this.size.rIndent);
		this.context.lineTo(moveToR, + this.size.rIndent);
		this.context.moveTo(moveToL, - this.size.rIndent);
		this.context.lineTo(moveToL, + this.size.rIndent);
		for(var k = 1; k < 10; k++)
		{
			this.context.moveTo(moveToR + k*smallMarker, - this.size.rIndent/2);
			this.context.lineTo(moveToR + k*smallMarker, + this.size.rIndent/2);
			this.context.moveTo(moveToL - k*smallMarker , - this.size.rIndent/2);
			this.context.lineTo(moveToL - k*smallMarker, + this.size.rIndent/2);
		}
		this.context.stroke();
	}
	for(var j = 0; j <= count_markerY; j++)
	{
		moveToU = - this.ratio*j;
		moveToD = + this.ratio*j;

		this.context.moveTo(- this.size.lIndent, moveToU);
		this.context.lineTo(+ this.size.lIndent, moveToU);

		this.context.moveTo(- this.size.lIndent, moveToD);
		this.context.lineTo(+ this.size.lIndent, moveToD);


		for(var k = 1; k < 10; k++)
		{
			this.context.moveTo(- this.size.lIndent/2, moveToU - k*smallMarker);
			this.context.lineTo(+ this.size.lIndent/2, moveToU - k*smallMarker);
			this.context.moveTo(- this.size.lIndent/2, moveToD + k*smallMarker);
			this.context.lineTo(+ this.size.lIndent/2, moveToD + k*smallMarker);
		}

		this.context.stroke();
	}
	this.context.closePath();
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

