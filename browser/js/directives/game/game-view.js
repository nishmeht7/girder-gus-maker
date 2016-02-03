app.directive( "gameView", function() {

  return {
    restrict: 'E',
    templateUrl: '/js/directives/game/game-view.html',
    scope: {
      level: '=',
      state: '='
    }
  }

});
