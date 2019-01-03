import Drawing from './drawing.js';
import Sparkle from './sparkle.js';
import Sound from './sound.js';
import Game from '../game.js';

class Meteor extends Drawing {

    constructor (opts) {
    	super(Game.renderer.canvas);

		let options = {
	    	chunks: Math.round(Math.random()) ? 2 : 3, //1 - 3
	    	speed: 5, // 1 - 10
	    	color: '#555',
	    	position: false,
	    	image: null //Image object
    	}
    	if (opts) options = Object.assign(options, opts);

    	this.canvas = Game.renderer.canvas;
    	
    	this.type = 'meteor';
        this.isTarget = true;

    	this.edgeOffset = 80; // random position outside of canvas
    	this.chunks = options.chunks; //1 - 7
    	this.direction = this.getRandomDirection(); //degrees
    	this.speed = this.randomizeSpeed(options.speed); // 1 - 10
    	this.rotation = 0;//Math.ceil(Math.random()*100+1);
    	this.movement = 0;
    	this.position = options.position || this.randomSpawnPoint(); // random position outside of canvas
    	this.toughness = this.chunks; //Shots

    	this.color = options.color;
        this.image = options.image;
    	this.randomRotationDirection = Math.round(Math.random()) ? -1 : 1;
        this.spinSpeed = 120 + Math.ceil(Math.random()*240);

        this.width = 100;
        this.height = 100;

        if (this.image != null) {
            this.width = this.image.width;
            this.height = this.image.height;
        }

    }

    randomSpawnPoint() {
    	let max;
    	let min = -this.edgeOffset;
    	let coords;

    	let axis = Math.ceil(Math.random()*100) > 50 ? 'y' : 'x';

    	if (axis == 'y') {
    		max = this.canvas.height + this.edgeOffset;
	    	coords = {
	    		'x': min*2,
	    		'y': Math.random() * (max - min) + min
	    	}
    	} else {
    		max = this.canvas.width + this.edgeOffset;
    		coords =  {
	    		'x': Math.random() * (max - min) + min,
	    		'y': min*2
	    	}
    	}

    	return coords;
    	
 
    }

    getRandomDirection(){
    	return Math.ceil(Math.random()*360+1)
    }

    randomizeSpeed(speed){
    	// speed +- 0-1-2
    	return speed + Math.pow(-1,Math.ceil(Math.random()*2)) * Math.ceil((Math.random()*3)-1);
    }

    draw(){
    	this.rotation++;
    	this.drawMeteor({
    		angle: this.rotation,
    		center: this.position,
    		color: this.color
    	});

        if (Game.status !== 'paused') {
    	   this.move();
        }
    }

    drawMeteor(opts){
    	let ctx = this.canvas.ctx

		let hasImage = this.image !== null;

        ctx.save();
        ctx.translate( opts.center.x + 20, opts.center.y + 20 );
        ctx.scale(this.chunks/4, this.chunks/4);
        ctx.rotate( this.randomRotationDirection * (opts.angle * Math.PI/this.spinSpeed) );

		if (hasImage) {
            
            ctx.drawImage(this.image, -this.width/2,-this.height/2);

		} else {
            ctx.beginPath();
            ctx.rect( -this.width/2, -this.height/2, this.width, this.height);
            ctx.fillStyle=opts.color;
            ctx.fill();
		}

        ctx.restore();

	}

    move(){

    	// this.direction = 180;
    	// this.position.y = 350;

        var offScreenDistance = 30 * this.chunks;

    	this.position.x = this.position.x + (this.speed/5) * Math.cos(this.direction * Math.PI / 180);
		this.position.y = this.position.y + (this.speed/5) * Math.sin(this.direction * Math.PI / 180);

        this.position.x = this.position.x;// + Game.x;//horizontal motion test
        this.position.y = this.position.y;// + Game.y;


		if (this.position.x < -offScreenDistance) {
			this.position.x = this.canvas.canvas.width + offScreenDistance;
		} else if (this.position.x > this.canvas.canvas.width+offScreenDistance) {
			this.position.x = -offScreenDistance
		}

		if (this.position.y < -offScreenDistance) {
			this.position.y = this.canvas.canvas.height + offScreenDistance;
		} else if (this.position.y > this.canvas.canvas.height+offScreenDistance) {
			this.position.y = -offScreenDistance
		}


		//{x: 490.10057054856605, y: 390.2870400388318}
		// this.position.x = 490;
		// this.position.y = 390;
    }

    remove(){
		Game.renderer.remove(this.index);
    }

    takeHit(){
    	if (this.toughness == 1){

            let rockPosition = JSON.parse(JSON.stringify(this.position));

	    	if (this.chunks > 1) {

	    		for (var i = this.chunks - 1; i >= 0; i--) {

		    		let options = {
				    	chunks: parseInt(this.chunks - 1),
				    	direction:  this.getRandomDirection(), //degrees
				    	speed: parseInt(this.speed), // 3 - 5
				    	position: JSON.parse(JSON.stringify(rockPosition)),
				    	image: this.image,
				    	game: Game
			    	}

		    		this.spawn(options);
		    	}

	    	}
	    	Game.addScore(50); //simple hit
            this.explosion({
                x: rockPosition.x + this.width/4,
                y: rockPosition.y + this.height/4
            });

            Sound.explosion.instance.volume = 0.33 * this.chunks;
            Sound.explosion.play();
    		this.remove();

    	} else {
            Sound.hit.play();
    		this.toughness--;
    		Game.addScore(10); //simple hit
    	}

    }

    explosion(position) {
        let options = {
            //speed: 50,
            color: 'orange',
            position: JSON.parse(JSON.stringify(position)), //{x:y;}
            size: Math.round(this.chunks*40/3)
        }

        let sparkle = new Sparkle(options);
        
    }

    spawn(opts) {
    	Game.renderer.addToStageBottom(new Meteor(opts));
    }

}


export default Meteor;