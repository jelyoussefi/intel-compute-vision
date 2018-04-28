angular.module('intelComputeVisionApp').controller('settingsController', ['$scope', 'settings', 'socket', function($scope, settings, socket) {
  	$scope.settings = settings;

	$scope.sources = [];
	$scope.cnns = [];
	$scope.chips = [];
	$scope.actions = [];
	$scope.inputTypes = [];

	$scope.settings.enabledChips = function () {
		var chips = [];
		$scope.chips.forEach(function(chip) {
			if ( chip.enabled ) {
				chips.push(chip)
			}
		})
		return chips;
	}

	$scope.settings.enabledCNNs = function () {
		var cnns = [];
		$scope.cnns.forEach(function(cnn) {
			if ( cnn.enabled ) {
				cnns.push(cnn)
			}
		})
		return cnns;
	}

	$scope.settings.enabledSources = function () {
		var sources = [];
		$scope.sources.forEach(function(source) {
			if ( source.enabled ) {
				sources.push(source)
			}
		})
		return sources;
	}

	$scope.settings.enabledInputTypes = function () {
		var inputTypes = [];
		$scope.inputTypes.forEach(function(inputType) {
			if ( inputType.enabled ) {
				inputTypes.push(inputType)
			}
		})
		return inputTypes;
	}

	$scope.settings.enabledActions = function () {
		var actions = [];
		$scope.actions.forEach(function(action) {
			if ( action.enabled ) {
				actions.push(action)
			}
		})
		return actions;
	}

	$scope.benchmarks = [
		{
			name: 'None',
			enabled: true
		},
		{
			name: 'Chips',
			enabled: false
		},
		{
			name: 'CNNs',
			enabled: true
		}
	];

	socket.on('settings', function(payload) {
		payload = JSON.parse(payload);
		$scope.sources = payload.sources;
		$scope.inputTypes = payload.inputTypes;
		$scope.cnns = payload.cnns;
		$scope.chips = payload.chips;
		$scope.actions = payload.actions;
		$scope.settings.source = $scope.settings.enabledSources().length > 0 ? $scope.settings.enabledSources()[0].name:'';
		$scope.settings.inputType = $scope.settings.enabledInputTypes().length > 0 ? $scope.settings.enabledInputTypes()[0].name:'';
		$scope.settings.chip = $scope.settings.enabledChips().length > 0 ? $scope.settings.enabledChips()[0].name:'';
		$scope.settings.cnn = $scope.settings.enabledCNNs().length > 0 ? $scope.settings.enabledCNNs()[0].name:'';
		$scope.settings.action = $scope.settings.enabledActions().length > 0 ? $scope.settings.enabledActions()[0].name:'';
	})


	if ( $scope.settings.init == false ) {
		$scope.settings.benchmark = $scope.benchmarks[0].name;
		$scope.settings.autoScrollEnabled = false;
		$scope.settings.autoplaySpeed = 5000;
		$scope.settings.init = true;
	}

 
}]);
