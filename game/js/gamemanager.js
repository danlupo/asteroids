import Meteor from './meteor.js';
import Images from './images.js';
import Bonus from './bonus.js';
import Alien from './alien.js';
import Game from '../game.js';

class Manager {

    constructor () {

    	this.canvas = Game.renderer.canvas;

    	this.type = 'factory';

    	this.spawnRate = 8; //seconds

		this.image = null;

    	let IMAGES = new Images('images/asteroid.svg', () => {
			this.image = IMAGES.image;
			this._init();
		});

    }

    _init() {

    	this.spawnThings();
        setTimeout(()=>{
            this.spawnBonus();            
        }, 2000)
    }

    spawnThings(){
    	let _self = this;

		if (Game.renderer.layers.stage.length < 11 + Game.stats.level &&
            Game.status == 'play') {
			_self.spawnMeteor();
		}

		let spawnRate = this.spawnRate - Game.stats.level;

		if (spawnRate <= 0) {
			spawnRate = 1;
		}

    	setTimeout(()=>{
    		
    			_self.spawnThings();

                if (Math.ceil(Math.random()*9) == 5) { //1 in 9 chance
                    this.spawnBonus();
                }
                if (Math.ceil(Math.random()*200) == 5) { //1 in 200 chance
                    this.spawnAlien();
                }

    	}, 1000*spawnRate)


    }

    reset() {
        Game.renderer.clearStage();
        Game.renderer.clearEnemyFire();
        this.spawnRate = 8; //seconds
    }


	spawnMeteor() {
        let speedPoint = 3 + 2*Game.stats.level;

		let meteor = new Meteor({
			image: this.image,
            speed: speedPoint
		});
		meteor.index = Game.renderer.addToStageBottom(meteor);
	}

    spawnBonus() {

        let speedPoint = 3 + Math.round(Math.random()*3);

        let bonus = new Bonus({
            speed: speedPoint
        });
        bonus.index = Game.renderer.addToStageBottom(bonus);
    }

    spawnAlien() {
        if (!Game.alienInvasion) {
            Game.alien = new Alien();
            Game.alien.addToRenderer();
        }
    }
}

export default Manager;