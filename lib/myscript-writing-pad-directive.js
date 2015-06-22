/* globals console, angular */
'use strict';

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('myscript-writing-pad-directive', [
        'myscript-writing-pad-directive.html'
      ], factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory(
      require('./myscript-writing-pad-directive.html')
      );
  }
  else {
    root.MyscriptWritingPadDirective = factory(
      undefined
      );
  }
})(this, setUpMyscriptWritingPadDirective);

function setUpMyscriptWritingPadDirective(MyscriptWritingPadDirectiveHtml) {
  /**
  * @ngInject
  */
  function MyscriptWritingPadDirective(MyscriptRecogniserService) {
    console.log('Construct MyscriptWritingPadDirective');

    var returnedObject = {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
      },
      link: MyscriptWritingPadDirectiveLink,
    };
    if (!MyscriptWritingPadDirectiveHtml) {
      returnedObject.templateUrl = '../lib/myscript-writing-pad-directive.html';
    }
    else {
      returnedObject.template = MyscriptWritingPadDirectiveHtml;
    }
    return returnedObject;

    function MyscriptWritingPadDirectiveLink(scope, element, attrs) {
      console.log('MyscriptWritingDirectiveLink');

      // event listeners
      var svgDomElement = element.find('svg')[0];
      var svgContainerElement =
        element[0].querySelector('.myscript-writing-svg-container');
      var doneButton =
        element[0].querySelector('.myscript-writing-done');
      var cancelButton =
        element[0].querySelector('.myscript-writing-cancel');
      var undoButton =
        element[0].querySelector('.myscript-writing-undo');
      var redoButton =
        element[0].querySelector('.myscript-writing-redo');

      // default context for raw myscript writing
      var context;
      MyscriptRecogniserService.modifyPadContext(modifyContextInit);

      function modifyContextInit(inputContext) {
        context = inputContext;
        context.elements = {
            svg: svgDomElement,
            svgContainer: svgContainerElement,
            doneButton: doneButton,
            cancelButton: cancelButton,
            undoButton: undoButton,
            redoButton: redoButton,
          };
        context.options = {
            myscriptRecogniseType: (scope.myscriptRecogniseType || 'equation'),
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

      function onRecogniseSuccessDefault(data) {
        scope.myscriptResults = data;
      }

      function onRecogniseFailureDefault(err) {
        console.log('Recognition Error', err);
      }

      var myscriptWritingInstance;

      myscriptWritingInstance = window.MyscriptWriting(context);

      // reset state and event listeners to prevent memory leaks
      element.on('$destroy', myscriptWritingInstance.hooks.onDestroy);
    }

  }

  return MyscriptWritingPadDirective;

}

