'use strict';
/* Controllers */
angular.module('myApp.transactionControlers', [])
  .controller('TransactionsController', ['$scope', '$http', 'UserDataService','ConstantProvider',
    function($scope, $http, UserDataService,ConstantProvider) {
      $http.get(ConstantProvider.getApiPath()+'transaction/from/' + localStorage.getItem("username")).success(function(data) {

        $scope.transitionState = "active";

        // show items others want from me
        function kompress() {

          var kompressed = {};

          for (var num in data[0]) {
            for (var key in data[0][num]) {
              if (typeof kompressed[key] == "undefined") {

                kompressed[key] = [{
                  "name": data[0][num][key],
                  "status": "" + data[1][num].isapproved
                }];
              } else {
                kompressed[key].push({
                  "name": data[0][num][key],
                  "status": "" + data[1][num].isapproved
                });
              }
            }
          }
          return kompressed;
        }

        // items contains persons + items that request from you
        $scope.items = kompress();

        // get size of transaction object
        var transactionLenght = 0,key;

        for (key in $scope.items) {
  // --------------------------- show gray area on the right if items are accepted --------------------------- //
          if ($scope.items.hasOwnProperty(key))
          transactionLenght++;
        }



        if (transactionLenght == 0){
          $scope.notification = "You dont have any running transactions at the moment";
          $scope.hint = "why dont you take a look in";
          $scope.showTip = true;
        }
        else
        {
          $scope.wizardCount ="1";
          $scope.wizardMessage = "Click >> button left below in transaction field to select some items you like to have";
          $scope.hasWizard =true;
        }




    // --------------------------- all Wizard notifications are emitted by children and inserted in scope.wizard ---------------------------//


      $scope.$on('child', function (event, data){
        $scope.wizardCount = data.count;
        $scope.wizardMessage = data.message;

          // highlight buttons when going tru wizard

          if($scope.wizardCount =="3") // highlight middle transaction button
          {
            $scope.transaction_wizard ="transaction-button-wizard";
          }

          // if we have to set middle button to waiting state

          if($scope.data="waiting")
          {
              $scope.$broadcast('parent', 'waiting');
          }


      });


      });
    }
  ])
  .controller('TransactionLibraryController', ['$scope', '$http', 'HttpConnectorService','ConstantProvider',
    function($scope, $http, HttpConnectorService,ConstantProvider) {

      // hide mid buttons in case user is waiting for another for approval

      //  -------------------------- show all incoming requests -------------------------- //

      $scope.selectedItems = [];
      $scope.instruction = "Select some items, you would like to borrow";
      $scope.over = false;

      // -------------------------- populating left side of transaction when needed --------------------------//
      var name_of_person_that_request = ($scope.key);
      var my_name = localStorage.getItem("username");

      $http.get(ConstantProvider.getApiPath()+'collection').success(function(data) {

        localStorage.setItem("collection", data.collection);
        var all_items = data.collection;
        processCollectionData(all_items);
        $scope.buttonsHeight = $scope.height;
      });

      function processCollectionData(all_items) {
        var new_array = [];

        for (var i = 0; i < all_items.length; i++) {
          if (all_items[i].requestedFrom == my_name && all_items[i].owner == name_of_person_that_request) {
            new_array.push(all_items[i]);
          }
        }


        $scope.requestedArray = new_array;


      // ------------------------------- if other approved transaction, make field on the left gray --------------------------//

        if($scope.requestedArray.length>0)
        {
           if ($scope.requestedArray[0].approval==1){
              $scope.isApprovedFromOtherSide = "transaction-accepted";
              localStorage.setItem("transaction",[0,1]);

              $scope.$emit('child', {count:"4", message:$scope.key +' approved transaction, now it is your turn, click on middle button to finialize'});
              $scope.button_show=true;
            }
        }
      }

      //  ----------------------------------- open library in transactions ----------------------------------- //

      $scope.openLibrary = function(data) {

        var tmp_name=data;

      // emit notification to root controller, so it sets scope.wizard to data

        $scope.$emit('child', {count:"2", message:'select some items from '+tmp_name});

        var name = data;
        $http.get(ConstantProvider.getApiPath()+'collection/' + data).success(function(data) {
          $scope.libraryOpen = true;

          var filtered_array = [];

          for (var i = 0; i < data.collection.length; i++) {
            if (data.collection[i].status != 0) {
              filtered_array.push(data.collection[i]);
            }
          }

          $scope.library = filtered_array;

          //  ----------- add item from library to transaction list ----------- /

          $scope.addItem = function($event, index) {


            $scope.$emit('child', {count:"3", message:'click red button in middle of transaction element to confirm your choice and send request to '+tmp_name});

            $event.preventDefault();
            // if no items are yet in the box
            if ($scope.requestedArray.length == 0) {
              $scope.selectedItems.push($scope.library[index]);
            }
            // if there are some items in the box
            if ($scope.requestedArray.length != 0) {
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
              $scope.wizardMessage = "Click >> button left below in transaction field to select some items you like to have";
            }
          };
        });
      };

      //  ----------------------------------- close library in transactions ----------------------------------- //

      $scope.closeLibrary = function(data) {
        $scope.libraryOpen = false;
      };

      //  ----------------------------------------- initiate swap --------------------------------------------- //

      $scope.initSwap = function(data) {

        var _my_requests = {};
        var _my_requested_names = [];

        if ($scope.requestedArray.length == 0) {
          _my_requests = $scope.selectedItems;
        } else {
          _my_requests = $scope.requestedArray;
        }



        for (var i = 0; i < _my_requests.length; i++) {
          _my_requested_names.push(_my_requests[i].name)
        }

        var transaction_data = {
          "requestor": localStorage.getItem("username"),
          "from": $scope.key,
          "names": _my_requested_names
        };

        HttpConnectorService.initTransaction(transaction_data, function(data) {
          if (data = "ok") {
            $scope.button_show=true
          }





        });
      };

      //  ----------------------------------------- approve swap, change row Approved from to 1 --------------------------------------------- //

      $scope.upproveSwap = function() {

        // change visual aspect of transaction row
        // only visually approve mine side of transaction
        $scope.isApprovedFromMineSide = "transaction-accepted";


        var data = {
          user: localStorage.getItem("username"),
          requestedItems: JSON.stringify($scope.value)
        }

        $http({
          method: 'PUT',
          url: ConstantProvider.getApiPath()+'/transaction/approval/',
          data: data,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
        }).success(function() {
            $scope.$emit('child', {count:"4", message:'now just wait for reply'});
        })
      }
    }
  ]).controller('transactionItemController', ['$scope', 'HttpConnectorService',
    function($scope, HttpConnectorService) {

      $scope.visible = true;

      $scope.showItemMenu = function($event) {
        $event.preventDefault();
        $scope.visible = false;
      }
      $scope.removeFromBorrow = function($event, $index, item, requestor) {
        $event.preventDefault();
        var _data = {
          "itemRequestor": requestor,
          "itemName": item
        }

        HttpConnectorService.removeItem(_data, function() {
          $scope.value.splice($index, 1);
        });
      }
      $scope.close = function($event) {
        $event.preventDefault();
        $scope.visible = true;
      }

          if ($scope.value[0].status==1){
            $scope.isApprovedFromMineSide = "transaction-accepted";

            $scope.$emit('child', {count:"4", message:'wait untill '+$scope.key+ ' will approve his part'});
            $scope.$emit('child', 'waiting');
      }
    }
  ]).controller('borrowController', ['$scope', 'HttpConnectorService',
    function($scope, HttpConnectorService) {

      $scope.whatClassIsIt = function(itm) {
        var _cls;
        if (itm.status == 1) {
          // show normal
          _cls = "list-group-item";
        } else {
          // show grey
          _cls = "list-group-item-borrowed";
        }
        return _cls;
      }


      $scope.checkSwapReady = function(itm) {
        if (itm.status == 1) {
          // show normal
          $scope.isswappable = true;
        } else {
          // show grey
          $scope.isswappable = false;
        }

        return $scope.isswappable;
      }
    }
  ]);