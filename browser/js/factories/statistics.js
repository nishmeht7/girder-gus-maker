app.factory( 'StatisticsFactory', function( $http ) {

  const factory = {};

  factory.post = ( data ) => {
    return $http.post( '/api/statistics', data )
      .then( ( res ) => res.data )
      .then( null, console.error.bind( console ) )
    };

  return factory;

} );
