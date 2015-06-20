# `myscript-angular`

Integrations for Myscript from VisionObjects for AngularJs projects.

## Usage

Note that this is very much a **work in progress**,
so do not expect anything to be stable.

### Basic usage

See the example app in `/example`.

```html
<!-- first include `angularjs` itself -->
<script src="./angular-1.3.2.js"></script>

<!-- include `handwriting` and `myscript-js`, which are this modules' dependencies -->
<script src="../node_modules/handwriting/index.js"></script>
<script src="../node_modules/myscript-js/myscript-writing.js"></script>
<script src="../node_modules/myscript-js/myscript-recogniser.js"></script>

<!-- include this modules -->
<script src="../lib/myscript-recogniser-service.js"></script>
<script src="../lib/myscript-writing-directive.js"></script>
<script src="../lib/myscript-writing-pad-directive.js"></script>
<script src="../lib/myscript-module.js"></script>

<!-- finally, include the application's own source -->
<script src="./index.js"></script>
```

### Bundled usage

Each of the angular providers are now exported in accord with
Universal Module Declaration (UMD) standards.
This means that the module can be used with bundlers such as Browserify.

### Browserify example

If you wish to use the entire module,
simply `require()` the `myscript-module` file.
This is the most likely scenario.

```javascript
var myscriptModule = require('myscript-angular/myscript-module');
```

If you have a very specific use case in mind,
where you need only specific parts,
you may require them individually.

```javascript
var myscriptRecogniserService = require('myscript-angular/myscript-recogniser-service');
var myscriptWritingDirective = require('myscript-angular/myscript-writing-directive');
var myscriptWritingPadDirective = require('myscript-angular/myscript-writing-pad-directive');
```

In both cases remember to add the
`require()`d module or provider to you application.

## Contributing

This repository uses the **git flow** branching strategy.
If you wish to contribute, please branch from the **develop** branch -
pull requests will only be requested if they request merging into the develop branch.

## Author

Maintained by Brendan Graetz

[bguiz.com](http://bguiz.com/)

Thanks to Thomas Roberts for making the first iteration of this.

## Licence

GPLv3
