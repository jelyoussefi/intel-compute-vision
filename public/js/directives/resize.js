

'use strict';
intelComputeVisionApp.directive('resize', [
    function () {
    return {
      link: function ($scope, $element, $attributes) {
          var resize = function() {
            var width = $element[0].offsetWidth;
            var ratio = 1;
            var height;
            if ($scope.$eval($attributes.ratio)) {
              ratio = parseFloat($scope.$eval($attributes.ratio));
            }   
            height = (width * ratio)/100;
            $element.css('height', height + 'px');
        }

        $scope.$watch(
                function () {
                    return $element[0].offsetWidth;
                },
                function (newValue, oldValue) {
                    resize();
                }
        );  
    }
  }
  }]);