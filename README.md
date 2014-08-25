# App Root Path Module

[![Build Status](https://travis-ci.org/inxilpro/node-app-root-path.svg)](https://travis-ci.org/inxilpro/node-app-root-path)

This simple module helps you access your application's root path from anywhere in the application without resorting to `require("../../path")`.

## Installation

``` bash
$ npm install app-root-path --save
```

## Usage

To simply access the app's root path:

``` js
var appRoot = require('app-root-path');
var myModule = require(appRoot + '/lib/my-module.js');
```

A helper function is also provided:

``` js
var reqlib = require('app-root-path').require;
var myModule = reqlib('/lib/my-module.js');
```

It's a little hacky, but you can also put this method on your application's `global` object:

``` js
// In app.js
global.reqlib = require('app-root-path').require;

// In lib/module/component/subcomponent.js
var myModule = reqlib('/lib/my-module.js');
```

Finally, you can also just resolve a module path:

``` js
var myModulePath = require('app-root-path').resolve('/lib/my-module.js');
```

You can also explicitly set the path, using the environmental variable `APP_ROOT_PATH` or by calling `require('app-root-path').setPath('/my/app/is/here')`

## How It Works

This module uses two different methods to determine the app's root path, depending on the circumstances.

### Method One (preferred)

If the module is located inside your project's directory, somewhere within the `node_modules` directory (whether directly, or inside a submodule), we just do:

``` js
path.resolve(__dirname).split('/node_modules')[0];
```

This will take a path like `/var/www/node_modules/submodule/node_modules/app-root-path` and return `/var/www`.  In 99% of cases, this is just what you need.

### Method Two (for edge cases)

The node module loader will also look in a few other places for modules (for example, ones that you install globally with `npm install -g`).  Theses can be in one of: 

  - `$HOME/.node_modules`
  - `$HOME/.node_libraries`
  - `$PREFIX/lib/node`

Or, anywhere in the `NODE_PATH` environmental variable ([see documentation](http://nodejs.org/api/modules.html#modules_loading_from_the_global_folders)).

In these cases, we fall back to an alternate trick:

``` js
path.dirname(require.main.filename);
```

When a file is run directly from Node, `require.main` is set to its `module`.  `module.filename` refers to the filename of that module, so by fetching the directory name for that file, we at least get the directory of the file that was called directly.  In some cases (process managers and test suites, for example) this doesn't actually give the correct directory, though, so this method is only used as a fallback.

## Change Log

### 0.1.0
  - Completely rewrote the path resolution method to account for most possible scenarios.  This shouldn't cause and backwards compatibility issues, but always test your code.
  - Removed the need to pass a modules's `require()` method to the `appRootPath.require()` function.  Which it's true that each module has its own `require()` method, in practice it doesn't matter, and it's **much** simpler this way.
  - Added tests


