app.factory('LevelsFactory', function($http) {
    return {
        fetchAll: function(params) {
            console.log('fetching levels')
            return $http.get('api/levels', { params: params })
                .then(function(res) {
                    console.log(res);
                    return res.data;
                });
        },
        fetchById: function(id) {
            return $http.get('api/levels/'+id)
                .then(function(res) {
                    return res.data;
                });
        }
    }
})