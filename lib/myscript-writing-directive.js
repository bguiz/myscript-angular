/* globals console, angular */
'use strict';

angular
  .module('myscript')
  .directive('myscriptWriting', MyscriptWritingDirective);

function MyscriptWritingDirective($compile) {
  console.log('Construct MyscriptWritingDirective');

  return {
    restrict: 'A',
    replace: true,
    transclude: true,
    scope: {
      recogniseType: '=',
      results: '=',
    },
    link: MyscriptWritingDirectiveLink,
  };

  var myscriptWritingPadSingleton;

  function MyscriptWritingDirectiveLink(scope, element, attrs) {
    if (!myscriptWritingPadSingleton) {
      // create a directive if one has not yet been instantiated
      var padElement = document.createElement('myscript-writing-pad');
      padElement.setAttribute('recogniseType', 'recogniseType');
      padElement.setAttribute('results', 'results');
      myscriptWritingPadSingleton = angular.element(padElement);
    }
    if (!document.querySelector('myscript-writing-pad')) {
      // now we know that the directive exists,
      // but it may not be currently in the DOM,
      // so make sure it is added to the body of the page
      // it should be invisible by default,
      // and be made to appear/ disappear over `<input myscript-writing>` elements when triggered
      var el = $compile(myscriptWritingPadSingleton)(scope);
      angular.element(document.body).append(myscriptWritingPadSingleton);
    }

    //TODO link attributes manually such that only one
    // is bound to the pad at any time
  }

};
