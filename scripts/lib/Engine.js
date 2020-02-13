window.Engine = {};

Engine.scene = {
	terrain: [],
	main: [],
	water: [],
	effects: [],
	background: [],
	backWater: [],
	ui: []
};
Engine.lastRender = 0;
Engine.accelX = 0;
Engine.accelY = 0;
Engine.speedX = 0;
Engine.speedY = 0;
Engine.lastTick = 0;
Engine.frameRate = 60;
Engine.computedFrameTime = 1000 / Engine.frameRate;

Engine.render = function() {
	var time = Date.now();
	if (!this.lastTick) {
		this.lastTick = time - 17;
	}
	this.frameTime = time - this.lastTick;
	this.lastTick = time;

	context.main.clearRect(0, 0, VIEWPORT_WIDTH + SIDE_VIEW, VIEWPORT_HEIGHT + TOP_VIEW);
	context.water.clearRect(0, 0, VIEWPORT_WIDTH + SIDE_VIEW, VIEWPORT_HEIGHT + TOP_VIEW);
	context.effects.clearRect(0, 0, VIEWPORT_WIDTH + SIDE_VIEW, VIEWPORT_HEIGHT + TOP_VIEW);
	context.main.fillStyle = 'rgb(48, 58, 122)';
	context.main.fillRect(0, VIEWPORT_HEIGHT + TOP_VIEW - 120, VIEWPORT_WIDTH + SIDE_VIEW, VIEWPORT_HEIGHT + TOP_VIEW);
	context.effects.fillStyle = 'rgb(48, 58, 122)';
	context.effects.fillRect(0, VIEWPORT_HEIGHT + TOP_VIEW - 160, VIEWPORT_WIDTH + SIDE_VIEW, VIEWPORT_HEIGHT + TOP_VIEW);

	this.renderChildren(context.main, this.scene.main, 0, 0, 0);
	this.renderChildren(context.main, this.scene.water, 0, 0, 0);
	this.renderChildren(context.effects, this.scene.effects, 0, 0, 0);
	this.renderChildren(context.effects, this.scene.background, 0, 0, 0);
	this.renderChildren(context.effects, this.scene.backWater, 0, 0, 0);
	this.renderChildren(context.ui, this.scene.ui, 0, 0, 0);

	nextFrame(function () {
		Engine.render();
	});
};

Engine.ApplyWindToAll = function() {
	this.applyWind(this.scene.effects);
	this.applyWind(this.scene.main);
};

Engine.applyWind = function (units) {
	for (var unitId in units) {
		// noinspection JSUnfilteredForInLoop
		if (units[unitId].airfriction) {
			// noinspection JSUnfilteredForInLoop
			units[unitId].accel.set(E.g, -Math.PI / 2);
			// noinspection JSUnfilteredForInLoop
			units[unitId].accel.add(Math.abs(E.w * units[unitId].airfriction), ((E.w > 0) ? 0 : Math.PI));
			//console.log('add('+ E.w*units[unitId].airfriction + ', ' + ((E.w > 0 ) ? 0 : Math.PI));
		}

		// noinspection JSUnfilteredForInLoop
		for (var unit in units[unitId].children) {
			// noinspection JSUnfilteredForInLoop
			this.applyWind(units[unitId].children[unit]);
		}
	}
};

Engine.renderChildren = function (context2d, units, x, y, log) {
	for (var unitId in units) {
		// noinspection JSUnfilteredForInLoop
		var unit = units[unitId];

		try {
			context2d.drawImage(
				AM.images[unit.model].data,
				0, unit.frameHeight * unit.currentFrame,
				unit.frameWidth, unit.frameHeight,
				Math.floor(unit.x + x - unit.offsetX - unit.frameWidth / 2),
				Math.floor(VIEWPORT_HEIGHT + TOP_VIEW - unit.y + y - unit.offsetY - unit.frameHeight / 2),
				unit.frameWidth, unit.frameHeight
			);

			/*if (false && unit.model === 36 && unitId === 15) {
				console.log('0,' + (unit.frameHeight * unit.currentFrame) + ', ' +
					unit.frameWidth + ', ' + unit.frameHeight + ', ' +
					Math.floor(unit.x + x - unit.offsetX - unit.frameWidth / 2) + ', ' +
					Math.floor(VIEWPORT_HEIGHT + TOP_VIEW - unit.y + y - unit.offsetY - unit.frameHeight / 2) + ', ' +
					unit.frameWidth + ', ' + unit.frameHeight);
			}*/
		} catch (e) {
			console.error(e);
		}

		for (var unit in unit.children) {
			this.renderChilds(context2d, unit.children, unit.x, unit.y, log);
		}

		unit.update();

		if (log === 1) {
			// noinspection JSUnfilteredForInLoop
			console.log(unitId, unit.x, unit.y, unit.speed.X, unit.speed.Y, unit.accel.X, unit.accel.Y);
		}

	}
};

window.nextFrame = (function (callback) {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();

Engine.start = function() {
	log.debug('starting engine');
	this.render();
	//setInterval('Engine.render()', 40);
};