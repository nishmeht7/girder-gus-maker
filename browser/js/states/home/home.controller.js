const eventEmitter = window.eventEmitter;

window.app.controller( 'HomeCtrl', function( $scope, $timeout ) {

  eventEmitter.on('what level to play', () => {
    eventEmitter.emit( 'play this level', [ 'default' ] )
  })

})
