class Drawing {

    constructor (canvas) {
    	this.canvas = canvas;
    	this.type = 'drawing';
    }

	drawCoords(options) {

		var ctx = this.canvas.ctx;

		ctx.beginPath();

		var opts = {
			fill: false,
			stroke: false,
			close: true,
			offset: {x:0,y:0},
			coords: []
		};

		if (options) opts = Object.assign(opts, options);

		opts.coords.forEach((v,i) => {

			if (i == 0) {
				ctx.moveTo(v.x + opts.offset.x, v.y + opts.offset.y);
			} else {
				ctx.lineTo(v.x + opts.offset.x, v.y + opts.offset.y);
			}

		});

		if (opts.close) {
			ctx.closePath();
		}
		if (opts.fill) {
			ctx.fillStyle = opts.fill;
			ctx.fill();
		}

		if (opts.stroke) {
			ctx.strokeStyle = opts.stroke;
			ctx.stroke();
		}

		if (!opts.fill && !opts.stroke) {
			ctx.strokeStyle = "#fff";
			ctx.stroke();
		}
	}


	drawRectangle(options){
		var opts = {
			angle: 0,
			center: this.canvas.getCenter(),
			w: 50,
			h: 50
		};

		if (options) opts = Object.assign(opts, options);

		this.canvas.ctx.save();
		this.canvas.ctx.beginPath();
		this.canvas.ctx.translate( opts.center.x + 20, opts.center.y + 20 );
		this.canvas.ctx.rotate( opts.angle * Math.PI/(1000/(50/opts.w)) );
		this.canvas.ctx.rect( -opts.w/2, -opts.h/2, opts.w, opts.h);
		this.canvas.ctx.fillStyle="#555";
        
		this.canvas.ctx.fill();
		this.canvas.ctx.restore();

	}

	centerRotate(coords, angle, precision, pivotPoint) {

		if (angle == 0) {
			return coords;
		}

		let delta = precision || 72;

		let radians = angle*(Math.PI/delta);

		let center = pivotPoint || this.canvas.getCenter();
		let coordinates = {
			x: center.x + ((coords.x - center.x) * Math.cos(radians) - (coords.y - center.y) * Math.sin(radians)),
			y: center.y + ((coords.x - center.x) * Math.sin(radians) + (coords.y - center.y) * Math.cos(radians))
		}

		return coordinates;

	}

	getSVGpaths(url) {
		var ele = document.getElementById("svg");


		ele.addEventListener("load",function(){

			var svg = ele.contentDocument;

		}, false);

		ele.data = url;

	}

	getDistance(a,b){
        return Math.sqrt( Math.pow(a.x - b.x ,2) + Math.pow(a.y - b.y ,2) )
    }

    getLineAngle(a,b) {
    	let angle = Math.round(Math.atan2((b.y - a.y),(b.x - a.x)) * 180 / Math.PI);
        return angle;
    }

    cleanCoords(coords) {
    	let XY = {
    		x: this.cleanInt(coords.x),
    		y: this.cleanInt(coords.y)
    	}

    	return XY;
    }

    cleanInt(int) {
    	return Math.round(int);//parseFloat(int.toFixed(2));
    }

    /*
    * equation = { minX: 0, maxX, 100, increment: 1, func: function(x){ return y } } 
    */

	getEquationCoords(equation) {
			let eq = equation;

			let coords = [];

	        for(var x = eq.minX + eq.increment; x <= eq.maxX; x += eq.increment) {
	          coords.push({ x:x, y:eq.func(x) });
	        }

	        return coords;
	}


}

export default Drawing;