// noinspection JSUnusedGlobalSymbols
var LOOP_ONCE = 0;
var MOVEMENT_STATE_RIGHT = 1;
var LOOP_CONTINUOUS = 1;
var LOOP_REVERSE = 2;
var LOOP_ZIGZAG = 3;
var LOOP_DESTROY = 4;
var PLAYSTATE_STOPPED = 0;
var PLAYSTATE_PLAYING = 1;
var PLAYSTATE_REWIND = 2;
var PHYSX_NORMAL = 0;
var PHYSX_SPIN = 1;
var WORLD_NORMAL = 0;
var WORLD_WRAPPED_HORISONTAL = 1;
var WORLD_WRAPPED_VERTICAL = 2;
var WORLD_WRAPPED = 3;
var MOVEMENT_STOPPED = 0;
var MOVEMENT_STATE_LEFT = -1;
// noinspection JSUnusedGlobalSymbols
var MOVEMENT_RATE_SLOW = 15;
var MOVEMENT_RATE_NORMAL = 5;
// noinspection JSUnusedGlobalSymbols
var MOVEMENT_RATE_FAST = 1;
var MOVEMENT_STEP_SIZE = 11;
var JUMP_ANGLE = 60;
var JUMP_POWER = 12;
// noinspection JSUnusedGlobalSymbols
var FORCE_GRAVITY = 0;
// noinspection JSUnusedGlobalSymbols
var FORCE_AIR_FRICTION = 1;

// noinspection DuplicatedCode,JSUnusedGlobalSymbols
var Unit = Class.create({
	initialize: function() {
		this.x = 0;
		this.y = 0;
		this.offsetX = 0;
		this.offsetY = 0;
		this.speed = new Vector(0, 0);
		this.medSpeed = new Vector(0, 0);
		this.accel = new Vector(0, 0);
		this.rotationCenterX = 0;
		this.rotationCenterY = 0;
		this.rotationAngle = 0;
		this.rotationSpeed = 0;
		this.rotationAccel = 0;
		this.rotationLength = 0;
		// noinspection JSUnusedGlobalSymbols
		this.orientation = 0;
		this.airfriction = 0;
		this.speedLimit = 0;
		// noinspection JSUnusedGlobalSymbols
		this.density = 1;
		this.mass = 0;
		// noinspection JSUnusedGlobalSymbols
		this.elasticity = 0.5; // collision reflexion
		// noinspection JSUnusedGlobalSymbols
		this.hasCollision = true;
		this.worldWrapping = WORLD_NORMAL;
		this.children = [];
		this.animationTime = 0;
		// noinspection JSUnusedGlobalSymbols
		this.animationFPS = 1;
		this.computedFrameTime = 0;
		this.physxFPS = 1;
		this.computedPhysixFrameTime = 0;
		this.parent = null;
		this.model = 0;
		this.frameCount = 0;
		this.currentFrame = 0;
		this.frameWidth = 0;
		this.frameHeight = 0;
		this.physxMode = PHYSX_NORMAL;
		this.frameRate = 1;
		// noinspection JSUnusedGlobalSymbols
		this.counter = 0;
		this.loopType = LOOP_CONTINUOUS;
		this.playState = PLAYSTATE_PLAYING;
		this.movement = MOVEMENT_STOPPED;
		this.movementStep = 0;
		this.movementRate = MOVEMENT_RATE_NORMAL;
		this.mainActor = false;
	},
	copyConfig: function (cfg) {
		if (typeof cfg.model !== 'undefined') {
			this.model = cfg.model;
		}

		if (typeof cfg.frameCount !== 'undefined') {
			this.frameCount = cfg.frameCount;
		}

		if (typeof cfg.frameRate !== 'undefined') {
			this.frameRate = cfg.frameRate;
		}

		if (typeof cfg.frameWidth !== 'undefined') {
			this.frameWidth = cfg.frameWidth;
		}

		if (typeof cfg.frameHeight !== 'undefined') {
			this.frameHeight = cfg.frameHeight;
		}

		if (typeof cfg.loopType !== 'undefined') {
			this.loopType = cfg.loopType;
		}

		if (typeof cfg.playState !== 'undefined') {
			this.playState = cfg.playState;
		}

		/*if (typeof cfg.offsetX !== 'undefined') {
			this.offsetX = cfg.offsetX;
		}*/

		if (typeof cfg.offsetY !== 'undefined') {
			this.offsetY = cfg.offsetY;
		}
	},
	animate: function() {
		if (this.playState === PLAYSTATE_STOPPED) {
			return;
		}

		this.animationTime += Engine.frameTime;

		if (this.animationTime < this.computedFrameTime) {
			return;
		}

		var framesPassed = Math.floor(this.animationTime / this.computedFrameTime);
		this.animationTime = this.animationTime - framesPassed * this.computedFrameTime;

		/*this.counter++;
		if (this.counter == this.frameRate) {
			this.counter = 0;
			//window.log.error('wtf','rendering');
		} else {
			return;
		}*/

		switch (this.playState) {
			case PLAYSTATE_PLAYING:
				this.currentFrame++;
				break;
			case PLAYSTATE_REWIND:
				this.currentFrame--;
				break;
		}

		switch (this.loopType) {
			case LOOP_CONTINUOUS:
				if (this.currentFrame >= this.frameCount) {
					this.currentFrame = 0;
				}
				break;
			case LOOP_REVERSE:
				if (this.currentFrame === 0) {
					this.currentFrame = this.frameCount - 1;
				}
				break;
			case LOOP_ZIGZAG:
				if (this.currentFrame === 0) {
					this.playState = PLAYSTATE_PLAYING;
				}
				if (this.currentFrame >= this.frameCount - 1) {
					this.playState = PLAYSTATE_REWIND;
				}
				break;
			case LOOP_DESTROY:
				if (this.currentFrame >= this.frameCount) {
					this.destroy();
				}
				break;
		}
		this.offsetX = this.movement * Math.floor(MOVEMENT_STEP_SIZE * this.currentFrame / this.frameCount);
	},
	updatePhysx: function() {
		var timeFactor = Engine.frameTime / this.computedPhysixFrameTime;

		switch (this.physxMode) {
			case PHYSX_NORMAL:
				// ty cache
				var ty = 0;

				if (this.mainActor) {
					ty = TerrainScene.getHeight(this.x, this.y);

					if (this.y < ty) {
						console.log('#Corrected at ' + this.y + ' ' + ty);
						this.y = ty;
						this.stance = TerrainScene.getTilt(this.x, this.y, this.direction);
						//return;
					}

					if (this.y === ty && this.speed.Y < 0) {
						this.speed.set(0, 0);
						this.accel.set(0, 0);
						console.log('hit the rock at ' + this.y + ' <= ' + ty);
						return;
					}
				}

				if (this.mass) {
					// add default accelerations if nothing set
					// has mass .. so gravity applies
					// can add wind friction as well ...
					if (!this.accel.value) {
						this.accel.set(E.g, -Math.PI / 2);

						if (this.mainActor) {
							if (this.y <= ty && this.speed.Y <= 0) {
								this.accel.add(E.g, Math.PI / 2);
							}
						}
						//this.accel.add(E.w*this.airfriction,E.w >0 ? 0 : Math.PI);
					}
					this.addSpeed(this.accel.value * timeFactor, this.accel.angle);
				} else {
					this.addSpeed(this.accel.value * timeFactor, this.accel.angle);
				}

				if (this.medSpeed.value) {
					// update position
					this.x += this.medSpeed.X * timeFactor;

					if (this.mainActor) {
						ty = TerrainScene.getHeight(this.x, this.y);

						if (this.y + (this.medSpeed.Y * timeFactor) < ty) {
							console.log('Corrected at ' + this.y + ' ' + ty + ' : ' + this.speed.Y + ' >> ' + this.accel.Y);
							this.y = ty;
							this.speed.set(0, 0);
							this.accel.set(0, 0);
							this.stance = TerrainScene.getTilt(this.x, this.y, this.direction);
						} else {
							this.y += this.medSpeed.Y * timeFactor;
							console.log(this.y);
						}

						if (this.y < -300) {
							this.destroy();
						}
					} else {
						this.y += this.medSpeed.Y * timeFactor;
					}
				}

				if (this.worldWrapping) {
					if (this.worldWrapping === WORLD_WRAPPED_HORISONTAL || this.worldWrapping === WORLD_WRAPPED) {
						this.x = (VIEWPORT_WIDTH + SIDE_VIEW + this.x) % (VIEWPORT_WIDTH + SIDE_VIEW);
					}

					if (this.worldWrapping === WORLD_WRAPPED_VERTICAL || this.worldWrapping === WORLD_WRAPPED) {
						//this.y = Math.abs(-((VIEWPORT_HEIGHT + TOP_VIEW  - this.y) % (VIEWPORT_HEIGHT + TOP_VIEW )) + VIEWPORT_HEIGHT + TOP_VIEW);
						this.y = (VIEWPORT_HEIGHT + TOP_VIEW + this.y) % (VIEWPORT_HEIGHT + TOP_VIEW);
					}
				}
				break;
			case PHYSX_SPIN:
				this.rotationAngle += this.rotationSpeed * timeFactor;
				this.rotationSpeed += this.rotationAccel * timeFactor;
				this.x = this.rotationCenterX + this.rotationLength * Math.cos(this.rotationAngle);
				this.y = this.rotationCenterY + this.rotationLength * Math.sin(this.rotationAngle);
				break;
		}
	},
	updateLogic: function() {

	},
	updateMovement: function() {
		if (this.movement === MOVEMENT_STOPPED) {
			return;
		}

		/*if(this.currentFrame < this.frameCount-1) {
			console.log('current frame:' + this.currentFrame);
			return;
		}*/

		console.log('updating movement!');
		this.movementStep += 2;

		if (this.movementStep < this.movementRate) {
			console.log(this.movementStep + ' out of ' + this.movementRate);
			return;
		}

		this.movementStep = 0;
		this.x += this.movement;// * MOVEMENT_STEP_SIZE;
		var y = TerrainScene.getHeight(this.x + this.movement, this.y);

		if (Math.abs(y - this.y) < 20) {
			console.log('old y:' + this.y + ' new y: ' + y);
			this.y = y;
			this.stance = TerrainScene.getTilt(this.x, this.y, this.direction);
			console.log('!!!!!set to stance:' + this.direction + '  ' + this.stance + ' => ' + this.model + ' f:' + this.currentFrame);
			this.copyConfig(worm.movement[this.direction][this.stance]);
		}
	},
	update: function() {
		this.updateMovement();
		this.updatePhysx();
		this.updateLogic();
		this.animate();
	},
	jump: function () {
		console.log('jump!' + this.speed.Y + ':' + this.speed.X);
		this.addSpeed(JUMP_POWER, Math.PI / 2 + Math.pow(-1, 1 - this.direction) * (90 - JUMP_ANGLE) * Math.PI / 180);
		console.log('jump!' + this.speed.Y + ':' + this.speed.X);
	},
	applyExplosion: function (x, y, power) {
		var dist = Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));

		if (dist > 100) {
			return;
		}

		var alpha = Math.PI + Math.atan2(y - this.y, x - this.x);
		power = Math.max(30, power / (dist / 5));
		this.applyImpulse(power, alpha);
	},
	applyImpulse: function (value, direction) {
		console.log('applying impulse' + value + ', ' + direction);
		console.log('crt speed:' + this.speed.X + ', ' + this.speed.Y + ' mass' + this.mass);
		this.speed.add(value / this.mass, direction);
		console.log('after speed:' + this.speed.X + ', ' + this.speed.Y);
	},
	addSpeed: function (value, direction) {
		if (!value) {
			return;
		}

		this.medSpeed = this.speed;
		this.medSpeed.add(value / 2, direction);
		this.speed.add(value, direction);

		if (this.mainActor) {
			console.log(this.speed.X + ', ' + this.speed.Y + ' and limit:' + this.speedLimit);
		}

		this.speed.set(Math.min(this.speedLimit, this.speed.value), this.speed.angle);
		this.medSpeed.set(Math.min(this.speedLimit, this.medSpeed.value), this.medSpeed.angle);
	},
	play: function() {
		this.playState = PLAYSTATE_PLAYING;
	},
	stop: function() {
		this.playState = PLAYSTATE_STOPPED;
	},
	rewind: function() {
		this.playState = PLAYSTATE_REWIND;
	},
	addTo: function (scene) {
		this.parent = scene;
		this.syncProperties();
		this.parent.push(this);
	},
	destroy: function() {
		for (var obj in this.parent) {
			// noinspection JSUnfilteredForInLoop
			if (this.parent[obj] === this) {
				// noinspection JSUnfilteredForInLoop
				this.parent.splice(obj, 1);
			}
		}
	},
	syncProperties: function () {
		this.computedFrameTime = Engine.computedFrameTime * this.frameRate;
		this.computedPhysixFrameTime = Engine.computedFrameTime / this.physxFPS;
	}
});