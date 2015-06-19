# `myscript-angular`

Integrations for Myscript from VisionObjects for AngularJs projects.

## Usage

See the example app in `/example`.

Note that this is very much a work in progress,
so do not expect anything to be stable.

### Browserified usage

Unfortunately, usage within a project built using browserify is not fully supported.

You can use it in a not so nice way.

```javascript
require('myscript-angular/myscript-module');
require('myscript-angular/myscript-recogniser-service');
require('myscript-angular/myscript-writing-directive');
require('myscript-angular/myscript-pad-directive');
```

This attaches each of the angular providers and the main module to the
angular namespace, rather than exporting them.
Future versions aim to make this a nicer experience,
perhaps by making each module conform to UMD standards.

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
