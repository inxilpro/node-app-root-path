'use strict';

var path = require('path');
var assert = require('assert');
var mockery = require('mockery');

function globalPathsContainPnpm() {
	return undefined !== require('module').globalPaths.find(function(e) {
		return e.indexOf('.pnpm') !== -1
	});
}

describe('The path resolution method', function() {
	var resolve = require('../lib/resolve.js');
	var originalReqMainFilename = require.main.filename;
	const isPnpm = globalPathsContainPnpm();

	// Make sure env variable isn't set for tests
	if (process.env.APP_ROOT_PATH) {
		delete process.env.APP_ROOT_PATH;
	}

	beforeEach(function() {
		require.main.filename = '/var/www/app.js';
	});

	afterEach(function() {
		require.main.filename = originalReqMainFilename;
	});

	if (isPnpm) {
		it('should use require.main.filename if the path is in the globalPaths array (PNPM)', function() {
			var expected = path.dirname(require.main.filename);
			var root = path.resolve(__dirname, '..');

			require('module').globalPaths.forEach(function(globalPath) {
				var testPath = globalPath + path.sep + 'node-app-root-path';
				
				if (-1 !== testPath.indexOf('.pnpm')) {
					assert.equal(resolve(testPath), root);
				} else {
					assert.equal(resolve(testPath), expected);
				}
			});
		});

		// Check pnpm
		it('should use String.split() if installed with pnpm', function() {
			var cases = [
				'/var/www/node_modules/.pnpm/node_modules/node-app-root-path',
				'/var/www/node_modules/.pnpm/custom_registry/node-app-root-path',
			];
			var expected = '/var/www';

			cases.forEach(function(testPath) {
				assert.equal(resolve(testPath), expected);
			});
		});

		// Check root path
		it('should still use String.split() in the root directory (PNPM)', function() {
			assert.equal(resolve('/node_modules'), path.dirname(require.main.filename));
		});
	} else {
		it('should use require.main.filename if the path is in the globalPaths array', function() {
			var expected = path.dirname(require.main.filename);
			require('module').globalPaths.forEach(function(globalPath) {
				var testPath = globalPath + path.sep + 'node-app-root-path';
				assert.equal(resolve(testPath), expected);
			});
		});

		// Check root path
		it('should still use String.split() in the root directory', function() {
			assert.equal(resolve('/node_modules'), '');
		});
	}

	// Check bin/ dir in global path
	it('should correctly handle the global bin/ edge case', function() {
		var prefix = path.resolve(path.dirname(path.dirname(process.execPath)), 'lib', 'node_modules');
		var testPath = prefix + '/node-app-root-path/bin/cli.js';
		var expected = prefix + '/node-app-root-path';
		require.main.filename = testPath;
		assert.equal(resolve(testPath), expected);
	});

	// Check some standard path layouts
	it('should use String.split() in common cases', function() {
		var cases = [
			'/var/www/node_modules/node-app-root-path',
			'/var/www/node_modules/somemodule/node_modules/node-app-root-path',
			'/var/www/node_modules/somemodule/node_modules/someothermodules/node_modules/node-app-root-path',
			'/var/www/node_modules/.bin',
			'/var/www/node_modules/bin'
		];
		var expected = '/var/www';
		cases.forEach(function(testPath) {
			assert.equal(resolve(testPath), expected);
		});
	});

	// Check unexpected path
	it('should use require.main.filename on unexpected input', function() {
		var cases = [
			'just-some-jibberish',
			'/var/www/libs/node-app-root-path'
		];
		var expected = path.dirname(require.main.filename);
		cases.forEach(function(testPath) {
			assert.equal(resolve(testPath), expected);
		});
	});

	// Check when setting via environmental variable
	it('should respect the APP_ROOT_PATH environmental variable', function() {
		var expected = '/some/arbirary/path';
		process.env.APP_ROOT_PATH = expected;
		assert.equal(resolve('/somewhere/else'), expected);
		delete process.env.APP_ROOT_PATH;
	});

	it('should defer to the main process inside an electron renderer process', function() {
		var fauxElectronPath = 'path/from/electron';
		var lastRemoteModule = null;

		// Set up mock
		mockery.registerAllowable('path');
		mockery.registerMock('electron', {
			remote: {
				require: function(moduleName) {
					lastRemoteModule = moduleName;
					return {
						path: fauxElectronPath
					};
				}
			}
		});
		global.window = {
			process: {
				type: 'renderer'
			}
		};
		mockery.enable();

		// Run test
		assert.equal(resolve('funky'), fauxElectronPath);
		assert.equal(lastRemoteModule, 'app-root-path');

		// Tear down mock
		mockery.deregisterMock('electron');
		delete global.window;
		mockery.disable();
	});

	// Check AWS Lambda execution environment is honored
	it('should respect the AWS Lambda environmental variables', function() {
		var expected = '/some/arbirary/path';
		process.env.LAMBDA_TASK_ROOT = expected;
		process.env.AWS_EXECUTION_ENV = 'AWS_Lambda_nodesomething';
		assert.equal(resolve('/somewhere/else'), expected);
		delete process.env.LAMBDA_TASK_ROOT;
		delete process.env.AWS_EXECUTION_ENV;
	});
});

describe('The public interface', function() {
	var lib = require('../lib/app-root-path.js');
	var root = path.resolve(__dirname);
	var pub = lib(root + '/node_modules/app-root-path');

	it('should expose a resolve() method that resolves a relative path to the root path', function() {
		assert(pub.resolve);
		assert.equal(pub.resolve('subdir/filename.js'), root + '/subdir/filename.js');
	});

	it('should expose a require() method that properly loads a module relative to root', function() {
		assert(pub.require);
		var testlib = pub.require('lib/testlib.js');
		assert.equal(testlib, 'hello world');
	});

	it('should implement toString()', function() {
		assert(pub.toString);
		assert.equal(pub + '', root);
		assert.equal(pub.toString(), root);
	});

	it('should allow explicitly setting the root path with setPath()', function() {
		assert(pub.setPath);
		var originalPath = pub.toString();
		pub.setPath('/path/to');
		assert.equal(pub.resolve('somewhere'), '/path/to/somewhere');
		assert.equal(pub.path, '/path/to');
		pub.setPath(originalPath);
	});

	it('should expose the app root path as a .path property', function() {
		assert(pub.path);
		assert.equal(pub.path, pub.toString());
	});
});
