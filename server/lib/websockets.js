/*
 *  websockets.js
 *  WebSockets implementation in node.js
 *  Based on http://github.com/Guille/node.websocket.js/
 *
 *  Copyright 2010 Marc Addeo
 *
 *  This file is part of nodejs-websockets.
 *
 *  nodejs-websockets is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  nodejs-websockets is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with nodejs-websockets.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

var tcp     = require('tcp'),
    sys     = require('sys'),
    events  = require('events'),
    tools   = require('./tools');
    
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
    
var log = function (message, type) {
    sys.puts('[' + new Date() + '] [' + (type || 'info') + '] ' + message);
};

var empty = new Function;

function Server (options) {
    events.EventEmitter.call(this);
    
    var self = this;
    
    this.options = tools.merge({
        port: 8888,
        host: 'localhost',
        resource: '/default',
        origins: '*',
        log: true,
        tls: false
    }, options || {});
    
    this.clients    = 0;
    this.server     = tcp.createServer(function (socket) {
        new Connection(self, socket);
    });
    this.server.listen(this.options.port, this.options.host);
    
    if (this.options.log)
        setInterval(function (){
            log(self.clients + ' clients connected', 'info');
        }, 5000);
}
sys.inherits(Server, events.EventEmitter);

Server.prototype._verifyOrigin = function (orgin) {
    if (this.options.origins === '*' || this.options.origins === origin) return true;
    if (!tools.isArray(this.options.origins)) {
        log('No valid `origins` array passed to constructor. This server won\'t accept any connections.', 
        'info');
        return false;
    }
    for (var i = this.options.origins.length; i--;) {
        if (this.options.origins[i] === origin) return true;
    }
    return false;
}

Server.prototype._onConnect = function (connection) {
    this.clients++;
    this.emit("connect", this, connection);
};

Server.prototype._onDisconnect = function (connection) {
    this.clients--;
    this.emit("disconnect", this, connection);
};

function Connection (server, socket) {
    events.EventEmitter.call(this);
    
    var self = this;
    
    this.server         = server;
    this.socket         = socket;
    this.initialized    = false;
    this.data           = "";
    
    this.log = server.options.log ? function (message, type) {
        log('[client ' + socket.remoteAddress + '] ' + message, type);
    } : empty;
    this.log('Requesting Connection', 'info');
    
    if (server.options.tls) socket.setSecure();
    socket.setTimeout(0);
    socket.setNoDelay(true);
    socket.setEncoding('utf8');
    socket.addListener('connect', function () { self.onConnect(); });
    socket.addListener('data', function (data) { self._onReceive(data); });
    socket.addListener('end', function () { self._onDisconnect(); });
}
sys.inherits(Connection, events.EventEmitter);

Connection.prototype.onConnect = function (data) {
    this.log('Connected', 'info');
    this.server._onConnect(this);  
};

Connection.prototype._onReceive = function (data) {
    if (this.initialized) {
        this._handle(data);
    } else {
        this._initialize(data);
    }
};

Connection.prototype._onDisconnect = function () {
    this.log('Disconnected', 'info');
    this.socket.close();
    this.server._onDisconnect(this);
};

Connection.prototype.write = function (data) {
    try {
        this.socket.write('\u0000' + data + '\uffff');
    } catch (e) {
        this.socket.close();
    }
};

Connection.prototype._handle = function (data) {
    var self = this;
    this.data += data;
    
    chunks = this.data.split('\ufffd');
    chunk_count = chunks.length - 1;
    
    for (var i = 0; i < chunk_count; i++) {
        chunk = chunks[i];
        if (chunk[0] != '\u0000') {
            this.log('Data incorrectly framed by UA. Dropping connection');
            this.socket.close();
            return false;
        }
        this.server.emit('receive', chunk.slice(1), this);
    }
    
    this.data = chunks[chunks.length - 1];
    
    return true;
};

Connection.prototype._initialize = function (data) {
    this.log('Performing Handshake', 'info');
    
    var self    = this,
        matches = [],
        headers = data.split('\r\n');
        
    if (headers.length && headers[0].match(/<policy-file-request.*>/)) {
        this.log('Flash Policy Request');
        this._serveFlashPolicy();
        return false;
    }
    
    for (var i = 0, l = headers.length, match; i < l; i++) {
        if (i === requestHeaders.length) break;
        match = headers[i].match(requestHeaders[i]);
        if (match && match.length > 1) {
            matches.push(match[1]);
        } else if (!match) {
            this.log('Handshake Aborted. Bad Header ' + headers[i]);
            this.socket.close();
            return false;
        }
    }
    
    if (!this.server._verifyOrigin(matches[2])) {
        this.log('Handshake Aborted. Security policy disallows origin: ' + matches[2]);
        this.socket.close();
        
        return false;
    }
    
    if (!this.server.options.resource.match(matches[0])) {
        this.log('Handshake Aborted. Resource does not match');
        this.socket.close();
        
        return false;
    }
    
    this.socket.write(tools.substitute(responseHeaders.join('\r\n'), {
        resource: matches[0],
        host: matches[1],
        origin: matches[2],
        protocol: this.server.secure ? 'wss' : 'ws'
    }));
    
    this.server.emit('connected', this.server, this);
    this.initialized = true;
    this.log('Handshake Sent', 'info');
    
    return true;
};

Connection.prototype._serveFlashPolicy = function () {
    var origins = this.server.options.origins;
    if (!tools.isArray(origins)) {
        origins = [origins];
    }  
    this.socket.write('<?xml version="1.0"?>\n');
    this.socket.write('<!DOCTYPE cross-domain-policy SYSTEM "http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd">\n');
    this.socket.write('<cross-domain-policy>\n');
    for (var i = origins.length; i--;) {
        this.socket.write('  <allow-access-from domain="' + origins[i] + '" to-ports="' + this.server.options.port + '"/>\n');
    }
    this.socket.write('</cross-domain-policy>\n');
    this.socket.close();
};

exports.Connection  = Connection;
exports.Server      = Server;

