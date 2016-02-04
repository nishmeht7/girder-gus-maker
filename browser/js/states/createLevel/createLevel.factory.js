app.factory('CreateLevelFactory', function ($http) {
	var factory = {};
	factory.submitLevel = function(objArr, title, girderCount, skyColor) {
		try { 
			var map = {
				startGirders: girderCount,
objects: objArr,
skyColor: skyColor
			}
			var level = {
				title: title,
map: map
			}
			$http.post('/api/levels/', level).then(res => console.log(res.data)).then(null, console.error);
		} catch(e) {
			console.error(e);
		}
	};
	return factory;
});
