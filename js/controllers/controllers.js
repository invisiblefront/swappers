'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('UserListController', ['$scope', '$http', 'ConstantProvider',
    function($scope, $http, ConstantProvider) {



      $http.get(ConstantProvider.getApiPath()+'users').success(function(data){
        $scope.users = data.users;
        $scope.transitionState="active";

        console.log($scope.users);

      });
    }
  ])
  .controller('UserDetailsController', ['$scope', '$http', '$routeParams','ConstantProvider',
    function($scope, $http, $routeParams,ConstantProvider){

      $scope.username = $routeParams.id;
      $http.get(ConstantProvider.getApiPath()+'collection/' + $routeParams.id).success(function(data) {
        $scope.items = data.collection;
        $scope.transitionState="active";
      });
    }
  ])
  .controller('LoginController', ['$scope', '$location', 'HttpConnectorService','ConstantProvider',
    function($scope, $location, HttpConnectorService,ConstantProvider) {

      $scope.transitionState="active";

      if (localStorage.getItem("isLogged")) {
        $location.path(ConstantProvider.getApiPath()+'/transactions');
      } else {


        $scope.submit = function(){

          HttpConnectorService.connectTo(ConstantProvider.getApiPath()+'login/', $scope.credentials, function(data) {
              if (data == 1) {

              localStorage.setItem("username", $scope.credentials.name);
              localStorage.setItem("isLogged", true);
              /*localStorage.setItem("avatar");*/
              $location.path('/transactions');

            } else {
              console.log("cannot login");
              localStorage.setItem("isLogged", false);
            }
          });
        };
      }
    }
  ])
  .controller('RegisterController', ['$scope', '$location', 'HttpConnectorService','$upload','ConstantProvider',
    function($scope, $location, HttpConnectorService,$upload,ConstantProvider) {

      $scope.transitionState="active";
      $scope.avatar="";

      $scope.submit = function(){

        $scope.register.avatar=$scope.avatar;

        HttpConnectorService.connectTo(ConstantProvider.getApiPath()+'users/', $scope.register, function(data) {
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
                  url: ConstantProvider.getApiPath()+'imageupload.php',
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
  .controller('AllItemsController', ['$scope', '$http', 'HttpConnectorService','ConstantProvider',
    function($scope, $http, HttpConnectorService, ConstantProvider) {

      $http.get(ConstantProvider.getApiPath()+'collection').success(function(data) {

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
  .controller('LibraryController', ['$scope', '$http', 'HttpConnectorService','ConstantProvider',
    function($scope, $http, HttpConnectorService, ConstantProvider) {

      $scope.transitionState="active";

      $scope.manipulation = "remove item";
      $scope.categories = ["movies", "books", "games", "other"];

      $scope.title = localStorage.getItem("username");
      $scope.newItemForm = false;
      $scope.instructions = "";

      $http.get(ConstantProvider.getApiPath()+'collection/' + localStorage.getItem("username")).success(function(data) {
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

         console.log($scope.cls);
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

      $scope.whatClassIsIt=function(itm)
      {
        var _cls;
        if(itm.status==1)
        {
          // show normal
          _cls="list-group-item "+$scope.cls;
        }
        else
        {
          // show grey
          _cls="list-group-item-borrowed "+$scope.cls;
        }
        return _cls;
      }


      $scope.submit = function() {
        $scope.newItem.owner = localStorage.getItem("username");
        $scope.newItem.status = 1;
        $scope.libraryItems.push($scope.newItem);
        HttpConnectorService.connectTo(ConstantProvider.getApiPath()+'item/', $scope.newItem, function(data) {});
      }
    }
  ]).controller('ChatController', ['$scope', '$http', 'HttpConnectorService','ConstantProvider',
    function($scope, $http, HttpConnectorService,ConstantProvider) {


      $http.get(ConstantProvider.getApiPath()+'chat/'+$scope.key).success(function(result){


        var reverseArray=result.messages.reverse();

        $scope.chatMessages=reverseArray;


/*                for(var i=0; i<result.messages.length; i++)
                {
                        if(result.messages[i].from_user==localStorage.getItem("username"))
                        {
                          // this message floats to the left
                          $scope.chatSort="mine-messages";
                        }
                        else
                        {
                          $scope.chatSort="opponent-messages";
                        }

                        console.log($scope.chatSort);
                }*/


               $scope.chatSort=function(from_user)
               {
                 console.log(from_user)

                 var cls="";

                 if(from_user == localStorage.getItem("username"))
                 {
                    cls="mine-messages";
                 }
                 else
                 {
                    cls="opponent-messages";
                 }

                 return cls;

               }

              $scope.confirm_chat=function()
              {
                $scope.chat_sent=$scope.chat;
                $scope.chat="sent..";

                $scope.chat_btn = "chatButtonDisabled";

                var chat_data={
                  msg:$scope.chat_sent,
                  to:$scope.key,
                  from:localStorage.getItem("username")
                }

                HttpConnectorService.connectTo(ConstantProvider.getApiPath()+'chat/',chat_data, function(data) {

                });
              }
      })
    }
  ])