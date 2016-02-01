app.factory('UsersFactory', function($http) {
    return {
        fetchAll: function() {
            return $http.get('api/users')
                .then(function(res) {
                    return res.data;
                })
        },
        fetchAllWithLevels: function() {
            return $http.get('api/users/levels')
                .then(function(res) {
                    return res.data;
                });
        },
        fetchById: function(id) {
            return $http.get('api/users/'+id)
                .then(function(res) {
                    return res.data;
                })
        }
    }
})