/* globals console, angular */
'use strict';

angular
  .module('myscript')
  .directive('myscriptWriting', MyscriptWritingDirective);

function MyscriptWritingDirective(MyscriptRecogniserService) {
  console.log('Construct MyscriptWritingDirective');

  return {
    restrict: 'A',
    replace: true,
    transclude: true,
    scope: {
      recogniseType: '=',
      results: '=',
    },
    templateUrl: '../lib/myscript-writing-directive.html',
    link: MyscriptWritingDirectiveLink,
  };

  function MyscriptWritingDirectiveLink(scope, element, attrs) {
    console.log('MyscriptWritingDirectiveLink');

    // event listeners
    var svgDomElement = element.find('svg')[0];
    var svgContainerElement = element[0].querySelector('.myscript-writing-svg-container');
    var doneButton = element[0].querySelector('.myscript-writing-done');
    var cancelButton = element[0].querySelector('.myscript-writing-cancel');
    var undoButton = element[0].querySelector('.myscript-writing-undo');
    var redoButton = element[0].querySelector('.myscript-writing-redo');

    // context for raw myscript writing
    var context = {
      elements: {
        svg: svgDomElement,
        svgContainer: svgContainerElement,
        doneButton: doneButton,
        cancelButton: cancelButton,
        undoButton: undoButton,
        redoButton: redoButton,
      },
      options: {
        recogniseType: (scope.recogniseType || 'equation'),
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
        }
      },
      callbacks: {
        recognise: MyscriptRecogniserService.recognise,
        onRecogniseSuccess: function onRecogniseSuccess(data) {
          scope.results = data;
        },
        onRecogniseFailure: function onRecogniseFailure(err) {
          console.log('Recognition Error', err);
        },
      },
    };

    var myscriptWritingInstance = window.MyscriptWriting(context);
    // reset state and event listeners to prevent memory leaks
    element.on('$destroy', myscriptWritingInstance.hooks.onDestroy);

  }

}

