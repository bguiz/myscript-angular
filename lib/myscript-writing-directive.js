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

      // Start listening to events from the writing pad instance
      MyscriptRecogniserService.modifyPadContext(modifyContextStart);

      if (!document.querySelector('.myscript-writing-pad-directive')) {
        // now we know that the directive exists,
        // but it may not be currently in the DOM,
        // so make sure it is added to the body of the page
        // it should be invisible by default,
        // and be made to appear/ disappear over `<input myscript-writing>` elements when triggered
        angular.element(document.body).append(myscriptWritingPadSingleton);
      }

      animatedDisplay(true);
    }

    var context;

    function modifyContextStart(inputContext) {
      context = inputContext;
      context.callbacks.onRecogniseSuccess = onRecogniseSuccess;
      context.callbacks.onRecogniseFailure = onRecogniseFailure;
      context.callbacks.onCancel = onCancel;
    }

    function modifyContextFinish(inputContext) {
      context = inputContext;
      context.callbacks.onRecogniseSuccess = undefined;
      context.callbacks.onRecogniseFailure = undefined;
      context.callbacks.onCancel = undefined;
    }

    function onRecogniseSuccess(data) {
      scope.results = data;

      // Stop listening to events from the writing pad instance
      MyscriptRecogniserService.modifyPadContext(modifyContextFinish);
      animatedDisplay(false);
    }

    function onRecogniseFailure(err) {
      console.log('Recognition Error', err);
    }

    function onCancel() {
      // Stop listening to events from the writing pad instance
      MyscriptRecogniserService.modifyPadContext(modifyContextFinish);
      animatedDisplay(false);
    }

    function animatedDisplay(shouldAppear) {
      var el = myscriptWritingPadSingleton[0];

      var disappearDuration = context.options.pad.animation.disappear.duration;
      var appearClass = context.options.pad.animation.appear.className;
      var disappearClass = context.options.pad.animation.disappear.className;

      if (!!shouldAppear) {
        el.style.display = '';

        // animate appearance after toggling visibility
        if (el.classList) {
          el.classList.add(appearClass);
          el.classList.remove(disappearClass);

        }
        else {
          el.className += ' ' + appearClass;
          el.className = el.className.replace(
            new RegExp('(^|\\b)' + disappearClass.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
      }
      else {
        if (el.classList) {
          el.classList.add(disappearClass);
          el.classList.remove(appearClass);
        }
        else {
          el.className += ' ' + disappearClass;
          el.className = el.className.replace(
            new RegExp('(^|\\b)' + appearClass.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }

        // animate disappearance before toggling visibility
        //NOTE if CSS changes animation duration for disappearance,
        //this timeout duration should be changed too
        window.setTimeout(function onDisappearAnimationComplete() {
          el.style.display = 'none';
        }, context.options.pad.animation.disappear.duration);
      }
    }
  }

};
