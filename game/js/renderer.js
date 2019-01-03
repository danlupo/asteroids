import Canvas from './canvas.js';

class Renderer {

    constructor (opts) {
    	this.layers = {
    		backgroud: [],
    		stage: [], //default
    		foreground: [],
    		overlay: []
    	};

    	this.opts = {
    		fps: 60,
    	}

    	if (opts) this.opts = Object.assign(this.opts, opts);

    	this.canvas = new Canvas(); // must be of type Canvas Class
    	this.frames = 0;


    	this.intervalRender = false;
    	this.intervalFunction = false;


    	this._init();

  
    }

    _init() {
    	this.render();
    }

    frameHandler() {
    	if (this.intervalRender) {

			if (typeof this.intervalFunction != 'number') {

				this.intervalFunction = setInterval(() => {
					this.render();
					console.log('interval')
				}, 1000/this.opts.fps);	
			}

			if(this.opts.fps <= this.frames) {
				console.log(this.frames);
				this.frames = 0;
			}

		} else {
			requestAnimationFrame(this.render.bind(this));
		}
    }

    render(){

		this.clear();
		this.canvas.draw();

		for (var key in this.layers) {
		    this.renderElements(this.layers[key]);
		}

		this.frames++;
		
		this.frameHandler();

    }

    halt() {
    	clearInterval(this.intervalFunction);
    	this.intervalFunction = false;
    }

    renderElements(elements) {
    	
    	if (elements.length > 0) {
    		elements.forEach((element,i) => {
    			element.draw();
    		});
    	}
	}

	addElement(e) {
		this.layers.stage.push(e);

		return this.layers.stage.length - 1;
	}

	addToStageBottom(e) {
		this.layers.stage.unshift(e);
		this.rewriteIndexes();
		return 0; //cause its the first element
	}

	addToForeground(e) {
		this.layers.foreground.push(e);

		return this.layers.foreground.length - 1; //element index
	}

	addToBackground(e) {
		this.layers.backgroud.push(e)
	}

	addToOverlay(e) {
		this.layers.overlay.push(e)
	}

	remove(index, layer) {

		let l = layer || 'stage';


		let element = this.layers[l][index];
		this.layers[l].splice(index, 1);

		this.rewriteIndexes(l);
	}

	rewriteIndexes(layer) {
		let l = layer || 'stage';

		this.layers[l].forEach((v,i) => {
			v.index = i;
		})
	}

	pause() {
		this.halt = true;
	}

	play() {
		this.halt = false;
	}

	clear() {
		this.canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	clearStage() {

		for (var i = this.layers.stage.length - 1; i >= 0; i--) {
			this.layers.stage[i].remove();
		}
		
	}

	clearEnemyFire() {
		for (var i = this.layers.foreground.length - 1; i >= 0; i--) {
			if (this.layers.foreground[i].type == 'weapon') {
				this.layers.foreground[i].remove();
			}
		}
	}

	memoryUsage() {

		var aMegaByte = 1048576; //bits
		var MEMORY_LIMIT = 25 * aMegaByte; // 20MB
		var PERCENT_THRESHOLD = 90;

		if (!window.performance || !window.performance.memory || !window.requestAnimationFrame) { return; }

		let MB = Math.round(10* performance.memory.usedJSHeapSize/aMegaByte)/10;

		return 'Memory used: ' + MB.toFixed(1) + 'MB ('+ Math.round(100*(performance.memory.usedJSHeapSize/MEMORY_LIMIT)) +'% / '+ Math.round(10 * MEMORY_LIMIT/aMegaByte)/10+ 'MB)';
	}



}

export default Renderer;