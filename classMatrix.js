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

function Gaus_method(system)
{
	var n = system.n;
	var A = system.a;

    for (var i=0; i<n; i++) {
        // Search for maximum in this column
        var maxEl = Math.abs(A[i][i]);
        var maxRow = i;
        for(var k=i+1; k<n; k++) {
            if (Math.abs(A[k][i]) > maxEl) {
                maxEl = Math.abs(A[k][i]);
                maxRow = k;
            }
        }

        // Swap maximum row with current row (column by column)
        for (var k=i; k<n+1; k++) {
            var tmp = A[maxRow][k];
            A[maxRow][k] = A[i][k];
            A[i][k] = tmp;
        }

        // Make all rows below this one 0 in current column
        for (k=i+1; k<n; k++) {
            var c = -A[k][i]/A[i][i];
            for(var j=i; j<n+1; j++) {
                if (i==j) {
                    A[k][j] = 0;
                } else {
                    A[k][j] += c * A[i][j];
                }
            }
        }
    }

    // Solve equation Ax=b for an upper triangular matrix A
    var x= new Array(n);
    for (var i=n-1; i>-1; i--) {
        x[i] = A[i][n]/A[i][i];
        for (var k=i-1; k>-1; k--) {
            A[k][n] -= A[k][i] * x[i];
        }
    }
    var result = new Vector(n);
    result.v = x;
    return result;
}
// a = new Matrix({a : [[2, 44, 44, 2], [8, 9, 0, -1], [2, 5, 8, 5]]});
// console.log("test", Gaus_method(a));

function calc_vj(p, discrete_p, delta)
{ 
	var max_length = Math.max(
		Math.pow(p.x - discrete_p.x, 2) + Math.pow(p.y - discrete_p.y, 2),
		Math.pow(0.5 * delta, 2)
		);
	// max_length = Math.sqrt(max_length);
	var uj = (1.0 / (2 * Math.PI)) * ((discrete_p.y - p.y) / max_length);
	var vj = (1.0 / (2 * Math.PI)) * ((p.x - discrete_p.x) / max_length);
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
	var result_vector = new Vector(2);
	var vj = new Vector(2);
	// var sum_gamma = 0;
	for(var i = 0; i<M; i++)
	{
		vj.v = calc_vj({x: x, y: y}, partition[i], delta);
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

function find_gamma(segment, alpha, gamma0)
{
	var system = [];
	var current_equation;
	var i, j;
	var v_inf = new Vector(2);
	var vj = new Vector(2);
	var normal = new Vector(2);
	v_inf.v = [Math.sin(alpha), Math.cos(alpha)];
	for(i = 0; i < segment.partition_middle.length; ++i) {
		normal.v = [segment.partition_middle[i].normal.x, segment.partition_middle[i].normal.y];
		current_equation = []
		for(j = 0; j < segment.partition.length; ++j) {
			vj.v = calc_vj(segment.partition_middle[i], segment.partition[j], segment.step);
			current_equation.push(vj.scalar(normal));
		}
		current_equation.push(-v_inf.scalar(normal))
		system.push(current_equation);
	}
	current_equation = [];
	for(j = 0; j < segment.partition.length; ++j) {
		current_equation.push(1);
	}
	current_equation.push(gamma0);
	system.push(current_equation);


	var m = new Matrix({m: segment.partition.length + 1, n: segment.partition_middle.length + 1});
	m.a = system;
	result = Gaus_method(m);

	// console.table(system);
	console.log(result.v);
	console.log(normal.v);
	return result;
}