# App Root Path Module

This simple module helps you access your application's root path from anywhere in the application without resorting to `require("../../path")`.

## Installation

``` bash
  $ npm install app-root-path --save
```

## Usage

To simply access the app's root path:

``` js
    var appRoot = require('app-root-path'),
        myModule = require(appRoot + '/lib/my-module.js');
```

A helper function is also provided:

``` js
    var appRequire = require('app-root-path').require(require),
        myModule = appRequire('/lib/my-module.js');
```

This works by passing the current module's `require` method (each module has its *own* `require` method) to the `app-root-path` module, which then returns a wrapper for that method that prepends the application's root path to whatever path is passed to it.

Finally, you can also just resolve a module path:

``` js
    var myModulePath = require('app-root-path').resolve('/lib/my-module.js');
```

## How It Works

This module works on the assumption that your application's root path is the parent of the `node_modules` directory.  Here's almost all the module's logic:

``` js
    var appRootPath = path.resolve(__dirname, '..', '..');
```

So, given this directory structure:

    my-app                  <--  ..
        node_modules        <--  ..
            app-root-path   <--  __dirname
                index.js
        lib
        my-module.js
            index.js

This may not work in every case--particularly if you try to use this in a module that is then used by other modules--but it should work 99% of the time when you're using it within the main application.

