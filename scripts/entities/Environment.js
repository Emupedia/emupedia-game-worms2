var E = {};

E.g = 1.8;
E.w = 0;
E.target = 0;
E.direction = 1;
E.af = 1;
E.windChangeStep = 5;

E.changeWeather = function (value) {
	//E.w = Math.random() * 20 - 10;
	E.target = value / 100;
	E.direction = E.target > E.w ? 1 : -1;
	E.ticker = setInterval(E.updateWeatherTick, 60);
};

E.updateWeatherTick = function() {
	if (E.w !== E.target) {
		if (E.w < E.target && (E.w + E.direction * E.windChangeStep / 100) > E.target ||
			E.w > E.target && (E.w + E.direction * E.windChangeStep / 100) < E.target) {
			E.w = E.target;
			clearInterval(E.ticker);
		} else {
			E.w += E.direction * E.windChangeStep / 100;
		}
	} else {
		clearInterval(E.ticker);
	}
	var left = document.getElementsByClassName('left')[0];
	var right = document.getElementsByClassName('right')[0];

	var width = Math.abs(Math.floor(88*E.w));

	if (E.w < 0) {
		left.style.width =  width + 'px';
		right.style.width = '0px';
	} else if (E.w > 0) {
		right.style.width = width + 'px';
		left.style.width = '0px';
	} else {
		left.style.width = '0px';
		right.style.width = '0px';
	}

	//console.log('Changing wind speed to '+ E.w,'Weather');
	Engine.ApplyWindToAll();
};