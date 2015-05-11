/* globals console, angular */
'use strict';

angular
  .module('myscript')
  .provider('MyscriptRecogniserService', MyscriptRecogniserServiceProvider);

function MyscriptRecogniserServiceProvider() {
  console.log('Construct MyscriptRecogniserServiceProvider');

  function MyscriptRecogniserServiceFactory($q) {

    function recognise(recogniseType, strokes) {
      var recogniser = window.MyscriptRecogniser();
      return $q(function(resolve, reject) {
        recogniser.recognise(recogniseType, strokes, function onRecongise(err, data) {
          if (!!err) {
            reject(err);
          }
          else {
            resolve(data);
          }
        });
      });
    }


    return {
      recognise: recognise,
    };
  }

  this.$get = MyscriptRecogniserServiceFactory;

}
