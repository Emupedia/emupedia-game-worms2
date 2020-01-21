var EventTrigger = new Function();

EventTrigger.prototype = {
	constructor: EventTrigger,
	_listeners: {},
	bind: function(type, handler) {
		if (typeof this._listeners[type] === 'undefined') {
			this._listeners[type] = [];
		}

		this._listeners[type].push(handler);
	},
	fire: function(event) {
		if (typeof event === 'string') {
			event = {type: event};
		}

		if (!event.target) {
			event.target = this;
		}

		if (!event.type) {
			// noinspection JSUnresolvedFunction
			throw new EventException('Event object missing type property.');
		}

		if (this._listeners[event.type] instanceof Array) {
			var listeners = this._listeners[event.type];

			for (var i = 0, size = listeners.length; i < size; ++i) {
				listeners[i].call(this, event);
			}
		}
	},
	unbind: function(type, handler) {
		if (this._listeners[type] instanceof Array) {
			if (typeof handler === 'undefined') {
				this._listeners[type] = [];
				return;
			}

			var listeners = this._listeners[type];
			for (var i = 0, size = listeners.length; i < size; ++i) {
				if (listeners[i] === handler) {
					listeners.splice(i, 1);
					break;
				}
			}
		}
	}
};