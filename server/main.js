console.log('Starting server');

var ws = require('websocket-server');
var mh = require('./lib/MessageHandler');
var server = ws.createServer();
try {
	server.on('connection', function (connection) {
		console.log('Client Connected!');

		connection.on('message', function(data) {
			var packet = JSON.parse(data);

			mh.handle(this, packet);
		});
	});
} catch(e) {
	console.log(e.message);
}
server.listen(8888, '86.120.68.3');

var changeWeather = function () {
	var packet = JSON.stringify({opcode: 2, success: true, data: {value: (Math.random() * 200) - 100}});

	server.broadcast(packet);
}

setInterval(changeWeather, 10000);

console.log('Server started');
