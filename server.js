var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var fs = require('fs');
var server = http.createServer(app).listen(process.env.PORT || 3000);
var io = require('socket.io').listen(server, { log: false });
var path = require('path');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var os = require('os');
var routes = require('./routes/index');
var usbDetect = require('usb-detection');
var drivelist = require('drivelist');
var ml = require('./lib/handlers');
var vs= require('./lib/video_streamer');
var video    = express();

var sockets = [];
var currentCmdProcId = -1;
var imageOutputFile = "image_output.png";
var videoOutputFile = "video_output.mp4";

var settings = {
    input: {
        source: '',
        type: '',
    }
};




var publicPath = path.join(__dirname, 'public')
var outputFilePath = path.join(publicPath, 'files/')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(publicPath));
app.use(express.static('/media/jelyouss/boot/'));

app.use('/', routes);

//-----------------------------------------------------------------------------------------------------
//  Video
//-----------------------------------------------------------------------------------------------------

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


// USB monitoring
usbDetect.startMonitoring();
usbDetect.on('add', function(device) { 
    if ( parseInt(device.vendorId) != 999 ) { //Movidius CS
        setTimeout( function() {
            updateSettings(sockets);
            sendInputFiles();
        }, 3000);
    }
});

usbDetect.on('remove', function(device) { 

    if ( parseInt(device.vendorId) != 999 ) { //Movidius CS
        updateSettings(sockets);
        sendInputFiles();
    }

});


function findFilesInDir(startPath,extList){

    var results = [];

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            results = results.concat(findFilesInDir(filename,extList)); //recurse
        }
        else {
            for (var j=0; j<extList.length; j++) {
                if ( filename.indexOf("."+extList[j])>=0 ) {
                    results.push(filename);
                }
            }
        }
    }
    return results;
}

function sendInputFiles() {
    if ( settings.input.source != "USB" ) {
        return;
    }

    var extList = [];
    if ( settings.input.type == "Image" ) {
        extList = ["jpeg", "jpg", "png"];
    } 
    else if ( settings.input.type  == "Video" ) {
        extList = ["mov", "mp4"]
    }
    else if ( settings.input.type  == "Audio" ) {
        extList = ["wav"];
    }
    if ( extList.length == 0 ) {
        return;
    }

    drivelist.list(function(error, drives)  {
        if (!error) {
            var files = [];
            drives.forEach(function(drive) {
                if ( !drive.isSystem ) {
                    var mountPoint = drive.mountpoints[0].path;
                    app.use(express.static(mountPoint));
                    var tmpFiles = findFilesInDir(mountPoint,extList);
                    for(var i=0; i<tmpFiles.length; i++) {
                        var file = new Object();
                        file.dir = mountPoint;
                        file.path = tmpFiles[i].substring(mountPoint.length+1);

                        files.push(file)
                    }
                }
            })
            
            sockets.forEach(function(socket) {
               
                socket.emit('setInputFiles', JSON.stringify(files));
            })
        }
    })
}

function updateSettings(socks) {
    socks.forEach(function(socket) {
        ml.getSettings( function(settings) {
            socket.emit('settings', JSON.stringify(settings));
        })
    })
}

function setOutputFile(settings) {
    settings.outputFilePath =  outputFilePath;

    if ( settings.inputType == "Image") {
        settings.outputFile = settings.outputFilePath + imageOutputFile;
    }
    else if ( settings.inputType == "Video") {
        settings.outputFile = settings.outputFilePath + videoOutputFile;

    }
}

//-----------------------------------------------------------------------------------------------------
//  Video
//-----------------------------------------------------------------------------------------------------


function isProcessRunning(pid) {
    try {
        return process.kill(pid,0)
    }
    catch (e) {
        return e.code === 'EPERM'
    }
}
//-----------------------------------------------------------------------------------------------------
//  Clients's Connection 
//-----------------------------------------------------------------------------------------------------


io.sockets.on('connection', function(socket) {

    console.log('New connection from :  ' + socket.handshake.address);

    sockets.push(socket);

    updateSettings([socket]);

    socket.on( 'getInputFiles', function(payload) {
        payload = JSON.parse(payload);
        settings.input.source = payload.source;
        settings.input.type = payload.inputType;
       
        sendInputFiles();
    });

    socket.on( 'command', function(payload) {
        payload = JSON.parse(payload)
        payload.topDir = __dirname;
       
        if ( currentCmdProcId != -1 && isProcessRunning(currentCmdProcId) ) {
            process.kill(-currentCmdProcId);
            currentCmdProcId = -1;
        }
           
        socket.emit('predictions', [])
        if (fs.existsSync(payload.outputFile)) {
            fs.unlinkSync(payload.outputFile);
        }
        setOutputFile(payload);
        payload.env = process.env;

        ml.handler(payload, function(err, result) {
            if ( !err ) {
                if( result.procId ) {
                    currentCmdProcId = parseInt(result.procId);
                }
                if ( result.predictions ) {
                    socket.emit('predictions', result.predictions, result.execTime);
                }
                if ( result.outputFile ) {
                    socket.emit('outputFile', result.outputFile.substring(publicPath.length));
                }
            }
            else {
                console.log("error "+err)
            }
        })        
    });

    socket.on('disconnect', function () {
      sockets.splice( sockets.indexOf(socket),1);

    })

});


module.exports = app;

console.log('Express server listening on port ' + server.address().port);




