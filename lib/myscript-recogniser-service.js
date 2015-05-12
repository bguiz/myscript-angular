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

    // The service owns the context,
    // and is the basis of the communications between the
    // myscript-writing-directive and the myscript-writing-pad-directive
    var context = {};

    // Both directives must modify this instance of the context via this function
    // This is designed such that there is only one (a singleton) myscript-writing-pad-directive
    // and multiple myscript-writing-directive
    // The developer should **not** use the myscript-writing-pad-directive
    // directly, and instead only use the myscript-writing-directive
    // to instantiate and manipulate it as necessary
    function modifyPadContext(modifier) {
      if (typeof modifier !== 'function') {
        throw new Error('Expected a modifier function');
      }
      modifier(context);

      if (!context.callbacks.onRecogniseSuccess) {
        context.callbacks.onRecogniseSuccess = onRecogniseSuccessDefault;
      }
      if (!context.callbacks.onRecogniseFailure) {
        context.callbacks.onRecogniseFailure = onRecogniseFailureDefault;
      }
      if (!context.callbacks.onCancel) {
        context.callbacks.onCancel = onCancelDefault;
      }
    }

    function onRecogniseSuccessDefault(data) {
      console.log('Recognition Success', data);
    }

    function onRecogniseFailureDefault(err) {
      console.log('Recognition Error', err);
    }

    function onCancelDefault() {
      console.log('Cancel Writing');
    }

    return {
      recognise: recognise,
      modifyPadContext: modifyPadContext,
    };
  }

  this.$get = MyscriptRecogniserServiceFactory;

}
