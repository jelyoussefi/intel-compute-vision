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
       cb(data);
    });
}

function imageClassification(params, cb) {
	if (!cb) {
        throw "Callback required";
    }

    var args = [];
    var inputFile = params.file.split(":");
    if ( inputFile.length == 2 && inputFile[0].trim() == "Image" ) {
        args.push ("-i " + inputFile[1]);
    }
    else {
        cb("Invalid input file "+params.file)
    }
    args.push ("-g " + params.graph);
    args.push ("-l " + params.label.path);
    if ( params.scale ) {
        args.push ("-S " + params.scale);
    }
    args.push ("-D " + params.dim);

    process('image-classifier.py', args, function(err, data) {
        if ( err ) {
           cb(err)
        }
        else {
            var data = data.toString().split("\n");
            var rePrediction = /^( ?)(?:(?:\d+\.\d+)|(?:\.\d+)|(?:\d+))%( ?).*/
            var reExecTime = /^Execution time:.*/
            var predictions = [];
            var execTime;
            for(var i=0; i<data.length; i++) {
                if ( reExecTime.test(data[i])) {
                    execTime = data[i].split(":")[1];
                }
                else if ( rePrediction.test(data[i]) ) {
                    var prediction =  data[i].split("\t");
                    if ( prediction.length >= 2 ) {
                        if ( params.label.id_format ) {
                            prediction[1] = prediction[1].replace(new RegExp(params.label.id_format),'')
                        }
                        prediction[1] = prediction[1].split(",")[0];
                    }
                    predictions.push({ name: prediction[1], percentage: prediction[0] });
                }
            }
           cb(null,predictions,execTime)
        }
    })  
}

function objectDetection(params, cb) {
	if (!cb) {
        throw "Callback required";
    }

    var args = [];
    args.push ("-i " + params.file);
    args.push ("-g " + params.graph);
    args.push ("-l " + params.label.path);
    if ( params.scale ) {
        args.push ("-S " + params.scale);
    }
    args.push ("-D " + params.dim);
    args.push ("-o " + params.outputFile);

    process('object-detector.py', args, function(err, data) {
        if ( err ) {
           cb(err)
        }
        else {
            var data = data.toString().split("\n");
            var rePrediction = /^( ?)(?:(?:\d+\.\d+)|(?:\.\d+)|(?:\d+))%( ?).*/
            var reExecTime = /^Execution time:.*/
            var predictions = [];
            var execTime;
            for(var i=0; i<data.length; i++) {
                if ( reExecTime.test(data[i])) {
                    execTime = data[i].split(":")[1];
                }
                else if ( rePrediction.test(data[i]) ) {
                    var prediction =  data[i].split("\t");
                    if ( prediction.length >= 2 ) {
                        
                        prediction[1] = prediction[1].split(":");
                        if ( prediction[1].length >= 1 ) {
                            prediction[1] = prediction[1][1];
                        }
                    }
                    predictions.push({ name: prediction[1], percentage: prediction[0] });
                }
            }

           cb(null,predictions,execTime,params.outputFile)
        }
    })  
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

function audioClassification(params, cb) {
    if (!cb) {
        throw "Callback required";
    }
    console.log("imageClassification ");
}

module.exports = {
	imageClassification: imageClassification,
	objectDetection: objectDetection,
    objectTracking: objectTracking,
    faceMathcer: faceMathcer
};