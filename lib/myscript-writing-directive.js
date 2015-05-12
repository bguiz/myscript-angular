/* globals console, angular */
'use strict';

angular
  .module('myscript')
  .directive('myscriptWriting', MyscriptWritingDirective);

function MyscriptWritingDirective($compile, MyscriptRecogniserService) {
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

      // compile the directive
      var directive = $compile(myscriptWritingPadSingleton);
      directive(scope);
    }

    element.bind('focus', onFocus);

    function onFocus(evt) {
      console.log('onFocus');

      if (!document.querySelector('.myscript-writing-pad-directive')) {
        // now we know that the directive exists,
        // but it may not be currently in the DOM,
        // so make sure it is added to the body of the page
        // it should be invisible by default,
        // and be made to appear/ disappear over `<input myscript-writing>` elements when triggered
        angular.element(document.body).append(myscriptWritingPadSingleton);
      }

      animatedDisplay(true);

      //start listening to events from the writing pad instance
      MyscriptRecogniserService.modifyPadContext(modifyContextStart);
    }

    function modifyContextStart(context) {
      context.callbacks.onRecogniseSuccess = onRecogniseSuccess;
      context.callbacks.onRecogniseFailure = onRecogniseFailure;
      context.callbacks.onCancel = onCancel;
    }

    function modifyContextFinish(context) {
      context.callbacks.onRecogniseSuccess = undefined;
      context.callbacks.onRecogniseFailure = undefined;
      context.callbacks.onCancel = undefined;
    }

    function onRecogniseSuccess(data) {
      scope.results = data;
      animatedDisplay(false);
      MyscriptRecogniserService.modifyPadContext(modifyContextFinish);
    }

    function onRecogniseFailure(err) {
      console.log('Recognition Error', err);
    }

    function onCancel() {
      animatedDisplay(false);
      MyscriptRecogniserService.modifyPadContext(modifyContextFinish);
    }

    function animatedDisplay(show) {
      if (!!show) {
        myscriptWritingPadSingleton[0].style.display = '';
        //TODO animation after toggling visibility
      }
      else {
        //TODO animation before toggling visibility
        myscriptWritingPadSingleton[0].style.display = 'none';
      }
    }
  }

};
