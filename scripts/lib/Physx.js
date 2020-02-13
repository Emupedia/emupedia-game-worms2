var Vector = Class.create({
	initialize: function () {
		this.value = 0;
		this.angle = 0;
		this.X = 0;
		this.Y = 0;
	},
	sync: function () {
		this.X = Math.round(this.value * Math.cos(this.angle));
		this.Y = Math.round(this.value * Math.sin(this.angle));
	},
	set: function (val, angle) {
		this.value = val;
		this.angle = angle;
		this.sync();
		//console.log(this);
	},
	add: function (val, angle) {
		if (!val) {
			// no point in computing anything when nothing to add
			return;
		}

		//console.log('old:' + this.value + ', ' + this.angle);
		if (!this.value) {
			this.value = val;
			this.angle = angle;
			this.sync();
		} else {
			/*/
			this.X += Math.cos(angle) * val;
			this.Y += Math.sin(angle) * val;
			this.value = Math.sqrt(Math.pow(this.X,2), Math.pow(this.Y,2));
			this.angle = Math.atan(this.Y/this.X);
			/*/

			if (Math.abs(this.angle - angle) === Math.PI) {
				this.angle = this.value > val ? this.angle : angle;
				this.value -= val;
			} else if (!(this.angle - angle)) {
				this.value += val;
			} else {
				var newVal = Math.sqrt(this.value * this.value + val * val + 2 * Math.cos(this.angle - angle) * this.value * val);

				if (!newVal) {
					this.angle = 0;
				} else {
					this.angle = this.angle - Math.atan2(val * Math.sin(this.angle - angle), this.value + val * Math.cos(this.angle - angle));
				}

				this.value = newVal;
			}

			this.sync();
			/**/
		}
		//console.log('new:' + this.value + ', ' + this.angle);
	}
});