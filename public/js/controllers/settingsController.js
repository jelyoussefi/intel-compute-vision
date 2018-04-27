angular.module('intelComputeVisionApp').controller('settingsController', ['$scope', 'settings', 'socket', function($scope, settings, socket) {
  	$scope.settings = settings;

	$scope.sources = [
		'USB',
		'WebCam'
	];

	$scope.inputTypes = [
		'Image',
		'Video',
		'Audio'
	];

	$scope.cnns = [];

	$scope.chips = [];

	$scope.actions = [];

	socket.on('settings', function(payload) {
		payload = JSON.parse(payload);
		$scope.cnns = payload.cnns;
		$scope.chips = payload.chips;
		$scope.actions = payload.actions;
		$scope.settings.chip = $scope.chips[0];
		$scope.settings.cnn = $scope.cnns[0];
		$scope.settings.action = $scope.actions[0];
	})


	if ( $scope.settings.init == false ) {
		$scope.settings.source = $scope.sources[0];
		$scope.settings.inputType = $scope.inputTypes[0];
		$scope.settings.autoScrollEnabled = false;
		$scope.settings.autoplaySpeed = 2000;
		$scope.settings.init = true;
	}
 
}]);
