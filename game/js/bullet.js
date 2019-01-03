import Sparkle from './sparkle.js';
import Sound from './sound.js';
import Drawing from './drawing.js';
import Game from '../game.js';

class Bullet extends Drawing {

    constructor (opts, renderer) {
        super(Game.renderer.canvas);

    	this.canvas = Game.renderer.canvas;
        this.speed = opts.speed || 9;

        this.rotationSpeed = opts.rotationPrecision;
        this.direction = opts.angle;
        this.position = opts.startPoint;
        this.acceleration = opts.acceleration;
        this.enemyFire = opts.enemyFire || false;

        this.color = opts.color || "#0093e5";
        this.sparkleColor = opts.sparkleColor || "#0093e5";
    	this.type = 'weapon';
    }

    draw(){
        this.drawBullet();
    }

	drawBullet(opts) {

        let center = this.canvas.getCenter();

        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(this.position.x, this.position.y, 2 , 0, 2*Math.PI);
        this.canvas.ctx.fillStyle = this.color;
        this.canvas.ctx.fill();

        this.move();

	}

    fire(){
        if(this.enemyFire) {
            this.index = Game.renderer.addToForeground(this);
        } else {
            this.index = Game.renderer.addElement(this);
        }
        Sound.shot.play();
    }


    move(){

        let trajectory = (this.direction * Math.PI / this.rotationSpeed) - (90 * Math.PI/180);

        this.position.x = this.position.x + this.acceleration.x + this.speed * Math.cos(trajectory);
        this.position.y = this.position.y + this.acceleration.y + this.speed * Math.sin(trajectory);


        this.checkHit();

        if (this.position.x < -80 || this.position.x > this.canvas.canvas.width+80 ||
            this.position.y < -80 || this.position.y > this.canvas.canvas.height+80) {
            this.remove();
        }
    }

    remove() {
        let layer = this.enemyFire ? 'foreground' : 'stage';
        Game.renderer.remove(this.index, layer); //remove bullet
    }

    hitFoe() {
        let data = this.canvas.ctx.getImageData(this.position.x, this.position.y, 1, 1).data; 
        //var rgb = [data[0], data[1], data[2]];
        let r = data[0];

        if (r > 0) {

            let distance = 0;
            let maxDistance = 100;
            let closest = false; //target
            
            Game.renderer.layers.stage.forEach((v,i) => {
                
                if (v.isTarget) {

                    distance = v.getDistance(v.position, this.position);

                    if (distance < maxDistance) {
                        maxDistance = distance;
                        closest = v;
                    }

                }

            });

            if ( closest )  {
                closest.takeHit();
                this.sparkle();
                this.remove();
            }
        }

    }

    checkHit() {
            if (!this.enemyFire) {
                this.hitFoe();
            } else {
                this.hitShip();
            }
    }

    hitShip() {
        let distance = this.getDistance(Game.ship.position, this.position);

        if (Game.ship.shield.active) {
            if (distance <= Game.ship.shield.radius + 3) {
                this.sparkle(this.position);
                this.remove();
            }
        } else {
            let data = this.canvas.ctx.getImageData(this.position.x, this.position.y, 1, 1).data; 
            //var rgb = [data[0], data[1], data[2]];
            let r = data[0];

            if (r > 0) {
                if (distance < 25) {
                    this.sparkle(this.position);
                    this.remove();
                    Game.ship.damage(15);
                }
            }
        }

    }

    sparkle(){

        let sparkle = new Sparkle({position: this.position, color: this.sparkleColor});
        
    }

}

export default Bullet;