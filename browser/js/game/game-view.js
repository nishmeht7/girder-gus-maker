app.directive( "gameView", function() {

  return {
    restrict: 'E',
    templateUrl: '/js/game/game-view.html',
    scope: {
      level: '=',
      state: '='
    }
  }

});