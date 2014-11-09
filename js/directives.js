'use strict';

/* Directives */


angular.module('myApp.directives', []).
directive('appVersion', ['version',
  function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }
]).directive('item', ['HttpConnectorService', function(HttpConnectorService) {
  return {
    restrict: "E",
    templateUrl: "partials/includes/item.html",
    scope:{
      name:"@name",
      owner:"@owner",
      category:"@category",
      swappable:"@swappable",
      timepick:"@timepick",
      period:"@period"
    },
    replace:true,
    link:function($scope)
    {
      $scope.swap=false;

      if($scope.period >0)
      {
        $scope.showPeriod=true;
      }

      if($scope.swappable=="true")
      {
        $scope.itemOver=function()
        {
          $scope.swap=true;
        }

        $scope.itemOut=function()
        {
          $scope.swap=false;
        }
      }

      $scope.selectItem=function($event)
      {
        $event.preventDefault();

        if(!$scope.timepick && $scope.swap==true)
        {
          $scope.timepick="true";
        }

        console.log( $scope.timepick);
      }

      $scope.confirmSwap=function()
      {
            var data={
              "itemName":$scope.name,
              "itemRequestor":localStorage.getItem("username"),
              "itemOwner":$scope.owner,
              "period":$scope.time
            };

            HttpConnectorService.borrowItem(data,function(res)
            {
                $scope.timepick="false";
            });

/*      $scope.whatClassIsit=function()
      {
          return "list-group-item-borrowed";
      }*/

  
      }

      $scope.discardSwap=function()
      {
        $scope.timepick="false";
      }

    }
  };
}]).directive('transactionItem', [
  function() {
    return {

    };
  }
]).directive('ngFileSelect', ['$parse', '$timeout',
  function($parse, $timeout) {
    return function(scope, elem, attr) {
      var fn = $parse(attr['ngFileSelect']);
      if (elem[0].tagName.toLowerCase() !== 'input' || (elem.attr('type') && elem.attr('type').toLowerCase()) !== 'file') {
        var fileElem = angular.element('<input type="file">')
        for (var i = 0; i < elem[0].attributes.length; i++) {
          fileElem.attr(elem[0].attributes[i].name, elem[0].attributes[i].value);
        }
        if (elem.attr("data-multiple")) fileElem.attr("multiple", "true");
        fileElem.css("top", 0).css("bottom", 0).css("left", 0).css("right", 0).css("width", "100%").
        css("opacity", 0).css("position", "absolute").css('filter', 'alpha(opacity=0)');
        elem.append(fileElem);
        if (elem.css("position") === '' || elem.css("position") === 'static') {
          elem.css("position", "relative");
        }
        elem = fileElem;
      }
      elem.bind('change', function(evt) {
        var files = [],
          fileList, i;
        fileList = evt.__files_ || evt.target.files;
        if (fileList != null) {
          for (i = 0; i < fileList.length; i++) {
            files.push(fileList.item(i));
          }
        }
        $timeout(function() {
          fn(scope, {
            $files: files,
            $event: evt
          });
        });
      });
    };
  }
]).directive('attributeData', function() {
    return {
        restrict: 'A',
        link: function(scope, element) {
          scope.height=element.prop('offsetHeight') + 105;
        }
    };
});
