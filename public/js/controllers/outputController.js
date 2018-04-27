angular.module('intelComputeVisionApp').controller('outputController', ['$scope','socket', function ($scope,socket) {
	
	$scope.prediction = {
		name: '',
		percentage:''
	}

	socket.on('predictions', function(predictions) {
		if ( predictions.length > 0) {
			$scope.prediction  = predictions[0];
		}
	})
}]);