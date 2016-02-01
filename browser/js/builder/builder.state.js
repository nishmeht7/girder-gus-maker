app.config(function ($stateProvider) {
    $stateProvider.state('builder', {
        url: '/builder',
        templateUrl: 'js/builder/builder.html',
		controller: 'BuilderCtrl' 
    });
});
