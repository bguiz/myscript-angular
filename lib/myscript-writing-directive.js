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
      strokes: '=',
      recogniseType: '=',
    },
    templateUrl: '../lib/myscript-writing-directive.html',
    link: MyscriptWritingDirectiveLink,
  };

  function MyscriptWritingDirectiveLink(scope, element, attrs) {
    console.log('MyscriptWritingDirectiveLink');

    var currentStroke;
    var recogniseType;
    var lastPos = {
      x: undefined,
      y: undefined,
    };

    // event listeners
    var domElement = element.find('svg')[0];
    enableStrokeListeners(true, false, false);

    scope.onDone = onDone;
    scope.onCancel = onCancel;

    // attributes
    scope.strokes = scope.strokes || [];
    scope.recogniseType = scope.recogniseType || 'equation';
    scope.lineStyle = {
      //TODO make this configurable
      'stroke': '#0E2B8D',
      'stroke-width': 2,
      'pointer-events': 'none',
    };

    console.log('scope.strokes', scope.strokes);
    console.log('scope.recogniseType', scope.recogniseType);

    // intialise state
    resetStrokes();
    resetCurrentStroke();

    function resetStrokes() {
      // Clear the array without using a new object
      scope.strokes.length = 0;
    }

    function resetCurrentStroke() {
      currentStroke = {
        segments: [],
      };
    }

    function resetLastPos() {
      lastPos.x = undefined;
      lastPos.y = undefined;
    }

    function setLastPos(evt) {
      lastPos.x = evt.offsetX;
      lastPos.y = evt.offsetY;
    }

    function enableStrokeListeners(start, move, end) {
      if (!!start) {
        domElement.addEventListener('mousedown', startStroke, false);
      }
      else {
        domElement.removeEventListener('mousedown', startStroke, false);
      }
      if (!!move) {
        domElement.addEventListener('mousemove', moveStroke, false);
      }
      else {
        domElement.removeEventListener('mousemove', moveStroke, false);
      }
      if (!!end) {
        domElement.addEventListener('mouseup', endStroke, false);
        domElement.addEventListener('mouseout', endStroke, false);
      }
      else {
        domElement.removeEventListener('mouseup', endStroke, false);
        domElement.removeEventListener('mouseout', endStroke, false);
      }
    }

    function startStroke(evt) {
      //start a new stroke
      setLastPos(evt);
      resetCurrentStroke();
      scope.strokes.push(currentStroke);

      console.log('startStroke lastPos', lastPos);

      // Next: only allow move stroke and end stroke
      enableStrokeListeners(false, true, true);
    }

    function moveStroke(evt) {
      //append to current stroke
      var currentSegment = {
        x1: lastPos.x,
        y1: lastPos.y,
        x2: evt.offsetX,
        y2: evt.offsetY,
      };

      console.log('moveStroke currentSegment', currentSegment);


      scope.$apply(function() {
        currentStroke.segments.push(currentSegment);
      });

      setLastPos(evt);
    }

    function endStroke(evt) {
      //end the current stroke
      console.log('endStroke scope.strokes', scope.strokes);

      scope.$apply(function() {
        //do nothing
      });
      resetLastPos();

      // Next: only allow start stroke
      enableStrokeListeners(true, false, false);
    }

    function onDone() {
      console.log('onDone');
      //clean up all strokes and submit them
      //hide element

      MyscriptRecogniserService.recognise(scope.recogniseType, scope.strokes)
        .then(function onSuccess(data) {
          console.log('Recognised', data);
          //TODO attempt to insert the recognised text into the element that has the directive
          resetStrokes();
        }, function onError(err) {
          console.log('Recognition Error', err);
          //TODO display error
          resetStrokes();
        });
    }

    function onCancel() {
      console.log('onCancel');
      //clean up all strokes discard them
      resetStrokes();
      //hide element
    }
  }

}

