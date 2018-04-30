angular.module('intelComputeVisionApp').controller('benchmarkController',  ['$scope', 'settings', 'socket', function($scope, settings, socket) {
  
  	$scope.settings = settings;
	$scope.enabledCNNs = [];
	$scope.currentIndex=-1;
	$scope.labels = [];
	$scope.data = [];
	$scope.options = {
		scales: {
		    yAxes: [{
		      scaleLabel: {
		        display: true,
		        labelString: 'Execution time'
		      }
		    }]
	  	}
	}


	$scope.$watchCollection('currentIndex', function(index) {
		if ( index>= 0 && index < $scope.enabledCNNs.length ) {
			var payload = $scope.settings;
			payload.cnn = $scope.enabledCNNs[$scope.currentIndex].name;
			socket.emit('command', JSON.stringify(payload));
		}
		else {
			$scope.settings.benchmarkInProgress = false;
		}
	});

	$scope.$watchCollection('settings.benchmark', function(benchmark) {
		$scope.labels = [];
		$scope.data = [];
		$scope.settings.benchmarkInProgress = false;
		$scope.currentIndex=-1;

		if ( benchmark == 'CNNs') {
			$scope.enabledCNNs = $scope.settings.enabledCNNs();
			if ( $scope.enabledCNNs.length > 0 ) {
				$scope.settings.benchmarkInProgress = true;
				$scope.currentIndex=0;
			}
		}

	});


	socket.on('predictions', function(predictions,execTime) {
		if ( predictions.length > 0 && $scope.settings.benchmarkInProgress ) {
			$scope.labels.push($scope.settings.cnn);
			$scope.data.push(parseFloat(execTime.split("ms")[0]));
			$scope.currentIndex++;
		}

	})
 
}]);
