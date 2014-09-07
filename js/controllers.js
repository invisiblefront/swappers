'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('UserListController', ['$scope', '$http',
    function($scope, $http) {

      $http.get('http://invisiblefront.net/dev/swappers/api/users').success(function(data) {
        $scope.users = data.users;
      });
    }
  ])
  .controller('UserDetailsController', ['$scope', '$http', '$routeParams',
    function($scope, $http, $routeParams) {

      $scope.username = $routeParams.id;
      $http.get('http://invisiblefront.net/dev/swappers/api/collection/' + $routeParams.id).success(function(data) {
        $scope.items = data.collection;
      });
    }
  ])
  .controller('LoginController', ['$scope', '$location', 'HttpConnectorService',
    function($scope, $location, HttpConnectorService){

      $scope.submit = function() {
        HttpConnectorService.connectTo('http://invisiblefront.net/dev/swappers/api/login/', $scope.credentials, function(data) {
          if (data == 1) {

            localStorage.setItem("username", $scope.credentials.name);
            localStorage.setItem("isLogged", true);

            $location.path('/transactions');
            console.log("logged in as: " + localStorage.getItem("username"));
          } else {
            console.log("cannot login");
            localStorage.setItem("isLogged", false);
          }
        });
      };
    }
  ])
  .controller('RegisterController', ['$scope', '$http', 'HttpConnectorService',
    function($scope, $http, HttpConnectorService) {

      $scope.submit = function() {
        HttpConnectorService.connectTo('http://invisiblefront.net/dev/swappers/api/users/', $scope.register, function(data) {});
      };
    }
  ])
  .controller('NavigationController', ['$scope', '$http', '$location',
    function($scope, $http, $location) {

      /*$scope.showNavigation=false;*/

      $scope.logout = function() {
        localStorage.removeItem('username');
        localStorage.setItem("isLogged", false);
        $location.path('/login');
      }

      $scope.checkLogin = function($event, url){
        $event.preventDefault();
        
        if(localStorage.getItem("username")!=null)
        {
          $location.path("/"+url);
         /* $scope.showNavigation=false;*/
        }
        else
        {
          $location.path('/login');
          /*$scope.showNavigation=true;*/
        }
      }
    }
  ])
  .controller('AllItemsController', ['$scope', '$http',
    function($scope, $http) {

      $http.get('http://invisiblefront.net/dev/swappers/api/collection').success(function(data) {

        var new_array = [];

        for (var i = 0; i < data.collection.length; i++) {
          if (data.collection[i].owner != localStorage.getItem("username")) {
            new_array.push(data.collection[i]);
          }
        }
        $scope.items = new_array;
      });

        $scope.borrow=function($event,item)
        {
          console.log(item);

            $http({
            method: 'PUT',
            url: 'http://invisiblefront.net/dev/swappers/api/item',
            data:{
              owner:item.owner,
              name:item.name,
              requestedFrom:localStorage.getItem('username')
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
          }).success(function(data){
            console.log(data);
          })


        }
    }
  ])
  .controller('DashboardController', ['$scope', '$http',
    function($scope, $http) {

      $scope.message = "welcome to dashboard :" + localStorage.getItem("username");

    }
  ])
  .controller('LibraryController', ['$scope', '$http', 'HttpConnectorService',
    function($scope, $http, HttpConnectorService) {

      /*$scope.categories = [{name:"movies"},{name:"books"},{name:"games"},{name:"other"}];*/
      $scope.categories = ["movies", "books", "games", "other"];

      $scope.title = localStorage.getItem("username");
      $scope.newItemForm = false;
      $scope.instructions = "";

      $http.get('http://invisiblefront.net/dev/swappers/api/collection/' + localStorage.getItem("username")).success(function(data) {
        $scope.items = data.collection;
      });

      $scope.addItem = function() {
        $scope.newItemForm = true;
        $scope.instructions = "";
      }

      $scope.closeItem = function() {
        $scope.newItemForm = false;
        $scope.instructions = "";
      }


      $scope.submit = function() {
        $scope.newItem.owner = localStorage.getItem("username");
        HttpConnectorService.connectTo('http://invisiblefront.net/dev/swappers/api/item/', $scope.newItem, function(data) {});
      }
    }
  ])
  .controller('TransactionsController', ['$scope', '$http', 'UserDataService',
    function($scope, $http, UserDataService) {

      $http.get('http://invisiblefront.net/dev/swappers/api/transaction/from/' + localStorage.getItem("username")).success(function(data) {
        // show items others want from me

        function kompress(src) {
          var kompressed = {};
          for (var num in src) {
            for (var key in src[num]) {

              if (typeof kompressed[key] == "undefined") {
                kompressed[key] = [src[num][key]];
              } else {
                kompressed[key].push(src[num][key]);
              }
            }
          }
          return kompressed;
        }

        $scope.items = kompress(data);
      });
    }
  ])
  .controller('TransactionLibraryController', ['$scope', '$http',
    function($scope, $http) {

      $scope.selectedItems = [];
      $scope.instruction = "Select some items, you would like to borrow";
      $scope.over=false;

      // populating right side of transaction when needed
      var name_of_person_that_request = ($scope.key);
      var my_name = localStorage.getItem("username");

      $http.get('http://invisiblefront.net/dev/swappers/api/collection').success(function(data) {
        localStorage.setItem("collection", data.collection);
        /* console.log(data.collection);*/

        var all_items = data.collection;
        var new_array = [];

        for (var i = 0; i < all_items.length; i++) {
          if (all_items[i].requestedFrom == my_name && all_items[i].owner == name_of_person_that_request) {
            new_array.push(all_items[i]);
          }
        }

        $scope.requestedArray = new_array;
        console.log($scope.requestedArray.length);
      });


      $scope.openLibrary = function(data) {

        var name = data;

        $http.get('http://invisiblefront.net/dev/swappers/api/collection/' + data).success(function(data){

          $scope.libraryOpen = true;
          $scope.library = data.collection;

          $scope.addItem = function($event, index) {
            $event.preventDefault();
            $scope.selectedItems.push($scope.library[index]);
            $scope.library.splice(index, 1);
            $scope.instruction = "Borrowing from " + name + ":";

            console.log($scope.selectedItems);
          };
          $scope.removeItem = function($event, index) {
            $event.preventDefault();
            $scope.library.push($scope.selectedItems[index]);
            $scope.selectedItems.splice(index, 1);

            console.log($scope.selectedItems);

            if ($scope.selectedItems.length == 0) {
              $scope.instruction = "Select some items, you would like to borrow";
            }
          };
        });
      };

      $scope.closeLibrary = function(data) {

        $scope.libraryOpen = false;
      };
    }
  ]).controller('transactionItemController', ['$scope', '$http',
    function($scope, $http) {

      $scope.showItemDetails=function($event)
      {
          $event.preventDefault();
      }

      $scope.removeFromBorrow=function($event,item)
      {
          $event.preventDefault();
      }

    }
  ]);