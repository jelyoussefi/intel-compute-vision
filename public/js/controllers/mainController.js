angular.module('intelComputeVisionApp').controller('mainController',  ['$scope', 'settings', 'socket', function($scope, settings, socket) {
  
  	$scope.settings = settings;

	$scope.$watch('settings', function(newVal, oldVal) {

		if ( newVal === oldVal ||
			 newVal.source != oldVal.source  || 
			 newVal.inputType  != oldVal.inputType  ) {

			var payload = {
				'source' : newVal.source,
				'inputType' : newVal.inputType
			}

			socket.emit('getInputFiles', JSON.stringify(payload));
		}

		if ( newVal.chip != oldVal.chip  ||
			 newVal.cnn  != oldVal.cnn  ||
			 newVal.file != oldVal.file ||
			 newVal.action != oldVal.action  ) {
				
    	    	socket.emit('command', JSON.stringify(newVal));
    	}

	}, true);

 
}]);
