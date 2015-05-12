/* globals console, angular */
'use strict';

angular
  .module('myscript')
  .directive('myscriptWritingPad', MyscriptWritingPadDirective);

function MyscriptWritingPadDirective(MyscriptRecogniserService) {
  console.log('Construct MyscriptWritingPadDirective');

  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
    },
    templateUrl: '../lib/myscript-writing-directive.html',
    link: MyscriptWritingPadDirectiveLink,
  };

  function MyscriptWritingPadDirectiveLink(scope, element, attrs) {
    console.log('MyscriptWritingDirectiveLink');

    // event listeners
    var svgDomElement = element.find('svg')[0];
    var svgContainerElement = element[0].querySelector('.myscript-writing-svg-container');
    var doneButton = element[0].querySelector('.myscript-writing-done');
    var cancelButton = element[0].querySelector('.myscript-writing-cancel');
    var undoButton = element[0].querySelector('.myscript-writing-undo');
    var redoButton = element[0].querySelector('.myscript-writing-redo');

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
          recogniseType: (scope.recogniseType || 'equation'),
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
              'style': 'stroke: #FF0000; stroke-width: 4; fill: transparent; pointer-events: none;',
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
      scope.results = data;
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

