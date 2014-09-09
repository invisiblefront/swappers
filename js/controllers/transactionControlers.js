'use strict';
/* Controllers */
angular.module('myApp.transactionControlers', [])
  .controller('TransactionsController', ['$scope', '$http', 'UserDataService',
    function($scope, $http, UserDataService){
      $http.get('http://invisiblefront.net/dev/swappers/api/transaction/from/' + localStorage.getItem("username")).success(function(data) {

        $scope.transitionState="active";

        // show items others want from me

        function kompress(src) {
          var kompressed = {};
          for (var num in src) {
            for (var key in src[num]) {
              if (typeof kompressed[key] == "undefined") {

/*                if(key !=localStorage.getItem("username"))
                {*/
                  kompressed[key] = [src[num][key]];
               /* }*/


              } else {
                kompressed[key].push(src[num][key]);
              }
            }
          }
          return kompressed;
        }

        $scope.items = kompress(data);

        // get size of transaction object

          var transactionLenght = 0, key;
          for (key in $scope.items){
              if ($scope.items.hasOwnProperty(key)) transactionLenght++;
          }



          if(transactionLenght==0)
          {
            $scope.notification="You dont have any running transactions at the moment";
            $scope.hint="why dont you take a look in";
            $scope.showTip=true;
          }
      });
    }
  ])
  .controller('TransactionLibraryController', ['$scope', '$http','HttpConnectorService',
    function($scope, $http,HttpConnectorService) {

      //  -------------------------- show all incoming requests -------------------------- //

      $scope.selectedItems = [];
      $scope.instruction = "Select some items, you would like to borrow";
      $scope.over = false;
      // populating right side of transaction when needed
      var name_of_person_that_request = ($scope.key);
      var my_name = localStorage.getItem("username");

        $http.get('http://invisiblefront.net/dev/swappers/api/collection').success(function(data){

          localStorage.setItem("collection", data.collection);
          var all_items = data.collection;
          processCollectionData(all_items);

          // check height of mid button

          console.log($scope.height);

          /*document.getElementById('').style.height = "200px"
*/


          $scope.buttonsHeight=$scope.height;


        });

      function processCollectionData(all_items)
      {
          var new_array = [];

          for (var i = 0; i < all_items.length; i++) {
            if (all_items[i].requestedFrom == my_name && all_items[i].owner == name_of_person_that_request) {
              new_array.push(all_items[i]);
            }
          }
          $scope.requestedArray = new_array;
      }

      //  ----------------------------------- open library in transactions ----------------------------------- //

      $scope.openLibrary = function(data) {
        var name = data;
        $http.get('http://invisiblefront.net/dev/swappers/api/collection/' + data).success(function(data){
          $scope.libraryOpen = true;

            var filtered_array=[];

            for (var i = 0; i < data.collection.length; i++){
                if (data.collection[i].status !=0) {
                filtered_array.push(data.collection[i]);
                }
            }

            $scope.library = filtered_array;

          //  ----------- add item from library to transaction list ----------- /

          $scope.addItem = function($event, index){
            $event.preventDefault();
            // if no items are yet in the box
            if ($scope.requestedArray.length == 0){
              $scope.selectedItems.push($scope.library[index]);
            }
            // if there are some items in the box
            if ($scope.requestedArray.length != 0){
              $scope.requestedArray.push($scope.library[index]);
            }
            // remove this item from library array
            $scope.library.splice(index, 1);
            $scope.instruction = "Borrowing from " + name + ":";
          };


          //  ----------- remove item from transaction and push to library ----------- //


          $scope.removeItem = function($event, index) {
            $event.preventDefault();
            // if no items are yet in the box
            if ($scope.requestedArray.length == 0) {
              $scope.library.push($scope.selectedItems[index]);
              $scope.selectedItems.splice(index, 1);
            }
            // if there are some items in the box
            if ($scope.requestedArray.length != 0) {
              $scope.library.push($scope.requestedArray[index]);
              $scope.requestedArray.splice(index, 1);
            }
            if ($scope.selectedItems.length == 0) {
              $scope.instruction = "Select some items, you would like to borrow";
            }
          };
        });
      };

      //  ----------------------------------- close library in transactions ----------------------------------- //

      $scope.closeLibrary = function(data) {
        $scope.libraryOpen = false;
      };

      //  ----------------------------------------- initiate swap --------------------------------------------- //

      $scope.iniateSwap = function(data) {

        console.log($scope.value);

        var _my_requests={};
        var _my_requested_names=[];

        if ($scope.requestedArray.length == 0) {
            _my_requests=$scope.selectedItems;
        }
        else
        {
            _my_requests=$scope.requestedArray;
        }


          for (var i = 0; i < _my_requests.length; i++){
              _my_requested_names.push(_my_requests[i].name)
          }

          var transaction_data={
              "requestor":localStorage.getItem("username"),
              "from":$scope.key,
              "names":_my_requested_names
          };

        HttpConnectorService.initTransaction(transaction_data,function(data)
        {
            if(data="ok")
            {
              $scope.cls="mid-transaction-waiting";
            }
        });
      };

    //  ----------------------------------------- approve swap --------------------------------------------- //


     $scope.upproveSwap = function(data){

      console.log("transaction approved");

      $scope.transactionStatusClass="transaction-accepted";
     }




    }
  ]).controller('transactionItemController', ['$scope','HttpConnectorService',
    function($scope,HttpConnectorService) {

      $scope.visible=true;

      $scope.showItemMenu = function($event) {
        $event.preventDefault();

        $scope.visible=false;

      }
      $scope.removeFromBorrow = function($event, $index, item, requestor) {
        $event.preventDefault();
        var _data={"itemRequestor":requestor, "itemName":item}

        HttpConnectorService.removeItem(_data,function()
        {
            $scope.value.splice($index, 1);
        });
      }
      $scope.close = function($event){
        $event.preventDefault();
        $scope.visible=true;
      }
    }
  ]).controller('borrowController', ['$scope','HttpConnectorService',
    function($scope,HttpConnectorService){

      $scope.whatClassIsIt=function(itm)
      {
        var _cls;
        if(itm.status==1)
        {
          // show normal
          _cls="list-group-item";
        }
        else
        {
          // show grey
          _cls="list-group-item-borrowed";
        }
        return _cls;
      }


      $scope.checkSwapReady=function(itm)
      {
          if(itm.status==1)
            {
              // show normal
              $scope.isswappable=true;
            }
            else
            {
              // show grey
               $scope.isswappable=false;
            }

        return $scope.isswappable;
      }




    }
  ]);