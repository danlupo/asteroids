class Controls {

    constructor (obj) {

		this.obj = obj;
    	this._init();
    	this.actions = {};
  
    }

    _init() {
    	this.bindControls();
    }

	bindControls() {
		window.addEventListener('keydown', (e) => {

			let action = this.getActionName(e);

			if (action == 'digitFunction') {
				if (typeof this.obj.controls.digitFunction == 'function') {
					this.obj.controls.digitFunction(parseInt(e.key));
				}

			} else if (typeof this.actions[action] == 'undefined') {
				this.actionStart(action);
			}
		});

		window.addEventListener('keyup', (e) => {

			let action = this.getActionName(e);

			this.actionStop(action);

		});

	}

	getActionName(e){
		let action = 'default';

		switch (e.keyCode) {
			case 16: //shift
				action = 'shift';
				break;
			case 37:
				action = 'turnLeft';
				break;
			case 38:
				action = 'arrowUp';
				break;
			case 39:
				action = 'turnRight';
				break;
			case 40:
				action = 'arrowDown';
				break;
			case 27:
				action = 'escape';
				break;
			case 32:
				action = 'spacebar';
				break;
			case 190:
				action = 'period';
				break;
			case 188:
				action = 'coma';
				break;
			default:
				
		}

		if (e.key.match("^[a-z]+$")) { //has One letter
			action = e.key.toLowerCase() + 'Key';
		}

		if (e.key.match("^[1-9]+$")) { //has One letter
			action = 'digitFunction';
		}
		
		return action;
	}

	actionStart(action) {

		let func = action;

		if (typeof this.obj.controls[func] == 'function') {
			
			let frenquency = this.obj.controls[func](action);

			if (frenquency == 0) {
				this.actions[func] = 0;
			} else {			
				this.actions[func] = setInterval(()=>{
					this.obj.controls[func](action);
				}, frenquency);
			}

		}

	}

	actionStop(action){

		let keyupFunc = action + 'Keyup';
		if (typeof this.obj.controls[keyupFunc] == 'function') {
			this.obj.controls[keyupFunc]();
		}

		clearInterval(this.actions[action]);
		delete this.actions[action];
	}


}

export default Controls;