app.factory('CreateLevelFactory', function ($http) {
	var factory = {};
	factory.submitLevel = function(objArr, title, girderCount, skyColor, fifthParam) {
		try { 
			var map = {
				startGirders: girderCount,
objects: objArr,
skyColor: skyColor
			}
			var level = {
				title: title,
map: map,
published: fifthParam
			}
			return $http.post('/api/levels/', level).then(res => res.data); 
		} catch(e) {
			console.error(e);
		}
	};
	return factory;
});
