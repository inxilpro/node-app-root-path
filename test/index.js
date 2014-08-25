'use strict';

var path = require('path');
var assert = require('assert');
var resolve = require('../lib/resolve.js');

describe('The path resolution method...', function() {
	// Check global paths
	it('should use require.main.filename if the path is in the globalPaths array', function() {
		var expected = path.dirname(require.main.filename);
		require('module').globalPaths.forEach(function(globalPath) {
			var testPath = globalPath + path.sep + 'node-app-root-path';
			assert.equal(resolve(testPath), expected);
		});
	});

	// Check some standard path layouts
	it('should use String.split() in common cases', function() {
		var cases = [
			'/var/www/node_modules/node-app-root-path',
			'/var/www/node_modules/somemodule/node_modules/node-app-root-path',
			'/var/www/node_modules/somemodule/node_modules/someothermodules/node_modules/node-app-root-path',
		];
		var expected = '/var/www';
		cases.forEach(function(testPath) {
			assert.equal(resolve(testPath), expected);
		});
	});

	// Check root path
	it('should still use String.split() in the root directory', function() {
		assert.equal(resolve('/node_modules'), '');
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
	});
});