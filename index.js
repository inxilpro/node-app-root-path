var path = require('path'),
	appRootPath = path.resolve(__dirname, '..', '..');

appRootPath.require = function(moduleReqire) {
	return function(path) {
		return moduleReqire(path.join(appRootPath, path));
	}
};

module.exports = appRootPath;