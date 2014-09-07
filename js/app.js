'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp',[
  'ngRoute',
  'myApp.controllers',
  'myApp.transactionControlers',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/list', {templateUrl: 'partials/list.html', controller: 'UserListController'});
  $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginController'});
  $routeProvider.when('/register', {templateUrl: 'partials/register.html', controller: 'RegisterController'});
  $routeProvider.when('/userlist', {templateUrl: 'partials/userlist.html', controller: 'UserListController'});
  $routeProvider.when('/details/:id', {templateUrl: 'partials/userdetails.html', controller: 'UserDetailsController'});
  $routeProvider.when('/items', {templateUrl: 'partials/allitems.html', controller: 'AllItemsController'});
  $routeProvider.when('/library', {templateUrl: 'partials/library.html', controller: 'LibraryController'});
  $routeProvider.when('/transactions', {templateUrl: 'partials/transactions.html', controller: 'TransactionsController'});
  $routeProvider.otherwise({ redirectTo:'/login'});
  /*$locationProvider.html5Mode(false);*/
}]);
