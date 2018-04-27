"use strict";
var movidius = require("./movidius");


var chips = ["CPU", "GPU", "Movidius","FPGA"];

var cnns = [
    {
        name: "Googlenet", 
        graphs: [
            {
                chip: "Movidius",
                path: 'cv-apps/movidius/ncappzoo/caffe/GoogLeNet/graph',
                label: 'cv-apps/movidius/ncappzoo/data/ilsvrc12/synset_words.txt'
            }
        ]
    },
    {
        name: "Mobilenet", 
        graphs: [
            {
                chip: "Movidius",
                path: "cv-apps/movidius/ncappzoo/tensorflow/mobilenets/model/graph",
                label: "cv-apps/movidius/ncappzoo/data/ilsvrc12/synset_words.txt"
            }
        ]
    },
    {
        name: "Squeezenet", 
        graphs: [
            {
                chip: "Movidius",
                path: "cv-apps/movidius/ncappzoo/caffe/SqueezeNet/graph",
                label: "cv-apps/movidius/ncappzoo/data/ilsvrc12/synset_words.txt"
            }
        ]
    },
    {
        name: "Alexnet", 
        graphs: [
            {
                chip: "Movidius",
                path: "cv-apps/movidius/ncappzoo/caffe/AlexNet/graph",
                label: "cv-apps/movidius/ncappzoo/data/ilsvrc12/synset_words.txt"
            }
        ]
    }
];

var actions = [
    {
        name: "None", 
        handlers: []
    },
    {
        name: "Image Classification", 
        handlers: [
            {
                chip: "Movidius",
                processor: movidius.imageClassification
            }
        ]
    },
    {
        name: "Object Detection", 
        handlers: [
            {
                chip: "Movidius",
                processor: movidius.objectDetection
            }
        ]
    },
    {
        name: "Object Tracking", 
        handlers: [
            {
                chip: "Movidius",
                processor: movidius.objectTracking
            }
        ]
    },
    {
        name: "Face Matcher", 
        handlers: [
            {
                chip: "Movidius",
                processor: movidius.faceMatcher
            }
        ]
    }
];



function handler(settings, cb) {
	if (!cb) {
        throw "Callback required";
    }

    actions.forEach(function(action) {
        if ( action.name == settings.action )
        {
            action.handlers.forEach(function(handler) {

                if ( handler.chip == settings.chip ) {
                    cnns.forEach(function(cnn) {
                        if ( cnn.name == settings.cnn ) {
                            cnn.graphs.forEach(function(graph) {
                                if ( graph.chip == settings.chip ) {
                                    var params = {};
                                    params.file = settings.file;
                                    params.graph = settings.topDir + "/" + graph.path;
                                    params.label = settings.topDir + "/" + graph.label;
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
    settings.cnns = [];
    settings.actions = []; 
    
    actions.forEach(function(action) {
        settings.actions.push(action.name)
    })
    
    cnns.forEach(function(cnn) {
        settings.cnns.push(cnn.name)
    })

    return settings;
}

module.exports = {
	handler: handler,
    settings: settings
};