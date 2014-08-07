var path = require('path'),
	appRootPath = path.resolve(__dirname, '..', '..');

exports.require = function(moduleReqire) {
	return function(pathToModule) {
		return moduleReqire(exports.resolve(pathToModule));
	}
};

exports.toString = function() {
	return appRootPath;
};

exports.path = appRootPath;