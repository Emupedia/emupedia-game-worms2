var net     = require('net'),
    sys     = require('sys'),
    events  = require('events'),
	tools   = require('./tools')

var requestHeaders = [
		/^GET (\/[^\s]*) HTTP\/1\.1$/,
		/^Upgrade: WebSocket$/,
		/^Connection: Upgrade$/,
		/^Host: (.+)$/,
		/^Origin: (.+)$/
		],
	responseHeaders = [
		'HTTP/1.1 101 Web Socket Protocol Handshake',
		'Upgrade: WebSocket',
		'Connection: Upgrade',
		'WebSocket-Origin: {origin}',
		'WebSocket-Location: {protocol}://{host}{resource}',
		'',
		''
	];

function Server(options) {

    events.EventEmitter.call(this);

    var self = this;

    this.options = tools.merge({
        port: 8888,
        host: 'localhost',
        log: true,
        tls: false
    }, options || {});

	this.socketCount = 0;
	this.sockets = new Array();

	this.server = net.Server(function (socket) {
		self.sockets.push(new Connection(self, socket));
		self.socketCount++;
	});

	this.server.listen(this.options.port, this.options.host);
}
sys.inherits(Server, events.EventEmitter);

Server.prototype._onConnect = function (connection, data) {
	this.emit('connect', connection, data);
}

Server.prototype._onData = function (connection, data) {
	this.emit('data', connection, data);
}

Server.prototype._onEnd = function (connection, data) {
	this.emit('end', connection, data);
}

function Connection(server, sock) {
	events.EventEmitter.call(this);

	var self = this;

	this.server         = server;
    this.socket         = sock;
    this.initialized    = false;
    this.data           = "";

	log('Requesting Connection');

    this.socket.setTimeout(0);
    this.socket.setNoDelay(true);
    this.socket.setEncoding('utf8');
	this.socket.on('connect', function (data) { self.onConnect(data); });
	this.socket.on('data', function (data) { self.onData(data); });
	this.socket.on('end', function (data) { self.onEnd(data); });
}
sys.inherits(Connection, events.EventEmitter);

Connection.prototype.onConnect = function (data) {
	log('Client connected');

	this.server._onConnect(this, data);
}

Connection.prototype.onData = function (data) {
//	log('Recived: ' + data);

	if(!this.initialised) {
		this.initialised = this.auth(data);
	}
	
	this.server._onData(this, data);
}

Connection.prototype.onEnd = function (data) {
	var index = this.server.sockets.indexOf(this);
	this.server.sockets = this.server.sockets.splice(index, 1);
	this.server.socketCount--;
	log('Client disconnected');
	this.server._onEnd(this, data);
}

Connection.prototype.auth = function (data) {
	log('Performing Handshake!');

	var self = this,
		matches = [],
		headers = data.split('\r\n');

	for( var i = 0, l = headers.length, match; i < l; i++) {
		if(i === requestHeaders.length)
			break;

		match = headers[i].match(requestHeaders[i]);
		if(match && match.length > 1) {
			matches.push(match[1]);
		} else if(!match) {
			log('Handshake aborted, bad header: ' + headers[i]);
			this.socket.end();
			return false;
		}

		var response = tools.substitute(responseHeaders.join('\r\n'), {
			host: matches[1],
			origin: matches[2],
			protocol: this.server.secure ? 'wss' : 'ws'
		});

		this.socket.write(response);

		this.server.emit('authorised', this, data);
	}
}

var log = function (message, type) {
    sys.puts('[' + new Date() + '] [' + (type || 'info') + '] ' + message);
};

exports.Connection = Connection;
exports.Server = Server;
