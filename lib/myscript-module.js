/* globals angular */
'use strict';

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('myscript-module', [
      'myscript-recogniser-service',
      'myscript-writing-directive',
      'myscript-writing-pad-directive'
      ], factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory(
      require('./myscript-recogniser-service'),
      require('./myscript-writing-directive'),
      require('./myscript-writing-pad-directive')
      );
  }
  else {
    root.MyscriptModule = factory(
      root.MyscriptRecogniserServiceProvider,
      root.MyscriptWritingDirective,
      root.MyscriptWritingPadDirective
      );
  }
})(this, function factory(
    MyscriptRecogniserServiceProvider,
    MyscriptWritingDirective,
    MyscriptWritingPadDirective){
  var mod = angular
    .module('myscript', [])
    .provider('MyscriptRecogniserService', MyscriptRecogniserServiceProvider)
    .directive('myscriptWriting', MyscriptWritingDirective)
    .directive('myscriptWritingPad', MyscriptWritingPadDirective);
  return mod;
});
