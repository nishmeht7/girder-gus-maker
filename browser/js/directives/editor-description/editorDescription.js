app.directive('editorDescription', () => {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: 'js/directives/editor-description/editor-description.html',
		link: (scope) => {
			scope.show = true;
			scope.toggle = function() {
				scope.show = !scope.show;
			}
		}
	}
});
