app.factory('LevelsFactory', function($http) {
    return {
        fetchAll: function(params) {
            return $http.get('api/levels', { params: params })
                .then(function(res) {
                    console.log(res);
                    return res.data;
                });
        },
        fetchById: function(levelId) {
            return $http.get('api/levels/'+levelId)
                .then(function(res) {
                    return res.data;
                });
        },
        levelLiker: function(levelId, func) {
            return $http.get('api/levels/like', {
                params: {
                    args: levelId,
                    func: func }
                })
                .then(function(res) {
                    console.log(res);
                    return res.data;
                });
        }
    }
})