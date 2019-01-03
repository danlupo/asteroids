import Game from '../game.js';

class Sparkle {

    constructor (opts) {

    	this.canvas = Game.renderer.canvas;
        
    	this.type = 'sparkles';

		let options = {
	    	speed: 200,
	    	color: '#F00',
            secondaryColor: '#FFF',
	    	position: false,
            size: 16
    	}

    	if (opts) options = Object.assign(options, opts);

    	this.position = options.position; // random position outside of canvas
    	this.initialRadius = 1;
        this.maxRadius = options.size;
        this.speed = options.speed/85;

        this.alpha = 1;
        this.alphaSteps = this.alpha/((this.maxRadius - this.initialRadius)/this.speed) / 2;
        this.color = options.color;
        this.secondaryColor = options.secondaryColor;

    	this._init();

    }

    _init() {
    	this.index = Game.renderer.addToForeground(this);
    }

    draw(){
        let ctx = this.canvas.ctx;
        let center = this.canvas.getCenter();

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.initialRadius , 0, 2*Math.PI);
        ctx.fillStyle = this.color;

        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.closePath()
        ctx.globalAlpha = 0.5;

        ctx.beginPath();
        ctx.fillStyle = this.secondaryColor;
        ctx.arc(this.position.x, this.position.y, this.initialRadius/3 , 0, 2*Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;

        this.initialRadius += this.speed;

        this.alpha -= this.alphaSteps;

        if (this.alpha <= 0) {
            this.alpha = 0;
        }

        if (this.initialRadius >= this.maxRadius) {
        	this.remove();
        }
    }

    remove() {
        Game.renderer.rewriteIndexes('foreground');
        Game.renderer.remove(this.index, 'foreground');
    }

}


export default Sparkle;