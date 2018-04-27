"use strict";

const { spawn } = require('child_process');

var scriptPath = 'cv-apps/movidius/apps/';

function process(script, args, cb) {
    if (!cb) {
        throw "Callback required";
    }

    const cmd = spawn('python3 '+ scriptPath + script, args, {shell: true});

    cmd.stdout.on('data', (data) => {
      cb(null, data);
    });

    cmd.stderr.on('data', (data) => {
       cb(null, data);
    });
}

function imageClassification(params, cb) {
	if (!cb) {
        throw "Callback required";
    }

    var args = [];
    args.push ("-i " + params.file);
    args.push ("-g " + params.graph);
    args.push ("-l " + params.label);

    process('image-classifier.py', args, function(err, data) {
        if ( err ) {
           cb(err)
        }
        else {
            var data = data.toString().split("\n");
            var re = /^( ?)(?:(?:\d+\.\d+)|(?:\.\d+)|(?:\d+))%( ?).*/
            var results = [];
            for(var i=0; i<data.length; i++) {
                if ( re.test(data[i]) ) {
                    var result =  data[i].split("\t");
                    if ( result.length >= 2 ) {
                        result[1] = result[1].replace(/^n\d+ /,'')
                        result[1] = result[1].split(",")[0];
                    }
                    results.push({ name: result[1], percentage: result[0] });
                }
            }
           cb(null,results)
        }
    })  
}

function objectDetection(params, cb) {
	if (!cb) {
        throw "Callback required";
    }
    console.log("objectDetection ");
}

function objectTracking(params, cb) {
    if (!cb) {
        throw "Callback required";
    }
    console.log("objectTracking ");
}

function faceMathcer(params, cb) {
    if (!cb) {
        throw "Callback required";
    }
    console.log("faceMathcer ");
}

module.exports = {
	imageClassification: imageClassification,
	objectDetection: objectDetection,
    objectTracking: objectTracking,
    faceMathcer: faceMathcer
};