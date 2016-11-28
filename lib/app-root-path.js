'use strict';

module.exports = function(dirname) {
	var path = require('path');
	var resolve = require('./resolve.js');
	var appRootPath = resolve(dirname);

	var publicInterface = {
		resolve: function(pathToModule) {
			return path.join(appRootPath, pathToModule);
		},

		resolveRelative: function(pathToModule) {
			if (!process.env.APP_RELATIVE_PATH) {
				console.warn('APP_RELATIVE_PATH not defined!');
			}
			return publicInterface.resolve(path.join(process.env.APP_RELATIVE_PATH, pathToModule));
		},

		require: function(pathToModule) {
			return require(publicInterface.resolve(pathToModule));
		},

		requireRelative: function(pathToModule) {
			if (!process.env.APP_RELATIVE_PATH) {
				console.warn('APP_RELATIVE_PATH not defined!');
			}
			return publicInterface.require(path.join(process.env.APP_RELATIVE_PATH, pathToModule));
		},

		toString: function() {
			return appRootPath;
		},

		setPath: function(explicitlySetPath) {
			appRootPath = path.resolve(explicitlySetPath);
			publicInterface.path = appRootPath;
		},

		path: appRootPath
	};

	return publicInterface;
};