/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : Zone.js
* Created at  : 2017-08-15
* Updated at  : 2017-08-15
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var noop = function () {},

symbol = function (object_name, name) {
	return `__jeefo_zone[${ object_name }.${ name }]__`;
},

Zone = function (other) {
	if (other) {
		var keys = Object.keys(other), i = keys.length;
		while (i--) {
			this[keys[i]] = other[keys[i]];
		}

		var patchers = this.patchers;
		i = patchers.length;
		this.patchers = [];

		while (i--) {
			this.patch(
				patchers[i].object_name,
				patchers[i].object,
				patchers[i].name,
				patchers[i].fn
			);
		}
	} else {
		this.patchers = [];
	}
};

Zone.prototype = {
	clone : function () {
		return new Zone(this);
	},
	bind : function (fn) {
		var self = this;
		return function () {
			return self.run(fn, this, arguments);
		};
	},
	run : function (fn, context, args) {
		try {
			this.on_enter();
			fn.apply(context, args);
		} catch (e) {
			this.on_error(e);
		} finally {
			this.on_leave();
		}
	},
	patch : function (object_name, object, name, fn) {
		var self        = this,
			symbol_name = symbol(object_name, name),
			original    = object[name][symbol_name] || object[name];

		object[name] = function () {
			return fn(self, original, this, arguments);
		};
		object[name][symbol_name] = original;

		this.patchers.push({
			fn          : fn,
			name        : name,
			object      : object,
			original    : original,
			object_name : object_name,
		});
	},
	get_original : function (object_name, name) {
		var i = this.patchers.length;
		while (i--) {
			if (this.patchers[i].object_name === object_name && this.patchers[i].name === name) {
				return this.patchers[i].original;
			}
		}
	},
	on_enter : noop,
	on_error : noop,
	on_leave : noop,
};

export default Zone;
