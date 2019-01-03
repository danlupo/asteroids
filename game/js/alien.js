import Game from '../game.js';
import Drawing from './drawing.js';
import Bullet from './bullet.js';
import Sparkle from './sparkle.js';
import Sound from './sound.js';

class Alien extends Drawing {

    constructor () {
    	super(Game.renderer.canvas);

    	this.health = 100;
    	this.type = 'alien';
    	this.isTarget = true;
    	
    	this.position = {x:0,y:0};
    	this.direction = 1;
    	this.movement = {x:0,y:0};

        this.movementAmplitude = 100;
        this.yDelta = 0;
        this.xDelta = 0;

        this.frames = 0;

    	this.rotationPrecision = 72;
        this.shootTimer = null;

        this.shootAngle = 0;

        this.flyAway = false;

        this.handleInvasion = true;

        this.chunks = 3;

		this.init();
    }

    init() {
    	this.setMovementVars();
        this.shootTimer = setInterval(() => {
            if(Math.round(Math.random()*3) == 0) {
                this.shoot();
            }
        },500);

        setTimeout(() => {
            this.flyAway = true;
        } ,27000)

    }


    draw() {
 
        this.drawAlien();

        if (Game.showDevInfo) {
            this.drawAmplitude();
            this.drawShotLine();
        }

        this.move();
    }

    addToRenderer() {
        this.disableOtherAliensInvasionHandler();

        this.index = Game.renderer.addElement(this);

        Game.alienInvasion = true;
    }

    disableOtherAliensInvasionHandler() {

        for (var i = Game.renderer.layers.stage.length - 1; i >= 0; i--) {
            if (Game.renderer.layers.stage[i].type = 'alien') {
                Game.renderer.layers.stage[i].handleInvasion = false;
            }
        }
    }

    drawAlien() {

            let rads = function(a) {
                return a * Math.PI/180;
            }

            let ctx = Game.renderer.canvas.ctx;

            //top
            ctx.beginPath();
            ctx.arc(this.position.x,this.position.y + 19 + 10, 40, rads(-135), rads(-45));
            ctx.closePath();
            ctx.fillStyle = '#777';
            ctx.fill();

            //bottom

            ctx.save();
            ctx.beginPath();
            ctx.rect(this.position.x - 40,this.position.y - 38 + 10, 200, 35);
            ctx.clip();

            ctx.beginPath();
            ctx.arc(this.position.x,this.position.y - 38 + 10, 40, rads(45), rads(-225));
            ctx.closePath();
            ctx.fillStyle = '#555';
            ctx.fill();
            ctx.restore();

            //Cabin
            ctx.save()
            ctx.beginPath();
            ctx.arc(this.position.x,this.position.y - 40 + 10, 24, 2*Math.PI, 0);
            ctx.closePath();
            ctx.clip();

            ctx.beginPath();
            ctx.arc(this.position.x,this.position.y - 14 + 10, 12, 2*Math.PI, 0);
            ctx.closePath();
            ctx.fillStyle = '#11CC33';
            ctx.fill();

            ctx.restore();

            //lights
                ctx.fillStyle = '#444';
                ctx.beginPath();
                ctx.arc(this.position.x - 15 ,this.position.y - 10 + 10, 3, 2*Math.PI, 0);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.arc(this.position.x ,this.position.y - 10 + 10, 3, 2*Math.PI, 0);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.arc(this.position.x + 15 ,this.position.y - 10 + 10, 3, 2*Math.PI, 0);
                ctx.closePath();
                ctx.fill();


            if ( this.frames < 15) {   
                ctx.beginPath();
                ctx.arc(this.position.x - 15 ,this.position.y - 10 + 10, 2, 2*Math.PI, 0);
                ctx.closePath();
                ctx.fillStyle = '#ccCC00';
                ctx.fill();
            }

            if ( this.frames > 15 && this.frames < 30) {   
                ctx.beginPath();
                ctx.arc(this.position.x ,this.position.y - 10 + 10, 2, 2*Math.PI, 0);
                ctx.closePath();
                ctx.fillStyle = '#ccCC00';
                ctx.fill();
            }

            if ( this.frames > 30 && this.frames < 45) {   
                ctx.beginPath();
                ctx.arc(this.position.x + 15 ,this.position.y - 10 + 10, 2, 2*Math.PI, 0);
                ctx.closePath();
                ctx.fillStyle = '#ccCC00';
                ctx.fill();
            }

            this.frames = this.frames > 60 ? 0 : this.frames + 1;

    }

    drawAmplitude() {

        let c = Game.renderer.canvas;
            

        let eq = { 
            minX: 0,
            maxX: c.width, 
            increment: 1, 
            func: (x) => {
                return this.getYCoords(x);
            }
        }

        this.sinCoords = this.getEquationCoords(eq);

        this.drawCoords({
            coords: this.sinCoords,
            stroke: '#0CF',
            close: false
        })
    }

    drawShotLine() {
        let ctx = Game.renderer.canvas.ctx;

        ctx.moveTo(this.position.x, this.position.y)
        ctx.lineTo(Game.ship.position.x, Game.ship.position.y);
        ctx.closePath();
        ctx.stroke();
        ctx.strokeStyle = 'none';
    }

    setMovementVars() {
    	this.direction = Math.round(Math.random()) ? -1 : 1;
    	this.position = {
    		x: this.direction > 0 ? -100 : Game.renderer.canvas.width + 100,
            y: Game.renderer.canvas.height/4 + (Math.floor(Math.random()*3))*(Game.renderer.canvas.height/4)
    	}

        this.xDelta = Math.round(Math.random() * 1000);

        this.movementAmplitude = 100 + Math.round(75*Math.random());

        this.yDelta = this.position.y;


    }

    getYCoords(x) {
        let y = this.yDelta + Math.sin((x - this.xDelta)/180)*this.movementAmplitude;;
        return y
    }

    move() {
    	
    	if (Game.status != 'play') return false;

    	this.position.x += this.direction*2;
        //console.log(this.position)
    	this.position.y = this.getYCoords(this.position.x);

        if (this.position.x < -100) {
            this.position.x = Game.renderer.canvas.width + 100;
            this.setMovementVars();

            if (this.flyAway){
                this.remove(this.index);
            }
        }

        
        if (this.position.x > Game.renderer.canvas.width + 100) {
            this.position.x = -100;
            this.setMovementVars();
            
            if (this.flyAway){
                this.remove(this.index);
            }
        }
		
    }

    remove() {
        clearInterval(this.shootTimer);
        Game.renderer.remove(this.index);

        if (this.handleInvasion) {
            Game.alienInvasion = false;
        }
    }

    shoot() {
			let shotOpts = {
				angle: this.getShotAngle(),
				startPoint: JSON.parse(JSON.stringify(this.position)),
				rotationPrecision: 180,
				acceleration: JSON.parse(JSON.stringify(Game.ship.movement)),
                enemyFire: true,
                color: '#0D0',
                sparkleColor: "#0C3",
                speed: 6
			}

			let shot = new Bullet(shotOpts);
			shot.fire();
    }

    getShotAngle() {
    	let angle = this.getLineAngle(this.position, Game.ship.position)

    	return angle + 90;
    }

    explode(randomOffset){
        let position = JSON.parse(JSON.stringify(this.position));
        
        if (randomOffset) {
            position.x += Math.round(Math.random()*30-15);
            position.y += Math.round(Math.random()*30-15);
        }

		let options = {
	    	color: '#0C0',
	    	position: position, //{x:y;}
            size: 30,
    	}

        let sparkle = new Sparkle(options);
        
    }

    takeHit() {

        this.health -= 12;

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        if(Math.round(Math.random()*5) == 1) {//1 of 5 chance
            Game.stats.lives++;
            Game.ship.health = 100;

            this.remove();
            this.explode();

            setTimeout(()=>{
                this.explode(true);
             
                setTimeout(()=>{
                    this.explode(true);
                },200)       
                
            },200);

        } else {
            Game.ship.health = 100;
            this.explode();
            this.remove();
        }

    }

}

export default Alien;