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
      results: '=',
    },
    templateUrl: '../lib/myscript-writing-directive.html',
    link: MyscriptWritingDirectiveLink,
  };

  function MyscriptWritingDirectiveLink(scope, element, attrs) {
    console.log('MyscriptWritingDirectiveLink');

    var recogniseType;
    var currentStroke;
    var currentSvgPathElement;

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

    // event listeners
    var svgDomElement = element.find('svg')[0];
    scope.onDone = onDone;
    scope.onCancel = onCancel;
    disableBounce();
    enableStrokeListeners(true, false, false);

    // intialise state
    resetStrokes();
    resetCurrentStroke();

    function resetStrokes() {
      // Clear the array without using a new object
      scope.strokes.length = 0;
      while (!!svgDomElement.firstChild) {
        svgDomElement.removeChild(svgDomElement.firstChild);
      }
    }

    function resetCurrentStroke() {
      currentStroke = {
        xs: [],
        ys: [],
        path: '',
      };

      currentSvgPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      currentSvgPathElement.setAttribute('class', 'myscript-writing-stroke');
      currentSvgPathElement.setAttribute('style', 'stroke: #FF0000; stroke-width: 4; fill: transparent; pointer-events: none;');
    }

    function addCurrentPos(lineType, evt) {
      var point = (!!evt.touches && !!evt.touches[0]) ? evt.touches[0] : evt;

      var x = 0;
      var y = 0;

      // First, get the X, Y coordinates of the SVG element
      if (typeof svgDomElement.offsetLeft === 'number') {
        // Webkit follows the HTML5 spec, `offsetLeft` and `offsetTop`
        // properties are available on SVG elements
        x -= svgDomElement.offsetLeft;
        y -= svgDomElement.offsetTop;
      }
      else {
        // Other web engines are buggy, and SVG elements do not inherit the
        // required property.
        // e.g.:
        //
        // - Firefox has a five year old bug: https://bugzilla.mozilla.org/show_bug.cgi?id=552113
        // - In IE, the above fails too, but the reasons are unclear and undocumented
        var rect = svgDomElement.getBoundingClientRect();
        if (rect.width || rect.height || svgDomElement.getClientRects().length) {
          var doc = svgDomElement.ownerDocument
          var docElement = doc.documentElement;

          //TODO invsetigate whether `window` could be something else
          x -= (rect.left + window.pageXOffset + docElement.clientLeft);
          y -= (rect.top  + window.pageYOffset +  docElement.clientTop);
        }
      }

      // Next get the X, Y coordinates of the point clicked on within the page
      // and subtract the coordinates opf the SVG element from it.
      if (point.pageX || point.pageY)   {
        x += point.pageX;
        y += point.pageY;
      }
      else if (point.clientX || point.clientY)  {
        x +=
          point.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y +=
          point.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }

      // Huzzah!
      // We have fought the good fight battling various cross browser issues,
      // and have finally arrived at a consistent result!
      // We can now add the computed coordinates to the current stroke data,
      // and append tio the SVG path.
      x = parseInt(x, 10);
      y = parseInt(y, 10);
      currentStroke.xs.push(x);
      currentStroke.ys.push(y);
      currentStroke.path += lineType+' '+x+' '+y+' ';
      currentSvgPathElement.setAttribute('d', currentStroke.path);
    }

    function enableStrokeListeners(start, move, end) {
      if (!!start) {
        svgDomElement.addEventListener('mousedown', startStroke, false);
        svgDomElement.addEventListener('touchstart', startStroke, false);
      }
      else {
        svgDomElement.removeEventListener('mousedown', startStroke, false);
        svgDomElement.removeEventListener('touchstart', startStroke, false);
      }

      if (!!move) {
        svgDomElement.addEventListener('mousemove', moveStroke, false);
        svgDomElement.addEventListener('touchmove', moveStroke, false);
      }
      else {
        svgDomElement.removeEventListener('mousemove', moveStroke, false);
        svgDomElement.removeEventListener('touchmove', moveStroke, false);
      }

      if (!!end) {
        svgDomElement.addEventListener('mouseup', endStroke, false);
        svgDomElement.addEventListener('touchend', endStroke, false);

        svgDomElement.addEventListener('mouseout', endStroke, false);
        svgDomElement.addEventListener('touchleave', endStroke, false);
      }
      else {
        svgDomElement.removeEventListener('mouseup', endStroke, false);
        svgDomElement.removeEventListener('touchend', endStroke, false);

        svgDomElement.removeEventListener('mouseout', endStroke, false);
        svgDomElement.removeEventListener('touchleave', endStroke, false);
      }
    }

    function disableBounce() {
      // Do this to disable "bounce" - dragging the page down on a touch device
      // beyond  its actual min top coordinate in order to refresh it -
      // by killing all `touchmove` events pre-emptively.
      // This should be conditionally re-enabled if necessary.
      // Also, in IE, this fails to have the intended effect,
      // and a CSS property is necessary in its place:
      //
      // ```
      // .myscript-writing-svg-container {
      //   -ms-touch-action: none;
      //   touch-action: none;
      // }
      // ```
      svgDomElement.parentNode.addEventListener('touchmove', function (evt) {
        //NOTE consider adding a conditional check around this such as `if (!evt.target.hasClass('draggable')) { ... }`
        evt.preventDefault();
        evt.stopImmediatePropagation();
        evt.stopPropagation();
      });
    }

    function disableEventPropagation(evt) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      evt.stopPropagation();
    }

    function startStroke(evt) {
      disableEventPropagation(evt);

      //start a new stroke
      resetCurrentStroke();
      addCurrentPos('M', evt);
      scope.strokes.push(currentStroke);
      svgDomElement.appendChild(currentSvgPathElement);

      // Next: only allow move stroke and end stroke
      enableStrokeListeners(false, true, true);
    }

    function moveStroke(evt) {
      disableEventPropagation(evt);

      //append to current stroke
      scope.$apply(function() {
        addCurrentPos('L', evt);
      });

      // Next: continue with move stroke and end stroke (no change required)
    }

    function endStroke(evt) {
      disableEventPropagation(evt);

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
          scope.results = data;
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

