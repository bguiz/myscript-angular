/* globals angular, console */

//TODO store this more securely, and somewhere else
// Do not use this key, instead get your own from https://cloud.myscript.com/
window.MYSCRIPT_API_KEY = 'e67c9167-613f-498b-bee7-053d2ed204ae';

angular
  .module('demo-myscript-app', ['myscript'])
  .controller('demo-myscript-controller', DemoMyscriptController);

function DemoMyscriptController($scope, $sce, $timeout) {
  console.log('Construct DemoMyscriptController');
  $scope.recogniseType = 'equation';
  $scope.strokes = [];
  $scope.results = {};

  $scope.formattedResults = {
    latex: '',
    mathml: '',
    raw: '{}',
  };

  $scope.$watch('results', function() {
    $scope.formattedResults.raw = JSON.stringify($scope.results, undefined, '  ');

    try {
      var results = $scope.results.data.result.results;
      results.forEach(function(result) {
        var type;
        if (result.type.toUpperCase() === 'LATEX') {
          $scope.formattedResults.latex = result.value;
          //TODO this is insecure, ensure that this is really latex before marking it as safe
          //TODO investigate if it is possible to set the results directly:
          //http://docs.mathjax.org/en/latest/api/elementjax.html#Text
          var div = document.getElementById('demo-myscript-result-latex');
          div.innerHTML = '\\('+result.value+'\\)';
          MathJax.Hub.Queue(['Typeset', MathJax.Hub, div]);
        }
        if (result.type.toUpperCase() === 'MATHML') {
          $scope.formattedResults.mathml = result.value;
          //TODO this is insecure, ensure that this is really mathml before marking it as safe
          var div = document.getElementById('demo-myscript-result-mathml');
          div.innerHTML = result.value;
          MathJax.Hub.Queue(['Typeset', MathJax.Hub, div]);
        }
      });
    }
    catch (ex) {
      // Do nothing
    }
  });
}
