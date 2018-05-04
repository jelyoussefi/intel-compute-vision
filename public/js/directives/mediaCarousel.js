'use strict';
intelComputeVisionApp.directive('mediaCarousel', function(settings, socket){

    function link(scope,element) {
        
        scope.settings = settings;
        scope.slides = [];
        scope.currentIndex = 0;

        scope.$watch('settings.source', function(newVal, oldVal) {
          scope.slides = [];
        }, true)

        scope.$watch('settings.action', function(newVal, oldVal) {
          scope.slides.forEach(function(slide) {
            slide.outputFile = null;
            slide.outputfilePath = null;
            slide.hasOutputFile = false;
          })
        }, true)

        socket.on('setInputFiles', function(files) {
          scope.slides = JSON.parse(files);
          scope.slides.forEach(function(slide) {
            slide.src = slide.path;
            slide.outputfile = null;
            slide.outputfilePath = null;
            slide.hasOutputFile = false;
          })
        })
        
        socket.on('outputFile', function(outputFile) {
          if ( outputFile && scope.currentIndex >= 0 && scope.currentIndex < scope.slides.length ) {
            if ( outputFile != scope.slides[scope.currentIndex].outputFilePath ) {
              setTimeout(function() {
                console.log("=========1====Out "+outputFile)
                scope.slides[scope.currentIndex].outputFile =  outputFile+'?_ts='+new Date().getTime();
                scope.slides[scope.currentIndex].outputFilePath = outputFile;
              }, 2000)
            }
          }
         
        })

        scope.onCarouselInit =  function() {
          scope.currentIndex = 0;
        }

        scope.onBeforeChange = function(currentSlide) {
        }

        scope.onAfterChange = function(currentSlide) {
          console.log("onAfterChange "+scope.slides[scope.currentIndex].outputFile)
          if ( scope.slides[currentSlide] ) {
            scope.settings.file = scope.slides[currentSlide].dir + "/" + scope.slides[currentSlide].path;
            scope.currentIndex = currentSlide;
            for(var i=0; i<scope.slides.length; i++ ){
              if ( i != currentSlide ) {
                scope.slides[i].hasOutputFile = false;
                scope.slides[i].outputFile = null;
              }
              else {
                if ( scope.slides[scope.currentIndex].outputFile ) {
                  console.log("Index "+currentSlide)
                  scope.slides[i].hasOutputFile = true;
                }
              }
            }
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
