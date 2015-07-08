/* globals console, angular */
'use strict';

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('myscript-writing-directive', [
      ], factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory(
      );
  }
  else {
    root.MyscriptWritingDirective = factory(
      );
  }
})(this, function factory() {
  var mod = MyscriptWritingDirective;
  return mod;
});

/**
  * @ngInject
  */
function MyscriptWritingDirective($compile, MyscriptRecogniserService) {
  console.log('Construct MyscriptWritingDirective');

  return {
    restrict: 'A',
    replace: true,
    transclude: true,
    scope: {
      myscriptResults: '=myscriptresults',
      myscriptOptions: '=myscriptoptions',
      myscriptRecogniseType: '=myscriptrecognisetype',
    },
    link: MyscriptWritingDirectiveLink,
  };

  var myscriptWritingPadSingleton;
  var myscriptWritingPadSingletonLinkedScopeId;

  function MyscriptWritingDirectiveLink(scope, element, attrs) {
    console.log('MyscriptWritingDirectiveLink', scope);

    if (!scope.myscriptOptions) {
      console.log('myscript-writing directive present but disabled');
      return; // exit early, we don't want to do anything
    }

    var context;
    context = scope.myscriptOptions;
    modifyContextInit(context);
    modifyContextStart(context);

    var myscriptWritingPadDirectiveCompiler;

    if (!myscriptWritingPadSingleton) {
      // create a directive if one has not yet been instantiated
      var padElement = document.createElement('myscript-writing-pad');
      padElement.setAttribute('myscriptresults', 'myscriptResults');
      padElement.setAttribute('myscriptrecognisetype', 'myscriptRecogniseType');
      padElement.setAttribute('myscriptoptions', 'myscriptOptions');
      myscriptWritingPadSingleton = angular.element(padElement);

      // compile the directive
      myscriptWritingPadDirectiveCompiler = $compile(myscriptWritingPadSingleton);
      myscriptWritingPadDirectiveCompiler(scope);
    }

    MyscriptRecogniserService.subscribe(onRecogniserMessage);
    function onRecogniserMessage(evt, data) {
      console.log('onRecogniserMessage', evt, data);
      if (!!data && scope.$id === myscriptWritingPadSingletonLinkedScopeId) {
        console.log(data.name, scope.$id, data.result);
        switch (data.name) {
          case 'recognised':
            context.callbacks.onRecogniseSuccess(
              parseAndEmitResult(data.result));
            break;
          case 'close-writing-pad':
            context.callbacks.onCancel();
            break;
          default:
            // Do nothing
        }
      }
    }

    function parseAndEmitResult(rawResult) {
      var parsedResult;
      try {
          var myscriptResult = rawResult.data.result;
          var results = myscriptResult.results;
          var textResults = myscriptResult.textSegmentResult;

          if (!!results) {
              var mathResult = {
                latex: undefined,
                mathml: undefined,
              };
              results.forEach(function(result) {
                var type, div;
                var resultType = result.type.toUpperCase();
                if (resultType === 'LATEX') {
                  mathResult.latex = result.value;
                }
                else if (resultType === 'MATHML') {
                  mathResult.mathml = result.value;
                }
              });
              if (!!mathResult.latex && !!mathResult.mathml) {
                parsedResult = {
                  math: mathResult,
                };
              }
          }
          else if (!!textResults) {
              var textResult =
                  textResults.candidates[textResults.selectedCandidateIdx];
              if (textResult && textResult.label) {
                parsedResult = {
                  text: textResult.label,
                };
              }
          }
      }
      catch (ex) {
          // Do nothing
      }

      var out = {
        name: 'result-parse',
        parsedResult: parsedResult,
        result: rawResult,
      };
      if (typeof parsedResult === 'undefined') {
        window.console.log('Failed to parse', rawResult);
      }
      return out;
    }

    element.on('focus', onFocus);

    function onFocus(evt) {
      console.log('onFocus');

      // Start listening to events from the writing pad instance
      context = scope.myscriptOptions;
      myscriptWritingPadSingletonLinkedScopeId = scope.$id;
      modifyContextStart(context);

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

    function modifyContextInit(inputContext) {
      context.options = {
          pad: {
            animation: {
              appear: {
                duration: 500, //ms
                className: 'animate-slide-from-top',
              },
              disappear: {
                duration: 500, //ms
                className: 'animate-slide-to-top',
              },
            },
          },
          stroke: {
            attributes: {
              'class': 'myscript-writing-stroke',
              'style': 'stroke: #ffffff; stroke-width: 4; fill: transparent; pointer-events: none;',
            }
          },
          simplify: {
            skip: false,
            tolerance: 0.5,
            onMoveInterval: 100,
            minimumPointsCount: 20,
          },
        };
      context.callbacks = {
          recognise: MyscriptRecogniserService.recognise,
        };
    }

    function modifyContextStart(inputContext) {
      context = inputContext;
      context.callbacks.onRecogniseSuccess = onRecogniseSuccess;
      context.callbacks.onRecogniseFailure = onRecogniseFailure;
      context.callbacks.onCancel = onCancel;
    }

    function modifyContextFinish(inputContext) {
      // Do nothing
    }

    function onRecogniseSuccess(data) {
      scope.$apply(function() {
        console.log('onRecogniseSuccess', data);
        scope.myscriptResults = data;
      });

      if (!scope.myscriptOptions.disableAutoCloseOnSubmit) {
        // Stop listening to events from the writing pad instance
        modifyContextFinish(context);
        animatedDisplay(false);
      }
    }

    function onRecogniseFailure(err) {
      console.log('Recognition Error', err);
    }

    function onCancel() {
      // Stop listening to events from the writing pad instance
      modifyContextFinish(context);
      animatedDisplay(false);
    }

    function animatedDisplay(shouldAppear) {
      var el = myscriptWritingPadSingleton[0];

      var disappearDuration = context.options.pad.animation.disappear.duration;
      var appearClass = context.options.pad.animation.appear.className;
      var disappearClass = context.options.pad.animation.disappear.className;

      if (!!shouldAppear) {
        // Make element appear
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
        // Make element disappear
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
        // this timeout duration should be changed too
        window.setTimeout(function onDisappearAnimationComplete() {
          el.style.display = 'none';
        }, context.options.pad.animation.disappear.duration);
      }
    }
  }

}
