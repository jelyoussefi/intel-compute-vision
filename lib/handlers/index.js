'use strict';
var movidius = require('./movidius');


var sources = [
    {
        name:'USB',
        enabled: true
    },

    {
        name:'WebCam',
        enabled: true
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
        enabled: true,
        handlers: []
    },
    {
        name: 'Image Classification',
        enabled: true,
        handlers: [
            {
                chip: 'Movidius',
                processor: movidius.imageClassification
            }
        ]
    },
    {
        name: 'Object Detection', 
        enabled: true,
        handlers: [
            {
                chip: 'Movidius',
                processor: movidius.objectDetection
            }
        ]
    },
    {
        name: 'Object Tracking', 
        enabled: true,
        handlers: [
            {
                chip: 'Movidius',
                processor: movidius.objectTracking
            }
        ]
    },
    {
        name: 'Face Matcher', 
        enabled: true,
        handlers: [
            {
                chip: 'Movidius',
                processor: movidius.faceMatcher
            }
        ]
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

function settings() {
    var settings = {};
    settings.chips = chips;
    settings.sources = sources;
    settings.inputTypes = inputTypes;
    settings.cnns = [];
    settings.actions = []; 
    
    cnns.forEach(function(cnn) {
        settings.cnns.push({ name: cnn.name, enabled: cnn.enabled })
    })

    actions.forEach(function(action) {
        settings.actions.push({name: action.name, enabled: action.enabled })
    })
    return settings;
}

module.exports = {
	handler: handler,
    settings: settings
};