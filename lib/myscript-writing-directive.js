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
      var el = myscriptWritingPadSingleton[0];
      if (!!show) {
        el.style.display = '';
        // animate appearance after toggling visibility
        if (el.classList) {
          el.classList.add('animate-slide-from-top');
          el.classList.remove('animate-slide-to-top');

        }
        else {
          el.className += ' ' + 'animate-slide-from-top';
          el.className = el.className.replace(new RegExp('(^|\\b)' + 'animate-slide-to-top'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
      }
      else {
        if (el.classList) {
          el.classList.add('animate-slide-to-top');
          el.classList.remove('animate-slide-from-top');
        }
        else {
          el.className += ' ' + 'animate-slide-to-top';
          el.className = el.className.replace(new RegExp('(^|\\b)' + 'animate-slide-from-top'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }

        // animate disappearance before toggling visibility
        //NOTE if CSS changes animation duration for disappearance,
        //this timeout duration should be changed too
        //TODO make this value configurable
        window.setTimeout(function onDisappearAnimationComplete() {
          el.style.display = 'none';
        }, 500);
      }
    }
  }

};
