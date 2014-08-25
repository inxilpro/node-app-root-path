'use strict';

var path = require('path');
var resolve = require('./lib/resolve.js');
var appRootPath = resolve(__dirname);

exports.resolve = function(pathToModule) {
	return path.join(appRootPath, pathToModule);
};

exports.require = function(pathToModule) {
	// Backwards compatibility check
	if ('function' === typeof pathToModule) {
		console.warn('Just use appRootPath.require() -- no need to pass in your ' +
					 'modules\'s require() function any more.');
		return function(pathToModule) {
			return exports.require(pathToModule);
		}
	}

	return require(exports.resolve(pathToModule));
};

exports.toString = function() {
	return appRootPath;
};

exports.setPath = function(explicitlySetPath) {
	appRootPath = path.resolve(explicitlySetPath);
}

exports.path = appRootPath;