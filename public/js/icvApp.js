'use strict';

var intelComputeVisionApp = angular.module('intelComputeVisionApp', [ 
                                                                      'icvDirectives',
                                                                      'icvController',
                                                                      'icvServices',
                                                                      'ngMaterial', 
                                                                      'ngMessages', 
                                                                      'ngAria',
                                                                      'ngAnimate',
                                                                      'ui.carousel',
                                                                      'ngSanitize',
                                                                      'vcRecaptcha',
                                                                      'btford.socket-io',
                                                                      'chart.js'
                                                                      ])


       .factory('socket', function (socketFactory) {
              return socketFactory();
       });

