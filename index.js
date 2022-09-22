'use strict';

var lib = require('./lib/app-root-path.js');
module.exports = lib(process.env.APP_ROOT_PATH || __dirname);
