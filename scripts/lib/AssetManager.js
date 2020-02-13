window.AM = {};

AM.imagesPath = 'images/';
AM.soundsPath = 'sounds/';
AM.images = [];
AM.sounds = [];
AM.loaded = 0;
AM.lastImageId = 1;
AM.lastSoundId = 1;
AM.toLoad = 0;

AM.mediaType = {
	'image': 'image',
	'sound': 'sound'
};

AM.allLoaded = function() {
	return this.toLoad === this.loaded;
};

AM.addImage = function (imagePath, onLoad) {
	this.images[this.lastImageId] = {
		path: this.imagesPath + imagePath,
		success: false,
		error: '',
		onLoad: onLoad
	};
	this.toLoad++;

	this.loadImage(this.lastImageId);

	return this.lastImageId++;
};

AM.loadImage = function (imageId) {
	var image = this.images[imageId];

	image.data = new Image();
	image.data.internalId = imageId;

	image.data.onload = function () {
		AM.images[this.internalId].success = true;
		console.log('Loaded ' + this.internalId);

		if (AM.images[this.internalId].onLoad) {
			AM.images[this.internalId].onLoad(this.internalId, AM.mediaType.image);
		}

		AM.loaded++;
	};

	image.data.src = image.path;
};

AM.addSound = function (soundPath, onLoad) {
	this.sounds[this.lastSoundId] = {
		path: AM.soundsPath + soundPath,
		success: false,
		error: '',
		onLoad: onLoad
	};

	this.toLoad++;
	this.loadSound(this.lastSoundId);

	return this.lastSoundId++;
};

AM.loadSound = function (soundId) {
	var sound = this.sounds[soundId];

	sound.data = new Audio();
	sound.data.internalId = soundId;

	sound.data.onloadeddata = function () {
		console.log('loaded sound id' + this.internalId);
		AM.sounds[this.internalId].success = true;
		
		if (AM.sounds[this.internalId].onLoad) {
			AM.sounds[this.internalId].onLoad(this.internalId, AM.mediaType.sound);
		}

		AM.loaded++;
	};

	sound.data.src = sound.path;
};

AM.play = function (soundId) {
	var sound = this.sounds[soundId];
	sound.data.play();
};

AM.unloadImage = function (imageId) {
	this.images[imageId] = null;
};

AM.unloadSound = function (soundId) {
	this.sounds[soundId] = null;
};