'use strict';

var intelComputeVisionApp = angular.module('intelComputeVisionApp', [ 
                                                                      'icvDirectives',
                                                                      'icvController',
                                                                      'icvServices',
                                                                      'ngMaterial', 
                                                                      'ngMessages', 
                                                                      'ngAria',
                                                                      'ui.carousel',
                                                                      'ngSanitize',
                                                                      'vcRecaptcha',
                                                                      'btford.socket-io'
                                                                      ])


       .factory('socket', function (socketFactory) {
              return socketFactory();
       });