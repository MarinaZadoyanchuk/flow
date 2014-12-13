//клас для роботи з матрицею
var max_length;
function Matrix(values)
{
	values = values || {};
	var a = values.a || [];
	var n = values.n || a.length;
	var m = values.m || a[0].length;
	this.n = n;
	this.a = a;
	this.m = m;

	//функція для генерування матриці - на діагоналі 0, під діагоналлю задане в кострукторі значення а, під діагоналлю - (-а)
	this.generate = function()
	{
		var Mass = [];
		for(i=0;i<this.n;i++)
		{
			Mass[i] = [];
			for(j=0;j<this.m;j++)
			{
				Mass[i][j] = 0;
			}
		}
		this.a = Mass;
	}
	if(a.length == 0)
		this.generate();
	//функція додавання матриць
	this.add = function(b)
	{
		var res;
		if(this.n!=b.n||this.n<=0) return res;
		var res = new Matrix({n: this.n});
		res.m = [];
		for(i=0;i<this.n;i++)
		{
			res.m[i] = [];
			for(j=0;j<this.m;j++)
			{
				res.m[i][j] = this.m[i][j]+b.m[i][j];
			}
		}
		return res;
	}
	//функція віднімання матриць
	this.substr = function(b)
	{
		var res;
		if(this.n!=b.n||this.n<=0) return res;
		var res = new Matrix({n: this.n});
		res.m = [];
		for(i=0;i<this.n;i++)
		{
			res.m[i] = [];
			for(j=0;j<this.m;j++)
			{
				res.m[i][j] = this.m[i][j]-b.m[i][j];
			}
		}
		return res;
	}
	// функція множення матриць
	this.mult = function(b)
	{
		var res;
		if(this.n!=b.n||this.n<=0) return res;
		var res = new Matrix({n: b.n});
		res.n = this.n;
		res.m = [];
		for(i=0;i<this.n;i++)
		{
			res.m[i] = [];
			for(j=0;j<this.m;j++)
			{
				res.m[i][j] = 0;
				for(h=0;h<this.n;h++)
				{
					res.m[i][j] = res.m[i][j] + this.m[i][h]*b.m[h][j];
				}
			}
		}
		return res;
	}
	//функція множення матриці на скаляр
	this.mult_matrix_by_scalar = function(p)
	{
		x = this;
		for(i=0;i<this.n;i++)
			for(j=0;j<this.m;j++)
				x.m[i][j] = x.m[i][j]*p;
		return x;
	}
	// функція присвоєння матриці 
	this.assign = function(b)
	{

		for(i=0;i<b.n;i++)
		{
			for(j=0;j<b.m;j++)
				this.m[i][j] = b.m[i][j];
		}
		return this;
	}
	//функція отримання транспонованої матриці
	this.transpose = function()
	{
		var x = new Matrix({n: this.n});
		x.assign(this);
		var t = 0;
		for(i=0;i<this.n-1;i++)
		{
			for(j=i+1;j<this.m;j++)
			{
				t = x.m[i][j];
				x.m[i][j] = x.m[j][i];
				x.m[j][i] = t;
			}
		}
		return x;
	}
	//знаходження максимального власного числа матриці
	this.lambda_max = function(eps)
	{
		var n = this.n;
		var m = this.m;
		var f = new Vector(n);
		var mu,mu1,sum,norm = 0; 
		var sum = 0;
		var mu = 0;
		var mu1 = 0;
		var x1 = new Vector(n);
		do
		{
			for(i=0; i<n;i++)
			{
				x1.v[i] = 0;
				for(j=0;j<m;j++)
				{
					x1.v[i] = x1.v[i]+this.m[i][j]*f.v[j]
				}
			}
			mu = mu1;
			mu1 = x1.v[0]/f.v[0];
			f.assign(x1);
		}
		while(Math.abs(mu1-mu)>eps);
		return mu1;
	}
	// обчислення евклідової норми матриці
	this.norma_matrix = function(eps)
	{
		var n = this.n;
		var r = new Matrix({n: n});
		var r = this.transpose();
		r.assign(r.mult(this));
		var l = r.lambda_max(eps);
		var norma = Math.sqrt(l);
		return norma;
	}
}

// клас для роботи з векторами
function Vector(n,a)
{
	if(a == undefined)
		a=0;
	if(n == undefined)
		n=3;
	this.n = n;
	this.a = a;
	// задаємо початковий вектор
	this.start_vector = function()
	{
		var Mass = [];
		for(i=0;i<this.n;i++)
			Mass[i] = this.a;
		this.v = Mass;
	}
	this.start_vector();
	// присвоювання вектора
	this.assign = function(b)
	{
		this.n = b.n;
		for(i=0;i<this.n;i++)
			this.v[i] = b.v[i];
		return this;
	}
	// множення вектора на матрицю
	this.mult_by_matrix = function(a)
	{
		var i,j;
		var res = new Vector(this.n);
		res.v = [];
		for(i=0;i<this.n;i++)
		{
			res.v[i] = 0;
			for(j=0;j<this.n;j++)
			{
				res.v[i] = res.v[i]+this.v[j]*a.m[i][j];
			}
		}
		return res;
	}
	// функція додавання векторів
	this.add = function(a)
	{
		var res;
		if (this.n != a.n || this.n<=0) return res;
		res = new Vector(this.n);
		res.v = [];
		for(i=0;i<this.n;i++)
			res.v[i] = this.v[i] + a.v[i];
		return res;
	}
	// функція віднімання векторів
	this.substr = function(a)
	{
		var res;
		if (this.n != a.n || this.n<=0) return res;
		res = new Vector(this.n);
		res.v = [];
		for(i=0;i<this.n;i++)
			res.v[i] = this.v[i] - a.v[i];
		return res;
	}
	// обчислення скалярного добутку векторів
	this.scalar = function(a)
	{
		var res = 0;
		for(var i=0;i<this.n;i++)
		{
			res = res + this.v[i]*a.v[i];
		}
		return res;
	}
	// множення вектора на скаляр
	this.mult_by_scalar = function(k)
	{
		var res = new Vector(this.n);
		for(i=0;i<this.n;i++)
			res.v[i] = this.v[i]*k;
		return res;
	}
	//обчислення евклідової норми вектора
	this.norma = function()
	{
		var norm = 0;
		norm = Math.sqrt(this.scalar(this));
		return norm;
	}
	this.abs = function()
	{
		n = this.n;
		var res = new Vector(n);
		res.v = [];
		var i;
		for(i=0;i<n;i++)
		{
			if(this.v[i]<0)
				res.v[i] = -this.v[i]
			else
				res.v[i] = this.v[i];
		}
		return res;
	}
	this.greater = function(eps) 
	{
		var n = this.n;
		var s=0;
		for(i=0;i<n;i++)
		{	
			var k=0;
			if (this.v[i]<eps)
				k=1;
			if(k==1)
				s=s+1;
		}
		if(s==0)
			return true
		else return false;
	}
	this.modul = function(a)
	{
		var res = 0;
		if (this.n!=a.n)
			return 'error';
		var i=0;
		var n = this.n;

		for(i=0;i<n;i++)
		{
			res = res + Math.pow(this.v[i]-a.v[i],2)
		}
		return Math.sqrt(res);
	}
}
function get_max_column(a, current_row, current_column)
{
	var max = Math.abs(a.a[current_row][current_column]);
	var number_max;
	for(var p = current_row+1; p < a.n; p++)
	{
		if(max != Math.max(max, Math.abs(a.a[p][current_column])))
		{
			max = Math.max(max, Math.abs(a.a[p][current_column]));
			number_max = p;
		}
	}
	if(max != Math.abs(a.a[current_row][current_column]))
	{
		c = a.a[number_max];
		a.a[number_max] = a.a[current_row];
		a.a[current_row] = c;
	}
	return a;
}
function Gaus_method(a)
{
	var n = a.n;
	var x = new Vector(a.n);
	var b = 0;
	for (var i = 0; i < a.n-1; i++) 
	{
		a = get_max_column(a, i, i);
		for (var k = i+1; k < a.n; k++) 
		{
			b = a.a[k][i] / a.a[i][i];
			for (var j = 0; j < a.m ; j++) 
			{
				a.a[k][j] = a.a[k][j] - b * a.a[i][j];
			}
		}
 	}
 	for(var i = a.n-1; i>= 0; i--)
 	{
 		var sum = 0;
 		for(var j = i+1; j < a.m - 1; j++)
 		{
 			sum +=a.a[i][j]*x.v[j];
 		}
 		x.v[i] = (a.a[i][a.m-1] - sum)/a.a[i][i];
 	}
 	return x;
}
// a = new Matrix({a : [[2, 44, 44, 2], [8, 9, 0, -1], [2, 5, 8, 1]]});
// console.log("test", Gaus_method(a));
function length_line(x1, y1 , x2, y2)
{
	return Math.pow(Math.pow(y2-y1, 2)+Math.pow(x2-x1, 2), 0.5);
}

function calc_vj(x, y, xj, yj, delta)
{ 
	var max_length = Math.max(
		Math.pow(x - xj, 2) + Math.pow(y - yj, 2),
		Math.pow(0.5 * delta, 2)
		);
	// max_length = Math.sqrt(max_length);
	var uj = (1.0 / (2 * Math.PI)) * ((yj - y) / max_length);
	var vj = (1.0 / (2 * Math.PI)) * ((x - xj) / max_length);
	// console.log(Math.pow(Math.pow(uj, 2) + Math.pow(vj, 2), 0.5))
	return [uj, vj];
}
function calc_v(x,y,gamma, partition, alpha, delta)
{
	// if (x > 0 && y > 300)
	// debugger
	var v = new Vector(2);
	v.v = [Math.cos(alpha), Math.sin(alpha)];
	var M = gamma.v.length;
	// var sum_gamma = 0;
	var result_vector = new Vector(2);
	var vj = new Vector(2);
	for(var i = 0; i<M; i++)
	{
		vj.v = calc_vj(partition[i].x, partition[i].y, x, y, delta);
		result_vector = result_vector.add(vj.mult_by_scalar(gamma.v[i]));
		// sum_gamma += gamma.v[i];
	}
	// console.log(sum_gamma);
	return v.substr(result_vector);
}
function calc_phi(x,y,gamma, partition, partition_middle, alpha, delta)
{
	var s1 = 0;
	var s2 = 0;
	var result = 0;
	var count_gamma = gamma.v.length;
	// console.log(count_gamma, partition_middle.length);
	var sum_all_gamma = 0;
	var log = 0;
	var result = 0;
	var sum_gamma;
	var phi;
	var v = [Math.cos(alpha), Math.sin(alpha)];
	for(var i = 0; i<count_gamma-1; i++)
	{
		sum_gamma = 0;
		for(var k = 0; k<=i; k++)
		{
			sum_gamma +=gamma.v[k];
		}
		// console.log(i);
		s1 = (x - partition_middle[i].x)*(partition[i + 1].y - partition[i].y) 
		- (y - partition_middle[i].y)*(partition[i + 1].x - partition[i].x);
		s2 = Math.pow(x - partition_middle[i].x, 2) + Math.pow(y - partition_middle[i].y, 2);
		result += (sum_gamma*s1)/(2*Math.PI*s2);
	}
	for(var j = 0; j<count_gamma; j++)
	{
		sum_all_gamma += gamma.v[j];
	}
	// log = Math.pow(Math.log(Math.pow(x - partition[count_gamma-1].x, 2)+Math.pow(y - partition[count_gamma-1].y, 2)), 0.5);
	atan = Math.atan2(
		(y - partition[partition.length - 1].y) ,
		(x - partition[partition.length - 1].x)
		);
	// atan = 1;
	phi = x*v[0] + y*v[1] + result +(sum_all_gamma*atan)/(2*Math.PI);
	return phi;
}

function calc_psi(x,y,gamma, partition, partition_middle, alpha, delta)
{
	var s1 = 0;
	var s2 = 0;
	var result = 0;
	var count_gamma = gamma.v.length;
	// console.log(count_gamma, partition_middle.length);
	var sum_all_gamma = 0;
	var log = 0;
	var result = 0;
	var sum_gamma;
	var psi;
	var v = [Math.cos(alpha), Math.sin(alpha)];
	for(var i = 0; i<count_gamma-1; i++)
	{
		sum_gamma = 0;
		for(var k = 0; k<=i; k++)
		{
			sum_gamma +=gamma.v[k];
		}
		// console.log(i);
		s1 = (x - partition_middle[i].x)*(partition[i + 1].x - partition[i].x) 
		+ (y - partition_middle[i].y)*(partition[i + 1].y - partition[i].y);
		s2 = Math.pow(x - partition_middle[i].x, 2) + Math.pow(y - partition_middle[i].y, 2);
		result += (sum_gamma*s1)/(2*Math.PI*s2);
	}
	for(var j = 0; j<count_gamma; j++)
	{
		sum_all_gamma += gamma.v[j];
	}
	log = 0.5 * Math.log(
		Math.pow(x - partition[partition.length - 1].x, 2)
		+ Math.pow(y - partition[partition.length - 1].y, 2)
		);
	// log = 1;
	psi = y*v[0] - x*v[1] + result +(sum_all_gamma*log)/(2*Math.PI);
	return psi;
}

function get_normal(sw)
{
	switch(sw)
	{
		case 1:
		case 3:
			return [0, -1];
			break;
		case 2:
			return [-1 / Math.pow(2,0.5), 1 / Math.pow(2, 0.5)];
			break;
		default:
			return [0, 0];
			break;
	}
}
function solve_solution(partition, partition_middle, alpha, gamma0, delta)
{

	var n = partition_middle.length;
	var m = partition.length;
	var a = new Matrix({n: n+1, m: m+1});
	var v = new Vector(2);
	v.v = [Math.sin(alpha), Math.cos(alpha)];
	// console.log(n, m, a);
	var normal = new Vector(2);
	var vj = new Vector(2);
	for(var i = 0; i< n; i++)
	{
		normal.v = get_normal(partition_middle[i].number);
		for(var j = 0; j< m; j++)
		{
			vj.v = calc_vj(partition[j].x, partition[j].y, partition_middle[i].x,partition_middle[i].y, delta);
			a.a[i][j] = vj.scalar(normal);
		}
		a.a[i].push(-v.scalar(normal));
		// console.log(a.a[i]);
	}
	for(var k = 0; k < m; k++)
	{
		a.a[n][k] = 1;
	}
	a.a[n][m] = gamma0;
	// t = a.a[0];
	// a.a[0] = a.a[n];
	// a.a[n] = t;

	return Gaus_method(a);
}
// a = new Matrix({a: [[5,3,8,-9], [9,8,10,0], [1,2,4,1]]});
// console.log(a);
// console.log(Gaus_method(a));