
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

    this.canvas.addEventListener('dblclick', function(e) {
        e.preventDefault();
        var angle = Math.atan2(e.offsetY - this.baseY, -e.offsetX + this.baseX) % (2 * Math.PI);
        console.log(angle);
        window.dispatchEvent(new CustomEvent('anglechange', {'detail': angle}));
    }.bind(this))
}

Canvas.prototype.clear = function() {
    this.context.clearRect(-this.baseX, -this.baseY, this.size.w, this.size.h);
}

Canvas.prototype.style = function(strokeStyle, lineWidth) {
	this.context.strokeStyle = strokeStyle;
	this.context.lineWidth = lineWidth;
}

Canvas.prototype.drawLine = function(points) {
	this.context.beginPath()
	this.context.moveTo(points[0].x * this.ratio, points[0].y * this.ratio);
	for(var i = 1; i < points.length; ++i) {
		this.context.lineTo(points[i].x * this.ratio, points[i].y * this.ratio);
	}
	this.context.stroke();
	this.context.closePath();
}

Canvas.prototype.drawLetter = function(letter) {
  this.style('#f00', 5);
  if (letter.breakpoint) {
    this.drawLine(letter.partition.slice(0, letter.breakpoint));
    var segment = letter.partition.slice(letter.breakpoint, letter.partition.length);
    segment.unshift({x : 2 * segment[0].x - segment[1].x, y: 2 * segment[0].y - segment[1].y})
    this.drawLine(segment);
  } else {
    this.drawLine(letter.partition);
  }
}

Canvas.prototype.drawLines = function(partition, lines) {
  this.style('#000', 1);

	this.context.beginPath()
	for(var i = 0; i < partition.length; ++i) {
		this.context.moveTo(partition[i].x * this.ratio, partition[i].y * this.ratio);
		this.context.lineTo((partition[i].x + lines[i][0]) * this.ratio,
            (partition[i].y + lines[i][1]) * this.ratio);
	}
	this.context.stroke();
	this.context.closePath();
}

Canvas.prototype.drawField = function(partition, field) {
	function get_color_by_value(value, min, max)
	{
		return Math.floor((max - value) / (max - min) * 256);
	}

	max_value = Math.max.apply(Math, field);
	min_value = Math.min.apply(Math, field);
	for(var i = 0; i < partition.length; i++)
	{
		var color = get_color_by_value(field[i], min_value, max_value);
		this.context.fillStyle = 'rgb('+ color +','+ color+ ','+ color+')';
		this.context.fillRect(partition[i].x * this.ratio, partition[i].y * this.ratio, 20, 20);
	}
}

Canvas.prototype.drawAxis = function(){
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
