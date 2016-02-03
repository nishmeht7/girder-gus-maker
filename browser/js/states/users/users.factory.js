app.factory('UsersFactory', function($http) {
    return {
        fetchAll: function(params) {
            return $http.get('api/users', { params: params })
                .then(function(res) {
                    return res.data;
                })
        },
        fetchById: function(id) {
            return $http.get('api/users/'+id)
                .then(function(res) {
                    return res.data;
                })
        }
    }
})