/* globals angular, console */

//TODO store this more securely, and somewhere else
// Do not use this key, instead get your own from https://cloud.myscript.com/
window.MYSCRIPT_API_KEY = 'e67c9167-613f-498b-bee7-053d2ed204ae';

angular
  .module('demo-myscript-app', ['myscript'])
  .controller('demo-myscript-controller', DemoMyscriptController);

function DemoMyscriptController($scope, $element) {
  //NOTE it **is not** the best idea to manipulate elements directly ion the controller
  // after all, that is what directives are for.
  // However, this is done here for demonstration purposes.
  // Normally one would bind to values here, but is not feasible here,
  // because MathJax cannot render to string.
  // Instead it requires DOM manipulatin directly.
  console.log('Construct DemoMyscriptController');

  $scope.myscriptOptions = {
    disableAutoCloseOnSubmit: true,
    // recogniseType: 'math',
    // recogniseType: 'text',
    recogniseType: 'digits',
  };
  $scope.myscriptResults = {};

  $scope.formattedResults = {
    latex: '',
    mathml: '',
    raw: '{}',
  };

  $scope.$watch('myscriptResults.parsedResult.math', function () {
    var div;
    var math =
      $scope.myscriptResults &&
      $scope.myscriptResults.parsedResult &&
      $scope.myscriptResults.parsedResult.math;
    var latex = math && math.latex;
    var mathml = math && math.mathml;
    if (!!latex) {
      $scope.formattedResults.latex = latex;
      //TODO this is insecure, ensure that this is really latex before marking it as safe
      //TODO investigate if it is possible to set the results directly:
      // http://docs.mathjax.org/en/latest/api/elementjax.html#Text
      div = $element[0].querySelector('.demo-myscript-result-latex');
      div.innerHTML = '\\('+latex+'\\)';
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, div]);
    }
    if (!!mathml) {
      $scope.formattedResults.mathml = mathml;
      // TODO this is insecure, ensure that this is really mathml before marking it as safe
      div = $element[0].querySelector('.demo-myscript-result-mathml');
      div.innerHTML = mathml;
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, div]);
    }
  });
}
