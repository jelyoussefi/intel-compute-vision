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
        enabled: true
    },
    {
        name: 'Mobilenet', 
        enabled: true
    },
    {
        name: 'Squeezenet', 
        enabled: true
    },
    {
        name: 'Alexnet',
        enabled: true
    },
    {
        name: 'Custom',
        enabled: false
    }
];

var actions = [
    {
        name: 'None', 
        chips: [],
        enabled: true

    },
    {
        name: 'Image Classification',
        chips : [
            {
                name: 'Movidius',
                handler: movidius.imageClassification,
                cnns: [
                    {
                        name : 'Googlenet',
                        graph:  'cv-apps/movidius/ncappzoo/caffe/GoogLeNet/graph',
                        label:  {
                            path: 'cv-apps/movidius/ncappzoo/data/ilsvrc12/synset_words.txt',
                            id_format: '^n\\d+ '
                        },
                        dim:    '224x224'
                    },
                    {
                        name:   'Mobilenet',
                        graph:  'cv-apps/movidius/ncappzoo/tensorflow/mobilenets/model/graph',
                        label:  {
                            path: 'cv-apps/movidius/ncappzoo/tensorflow/mobilenets/model/labels.txt',
                            id_format: '^\\d+:'
                        },
                        dim:    '224x224',
                        scale:   '0.00789'
                    },
                    {
                        name:   'Squeezenet',
                        graph:  'cv-apps/movidius/ncappzoo/caffe/SqueezeNet/graph',
                        label:  {
                            path: 'cv-apps/movidius/ncappzoo/data/ilsvrc12/synset_words.txt',
                            id_format: '^n\\d+ '
                        },
                        dim:    '227x227'
                    },
                     {
                        name:   'Alexnet',
                        graph:  'cv-apps/movidius/ncappzoo/caffe/AlexNet/graph',
                        mean:   '127.5, 127.5, 127.5',
                        label:  {
                            path: 'cv-apps/movidius/ncappzoo/data/ilsvrc12/synset_words.txt',
                            id_format: '^n\\d+ '
                        },
                        dim:    '227x227'
                    }

                ]
            }
        ],
        enabledFor: {
            inputTypes : ['Image']
        }

    },
    {
        name: 'Object Detection', 
        chips: [
            {
                name: 'Movidius',
                handler: movidius.objectDetection,
                cnns: [
                    {
                        name:   'Mobilenet',
                        graph:  'cv-apps/movidius/ncappzoo/caffe/SSD_MobileNet/graph',
                        label:  {
                            path: 'cv-apps/movidius/ncappzoo/caffe/SSD_MobileNet/labels.txt',
                            id_format: '^\\d+:'
                        },
                        dim:    '300x300',
                        scale:   '0.00789'
                    }
                ]
            }
        ],
        enabledFor: {
            inputTypes : ['Image', "Video"],
            cnns: ['Mobilenet']
        },
        hasMediaOutput: true
    },
    
    {
        name: 'Face Matcher', 
        chips: [
            {
                name: 'Movidius',
                handler: movidius.objectDetection
            }
        ],
        enabledFor: {
            inputTypes : ['Image', "Video"]
        }
    },

     {
        name: 'Audio Classification', 
        chips: [
            {
                name: 'Movidius',
                handler: movidius.objectDetection,
                cnns: [
                    {
                        name:   'Mobilenet'
                    }
                ]
            }
        ],
        enabledFor: {
            inputTypes : ['Audio']
        }
    },
];



function handler(settings, cb) {
	if (!cb) {
        throw 'Callback required';
    }

    actions.forEach(function(action) {
        if ( action.name == settings.action )
        {
            action.chips.forEach(function(chip) {

                if ( chip.name == settings.chip ) {
                    chip.cnns.forEach(function(cnn) {
                        if ( cnn.name == settings.cnn ) {
                            var params = {};
                            params.file = settings.file;
                            params.outputFile = settings.outputFile;
                            params.graph = settings.topDir + '/' + cnn.graph;
                            params.label = {};
                            params.label.path =  settings.topDir + '/' +  cnn.label.path;
                            params.label.id_format = cnn.label.id_format;
                            params.dim =  cnn.dim;
                            if ( params.mean ) {
                                params.mean = cnn.mean;
                            }
                            if (  cnn.scale ) {
                                params.scale = cnn.scale;
                            }
                            if ( settings.source == "USB" ) {
                                params.file = settings.inputType + ":" + settings.file;
                                chip.handler(params,cb);
                            }
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
            newAction.hasMediaOutput = false;
            if ( action.hasOwnProperty('hasMediaOutput') ) {
                newAction.hasMediaOutput = action.hasMediaOutput;
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