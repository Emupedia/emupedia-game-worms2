var Viewport = {};

/**
 * Tracks mouse movement over the viewport and positions the viewport to match the changes
 *
 * @param x the horizontal position of the cursor
 * @param  y the vertical position of the cursor
 */
Viewport.track = function (x, y) {
	var width = window.innerWidth;
	var height = window.innerHeight;
	var viewport = document.getElementById('viewport');

	var left = Math.round((VIEWPORT_WIDTH + SIDE_VIEW) / 2 - (VIEWPORT_WIDTH + SIDE_VIEW - width) * x/width) + 'px';
	if ((VIEWPORT_HEIGHT + TOP_VIEW) > height) {
		viewport.style.bottom = Math.round(-(VIEWPORT_HEIGHT + TOP_VIEW - height) * (height - y) / height) + 'px';
	}

	viewport.style.left = left;

	for(unitId in Engine.scene.background) {
		unit = Engine.scene.background[unitId];
		unit.x = 640* unitId + 500 * x/width - 320;
	}
};