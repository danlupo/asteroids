import Drawing from './drawing.js';
import Bullet from './bullet.js';
import Images from './images.js';
import Sparkle from './sparkle.js';
import Controls from './controls.js';
import Sound from './sound.js';
import Game from '../game.js';

class Spacecraft extends Drawing {

    constructor () {
    	super(Game.renderer.canvas);

    	this.rotation = 0; //degrees
    	this.maxRotation = 72; //= 360 converted to radians
    	this.rotationPrecision = 72;
    	this.shield = {
    		health: 100, //full
    		alpha: 1,
    		radius: 39,
    		active: false,
    		deactivating: false,
    		fillStyle: '#002222',
    		strokeStyle: '#004ab4'
    	}

    	this.position = Game.renderer.canvas.getCenter();

    	this.shipHitColor = '#F00';

    	this.takeHits = true;
    	this.health = 100;
    	this.movement = {x: 0, y: 0};
    	this.type = 'spacecraft';
    	this.coordinates;
    	this.lastAngle = this.rotation;
    	this.controls = {};

		this.image = null;
		this.imageO = null;
		this.imageThrust = null;

		this.bonusDuration = 15*1000;

		this.maxControlsVelocity = 6;
		this.controlsVelocityIncrement = 1/40;

		this.reverseThrust = false;
		this.thrustOn = false;

    	let SpaceshipImage = new Images('images/spacecraft.svg', () => {
			this.image = SpaceshipImage.image;
			this.imageO = SpaceshipImage.image;
		});
    	let SpaceshipImageThrust = new Images('images/spacecraft-thrust.svg', () => {
			this.imageThrust = SpaceshipImageThrust.image;
		});

		this.burstShot = false;
		this.trippleShot = false;


		this.shipHotPointsB = [

			{x: 22, y: 17},//right side
			{x: 22, y: 10},
			{x: 19, y: 4.5},
			{x: 18, y: -3},
			{x: 12, y: -7.5},
			{x: 10, y: -13.5},
			{x: 6, y: -20},
			{x: 0, y: -24.5}, // tip
			{x: -6, y: -20}, //left side
			{x: -10, y: -13.5},
			{x: -12, y: -7.5},
			{x: -18, y: -3},
			{x: -19, y: 4.5},
			{x: -22, y: 10},
			{x: -22, y: 17},
			{x: -22, y: 17},//bottom
			{x: -16, y: 17},
			{x: -10, y: 17},
			{x: -3, y: 17},
			{x: 3, y: 17},
			{x: 10, y: 17},
			{x: 16, y: 17}

		];

		this.shipHotPoints = JSON.parse(JSON.stringify(this.shipHotPointsB));

		this.visible = true;


		this.gunCharge = 100;
		this.shooting = false;

		this.particleBurstRadius = 0;
		this.friction = false;

		this.alive = true;

		this.init();
    }

    init() {
    	this.addToRenderer();
    }

    move(i) {

    	
    	if (Game.status != 'play') return false;

    	let max = this.maxControlsVelocity;

    	let vector = this.centerRotate({ x:0, y:max }, this.rotation, this.rotationPrecision, {x:0,y:0});
    	let delta = {
    		x: -i*vector.x*this.controlsVelocityIncrement,
    		y: -i*vector.y*this.controlsVelocityIncrement
    	}

    	if (Math.abs(this.movement.x) >= max) { 
    		let signX = this.movement.x < 0 ? -1 : 1;
    		this.movement.x = signX*max;
    	}
    	if (Math.abs(this.movement.y) >= max) { 
    		let signY = this.movement.y < 0 ? -1 : 1;
    		this.movement.y = signY*max;
    	}

		this.movement.x = this.movement.x + delta.x;
		this.movement.y = this.movement.y + delta.y;


    }

	inertiaMovement() {
		if (Game.status == 'play') {
		    	this.position.x +=  this.movement.x;
		    	this.position.y +=  this.movement.y;

		    	this.position = this.position;
    	}
    	
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




		if (!this.thrustOn && this.friction) {

			//FRICTION
			let frictionAmount = 0.03;
			if (this.movement.x != 0) {
				if (this.movement.x < 0) {
					this.movement.x += Math.abs(this.movement.x)*frictionAmount;
				} else {
					this.movement.x -= Math.abs(this.movement.x)*frictionAmount;
				}
			}
			if (this.movement.y != 0) {
				if (this.movement.y < 0) {
					this.movement.y += Math.abs(this.movement.y)*frictionAmount;
				} else {
					this.movement.y -= Math.abs(this.movement.y)*frictionAmount;
				}
			}

		} 

	}

    startThrust() {
		if (this.imageThrust !== null && this.imageThrust !== 'undefined') {
			this.image = this.imageThrust;
		}

		if(!this.thrustOn) {
			Sound.thrust.play();
			this.thrustOn = true;
		}
    }

    stopThrust() {
		if (this.imageO !== null && this.imageO !== 'undefined') {
			this.image = this.imageO;
		}
		Sound.thrust.stop();
		this.thrustOn = false;
    }

    startReverseThrust() {
    	this.reverseThrust = true;
    	if(!this.thrustOn) {
			Sound.thrust.play();
			this.thrustOn = true;
		}
    }

    stopReverseThrust() {
    	this.reverseThrust = false;
    	Sound.thrust.stop();
		this.thrustOn = false;
    }

    rotateShip(direction) {

    	if (Game.status != 'play') return false;

    	this.rotation = this.rotation + direction;

		this.shipHotPoints.forEach((v,i) => {
			this.shipHotPoints[i] = this.centerRotate(v, direction, this.rotationPrecision, {x:0,y:0});
		})

    }

    weaponsUpdater() {
    	if (!this.shooting && this.gunCharge < 100) {
    		this.gunCharge += 1;
    	}

    	if (this.shooting) {
    		this.gunCharge -= 5/15;	
    	}

		if (this.gunCharge <= 0) {
			this.gunCharge = 0;
		}
    }

    shoot() {
    	let shots = 1;
		let angles = [];

		if (this.trippleShot) {
			shots = 3;
			angles.push(JSON.parse(JSON.stringify(this.rotation - 3)));
			angles.push(JSON.parse(JSON.stringify(this.rotation)));
			angles.push(JSON.parse(JSON.stringify(this.rotation + 3)));
		} else {
			angles.push(JSON.parse(JSON.stringify(this.rotation)));
		}

		for (var i = 0; i < shots; i++) {

			let shotOpts = {
				angle: JSON.parse(JSON.stringify(angles[i])),
				startPoint: JSON.parse(JSON.stringify(this.position)),
				rotationPrecision: JSON.parse(JSON.stringify(this.rotationPrecision)),
				acceleration: this.movement,
				burst: this.burstShot

			}

			let shot = new Bullet(shotOpts);
			shot.fire();
		}
    }

    reset() {
    	this.rotation = 0;
    	this.movement.x = 0;
    	this.movement.y = 0;
    	this.health = 100;
    	this.position = Game.renderer.canvas.getCenter();
    	this.shield.health = 100;
    	this.takeHits = true;
    	this.particleBurstRadius = 0;
    	this.alive = true;
    	this.shipHotPoints = JSON.parse(JSON.stringify(this.shipHotPointsB));

    	if (this.index == null) {
    		this.addToRenderer();
    	}
    }

    draw() {

    	if (!this.alive) {
    		this.drawExplosion();
    	} else {

			let ctx = Game.renderer.canvas.ctx;

			ctx.save();

			ctx.translate( this.position.x, this.position.y );
			ctx.rotate( this.rotation * (Math.PI/this.rotationPrecision));

    		this.drawShield();
			this.checkHit();
	    	this.drawShip();

	    	ctx.restore();

	    	if (!this.visible) {
				this.drawHotPoints(); //for testing
	    	}
    	}

    	//frame hanler
		this.inertiaMovement();
    	this.weaponsUpdater();
	}

	addToRenderer() {
		this.index = Game.renderer.addToForeground(this);
	}

	drawShip() {
			if (this.image == null || this.image == 'undefined') {
				return false;
			}

			let ctx = Game.renderer.canvas.ctx;

			// Create gradient

			if (this.reverseThrust && this.visible) {
				ctx.beginPath();
				ctx.arc(0,-5, 20, 0, 2*Math.PI);
				let grd = ctx.createRadialGradient(0,-5, 0.000, 0,-5, 20);
				grd.addColorStop(0.000, 'rgba(0, 200, 255, 1.000)');
				grd.addColorStop(1.000, 'rgba(0, 200, 255, 0.000)');
				ctx.fillStyle = grd;
				ctx.fill();
			}

			if (!this.takeHits) {
				let flickerFreq = Game.renderer.frames%2;
				if(flickerFreq) {
					ctx.globalAlpha = 0.5;
				}
			}

			if(this.visible) {
				ctx.drawImage(this.image, -this.image.width/2, -this.image.height/2);
			}
		
			ctx.globalAlpha = 1;

	}

	drawShield(){

		if (this.shield.active || this.shield.deactivating) {

			let ctx = Game.renderer.canvas.ctx;

			ctx.beginPath();

			let tempAlpha = this.shield.alpha * Math.floor((Math.random()*5+6))/10;
			ctx.globalAlpha = tempAlpha;
			ctx.arc(0, 0, this.shield.radius , 0, 2*Math.PI);
			ctx.strokeStyle = this.shield.strokeStyle;
			ctx.stroke();
			ctx.globalAlpha = 1;

			//Use shield health
			
			this.shield.health = this.shield.health - 1/4;

			//degrade deactivated shield
			if (this.shield.deactivating) {
				this.shield.alpha = this.shield.alpha - 0.04;

				if (this.shield.alpha <= 0 || this.shield.health <= 0) {
					this.shield.deactivating = false;
					this.shield.active = false;
		
				}
			}

			if (this.shield.health <= 0) {
				this.shield.deactivating = false;
				this.shield.active = false;
			}

		}
	}

	drawExplosion(){

		if (this.particleBurstRadius < 2000) {

			this.particleBurstRadius++;
			let shieldCirc = 20;
			let ctx = Game.renderer.canvas.ctx;

			let particleColors = ['#3b5c77','#91c6f1','#cbe9fa']

			for (let i = 0; i < shieldCirc; i++) {
				let rads = i*(360/shieldCirc) * Math.PI/180;

			    let x2 = Math.pow(this.particleBurstRadius,2)/10 * Math.cos(rads + this.particleBurstRadius/50) + this.position.x;
			    let y2 = Math.pow(this.particleBurstRadius,2)/10 * Math.sin(rads + this.particleBurstRadius/50) + this.position.y;

				ctx.beginPath();
				ctx.arc(x2, y2, 3 , 0, 2*Math.PI);
				ctx.fillStyle = particleColors[i%2];
				ctx.fill();
			}

		}

	}

	activateShield() {
		if (this.shield.health > 0) {
			this.shield.active = true;
			this.shield.deactivating = false;
			this.shield.alpha = 1;
		}
	}

	deactivateShield() {
		this.shield.deactivating = true;
	}

	refreshShield() {
		this.shield.health = 100;
	}


	drawHotPoints(){

	
			let ctx = Game.renderer.canvas.ctx;

		    for (let i = this.shipHotPoints.length - 1; i >= 0; i--) {

		    	let x = this.shipHotPoints[i].x + this.position.x;
		    	let y = this.shipHotPoints[i].y + this.position.y;

		    	ctx.beginPath();
				ctx.arc(x, y, 1.5 , 0, 2*Math.PI);
				if (this.shield.active) {
					ctx.fillStyle = '#444';
				} else {
					ctx.fillStyle = '#0C4';
				}
				ctx.fill();
		    
		    }

		    if (this.shield.active) {
		    	let shieldCirc = 30;
			    for (let i = shieldCirc; i >= 0; i--) {

			    	let x,y;


				    	let rads = i*(360/shieldCirc) * Math.PI/180;
					    x = this.shield.radius * Math.cos(rads) + this.position.x;
					    y = this.shield.radius * Math.sin(rads) + this.position.y;


			    	ctx.beginPath();
					ctx.arc(x, y, 1.5 , 0, 2*Math.PI);
					ctx.fillStyle = '#0C4';
					ctx.fill();
			    
			    }
		    }

		    this.drawCoords({ coords: this.shipHotPoints, fill: 'rgba(155,0,30,0.05)', offset: this.position })

	    
	}

	checkHit(){

	
			let ctx = Game.renderer.canvas.ctx;

			let shieldCirc = 30; //40;

			let hitPointsCount = this.shield.active ? shieldCirc : this.shipHotPoints.length - 1;

		    for (let i = hitPointsCount; i >= 0; i--) {

		    	let x,y;

		    	if (this.shield.active) {

			    	let rads = i*(360/shieldCirc) * Math.PI/180;
				    x = this.shield.radius * Math.cos(rads) + this.position.x;
				    y = this.shield.radius * Math.sin(rads) + this.position.y;
		    	} else {
		    		x = this.shipHotPoints[i].x + this.position.x;
		    		y = this.shipHotPoints[i].y + this.position.y;
		    	}


				let data = this.canvas.ctx.getImageData(x, y, 1, 1).data; 
				//var rgb = [data[0], data[1], data[2]];
				let r = data[0];

				if (r > 0) { //hit a red pixel

					if (this.takeHits) {
						this.sparkle({x: x, y: y});
					}

					if (this.shield.active){

						
						let damage = this.collision({x: x,y: y});

						this.shield.health = this.shield.health - (damage * 1/3);

						if (this.shield.health <= 0) {
							this.shield.health = 0;
							this.deactivateShield();
						}

					} else {
						if (this.takeHits) {

							let damage = this.collision({x: x,y: y});
							this.damage(3 * damage);
						}
					}
				}


		    }
	    
	    
	}

	tempProtect(){

		this.takeHits = false;

		setTimeout(()=>{
			this.takeHits = true;
		}, 300);
		
	}

	kill() {
		this.alive = false;
	}

    collision(position) {

        let distance = 100; //float
        let closest; //Object
        
        Game.renderer.layers.stage.forEach((v,i) => {
            
            if (v.isTarget) {
	            let d = v.getDistance(v.position, position);
	            if (d < distance) {
	                distance = d;
	                closest = v;
	            }
	        }

        });

		let chunks = 1;

        if (!!closest)  {
        	chunks = closest.chunks;
        	closest.takeHit();
        }

        this.tempProtect();

        return chunks;

    }

    setBurstShot() {
    	this.burstShot = true;
    	clearInterval(this.burstShotImeout)

    	this.burstShotImeout = setTimeout(()=>{
    		this.burstShot = false;
    	}, this.bonusDuration)
    }

    setTripleShot() {
    	this.trippleShot = true;
    	clearInterval(this.trippleShotTimeout);

    	this.trippleShotTimeout = setTimeout(()=>{
    		this.trippleShot = false;
    	}, this.bonusDuration)
    }

    setFriction() {
    	this.friction = true;
    	clearInterval(this.frictionTimeout);

    	this.frictionTimeout = setTimeout(()=>{
    		this.friction = false;
    	}, this.bonusDuration*2)
    }

    getReward() {

    	let max = this.shield.health == 100 ? 2 : 3;
    	var random = Math.round(Math.random()*max); //0-1 || 0-2;

		switch (random) {
			case 0: //shift
				this.setTripleShot();
				break;
			case 1:
				this.setBurstShot();
				break;
			case 2:
				this.setFriction();
				break;	
			case 3:
				this.refreshShield();
				Game.addScore(100);
				break;			
		}

    }

    sparkle(coords){
		let options = {
	    	color: this.shield.active ? this.shield.strokeStyle : this.shipHitColor,
	    	position: coords, //{x:y;}
            size: 15
    	}

        let sparkle = new Sparkle(options);
        
    }

    damage(qty) {
    	let newHealth = parseInt(this.health) - qty;
        if (newHealth <= 0) newHealth = 0;

        this.health = newHealth;
    }


}

export default Spacecraft;