class Canvas {

    constructor (options) {

        this.opts = {
            id: 'canvas',
            context: '2d'
        };

    	if (options) this.opts = Object.assign(this.opts, options);

        this.id = this.opts.id;
     	this.context = this.opts.context;
     	this.canvas = document.getElementById(this.id);
     	this.ctx = this.canvas.getContext(this.context,  { alpha: false });
     	this.center = this.getCenter();
        this.guideLines = false;

        this.w = this.opts.w || window.innerWidth;
        this.h = this.opts.h || window.innerHeight;

        this.backgrounds = [];

        this.green = false;
        this.bgColor = {
            r: 0,
            g: 17,
            b: 34
        }


        this._fit();
        this._bindings();
        this.BGstars = this.getRandomStarCoords(30);
        this.BGstarsColor = '#00c3ff';
  
    }

    _fit() {

        this.width = Math.min(window.innerWidth, this.w);
        this.height = Math.min(window.innerHeight, this.h);

    	this.canvas.width  = this.width;
  		this.canvas.height = this.height;



  		this.center = this.getCenter();
    }

    _bindings() {
    	window.addEventListener('resize', () => { 
	    	this._fit();
    	});
    }


    draw(wipe) {

    	if (wipe) this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    	this.canvasBackground();

        this.drawStarsBG();
	
	}

	canvasBackground() {
		this.ctx.beginPath();
		this.ctx.rect(0,0,this.canvas.width,this.canvas.height);

        this.setFillStyle();
		this.ctx.fill();

        if (this.guideLines) {
            this.drawGuideLines();
        }
	}

    setFillStyle() {
        if (this.green) {
            if (this.bgColor.g < 25) this.bgColor.g++;
            if (this.bgColor.b > 17) this.bgColor.b--;
        } else {
            if (this.bgColor.g > 17) this.bgColor.g--;
            if (this.bgColor.b < 34) this.bgColor.b++;
        }
        this.ctx.fillStyle = 'rgb(' + this.bgColor.r + ',' + this.bgColor.g + ',' + this.bgColor.b + ')';
    }

    drawGuideLines() {
        //center guidelines
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width/2,0);
        this.ctx.lineTo(this.canvas.width/2,this.canvas.height);
        this.ctx.moveTo(0,this.canvas.height/2);
        this.ctx.lineTo(this.canvas.width,this.canvas.height/2);


        this.ctx.moveTo(0,0);
        this.ctx.lineTo(this.canvas.width,this.canvas.width);
        this.ctx.moveTo(this.canvas.width,0);
        this.ctx.lineTo(0, this.canvas.width);

        this.ctx.strokeStyle = '#055';
        this.ctx.stroke();
    }

	getCenter() {
		return {
			x: this.canvas.width/2,
			y: this.canvas.height/2
		}
	}

    getRandomStarCoords(i) {
        let coords = [];

        let max = {x: this.width+80, y:this.height+80}

        for (var j = 0; j <= i; j++) {
            coords.push({
                x: Math.floor(Math.random()*max.x),
                y: Math.floor(Math.random()*max.y)
            })
        }

        return coords;
    }

    drawStarsBG() {
        this.BGstars.forEach((v,i) => {
            //console.log(v);
            this.ctx.beginPath();

            let radius = Math.round(Math.random()) + 1;
            
            if (i%4 == 0) {
                v = this.moveStars(v);
                radius = radius*1.5;
            }

            //let alpha = radius > 1 ? 0.2 : (5 + Math.floor(Math.random()*3))/10;
            let alpha = (1 + Math.floor(Math.random()*3))/10;

            if (true) {
                this.ctx.arc(v.x, v.y, 1 , 0, 2*Math.PI);
                this.ctx.globalAlpha = 0.4;
                this.ctx.fillStyle = '#0FF';
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            }

            this.ctx.arc(v.x, v.y, radius , 0, 2*Math.PI);
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = this.BGstarsColor;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;


            v = this.moveStars(v);


        });
    }

    moveStars(coords) {
        let pos = coords;
            pos.x += 1/7;
            pos.y += 1/14;

            if (pos.x < -40) {
                pos.x = this.canvas.width + 40;
            } else if (pos.x > this.canvas.width+40) {
                pos.x = -40
            }

            if (pos.y < -40) {
                pos.y = this.canvas.height + 40;
            } else if (pos.y > this.canvas.height+40) {
                pos.y = -40
            }

            return pos;
    }

}

export default Canvas;