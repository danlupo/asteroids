class Sound {

    constructor (src, volume) {
    	this.urls = src;
    	this.instances = [];//array of objects
    	this.instance; //object
    	this.volume = volume || 1;
    	
    	this.muted = true;

    	this.loadSound(this.urls);
    	
    }

	loadSound(src) {



		this.instance = document.createElement("audio");
		this.instance.src = src;
		this.instance.setAttribute("preload", "auto");
		this.instance.setAttribute("controls", "none");
		this.instance.style.display = "none";
		document.body.appendChild(this.instance);

		this.instance.volume = this.volume;



	}

	play() {
		if (this.muted) return false;
		this.instance.currentTime = 0;
		this.instance.play();
	}

	stop() {
		this.instance.currentTime = 0;
		this.instance.pause();
	}

	muteToggle() {
		if (this.muted) {
			this.muted = false;
		} else {
			this.muted = true;
		}
	}


}


let sounds = {
    explosion: new Sound('sounds/small-boom.mp3', 0.5),
    thrust: new Sound('sounds/rocket.mp3'),
    shot: new Sound('sounds/laser-gun.mp3', 0.05),
    hit: new Sound('sounds/hit2.mp3', 0.1),
    mute: function() {
    	for (let key in sounds) {
 
    		if (key != 'mute') sounds[key].muteToggle();
    	}
    }
}

export default sounds;