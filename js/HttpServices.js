angular.module('myApp.services', [])
  .factory('ConnectToApiService', function($http) {
  return {
			connectTo:function(endpoint, postData, callback)
			{
				$http({
			        method: 'POST',
			        url: endpoint,
			        data: postData,
			        headers: {
			          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			        }
			    }).success(callback);
			}
   };
});