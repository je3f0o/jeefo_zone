/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : index.js
* Created at  : 2017-07-20
* Updated at  : 2017-09-28
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start
"use strict";

/* globals */
/* exported */

// ignore:end

var $q           = require("jeefo_q"),
	Zone         = require("./zone"),
	zone         = new Zone(),
	JeefoPromise = require("jeefo_promise"),
	JeefoElement = require("jeefo_jqlite/jeefo_element"),

	noop = function () {},

invoker = function (zone, original, instance, args) {
	args[0] = zone.bind(args[0]);
	return original.apply(instance, args);
},
event_invoker = function (zone, original, instance, args) {
	args[1] = zone.bind(args[1]);
	return original.apply(instance, args);
};

zone.patch("window", window, "setTimeout" , invoker);
zone.patch("window", window, "setInterval", invoker);

zone.patch("window", window, "addEventListener", event_invoker);
zone.patch("JeefoElement", JeefoElement.prototype, "on", event_invoker);

/*
this.patch("EventTarget", window.EventTarget.prototype, "addEventListener", function (zone, original, instance, args) {
	args[1] = zone.bind(args[1]);
	return original.apply(instance, args);
});
*/

zone.patch("$q", $q, "defer", function (zone, original, instance, args) {
	var deferred = {};

	deferred.promise = new JeefoPromise(function (resolve, reject) {
		deferred.resolve = resolve;
		deferred.reject  = reject;
	}, zone.bind(noop), args);

	return deferred;
});

export default zone;
