'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('UserListController', ['$scope', '$http',
    function($scope, $http) {

      $http.get('http://invisiblefront.net/dev/swappers/api/users').success(function(data) {
        $scope.users = data.users;
        $scope.transitionState="active";

        console.log($scope.users);

      });
    }
  ])
  .controller('UserDetailsController', ['$scope', '$http', '$routeParams',
    function($scope, $http, $routeParams) {

      $scope.username = $routeParams.id;
      $http.get('http://invisiblefront.net/dev/swappers/api/collection/' + $routeParams.id).success(function(data) {
        $scope.items = data.collection;

        $scope.transitionState="active";
      });
    }
  ])
  .controller('LoginController', ['$scope', '$location', 'HttpConnectorService',
    function($scope, $location, HttpConnectorService) {

      $scope.transitionState="active";

      if (localStorage.getItem("isLogged")) {
        $location.path('/transactions');
      } else {
        $scope.submit = function() {


          console.log($scope.credentials);

          HttpConnectorService.connectTo('http://invisiblefront.net/dev/swappers/api/login/', $scope.credentials, function(data) {
            if (data == 1) {

              localStorage.setItem("username", $scope.credentials.name);
              localStorage.setItem("isLogged", true);
              localStorage.setItem("avatar");

              $location.path('/transactions');
              console.log("logged in as: " + localStorage.getItem("username"));
            } else {
              console.log("cannot login");
              localStorage.setItem("isLogged", false);
            }
          });
        };
      }
    }
  ])
  .controller('RegisterController', ['$scope', '$location', 'HttpConnectorService','$upload',
    function($scope, $location, HttpConnectorService,$upload) {

      $scope.transitionState="active";
      $scope.avatar="";

      $scope.submit = function(){

        $scope.register.avatar=$scope.avatar;

        HttpConnectorService.connectTo('http://invisiblefront.net/dev/swappers/api/users/', $scope.register, function(data) {
          localStorage.setItem("username", $scope.register.username);
          localStorage.setItem("isLogged", true);
          $location.path('/transactions');
        });
      };

      $scope.onFileSelect = function($files){
          $scope.message = "";
          for (var i = 0; i < $files.length; i++) {
              var file = $files[i];
              console.log(file.name);

              /*$scope.register.avatar=file.name;*/
              $scope.avatar = file.name;

              $scope.upload = $upload.upload({
                  url: 'http://invisiblefront.net/dev/swappers/api/imageupload.php',
                  method: 'POST',
                  file: file
              }).success(function(data, status, headers, config) {
                  $scope.message = data;
              }).error(function(data, status) {
                  $scope.message = data;
              });
          }
      };
    }
  ])
  .controller('NavigationController', ['$scope', '$http', '$location',
    function($scope, $http, $location) {

      $scope.logout = function() {
        localStorage.removeItem('username');
        localStorage.removeItem("isLogged");
        $location.path('/login');
      }

      $scope.user=localStorage.getItem("username");

      $scope.checkLogin = function($event, url){
        $event.preventDefault();
        if (localStorage.getItem("username") != null) {
          $location.path("/" + url);


        }else{
          $location.path('/login');
        }
      }
    }
  ])
  .controller('AllItemsController', ['$scope', '$http', 'HttpConnectorService',
    function($scope, $http, HttpConnectorService) {

      $http.get('http://invisiblefront.net/dev/swappers/api/collection').success(function(data) {

      $scope.transitionState="active";

        var new_array = [];
        for (var i = 0; i < data.collection.length; i++) {
          if (data.collection[i].owner != localStorage.getItem("username")) {
            new_array.push(data.collection[i]);
          }
        }
        $scope.items = new_array;
      });
    }
  ])
  .controller('LibraryController', ['$scope', '$http', 'HttpConnectorService',
    function($scope, $http, HttpConnectorService) {

      $scope.transitionState="active";

      $scope.manipulation = "remove item";
      $scope.categories = ["movies", "books", "games", "other"];

      $scope.title = localStorage.getItem("username");
      $scope.newItemForm = false;
      $scope.instructions = "";

      $http.get('http://invisiblefront.net/dev/swappers/api/collection/' + localStorage.getItem("username")).success(function(data) {
        $scope.libraryItems = data.collection;
      });

      $scope.addItem = function() {
        $scope.newItemForm = true;
        $scope.instructions = "";
      }

      $scope.closeItem = function() {
        $scope.newItemForm = false;
        $scope.instructions = "";
      }

      $scope.removeItem = function() {
        if ($scope.cls == "remove-library-state") {
          $scope.cls = "normal-library-state";
          $scope.manipulation = "remove item";
        } else {
          $scope.cls = "remove-library-state";
          $scope.manipulation = "exit remove mode";
        }
      }

      $scope.manipulateItem = function($event, index, item) {
        $event.preventDefault();

        if ($scope.manipulation == "exit remove mode") {
          $scope.libraryItems.splice(index, 1);

          HttpConnectorService.deleteItemFromDB({
            "itemOwner": item.owner,
            "itemName": item.name
          }, function(res) {
            console.log(res);
          });
        }
      }

      $scope.submit = function() {
        $scope.newItem.owner = localStorage.getItem("username");
        $scope.newItem.status = 1;
        $scope.libraryItems.push($scope.newItem);
        HttpConnectorService.connectTo('http://invisiblefront.net/dev/swappers/api/item/', $scope.newItem, function(data) {});
      }
    }
  ]);