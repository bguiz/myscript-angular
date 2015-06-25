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
    recogniseType: 'digits',
  };
  $scope.myscriptResults = {};

  $scope.formattedResults = {
    latex: '',
    mathml: '',
    raw: '{}',
  };

  $scope.$watch('myscriptResults', function() {
    $scope.formattedResults.raw = JSON.stringify($scope.myscriptResults, undefined, '  ');

    try {
      var myscriptResult = $scope.myscriptResults.data.result;
      var results = myscriptResult.results;
      var textResults = myscriptResult.textSegmentResult;
      if (!!results) {
        results.forEach(function(result) {
          var type, div;
          if (result.type.toUpperCase() === 'LATEX') {
            $scope.formattedResults.latex = result.value;
            //TODO this is insecure, ensure that this is really latex before marking it as safe
            //TODO investigate if it is possible to set the results directly:
            // http://docs.mathjax.org/en/latest/api/elementjax.html#Text
            div = $element[0].querySelector('.demo-myscript-result-latex');
            div.innerHTML = '\\('+result.value+'\\)';
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, div]);
          }
          if (result.type.toUpperCase() === 'MATHML') {
            $scope.formattedResults.mathml = result.value;
            //TODO this is insecure, ensure that this is really mathml before marking it as safe
            div = $element[0].querySelector('.demo-myscript-result-mathml');
            div.innerHTML = result.value;
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, div]);
          }
        });
      }
      else if (!!textResults) {
        var val = textResults.candidates[textResults.selectedCandidateIdx];
        val = val && val.label;
        var div = $element[0].querySelector('.demo-myscript-result-latex');
        div.innerHTML = '\\('+val+'\\)';
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, div]);
        div = $element[0].querySelector('.demo-myscript-result-mathml');
        div.innerHTML = '';
      }
    }
    catch (ex) {
      console.log('Error occurred while parsing myscriptResults', ex);
    }
  });
}
