'use strict';

var movidius = require('./movidius');
var drivelist = require('drivelist');
var sync = require('synchronize');
var fs = require('fs');

var sources = [
    {
        name:'USB',
        enabled: false
    },

    {
        name:'WebCam',
        enabled: false
    },
    {
        name:'Web',
        enabled: false
    }
]

var chips = [
    {
        name:'CPU',
        enabled: false
    },

    {
        name:'Movidius',
        enabled: true
    },
    {
        name:'GPU',
        enabled: false
    },
    {
        name:'FPGA',
        enabled: false
    }
]

var inputTypes = [
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

var cnns = [
    {
        name: 'Googlenet', 
        enabled: true,
        chips: [
            {
                name:   'Movidius',
                graph:  'cv-apps/movidius/ncappzoo/caffe/GoogLeNet/graph',
                label:  {
                    path: 'cv-apps/movidius/ncappzoo/data/ilsvrc12/synset_words.txt',
                    id_format: '^n\\d+ '
                },
                dim:    '224x224'
            }
        ]
    },
    {
        name: 'Mobilenet', 
        enabled: true,
        chips: [
            {
                name:   'Movidius',
                graph:  'cv-apps/movidius/ncappzoo/tensorflow/mobilenets/model/graph',
                label:  {
                    path: 'cv-apps/movidius/ncappzoo/tensorflow/mobilenets/model/labels.txt',
                    id_format: '^\\d+:'
                },
                dim:    '224x224',
                scale:   '0.00789'
            }
        ]
    },
    {
        name: 'Squeezenet', 
        enabled: true,
        chips: [
            {
                name:   'Movidius',
                graph:  'cv-apps/movidius/ncappzoo/caffe/SqueezeNet/graph',
                label:  {
                    path: 'cv-apps/movidius/ncappzoo/data/ilsvrc12/synset_words.txt',
                    id_format: '^n\\d+ '
                },
                dim:    '227x227'

            }
        ]
    },
    {
        name: 'Alexnet',
        enabled: true, 
        chips: [
            {
                name:   'Movidius',
                graph:  'cv-apps/movidius/ncappzoo/caffe/AlexNet/graph',
                label:  {
                    path: 'cv-apps/movidius/ncappzoo/data/ilsvrc12/synset_words.txt',
                    id_format: '^n\\d+ '
                },
                dim:    '227x227'
            }
        ]
    }
];

var actions = [
    {
        name: 'None', 
        handlers: [],
        enabled: true,

    },
    {
        name: 'Image Classification',
        handlers: [
            {
                chip: 'Movidius',
                processor: movidius.imageClassification
            }
        ],
        enabledFor: {
            inputTypes : ['Image']
        }

    },
    {
        name: 'Object Detection', 
        handlers: [
            {
                chip: 'Movidius',
                processor: movidius.objectDetection
            }
        ],
        enabledFor: {
            inputTypes : ['Image', "Video"]
        }
    },
    {
        name: 'Object Tracking', 
        handlers: [
            {
                chip: 'Movidius',
                processor: movidius.objectTracking
            }
        ],
        enabledFor: {
            inputTypes : ["Video"]
        }
    },
    {
        name: 'Face Matcher', 
        handlers: [
            {
                chip: 'Movidius',
                processor: movidius.faceMatcher
            }
        ],
        enabledFor: {
            inputTypes : ['Image', "Video"]
        }
    }
];



function handler(settings, cb) {
	if (!cb) {
        throw 'Callback required';
    }

    actions.forEach(function(action) {
        if ( action.name == settings.action )
        {
            action.handlers.forEach(function(handler) {

                if ( handler.chip == settings.chip ) {
                    cnns.forEach(function(cnn) {
                        if ( cnn.name == settings.cnn ) {
                            cnn.chips.forEach(function(chip) {
                                if ( chip.name == settings.chip ) {
                                    var params = {};
                                    params.file = settings.file;
                                    params.graph = settings.topDir + '/' + chip.graph;
                                    params.label = {};
                                    params.label.path =  settings.topDir + '/' +  chip.label.path;
                                    params.label.id_format = chip.label.id_format;
                                    params.dim =  chip.dim;
                                    if (  chip.scale ) {
                                        params.scale = chip.scale;
                                    }
                                    else {
                                        params.scale = '1'
                                    }

                                    handler.processor(params,cb)
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

function getSettings(cb) {

    if (!cb) {
        throw 'Callback required';
    }
    var settings = {};
    settings.chips = chips;
    settings.sources = sources;
    settings.inputTypes = inputTypes;
    settings.cnns = [];
    settings.actions = []; 

    var drivesList = sync(drivelist.list);

    sync.fiber(function() {
        var drives = drivesList();
        settings.sources.forEach(function(source) {
            if ( source.name == 'USB' ) {
                source.enabled = false;
                drives.forEach(function(drive) {
                    if ( !drive.isSystem ) {
                       source.enabled = true;
                    }
                })
            }
        })

        var enableWebCam = false;
        for(var i=1; i<10; i++ ) {
            if (fs.existsSync("/dev/video"+i)) {
                enableWebCam = true;
                break;
            }
        }
        settings.sources.forEach(function(source) {
            if ( source.name == 'WebCam' ) {
                 source.enabled = enableWebCam; 
            }
        })

        cnns.forEach(function(cnn) {
            settings.cnns.push({ name: cnn.name, enabled: cnn.enabled })
        })

        actions.forEach(function(action) {
            var newAction = {};
            newAction.name =  action.name;
            if ( action.hasOwnProperty('enabled') ) {
                newAction.enabled = action.enabled;
            }
            if ( action.hasOwnProperty('enabledFor') ) {
                newAction.enabledFor = action.enabledFor;
            }
            settings.actions.push(newAction);
        })

        cb(settings);

    })
}

module.exports = {
	handler: handler,
    getSettings: getSettings
};