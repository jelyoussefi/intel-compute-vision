angular.module('intelComputeVisionApp').controller('benchmarkController',  ['$scope', 'settings', 'socket', function($scope, settings, socket) {
  
  	$scope.settings = settings;
	$scope.labels = [];
	$scope.data = [];
	$scope.currentIndex=0;
	$scope.remaining=0;
	$scope.enabledCNNs = [];

	$scope.nextCNN = function () {
		if ( $scope.remaining > 0 ) {
			if ( $scope.currentIndex >= $scope.enabledCNNs.length ) {
				$scope.currentIndex = 0;
			}
			$scope.settings.cnn = $scope.enabledCNNs[$scope.currentIndex].name;
		}
		else {
			$scope.settings.benchmarkInProgress = false;
		}

	}

	$scope.$watch('settings.benchmark', function(newVal, oldVal) {
		$scope.labels = [];
		$scope.data = [];
		$scope.currentIndex=-1;
		$scope.settings.benchmarkInProgress = false;
		if ( newVal == 'CNNs') {
			$scope.settings.benchmarkInProgress = true;
			$scope.enabledCNNs = $scope.settings.enabledCNNs();
			for(var i=0; i<$scope.enabledCNNs.length; i++) {
				if ($scope.enabledCNNs[i].name == $scope.settings.cnn ) {
					$scope.currentIndex = i;
					$scope.remaining = $scope.enabledCNNs.length;
					break;
				}
			}
			if ( $scope.currentIndex >= 0 ) {
				$scope.nextCNN();
			}
		}

	}, true);


	socket.on('predictions', function(predictions,execTime) {
		if ( execTime && $scope.settings.benchmarkInProgress > 0) {
			$scope.labels.push($scope.settings.cnn);
			$scope.data.push(parseFloat(execTime.split("ms")[0]));
			$scope.remaining--;
			$scope.currentIndex++;
			$scope.nextCNN();
		}

	})
 
}]);
