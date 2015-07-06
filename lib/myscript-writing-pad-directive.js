/* globals console, angular */
'use strict';

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('myscript-writing-pad-directive', [
        'myscript-writing',
        'myscript-writing-pad-directive.html'
      ], factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory(
      require('myscript-js/myscript-writing'),
      require('./myscript-writing-pad-directive.html')
      );
  }
  else {
    root.MyscriptWritingPadDirective = factory(
      root.MyscriptWriting,
      undefined
      );
  }
})(this, setUpMyscriptWritingPadDirective);

function setUpMyscriptWritingPadDirective(MyscriptWriting, MyscriptWritingPadDirectiveHtml) {
  if (typeof MyscriptWriting !== 'function') {
    throw 'Expect a MyscriptWriting function';
  }

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
        myscriptResults: '=myscriptresults',
        myscriptOptions: '=myscriptoptions',
        myscriptRecogniseType: '=myscriptrecognisetype',
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
      console.log('MyscriptWritingPadDirectiveLink', scope);

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
      modifyContextInit(scope.myscriptOptions);

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
      }

      var myscriptWritingInstance = MyscriptWriting(context);

      // reset state and event listeners to prevent memory leaks
      element.on('$destroy', myscriptWritingInstance.hooks.onDestroy);
    }

  }

  return MyscriptWritingPadDirective;

}

