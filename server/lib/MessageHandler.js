var MOUSE_CLICK         = 1;
var CHANGE_WEATHER      = 2;

exports.handlers = new Array();
exports.handlers[MOUSE_CLICK] = handleMouseClick;

exports.handle = function(connection, packet) {
	var opcode = packet.opcode;
	var success = packet.success;

	if(!success) {
		console.log(packet.error);
		return;
	}

	this.handlers[opcode].apply(null, [connection, packet.data]);
}

function handleMouseClick(connection, data) {
	console.log(connection.id + ' clicked at ' + data.x + ' x ' + data.y)
	connection.broadcast(JSON.stringify({opcode: 1, success: true, data: data}));
}
