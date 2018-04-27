angular.module('intelComputeVisionApp').controller('outputController', ['$scope','socket', function ($scope,socket) {
	$scope.predictions = []
	$scope.prediction = {
		name: '',
		percentage:''
	}

	$scope.currentIndex = 0;

	socket.on('predictions', function(predictions) {
		$scope.predictions = predictions;
		$scope.currentIndex = 0;
		if ( predictions.length > 0) {
			$scope.prediction  = predictions[0];
		}
	})

	$scope.nextPrediction = function () {
		$scope.currentIndex++;
		if ( $scope.currentIndex >= $scope.predictions.length ) {
			 $scope.currentIndex = 0;
		}
    	$scope.prediction  = $scope.predictions[$scope.currentIndex];
  	};

  	$scope.prevPrediction = function (){
    	$scope.currentIndex--;
		if ( $scope.currentIndex < 0) {
			 $scope.currentIndex = $scope.predictions.length -1;
		}
    	$scope.prediction  = $scope.predictions[$scope.currentIndex];
  	};

}]);