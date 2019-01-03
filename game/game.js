import Renderer from './js/renderer.js';
import Canvas from './js/canvas.js';
import Spacecraft from './js/spacecraft.js';
import Manager from './js/gamemanager.js';
import Controls from './js/controls.js';
import Sound from './js/sound.js';
import Images from './js/images.js';

class Game {
	constructor(){


		this.renderer = new Renderer();

		this.c = this.renderer.canvas;


		this.stats = {
			score: 0,
			lives: 3,
			level: 1,
			health: 0,
			shield: 0
		}

		this.levelPassScores = [
			2000,
			10000,
			25000,
			70000,
			115000,
			160000,
			260000,
			460000,
			860000,
			9999999
		]

		this.status = 'new';

		this.seconds = 0;
    	
    	this.frameRate = 60;

		this.gameEngine = null;

		this.showDevInfo = false;

		this.doOncePerLife = true;

		this.alienInvasion = false;


		this.type = 'game';

    	let introImage = new Images('images/arcade.jpg', () => {
			this.intro = introImage.image;
		});


		this.init();
	}

	init() {



    	this.controls = {
			escape: () => {

				if (this.status == 'new') {
					
					this.startGame();

				} else if (this.status == 'play') {
					this.pauseGame();
				} else if (this.status == 'gameover') {
					this.restartGame();
				} else {
					this.resume();
				}

				return 0;
			},
			digitFunction: (num) => {
				
				if (this.status == 'new') {
					
					this.startGame(num);

				}

				return 0;
			},
			mKey: () => {
				Sound.mute();

				return 0;
			},

			dKey: () => {
				let showShipPoints = false;
				if (this.showDevInfo) {
					this.showDevInfo = false;
				} else {
					this.showDevInfo = true;
					showShipPoints = true;
				}

				if (typeof this.ship.visible == 'boolean') {
					this.ship.visible = !showShipPoints;
				}

				return 0;
			},
			xKey: () => {

				if (this.status != 'play' || this.ship.gunCharge <= 0) return false;

				this.ship.shooting = true;

				const FRQ = 175;


				if (this.ship.burstShot) {
					let i = 1;
					let int = setInterval(()=>{
						this.ship.shoot();
						i++

						if (i>3) {
							clearInterval(int);
						}
					},FRQ/3)

				} else {
					this.ship.shoot();
				}

				return 175;

			},

			xKeyKeyup: () => {
				this.ship.shooting = false;
			},

			turnRight: () => {
				this.ship.rotateShip(1);
				return 15; //speed
			},

			turnLeft: () => {
				this.ship.rotateShip(-1)
				return 15; //speed
			},

			arrowUp: () => {

				this.ship.move(+1);
				this.ship.startThrust();

				return 30;
			},
			arrowUpKeyup: () => {

				this.ship.stopThrust();

			},

			arrowDown: () => {

				this.ship.move(-1);

				this.ship.startReverseThrust();

				return 30;
			},

			arrowDownKeyup: () => {
				this.ship.stopReverseThrust();
			},

			spacebar: () => {

				if (this.status == 'new') {
					this.startGame();
				}

				this.ship.activateShield();
				return 0;
			},

			spacebarKeyup: () => {
				this.ship.deactivateShield();
			}

    	}

    	this.addGameToRenderer();

    	new Controls(this);


	}

	restartGame(hasLife) {
		
		this.pauseGame();
		this.doOncePerLife = true;

		if (hasLife) {

			this.stats.health = 100;
			this.stats.lives -= 1;

		} else {
			//gameover
			this.stats = {
				score: 0,
				lives: 3,
				level: 1,
				health: 0
			}			

			this.manager.reset();
		}

		this.ship.reset();

		this.resume();


	}

	addGameToRenderer() {

		let hasGame = false;

		for (var i = 0; i < this.renderer.layers.overlay.length; i++) {
			if (this.renderer.layers.overlay[i].type == 'game') {
				hasGame = true;
			}
		}

		if (!hasGame) {
			this.renderer.addToOverlay(this);
		}
	}

	startGame(num) {

		if (num) {
			this.stats.level = num;
		}

		this.ship = new Spacecraft();

		this.manager = new Manager();

		this.status = 'play';

    	this.resume();
	}

	gameOver() {
		this.pauseGame();
		this.status = 'gameover';

		this.ship.kill();
	}

	newLife() {

		this.ship.kill();

		setTimeout(()=>{
			this.restartGame(true);
		},1000)
	}

	pauseGame() {
		this.status = 'paused';
		clearInterval(this.gameEngine);
	}

	resume() {

		this.status = 'play';

		this.gameEngine = setInterval(() => {
			
			if (this.stats.score > this.levelPassScores[this.stats.level-1]) {
				this.stats.level++;

				this.manager.spawnAlien();

				//level up score
				this.stats.score = Math.floor(100 + this.stats.score + this.stats.score * 0.1);				
				
			}

    		this.seconds++;
    		this.frameRate = this.renderer.frames;
    		this.renderer.frames = 0;

		}, 1000);
	}

	draw() {

		if (this.status == 'new') {
			//intro
			this.drawIntro();
		} else {
			if (this.status != 'gameover') {
				this.drawHUD();	
			}
		}

		if (this.status == 'gameover'){
			this.drawGameOver();
		}

		if (this.status == 'paused') {
			//intro
			this.drawPaused();
		}

		this.frameHandler();
	}


	drawHUD() {
		let ctx = this.c.ctx;
		let center = this.c.getCenter();
		


		if (this.showDevInfo) {
			let filter = this.c.ctx.filter;
			this.c.ctx.filter = 'none'
			ctx.textAlign = 'start';
			ctx.font="10px courier";
			ctx.fillStyle = "#0A2";
			ctx.textAlign = "end";
			ctx.fillText('fps: ' + this.frameRate , this.c.width - 10, this.c.height - 35);
			ctx.fillText(this.renderer.memoryUsage() , this.c.width - 10, this.c.height - 20);

			this.c.ctx.filter = filter;
		}


		//GUN CHARGE

		ctx.beginPath();

		let gunCharge = Math.floor(this.ship.gunCharge)/100;

		let puffAbit = 10 - 10*gunCharge;

		let gBox = {x:179+puffAbit, bx: 122+puffAbit/2}

		let bottomY = 28*gunCharge;

		let bottomX =  (gBox.x-gBox.bx)*gunCharge;

		let green = 181;

		if (100*gunCharge <= 15) {
			green = green*Math.random();
		} else {
			green = green*gunCharge
		}


		ctx.beginPath();
		ctx.moveTo(center.x - gBox.x, 0);
		ctx.lineTo(center.x + gBox.x, 0);
		ctx.lineTo(center.x + gBox.bx, 28);
		ctx.lineTo(center.x - gBox.bx, 28);
		ctx.closePath();
		ctx.fillStyle = 'rgb(255,'+ green  +',0)';
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(center.x - gBox.x, 0);
		ctx.lineTo(center.x + gBox.x, 0);
		ctx.lineTo(center.x + gBox.x - bottomX, bottomY);
		ctx.lineTo(center.x - gBox.x + bottomX, bottomY);
		ctx.closePath();
		ctx.globalAlpha = 0.5 + 0.5*gunCharge;
		ctx.fillStyle = '#555';
		ctx.fill();

		ctx.globalAlpha = 1;




		//HUD frame shape
		ctx.beginPath();
		ctx.moveTo(center.x - 165, 0);
		ctx.lineTo(center.x + 165, 0);
		ctx.lineTo(center.x + 112, 32);
		ctx.lineTo(center.x + 53, 32);
		ctx.lineTo(center.x + 32, 45);
		ctx.lineTo(center.x - 32, 45);
		ctx.lineTo(center.x - 53, 32);
		ctx.lineTo(center.x - 112, 32);
		ctx.closePath();
		ctx.fillStyle = '#444';
		ctx.fill();
		//HUD frame shade
		ctx.beginPath();
		ctx.moveTo(center.x - 165, 0);
		ctx.lineTo(center.x + 165, 0);
		ctx.lineTo(center.x + 112, 32);//
		ctx.lineTo(center.x + 56, 12);//
		ctx.lineTo(center.x + 53, 32);
		ctx.lineTo(center.x + 32, 45);
		ctx.lineTo(center.x, 0);//
		ctx.lineTo(center.x - 32, 45);
		ctx.lineTo(center.x - 53, 32);
		ctx.lineTo(center.x, 0);//
		ctx.lineTo(center.x - 112, 32);
		ctx.closePath();
		ctx.fillStyle = '#222';
		ctx.fill();

		//HUD Black Pannel
		ctx.beginPath();
		ctx.moveTo(center.x - 160, 0);
		ctx.lineTo(center.x + 160, 0);
		ctx.lineTo(center.x + 110, 30);
		ctx.lineTo(center.x - 110, 30);
		ctx.closePath();
		ctx.fillStyle = '#000';
		ctx.fill();





		//HUD time

		ctx.beginPath();
		ctx.moveTo(center.x - 50, 30);
		ctx.lineTo(center.x + 50, 30);
		ctx.lineTo(center.x + 30, 43);
		ctx.lineTo(center.x - 30, 43);
		ctx.closePath();
		ctx.fillStyle = '#111';
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(center.x - 20, 30);
		ctx.lineTo(center.x + 20, 30);
		ctx.lineTo(center.x + 30, 42);
		ctx.lineTo(center.x - 30, 42);
		ctx.closePath();
		ctx.fillStyle = '#222';
		ctx.fill();

		ctx.textAlign = 'center';
		ctx.font="10px courier";

		ctx.fillStyle = '#666';
		ctx.fillText(this.toTimeFormat(this.seconds), center.x, 31);


		//HUD Shield

		ctx.beginPath();
		ctx.moveTo(center.x - 121 , 22);
		ctx.lineTo(center.x + 121, 22);
		ctx.lineTo(center.x + 109, 28);
		ctx.lineTo(center.x - 109, 28);
		ctx.closePath();

		ctx.fillStyle = '#00032f';
		ctx.fill();

		if (this.stats.shield > 0) {

			let shieldRatio = Math.round(this.stats.shield)/100;
			let invertedShieldRatio = (100 - Math.round(this.stats.shield))/100;

			ctx.beginPath();
			ctx.moveTo(center.x - 121 , 22);

			ctx.lineTo((center.x - 121) + 242*shieldRatio, 22); //
			ctx.lineTo((center.x - 109) + 218*shieldRatio, 28); //
			ctx.lineTo(center.x - 109, 28);
			ctx.closePath();

			let r,g,b;

				r = 255 * invertedShieldRatio;
				g = 150 * shieldRatio;
				b = 255 * shieldRatio;

			ctx.fillStyle = 'rgb('+ r +','+ g +','+ b +')';
			ctx.fill();

		}

		//shield glare
		ctx.globalAlpha = 0.2;
		
		ctx.beginPath();
		ctx.moveTo(center.x - 113, 22);
		ctx.lineTo(center.x + 113, 22); //
		ctx.lineTo(center.x + 101, 25); //
		ctx.lineTo(center.x - 101, 25);
		ctx.fillStyle = '#FFF';
		ctx.fill();

		//shield shade
		ctx.beginPath();
		ctx.moveTo(center.x - 117 , 25);
		ctx.lineTo(center.x + 117, 25);
		ctx.lineTo(center.x + 109, 28);
		ctx.lineTo(center.x - 109, 28);
		ctx.closePath();
		ctx.fillStyle = '#000';
		ctx.fill();

		ctx.globalAlpha = 1;



		//info / textx

		ctx.textAlign = "start";
		
		ctx.font="10px arial";
		ctx.textBaseline='top';

		if (this.stats.health < 30) {
			ctx.fillStyle = '#d600ba';
		} else {
			ctx.fillStyle = '#AAA';
		}
		ctx.fillText( this.stats.health, center.x + 55, 7);
		
		ctx.fillStyle = '#0AF';

		let displayScore = '0000000' + this.stats.score;
    
		ctx.fillText(displayScore.substr(displayScore.length-7), center.x - 120, 7);			
		
		ctx.textAlign = 'end';
		ctx.fillText('Lvl ' + this.stats.level , center.x + 120, 7);



		//HUD Gloss

		ctx.beginPath();
		ctx.moveTo(center.x - 153, 2);
		ctx.lineTo(center.x + 153, 2);
		ctx.lineTo(center.x + 123, 11);
		ctx.lineTo(center.x - 123, 11);
		ctx.closePath();
		ctx.globalAlpha = 0.2;
		ctx.fillStyle = '#AAF';
		ctx.fill();
		ctx.globalAlpha = 1;


		//HUD health

		ctx.beginPath();
		ctx.rect(center.x - 50, 6, 100, 10);
		ctx.fillStyle = '#980085';
		ctx.fill();

		ctx.beginPath();

		ctx.rect(center.x - 50, 6, 100*Math.floor(this.stats.health)/100, 10);
		ctx.fillStyle = '#ffb500';
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(center.x - 50, 6);
		ctx.lineTo(center.x + 50, 6);
		ctx.lineTo(center.x + 46, 10);
		ctx.lineTo(center.x - 46, 10);
		ctx.closePath();
		ctx.fillStyle = 'rgba(255,255,255,0.1)';
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(center.x - 48, 8);
		ctx.lineTo(center.x + 48, 8);
		ctx.lineTo(center.x + 46, 10);
		ctx.lineTo(center.x - 46, 10);
		ctx.closePath();
		ctx.fillStyle = 'rgba(255,255,255,0.2)';
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(center.x - 46, 12);
		ctx.lineTo(center.x + 46, 12);
		ctx.lineTo(center.x + 50, 16);
		ctx.lineTo(center.x - 50, 16);
		ctx.closePath();
		ctx.fillStyle = 'rgba(55,0,10,0.2)';
		ctx.fill();


		//shooting / upgrade indicators

		if (this.ship.burstShot && !this.ship.trippleShot) {
			
			ctx.fillStyle = '#F00';
			ctx.beginPath();
			ctx.arc(center. x - 60, 11, 2, 0, 2*Math.PI);
			ctx.fill();

		}

		if (this.ship.trippleShot) {
			ctx.fillStyle = '#0AF';

			if (this.ship.burstShot) {
				ctx.fillStyle = '#F00';
			}

			ctx.beginPath();
			ctx.arc(center. x - 60, 11, 2, 0, 2*Math.PI);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(center. x - 65, 11, 2, 0, 2*Math.PI);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(center. x - 70, 11, 2, 0, 2*Math.PI);
			ctx.fill();
		}


		if (this.ship.friction) {
			
			ctx.fillStyle = '#0AF';
			ctx.beginPath();
			ctx.arc(center. x + 85, 11, 2, 0, 2*Math.PI);
			ctx.fill();

			ctx.strokeStyle = '#0AF';
			ctx.beginPath();
			ctx.arc(center. x + 85, 11, 4, 0, 2*Math.PI);
			ctx.stroke();
		}


		//Lives

			let itemWidth = 5;
			let itemHeight = 10;
			let containerWidth = 10 * this.stats.lives;

			//let livesPos = {x:center.x, y:this.c.height - 20};
			let livesPos = {x:this.c.width - 10, y: 10};

			let spaceBetween;

			if (this.stats.lives == 1) {
				spaceBetween = 0;
				containerWidth = itemWidth;
			} else {
				spaceBetween = (containerWidth - itemWidth* this.stats.lives)/(this.stats.lives-1);
			}

			for (let i = 0; i < this.stats.lives; i++) {
				
				let x = (livesPos.x - containerWidth/2) + (itemWidth + spaceBetween)*i - containerWidth/2;
				let y = livesPos.y;

				ctx.beginPath();
				ctx.moveTo(x + itemWidth/2,y);
				ctx.lineTo(x, y + itemHeight);
				ctx.lineTo(x + itemWidth, y + itemHeight);
				ctx.fillStyle = '#ffcc00';
				ctx.fill();
			}
	}

	drawIntro() {
		let ctx = this.c.ctx;
		let center = this.c.getCenter();
		let topOffeset = center.y - 50;
		
		ctx.textAlign = 'center';
		// ctx.font="40px Georgia";
		// ctx.fillStyle = "#006eff";
		//ctx.fillText('CanvASTEROIDS' ,center.x, center.y);

		if (this.intro) {
			ctx.globalAlpha = 0.1;
			ctx.drawImage(this.intro, 0 , 0, this.intro.width, this.intro.height, 0, 0, this.c.width, this.c.height);
			ctx.globalAlpha = 1;
		}

		ctx.fillStyle = "#FFF";
		ctx.font="14px Georgia";
		ctx.fillText('\'escape\' to start or pause' ,center.x, topOffeset + 30);
		ctx.fillText('x - to shoot' ,center.x, topOffeset + 50);
		ctx.fillText('spacebar - for shield' ,center.x, topOffeset + 70);
		ctx.fillText('Arrow keys to move around' ,center.x, topOffeset + 90);
		ctx.fillText('1-9 to start at that level' ,center.x, topOffeset + 110);
		ctx.fillText('m - mute/unmute' ,center.x, topOffeset + 130);

	}

	drawGameOver() {
		let ctx = this.c.ctx;

		let center = this.c.getCenter();
		
		ctx.textAlign = 'center';
		ctx.font="30px Courier";
		ctx.fillStyle = "#F0F";
		ctx.fillText('Game Over' ,center.x, center.y);
		ctx.font="14px Courier";
		ctx.fillStyle = "#FFF";
		ctx.fillText('press \'spacebar\' to restart' ,center.x, center.y + 40);
		ctx.fillText('Score: ' + this.stats.score ,center.x, center.y + 60);

	}

	drawPaused() {
		let ctx = this.c.ctx;
		let center = this.c.getCenter();
		
		ctx.textAlign = 'center';
		ctx.font="20px Verdana";
		ctx.fillStyle = "#FFF";
		ctx.fillText('PAUSED' ,center.x, center.y);
	}

	frameHandler() {

		if (this.status == 'play') {
			if (this.ship.health <= 0 && this.doOncePerLife) {

				this.doOncePerLife = false;

				if (this.stats.lives > 1) {
					this.newLife();
				} else {
					this.gameOver();
				}
			}

			//smooth update health
			if (this.stats.health > this.ship.health) {
				this.stats.health--;
			}

			if (this.stats.health < this.ship.health) {
				this.stats.health++;
			}

			//smooth update shield

			if (this.stats.shield < this.ship.shield.health) {
				this.stats.shield+= 0.5;
			} else if (this.stats.shield > this.ship.shield.health) {
				this.stats.shield-= 0.5;
			}


			if (this.alienInvasion) {
				this.c.green = true;
			} else {
				this.c.green = false;
			}
		}


	}

	toTimeFormat(secs) {
	    var s = parseInt(secs, 10);
	    var hours   = Math.floor(s / 3600);
	    var minutes = Math.floor((s - (hours * 3600)) / 60);
	    var seconds = s - (hours * 3600) - (minutes * 60);

	    if (hours   < 10) {hours   = "0"+hours;}
	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}
	    //return hours + ':' + minutes + ':' + seconds;
	    return minutes + ':' + seconds;
	}

	addScore(num) {
		let levelMultiplier = num + num * (this.stats.level - 1)/2;
		this.stats.score = Math.floor(this.stats.score + levelMultiplier);
	}


}


let game = new Game();

window.game = game; //allow cheating in console :D

export default game;
