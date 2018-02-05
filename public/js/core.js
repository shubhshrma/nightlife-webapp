var nightlife = angular.module('nightlife', ['ngRoute']);
nightlife.config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider, $scope) {
      $locationProvider.hashPrefix('!');

      $routeProvider.
        when('/', {
			templateUrl: './search.html'
	    }).
        when('/myplaces', {
			templateUrl: './myplaces.html'
	    }).
        otherwise('/');
    }
  ]);
nightlife.controller('navController', function() {


});
nightlife.controller('searchController', function searchController($scope, $http){
	$scope.place='';
	$scope.getBars = function(){
		$http.get("https://cors-anywhere.herokuapp.com/api.yelp.com/v3/businesses/search?location="+$scope.place,{
			headers:{'Authorization':'Bearer L_hC1l86flwecMOek3SMlhuD4LMbz1oTth5IbJuP42QiOoMhh8k6h474UYmZJzykkN93zUFQJT3hyMCe6d2mxLBBuVLVhD4kvYJajei32WtWTEWcPsDumAgDNj9fWnYx'}
		}).then(function(res){
		$scope.bars=res.data.businesses;
		$scope.strengths=[];
		$scope.bars.forEach(function(obj){
			$http.get('/bars/'+obj.id+'/strength').then(function(res){
				JSON.parse(JSON.stringify(res));
				$scope.strengths[obj.id]=res.data.strength;
				
			}, function(err){
				console.err(err);
			});
			
		});
	}, function(err){
		console.err(err);
	});

	}
	$http.get('/userstate').then(function(res){
		$scope.user=res.data.user;
	}, function(err){
		console.err(err);
	});
	$scope.go=function(id){
		$http.get('bars/go/'+id).then(function(res){
			$scope.strengths[id]=res.data.strength;
		}, function(err){
			console.err(err);
		});
	}

});
nightlife.controller('myPlacesController', function myPlacesController($scope, $http){
	$scope.place='';
	$http.get('/userstate').then(function(res){
		$scope.user=res.data.user;
	}, function(err){
		console.err(err);
	});
	$scope.getBars = function(){
		$http.get("/users/"+user+"/bars").then(function(res){
		$scope.bars=res.data.businesses;
			
		
	}, function(err){
		console.err(err);
	});
	};
	
	$scope.remove=function(id){
		$http.get('bars/remove/'+id).then(function(res){
			$scope.strengths[id]=res.data.strength;
		}, function(err){
			console.err(err);
		});
	}

});
