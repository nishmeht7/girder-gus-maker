app.factory('LevelsFactory', function($http) {
    return {
        fetchAll: function() {
            return $http.get('api/levels')
                .then(function(res) {
                    return res.data;
                });
        },
        fetchAllWithCreators: function() {
            console.log('fetching');
            return $http.get('api/levels/users')
                .then(function(res) {
                    return res.data;
                })
        },
        fetchById: function(id) {
            return $http.get('api/levels/'+id)
                .then(function(res) {
                    return res.data;
                });
        }
    }
})