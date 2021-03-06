
function Canvas(canvasId) {

    this.canvas = document.getElementById('canvas');
    this.legend = document.getElementById('legend');
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
        window.dispatchEvent(new CustomEvent('anglechange', {'detail': angle}));
    }.bind(this))
}

Canvas.prototype.clear = function() {
    this.context.clearRect(-this.baseX, -this.baseY, this.size.w, this.size.h);
    this.drawLegend([]);
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
  this.style('#f00', 3);
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
		this.context.lineTo((partition[i].x + lines[i][0] * 13.5 / this.ratio) * this.ratio,
            (partition[i].y + lines[i][1] * 13.5 / this.ratio) * this.ratio);
	}
	this.context.stroke();
	this.context.closePath();
}

var arr_colors = [
    '224, 255, 255',
    '175, 238, 238',
    '0, 255, 255',
    '64, 224, 208', 
    '72, 209, 204',  
    '0, 206, 209',
    '102, 204, 255',
    '51, 153, 204',
    '0, 102, 153',
    '0, 51, 102',
    '0, 0, 51'
]; 
var getColorByValueBlue = function(value, min, max) {
    var index =  Math.floor((value - min) / (max - min) * arr_colors.length);
    return 'rgb(' + arr_colors[index] + ')';
};
var getLegendBlue = function(min, max) {
    var step = (max - min) / (arr_colors.length);
    return arr_colors.map(function(color, i) {
        return {
            color: 'rgb(' + color + ')',
            value: min + step * i
        }
    });
};

var getColorByValueGrey = function(value, min, max) {
    var color = 255 - Math.floor((value - min) / (max - min) * 256);
    return 'rgb(' + [color, color, color].join(', ') + ')';
}

Canvas.prototype.drawLegend = function(legend) {
    var legendItem = function(item) {
        return '<div class="legend-item">' + 
            '<div class="legend-color" style="background-color: ' + item.color + ';"></div>' +
            '<div class="legend-value">' + item.value.toFixed(2) + '</div>' +
        '</div>';
    }
    this.legend.innerHTML = legend.map(legendItem).join('');
}

Canvas.prototype.drawField = function(partition, field) {
	var max_value = Math.max.apply(Math, field);
	var min_value = Math.min.apply(Math, field);
	for(var i = 0; i < partition.length; i++)
	{
		this.context.fillStyle = getColorByValueBlue(field[i], min_value, max_value);
		this.context.fillRect(partition[i].x * this.ratio, partition[i].y * this.ratio, partition.step, partition.step);
	}
    this.drawLegend(getLegendBlue(min_value, max_value));
}

Canvas.prototype.drawWhirls = function(whirls) {
    for(var i = 0; i < whirls.length; ++i) {
	    this.context.fillStyle = whirls[i].gamma > 0 ? 'red' : 'blue';
        this.context.beginPath();
        this.context.arc(
            whirls[i].location.x * this.ratio,
            whirls[i].location.y * this.ratio,
            0.5 + 10 * Math.abs(whirls[i].gamma),
            0, 2 * Math.PI
        );
        this.context.fill();
        this.context.closePath();
    }
}

Canvas.prototype.getPartition = function(step) {
	var w = this.width();
	var h = this.height();
	var partition = new Array();
	partition.step = step;
	var i = -w / 2;
	var j = -h / 2;
	step = step / this.ratio;

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

Canvas.prototype.drawAxis = function(){
    baseY = this.size.h/2;
    baseX = this.size.w/2;
    
  	this.style('#aaa', 1);

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
