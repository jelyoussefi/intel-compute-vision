angular.module('intelComputeVisionApp').controller('settingsController', ['$scope', 'settings', 'socket', function($scope, settings, socket) {
  	$scope.settings = settings;

	$scope.inputTypes = [
		{
			name: 'Image',
			enabled: true
		},
		{
			name: 'Video',
			enabled: true
		},
		{
			name: 'Audio',
			enabled: true
		}
	];

	$scope.sources = [];
	$scope.cnns = [];
	$scope.chips = [];
	$scope.actions = [];

	socket.on('settings', function(payload) {
		payload = JSON.parse(payload);
		$scope.sources = payload.sources;
		$scope.cnns = payload.cnns;
		$scope.chips = payload.chips;
		$scope.actions = payload.actions;
		$scope.settings.chip = $scope.chips[0].name;
		$scope.settings.cnn = $scope.cnns[0].name;
		$scope.settings.action = $scope.actions[0].name;
		$scope.settings.source = $scope.sources[0].name;
	})


	if ( $scope.settings.init == false ) {
		$scope.settings.inputType = $scope.inputTypes[0].name;
		$scope.settings.autoScrollEnabled = false;
		$scope.settings.autoplaySpeed = 5000;
		$scope.settings.init = true;
	}
 
}]);
