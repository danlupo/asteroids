import Drawing from './drawing.js';
import Sparkle from './sparkle.js';
import Sound from './sound.js';
import Game from '../game.js';

class Bonus extends Drawing {

    constructor (opts) {
    	super(Game.renderer.canvas);

		let options = {
	    	speed: 5, // 1 - 10
	    	color: '#555',
	    	position: false
    	}
    	if (opts) options = Object.assign(options, opts);

    	this.canvas = Game.renderer.canvas;

        this.width = 16;
        this.height = 22;
    	

    	this.type = 'bonus';
        this.isTarget = true;

    	this.edgeOffset = 80; // random position outside of canvas

    	this.direction = this.getRandomDirection(); //degrees
    	this.speed = this.randomizeSpeed(options.speed); // 1 - 10
    	this.rotation = 0;//Math.ceil(Math.random()*100+1);

    	this.position = options.position || this.randomSpawnPoint(); // random position outside of canvas
    	this.toughness = 5; //Shots

    	this.color = options.color;
    	this.randomRotationDirection = Math.round(Math.random()) ? -1 : 1;
        this.spinSpeed = 120 + Math.ceil(Math.random()*240);
        this.chunks = 2;
    

        this.init();

    }

    init() {
        this.timeout = setTimeout(()=>{
            this.explosion(this.position);
            this.remove();
        }, 17000)
    }

    randomSpawnPoint() {
    	let max;
    	let min = -this.edgeOffset;
    	let coords;

    	let axis = Math.ceil(Math.random()*100) > 50 ? 'y' : 'x';

    	if (axis == 'y') {
    		max = this.canvas.height + this.edgeOffset;
    		//console.log(max)
	    	coords = {
	    		'x': min*2,
	    		'y': Math.random() * (max - min) + min
	    	}
    	} else {
    		max = this.canvas.width + this.edgeOffset;
			//console.log(max)
    		coords =  {
	    		'x': Math.random() * (max - min) + min,
	    		'y': min*2
	    	}
    	}

    	return coords;
    	
 
    }

    getRandomDirection(){

        let dir = 0;

        if (Math.round(Math.random())) {
            dir = 30+Math.round(Math.random()*30)
        } else {
            dir = 210+Math.round(Math.random()*30)
        }

        return dir;

    }

    randomizeSpeed(speed){
    	// speed +- 0-1-2
    	return speed + Math.pow(-1,Math.ceil(Math.random()*2)) * Math.ceil((Math.random()*3)-1);
    }

    draw(){
    	this.rotation++;
    	this.drawBonus({
    		angle: this.rotation,
    		center: this.position,
    		color: this.color
    	});

        if (Game.status !== 'paused') {
    	   this.move();
        }
    }

    drawBonus(options){
    	let ctx = this.canvas.ctx

        let opts = {};

		if (options) opts = Object.assign(opts, options);


			ctx.save();
            ctx.translate( this.position.x + 20, this.position.y + 20 );
            ctx.rotate( this.rotation * Math.PI/100 );
            
            //pill shape
            ctx.beginPath();
            ctx.rect( -this.width/2, -this.height/2, this.width, this.height);
            ctx.arc(0, -this.height/2, this.width/2, 0, 2*Math.PI);
            ctx.arc(0, this.height/2, this.width/2, 0, 2*Math.PI);
			ctx.fillStyle='#FFF';
			ctx.fill();

            ctx.beginPath();
            ctx.rect( -this.width/2 + 2, -this.height/2 + 1, this.width - 4, this.height - 2);
            ctx.arc(0, -this.height/2 + 1, this.width/2 - 2, 0, 2*Math.PI);
            ctx.arc(0, this.height/2 - 1, this.width/2 - 2, 0, 2*Math.PI);
            ctx.fillStyle='#CCC';
            ctx.fill();

            ctx.beginPath();
            ctx.rect( -this.width/2, -this.height/2, this.width, 3);
            ctx.rect( -this.width/2, this.height/2-3, this.width, 3);
            ctx.fillStyle='#F00';
            ctx.fill();


            ctx.globalAlpha = 0.2;

            ctx.beginPath();
            ctx.rect( -this.width/2, -this.height/2 - 4, (this.width - 4)/2, this.height + 8);
            ctx.fillStyle='#000';
            ctx.fill();

            ctx.beginPath();
            ctx.rect( this.width/2 - 6, -this.height/2 - 4, (this.width - 4)/2, this.height + 8);
            ctx.fillStyle='#FFF';
            ctx.fill();

            ctx.globalAlpha = 1;

			ctx.restore();


	}

    move(){


    	this.position.x = this.position.x + (this.speed/5) * Math.cos(this.direction * Math.PI / 180);
		this.position.y = this.position.y + (this.speed/5) * Math.sin(this.direction * Math.PI / 180);


		if (this.position.x < -40) {
			this.position.x = this.canvas.canvas.width + 40;
		} else if (this.position.x > this.canvas.canvas.width+40) {
			this.position.x = -40
		}

		if (this.position.y < -40) {
			this.position.y = this.canvas.canvas.height + 40;
		} else if (this.position.y > this.canvas.canvas.height+40) {
			this.position.y = -40
		}

    }

    remove(){
        clearTimeout(this.timeout);
		Game.renderer.remove(this.index);
    }

    takeHit(){

    	if (this.toughness == 1){

            let bonusPosition = JSON.parse(JSON.stringify(this.position));

	    	Game.addScore(10); //simple hit
            this.explosion({
                x: bonusPosition.x + this.width/4,
                y: bonusPosition.y + this.height/4
            });
            
            Game.ship.getReward();

            this.remove();
    		

    	} else {
            Sound.hit.play();
    		this.toughness--;
    	}

    }

    explosion(position) {
        let options = {
            color: 'orange',
            position: JSON.parse(JSON.stringify({x:position.x + this.width/2,y: position.y + this.height/2})), //{x:y;}
            size: 30
        }
        Sound.explosion.play();

        let sparkle = new Sparkle(options);
    }

    spawn(opts) {
    	Game.renderer.addToStageBottom(new Bonus(opts));
    }

}


export default Bonus;