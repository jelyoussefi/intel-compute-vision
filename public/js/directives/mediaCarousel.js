'use strict';
intelComputeVisionApp.directive('mediaCarousel', function(settings, socket){

    function link(scope,element) {
        
        scope.settings = settings;
        scope.slides = [];

        scope.$watch('settings.source', function(newVal, oldVal) {
          scope.slides = [];
        }, true)

        socket.on('setInputFiles', function(files) {
          scope.slides = JSON.parse(files);
        })
        
        scope.onCarouselInit =  function() { }

        scope.onAfterChange = function(currentSlide) {
          if ( scope.slides[currentSlide] ) {
            scope.settings.file = scope.slides[currentSlide].dir + "/" + scope.slides[currentSlide].path;
          }
        }

        scope.slider = {
                  value: 1,
                  options: {
                    floor: 0,
                    ceil: 10,
                    vertical: false
                  },
                }        
    }

    return {
        restrict: 'AE',
        link: link, 
        replace: true,
        templateUrl:  'partials/directives/mediaCarousel.html'
    };
});
