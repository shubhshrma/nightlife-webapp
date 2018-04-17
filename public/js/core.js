var nightlife = angular.module('nightlife', ['ngRoute']);
nightlife.config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider, $scope) {
      $locationProvider.hashPrefix('!');

      $routeProvider.
        when('/', {
			templateUrl: './search.html'
	    }).
        otherwise('/');
    }
  ]);

nightlife.controller('searchController', function searchController($anchorScroll, $location, $scope, $http){
	// $scope.getBars = function(){
	// 	$http.get("https://cors-anywhere.herokuapp.com/api.yelp.com/v3/businesses/search?location="+$scope.place,{
	// 		headers:{'Authorization':'Bearer L_hC1l86flwecMOek3SMlhuD4LMbz1oTth5IbJuP42QiOoMhh8k6h474UYmZJzykkN93zUFQJT3hyMCe6d2mxLBBuVLVhD4kvYJajei32WtWTEWcPsDumAgDNj9fWnYx'}
	// 	}).then(function(res){
	// 	$scope.bars=res.data.businesses;
	// 	$scope.strengths=[];
	// 	$scope.bars.forEach(function(obj){
	// 		$http.get('/bars/'+obj.id+'/strength').then(function(res){
	// 			JSON.parse(JSON.stringify(res));
	// 			$scope.strengths[obj.id]=res.data.strength;
				
	// 		}, function(err){
	// 			console.error(err);
	// 		});
			
	// 	});
	// }, function(err){
	// 	console.error(err);
	// });

	//

	$scope.gotoTop = function(){
		$location.hash('navbar');
		$anchorScroll();
	}
	$scope.getBars = function(){
		localStorage.setItem('place', $scope.place);
		$http.get("https://cors-anywhere.herokuapp.com/developers.zomato.com/api/v2.1/locations",{
			headers: {'user-key': '5de056390dcaf1aba69c9604cc55f0bf'},
			params: {'query': $scope.place}
		})
		.then(function(res){
			return res;
		}, function(err){
			console.error(err);
		})
		.then(function(res){
			var data=res.data.location_suggestions[0];
			return $http.get("https://cors-anywhere.herokuapp.com/developers.zomato.com/api/v2.1/search?", {
				headers: {'user-key': '5de056390dcaf1aba69c9604cc55f0bf'},
				params: {'entity_type': data.entity_type, 'entity_id': data.entity_id}
			})
			
		})
		.then(function(res){
			console.log(res);
			$scope.bars=res.data.restaurants;
			$scope.strengths=[];
			$scope.bars.forEach( function(obj){
				$http.get('/bars/'+obj.restaurant.id+'/strength')
				.then(function(result){
					JSON.parse(JSON.stringify(result));
					$scope.strengths[obj.restaurant.id]=result.data.strength;
				})
			})
		})
		.catch(function(err){
			console.error(err);
		})
			
	}
	var place = localStorage.getItem('place');
	if(typeof place == "string" && place!="null")
	{
		$scope.place=localStorage.getItem('place');
		$scope.getBars();
	}
	$scope.username='';
	$scope.going={};
	$http.get('/userstate').then(function(res){
		$scope.username=res.data.user.username;
		//console.log($scope.username);
		if($scope.username){
			$http.get('/users/'+$scope.username+'/bars').then(function(res){
				console.log(res.data.places);
				res.data.places.map(e => $scope.going[e]=1);
			})
		}
	
	}, function(err){
		console.error(err);
	});
	console.log($scope.going);
	$scope.go=function(id){
		$http.get('bars/go/'+id).then(function(res){
			$scope.strengths[id]=res.data.strength;
			$scope.going[id]=1;
		}, function(err){
			console.error(err);
		});
	}
	$scope.remove=function(id){
		$http.get('bars/remove/'+id).then(function(res){
			console.log(res.data);
			$scope.strengths[id]=res.data.strength;
			$scope.going[id]=0;
		}, function(err){
			console.error(err);
		});
	}

}
);
