/* globals console, angular */
'use strict';

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('myscript-recogniser-service', [
      'myscript-recogniser'
      ], factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory(
      require('myscript-js/myscript-recogniser')
      );
  }
  else {
    root.MyscriptRecogniserServiceProvider = factory(
      window.MyscriptRecogniser
      );
  }
})(this, setUpMyscriptRecogniserServiceProvider);

function setUpMyscriptRecogniserServiceProvider(MyscriptRecogniser) {
  if (typeof MyscriptRecogniser !== 'function') {
    throw 'Expected a MyscriptRecogniser function';
  }

  return MyscriptRecogniserServiceProvider;

  function MyscriptRecogniserServiceProvider() {
    console.log('Construct MyscriptRecogniserServiceProvider');

    var eventName = 'MyscriptRecogniserEvent';
    var recogniser = MyscriptRecogniser();

    /**
    * @ngInject
    */
    function MyscriptRecogniserServiceFactory($rootScope) {

      function publish(data) {
        $rootScope.$emit(eventName, data);
      }

      function subscribe(callback) {
        $rootScope.$on(eventName, callback);
      }

      function recognise(myscriptRecogniseType, strokes, callback) {
        recogniser.recognise(myscriptRecogniseType, strokes, function(err, data) {
          if (!err) {
            publish({
              name: 'recognised',
              result: data,
            });
          }
          callback(err, data);
        });
      }

      return {
        recognise: recognise,
        publish: publish,
        subscribe: subscribe,
      };
    }

    this.$get = MyscriptRecogniserServiceFactory;

  }
}

