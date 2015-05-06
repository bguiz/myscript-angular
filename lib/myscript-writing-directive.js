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
      'fill': 'transparent',
      'pointer-events': 'none',
    };

    // intialise state
    resetStrokes();
    resetCurrentStroke();

    function resetStrokes() {
      // Clear the array without using a new object
      scope.strokes.length = 0;
    }

    function resetCurrentStroke() {
      currentStroke = {
        xs: [],
        ys: [],
        path: '',
      };
    }

    function addCurrentPos(lineType, evt) {
      if (evt.touches) {
        evt = evt.touches[0];
      }
      var x = 0 - domElement.offsetLeft;
      var y = 0 - domElement.offsetTop;
      if (evt.pageX || evt.pageY)   {
        x += evt.pageX;
        y += evt.pageY;
      }
      else if (evt.clientX || evt.clientY)  {
        x +=
          evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y +=
          evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      currentStroke.xs.push(x);
      currentStroke.ys.push(y);
      currentStroke.path += lineType+' '+x+' '+y+' ';
    }

    function enableStrokeListeners(start, move, end) {
      if (!!start) {
        domElement.addEventListener('mousedown', startStroke, false);
        domElement.addEventListener('touchstart', startStroke, false);
      }
      else {
        domElement.removeEventListener('mousedown', startStroke, false);
        domElement.removeEventListener('touchstart', startStroke, false);
      }

      if (!!move) {
        domElement.addEventListener('mousemove', moveStroke, false);
        domElement.addEventListener('touchmove', moveStroke, false);
      }
      else {
        domElement.removeEventListener('mousemove', moveStroke, false);
        domElement.removeEventListener('touchmove', moveStroke, false);
      }

      if (!!end) {
        domElement.addEventListener('mouseup', endStroke, false);
        domElement.addEventListener('touchend', endStroke, false);

        domElement.addEventListener('mouseout', endStroke, false);
        domElement.addEventListener('touchleave', endStroke, false);
      }
      else {
        domElement.removeEventListener('mouseup', endStroke, false);
        domElement.removeEventListener('touchend', endStroke, false);

        domElement.removeEventListener('mouseout', endStroke, false);
        domElement.removeEventListener('touchleave', endStroke, false);
      }
    }

    function startStroke(evt) {
      //start a new stroke
      resetCurrentStroke();
      addCurrentPos('M', evt);
      scope.strokes.push(currentStroke);

      // Next: only allow move stroke and end stroke
      enableStrokeListeners(false, true, true);
    }

    function moveStroke(evt) {
      //append to current stroke
      scope.$apply(function() {
        addCurrentPos('L', evt);
      });

      // Next: continue with move stroke and end stroke (no change required)
    }

    function endStroke(evt) {
      //end the current stroke
      scope.$apply(function() {
        //do nothing
      });

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

          //TODO hide element
        }, function onError(err) {
          console.log('Recognition Error', err);
          //TODO display error
          resetStrokes();

          //TODO hide element
        });
    }

    function onCancel() {
      console.log('onCancel');
      //clean up all strokes discard them
      resetStrokes();

      //TODO hide element
    }
  }

}

