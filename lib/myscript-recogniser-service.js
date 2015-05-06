/* globals console, angular */
'use strict';

angular
  .module('myscript')
  .provider('MyscriptRecogniserService', MyscriptRecogniserServiceProvider);

function MyscriptRecogniserServiceProvider() {
  console.log('Construct MyscriptRecogniserServiceProvider');

  function getApiUrl(inputType) {
    return 'https://myscript-webservices.visionobjects.com/api/myscript/v2.0/'+inputType+'/doSimpleRecognition.json';
  }

  function getApiKey() {
    // Get your own API key from https://cloud.myscript.com/
    return window.MYSCRIPT_API_KEY || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
  }

  function processStrokeList(strokes) {
    return strokes.map(function(stroke, idx) {
      return {
        type: 'stroke',
        x: stroke.xs,
        y: stroke.ys,
      };
    });
  }

  function processStrokesForEquation(strokes) {
    return {
      apiKey: getApiKey(),
      equationInput: JSON.stringify({
        resultTypes:['LATEX', 'MATHML'],
        components: processStrokeList(strokes),
      }),
    };
  }

  function transformObjectToWwwFormUrlEncoded(data) {
    var keyVals = [];
    for (var key in data) {
      keyVals.push(encodeURIComponent(key)+'='+encodeURIComponent(data[key]));
    }
    return keyVals.join('&');
  }

  this.$get = MyscriptRecogniserServiceFactory;

  function MyscriptRecogniserServiceFactory($http, $q) {

    function recogniseEquation(strokes) {
      var strokeData =
        transformObjectToWwwFormUrlEncoded( processStrokesForEquation(strokes) );

      //NOTE myscript does not currently accept `application/json`,
      //only `application/x-www-form-urlencoded`
      return $http({
          method: 'POST',
          url: getApiUrl('equation'),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: strokeData,
        })
        .then(function(result) {
          //TODO process the result
          console.log(result);
          return result;
        });
    }

    function recognise(recogniseType, strokes) {
      switch (recogniseType) {
        case 'equation':
          return recogniseEquation(strokes);
        default:
          // Return a promise that rejects immediately
          return $q.reject('Recognise type unsupported: '+recogniseType);
      }
    }

    return {
      recognise: recognise,
      equation: recogniseEquation,
    };
  }
}
