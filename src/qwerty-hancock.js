/*
 * Qwerty Hancock keyboard library v0.10.0
 * The web keyboard for now people.
 * Copyright 2012-20, Stuart Memo
 *
 * Licensed under the MIT License
 * http://opensource.org/licenses/mit-license.php
 *
 * http://stuartmemo.com/qwerty-hancock
 */

/**
 * Qwerty Hancock constructor.
 * @param {object} userSettings Optional user settings.
 */
export class QwertyHancock {
	/**
	 * Lighten up man. Change the colour of a key.
	 * @param  {element} el DOM element to change colour of.
	 */
	lightenUp(el) {
		if (el !== null && typeof el !== 'undefined') {
			el.style.backgroundColor = this.settings.activeColour;
		}
	};

	/**
	 * Revert key to original colour.
	 * @param  {element} el DOM element to change colour of.
	 */
	darkenDown(el){
		if (el !== null) {
			if (el.getAttribute('data-note-type') === 'white') {
				el.style.backgroundColor = this.settings.whiteKeyColour;
			} else {
				el.style.backgroundColor = this.settings.blackKeyColour;
			}
		}
	};


	/**
	 * Add styling to individual white key.
	 * @param  {object} key White key DOM element.
	 */
	styleWhiteKey(key){
		key.el.style.backgroundColor = this.settings.whiteKeyColour;
		key.el.style.border = '1px solid ' + this.settings.borderColour;
		key.el.style.borderRight = 0;
		key.el.style.height = this.settings.height + 'px';
		key.el.style.width = key.width + 'px';
		key.el.style.borderRadius = '0 0 5px 5px';
		key.el.style.position = 'relative';
		key.el.style.zIndex = '1';
		key.el.style.boxSizing = 'content-box';

		if (key.noteNumber === this.getTotalWhiteKeys() - 1) {
			key.el.style.border = '1px solid ' + this.settings.borderColour;
		}
	};


	/**
	 * Add styling to individual key on keyboard.
	 * @param  {object} key Element of key.
	 */
	styleKey(key) {
		key.el.style.display = 'inline-block';
		key.el.style['-webkit-user-select'] = 'none';

		if (key.colour === 'white') {
			this.styleWhiteKey(key);
		} else {
			this.styleBlackKey(key);
		}
	};


	getTotalWhiteKeys(){
		return this.settings.octaves * 7;
	}

	/**
	 * Call user's mouseDown event.
	 */
	mouseDown(element, callback) {
		if (element.tagName.toLowerCase() === 'li') {
			this.mouseIsDown = true;
			this.lightenUp(element);
			callback(element.title, this.getFrequencyOfNote(element.title));
		}
	};

	/**
	 * Call user's mouseUp event.
	 */
	mouseUp(element, callback) {
		if (element.tagName.toLowerCase() === 'li') {
			this.mouseIsDown = false;
			this.darkenDown(element);
			callback(element.title, this.getFrequencyOfNote(element.title));
		}
	};

	/**
	 * Call user's mouseDown if required.
	 */
	mouseOver(element, callback) {
		if (this.mouseIsDown) {
			this.lightenUp(element);
			callback(element.title, this.getFrequencyOfNote(element.title));
		}
	};

	/**
	 * Call user's mouseUp if required.
	 */
	mouseOut(element, callback) {
		if (this.mouseIsDown) {
			this.darkenDown(element);
			callback(element.title, this.getFrequencyOfNote(element.title));
		}
	};

	/**
	 * Create key DOM element.
	 * @return {object} Key DOM element.
	 */
	createKey(key) {
		key.el = document.createElement('li');
		key.el.id = key.id;
		key.el.title = key.id;
		key.el.setAttribute('data-note-type', key.colour);

		this.styleKey(key);

		return key;
	};


	addKeysToKeyboard(keyboard) {
		for (const key of keyboard.keys) {
			keyboard.el.appendChild(key);
		}
	};

	setKeyPressOffset(sortedWhiteNotes) {
		this.settings.keyPressOffset = sortedWhiteNotes[0] === 'C' ? 0 : 1;
	};

	getKeyPressed(keyCode) {
		return this.keyMap[keyCode]
			.replace('l', parseInt(this.settings.keyOctave, 10) + this.settings.keyPressOffset)
			.replace('u', (parseInt(this.settings.keyOctave, 10) + this.settings.keyPressOffset + 1)
			.toString());
	};

	/**
	 * Handle a keyboard key being pressed.
	 * @param {object} key The keyboard event of the currently pressed key.
	 * @param {callback} callback The user's noteDown function.
	 * @return {boolean} true if it was a key (combo) used by qwerty-hancock
	 */
	keyboardDown(key, callback) {
		if (key.keyCode in this.keysDown) {
			return false;
		}

		this.keysDown[key.keyCode] = true;

		if (typeof this.keyMap[key.keyCode] !== 'undefined') {
			const keyPressed = this.getKeyPressed(key.keyCode);
			callback(keyPressed, this.getFrequencyOfNote(keyPressed));
			this.lightenUp(document.getElementById(keyPressed));
			return true;
		}
		return false;
	};

	/**
	 * Handle a keyboard key being released.
	 * @param {element} key The DOM element of the key that was released.
	 * @param {callback} callback The user's noteDown function.
	 * @return {boolean} true if it was a key (combo) used by qwerty-hancock
	 */
	keyboardUp(key, callback) {
		delete this.keysDown[key.keyCode];

		if (typeof this.keyMap[key.keyCode] !== 'undefined') {
			const keyPressed = this.getKeyPressed(key.keyCode);
			callback(keyPressed, this.getFrequencyOfNote(keyPressed));
			this.darkenDown(document.getElementById(keyPressed));
			return true;
		}
		return false;
	};

	/**
	 * Determine whether pressed key is a modifier key or not.
	 * @param {KeyboardEvent} The keydown event of a pressed key
	 */
	isModifierKey(key) {
		return key.ctrlKey || key.metaKey || key.altKey;
	};

	/**
	 * Add event listeners to keyboard.
	 * @param {element} keyboardElement
	 */
	addListeners(keyboardElement) {
		if (this.settings.musicalTyping) {
			// Key is pressed down on keyboard.
			window.addEventListener('keydown', (key) => {
				if (this.isModifierKey(key)) return;
				if (this.keyboardDown(key, this.keyDown)) {
					key.preventDefault();
				}
			});

			// Key is released on keyboard.
			window.addEventListener('keyup', (key) => {
				if (this.isModifierKey(key)) return;
				if (this.keyboardUp(key, this.keyUp)) {
					key.preventDefault();
				}
			});
		}

		// Mouse events
		keyboardElement.addEventListener('mousedown', (event) => 
			this.mouseDown(event.target, this.keyDown));

		keyboardElement.addEventListener('mouseup', (event) => 
			this.mouseUp(event.target, this.keyUp));

		keyboardElement.addEventListener('mouseover', (event) => 
			this.mouseOver(event.target, this.keyDown));

		keyboardElement.addEventListener('mouseout', (event) => 
			this.mouseOut(event.target, this.keyUp));

		// Touch events
		if ('ontouchstart' in document.documentElement) {
			keyboardElement.addEventListener('touchstart', (event) => 
				this.mouseDown(event.target, this.keyDown));

			keyboardElement.addEventListener('touchend', (event) => 
				this.mouseUp(event.target, this.keyUp));

			keyboardElement.addEventListener('touchleave', (event) => 
				this.mouseOut(event.target, this.keyUp));

			keyboardElement.addEventListener('touchcancel', (event) => 
				this.mouseOut(event.target, this.keyUp));
		}
	};

	createKeys(keyboard) {
		const keys = [];
		let noteCounter = 0;
		let octaveCounter = this.settings.startOctave;
		const totalWhiteKeys = this.getTotalWhiteKeys();

		for (let i = 0; i < totalWhiteKeys; i++) {
			if (i % keyboard.whiteNotes.length === 0) {
				noteCounter = 0;
			}

			const bizarreNoteCounter = keyboard.whiteNotes[noteCounter];

			if ((bizarreNoteCounter === 'C') && (i !== 0)) {
				octaveCounter++;
			}

			const key = this.createKey({
				colour: 'white',
				octave: octaveCounter,
				width: this.getWhiteKeyWidth(totalWhiteKeys),
				id: keyboard.whiteNotes[noteCounter] + octaveCounter,
				noteNumber: i
			});

			keys.push(key.el);

			if (i !== totalWhiteKeys - 1) {
				for (const note of keyboard.notesWithSharps) {
					if (note === keyboard.whiteNotes[noteCounter]) {
						const key = this.createKey({
							colour: 'black',
							octave: octaveCounter,
							width: this.getWhiteKeyWidth(totalWhiteKeys) / 2,
							id: keyboard.whiteNotes[noteCounter] + '#' + octaveCounter,
							noteNumber: i
						});

						keys.push(key.el);
					}
				}
			}
			noteCounter++;
		}

		return {
			keys,
			totalWhiteKeys
		};
	};

	createKeyboard() {
		const keyboard = {
			container: document.getElementById(this.settings.id),
			el: document.createElement('ul'),
			whiteNotes: this.orderNotes(['C', 'D', 'E', 'F', 'G', 'A', 'B']),
			notesWithSharps: this.orderNotes(['C', 'D', 'F', 'G', 'A']),
		};

		const keysObj = this.createKeys(keyboard);
		keyboard.keys = keysObj.keys;
		keyboard.totalWhiteKeys = keysObj.totalWhiteKeys;

		this.setKeyPressOffset(keyboard.whiteNotes);
		this.styleKeyboard(keyboard);

		// Add keys to keyboard, and keyboard to container.
		this.addKeysToKeyboard(keyboard);

		if (keyboard.container.querySelector('ul')) {
			keyboard.container.replaceChild(keyboard.el, keyboard.container.querySelector('ul'));
		} else {
			keyboard.container.appendChild(keyboard.el);
		}

		return keyboard;
	};


	/**
	 * Add styling to individual black key.
	 * @param  {object} key Black key DOM element.
	 */
	styleBlackKey(key) {
		const whiteKeyWidth = this.getWhiteKeyWidth(this.getTotalWhiteKeys());
		const blackKeyWidth = Math.floor(whiteKeyWidth / 2);

		key.el.style.backgroundColor = this.settings.blackKeyColour;
		key.el.style.border = '1px solid ' + this.settings.borderColour;
		key.el.style.position = 'absolute';
		key.el.style.left = Math.floor(((whiteKeyWidth + 1) * (key.noteNumber + 1)) - (blackKeyWidth / 2)) + 'px';
		key.el.style.width = blackKeyWidth + 'px';
		key.el.style.height = (this.settings.height / 1.5) + 'px';
		key.el.style.borderRadius = '0 0 3px 3px';
		key.el.style.zIndex = '2';
		key.el.style.boxSizing = 'content-box';
	};

	/**
	 * Get frequency of a given note.
	 * @param  {string} note Musical note to convert into hertz.
	 * @return {number} Frequency of note in hertz.
	 */
	getFrequencyOfNote(note) {
		const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
		const octave = note.length === 3 ? note.charAt(2) : note.charAt(1);
		let keyNumber = notes.indexOf(note.slice(0, -1));

		if (keyNumber < 3) {
			keyNumber = keyNumber + 12 + ((octave - 1) * 12) + 1;
		} else {
			keyNumber = keyNumber + ((octave - 1) * 12) + 1;
		}

		return 440 * Math.pow(2, (keyNumber - 49) / 12);
	};


	/**
	 * Calculate width of white key.
	 * @return {number} Width of a single white key in pixels.
	 */
	getWhiteKeyWidth(numberOfWhiteKeys) {
		return Math.floor((this.settings.width - numberOfWhiteKeys) / numberOfWhiteKeys);
	};


	/**
	 * Reset styles on keyboard container and list element.
	 * @param {object} keyboard Keyboard container DOM element.
	 */
	styleKeyboard(keyboard) {
		const styleElement = (el) => {
			el.style.cursor = 'default';
			el.style.fontSize = '0px';
			el.style.height = this.settings.height + 'px';
			el.style.padding = 0;
			el.style.position = 'relative';
			el.style.listStyle = 'none';
			el.style.margin = this.settings.margin;
			el.style['-webkit-user-select'] = 'none';
			el.style.boxSizing = 'content-box';
		};

		styleElement(keyboard.container);
		styleElement(keyboard.el);
		keyboard.el.style.width = (keyboard.totalWhiteKeys * (this.getWhiteKeyWidth(keyboard.totalWhiteKeys) + 1) + 2) + 'px';
	};

	init() {
		const container = document.getElementById(this.settings.id);

		// Set dimensions based on container if not specified
		if (typeof this.settings.width === 'undefined') {
			this.settings.width = container.offsetWidth;
		}

		if (typeof this.settings.height === 'undefined') {
			this.settings.height = container.offsetHeight;
		}


		// Add getters and setters as class methods
		this.setKeyOctave = (octave) => {
			this.settings.keyOctave = octave;
			return this.settings.keyOctave;
		};

		this.getKeyOctave = () => this.settings.keyOctave;

		this.keyOctaveUp = () => {
			this.settings.keyOctave++;
			return this.settings.keyOctave;
		};

		this.keyOctaveDown = () => {
			this.settings.keyOctave--;
			return this.settings.keyOctave;
		};

		this.getKeyMap = () => this.keyMap;

		this.setKeyMap = (newKeyMap) => {
			Object.assign(this.keyMap, newKeyMap);
			return this.keyMap;
		};

		this.createKeyboard();
		this.addListeners(container);
	};

	/**
	 * Order notes into order defined by starting key in settings.
	 * @param {array} notesToOrder Notes to be ordered.
	 * @return {array} orderedNotes Ordered notes.
	 */
	orderNotes(notesToOrder) {
		const numberOfNotesToOrder = notesToOrder.length;
		const orderedNotes = [];
		let keyOffset = 0;

		for (let i = 0; i < numberOfNotesToOrder; i++) {
			if (this.settings.startNote.charAt(0) === notesToOrder[i]) {
				keyOffset = i;
				break;
			}
		}

		for (let i = 0; i < numberOfNotesToOrder; i++) {
			if (i + keyOffset > numberOfNotesToOrder - 1) {
				orderedNotes[i] = notesToOrder[i + keyOffset - numberOfNotesToOrder];
			} else {
				orderedNotes[i] = notesToOrder[i + keyOffset];
			}
		}

		return orderedNotes;
	};

	static keyMap = {
		65: 'Cl',
		87: 'C#l',
		83: 'Dl',
		69: 'D#l',
		68: 'El',
		70: 'Fl',
		84: 'F#l',
		71: 'Gl',
		89: 'G#l',
		90: 'G#l',
		72: 'Al',
		85: 'A#l',
		74: 'Bl',
		75: 'Cu',
		79: 'C#u',
		76: 'Du',
		80: 'D#u',
		59: 'Eu',
		186: 'Eu',
		222: 'Fu',
		221: 'F#u',
		220: 'Gu'
	};

	constructor(userSettings = {}) {
		this.mouseIsDown = false;
		this.keysDown = {};
		this.version = '0.10.0';

		// Initialize placeholder methods
		this.keyDown = () => {};
		this.keyUp = () => {};
		this.setKeyOctave = () => {};
		this.getKeyOctave = () => {};
		this.keyOctaveUp = () => {};
		this.keyOctaveDown = () => {};
		this.getKeyMap = () => {};
		this.setKeyMap = () => {};

		// Initialize settings with defaults and user overrides
		const startNote = userSettings.startNote || 'A3';
		const startOctave = parseInt(startNote.charAt(1), 10);

		this.settings = {
			id: userSettings.id || 'keyboard',
			octaves: userSettings.octaves || 3,
			width: userSettings.width,
			height: userSettings.height,
			margin: userSettings.margin || 0,
			startNote: startNote,
			whiteKeyColour: userSettings.whiteKeyColour || '#fff',
			blackKeyColour: userSettings.blackKeyColour || '#000',
			activeColour: userSettings.activeColour || 'yellow',
			borderColour: userSettings.borderColour || '#000',
			keyboardLayout: userSettings.keyboardLayout || 'en',
			musicalTyping: userSettings.musicalTyping !== false,
			startOctave: startOctave,
			keyOctave: userSettings.keyOctave || startOctave,
		};

		this.init();
	}
}

