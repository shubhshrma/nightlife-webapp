/*$(document).ready(function() {
	$("#search").click(function(){
		var query = $("#search_text").val();
		var data = {"location": query};
		$.ajax({ 
			dataType: 'json',
		   type : "GET", 
		   url : "https://cors-anywhere.herokuapp.com/api.yelp.com/v3/businesses/search",
		   data : data,
		   beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer L_hC1l86flwecMOek3SMlhuD4LMbz1oTth5IbJuP42QiOoMhh8k6h474UYmZJzykkN93zUFQJT3hyMCe6d2mxLBBuVLVhD4kvYJajei32WtWTEWcPsDumAgDNj9fWnYx');},
		   success : function(result) { 
		       //set your variable to the result 
		       console.log(result);
		       $("body").append(JSON.stringify(result));

		   }, 
		   error : function(result) { 
		     //handle the error 


		   } 
		 }); 
	})
});*/