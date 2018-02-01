var nightlife = angular.module('nightlife', []);

nightlife.controller('mainController', function mainController($scope, $http){
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
		console.log($scope.bars);
	}, function(err){
		console.err(err);
	});
}
});

