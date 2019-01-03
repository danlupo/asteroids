class Images {

    constructor (urls, callback) {
    	this.urls = urls;
    	this.callback = callback;
    	this.images = [];//array of objects
    	this.image; //object

    	if (typeof this.urls == 'string') {
    		this.loadImage(this.urls);
    	} else {
    		//array
    		this.urls.forEach((v,i) => {
    			this.loadImage(v, true);
    		})
    	}
    }

	loadImage(url, array) {
		let image = new Image();
		let _self = this;


		image.addEventListener('load', () => {
		  if (array) {
		  	_self.images.push(image);

		  	if (_self.images.length == _self.urls.length) {
		  		_self.loaded();
		  	}
		  } else {
		  	_self.image = image;
		  	_self.loaded();
		  }
		}, false);

		image.src = url;

	}

	loaded() {
		if (typeof this.callback == 'function') {
			this.callback();
		}

		return this.image || this.images;
	}

	draw(ctx, image) {
		ctx.drawImage(image, 50, 50);
	}


}

export default Images;