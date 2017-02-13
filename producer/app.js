var express = require('express');
var bodyParser = require('body-parser');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var sb = require("mssb");
var app = new express();

var raspId = 1;
var operationQueue = [];

startUp();

//Listen for all the request
var server = app.listen(app.get('port'), function () {
    var port = server.address().port;
    console.log('Server running on port ' + port);
});

server.timeout = 300000;

//Register all the startup related stuffs in this function
function startUp() {
    configureExternalModule();
    setUpHttpHandler();
    var port = process.env.PORT || 9000;
    app.set('port', port);
}

//Configure external modules here
function configureExternalModule() {
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    var options = {
        index: "index.htm"
    };

    app.use('/', express.static('public', options));
}

//Configure http request handler
function setUpHttpHandler() {

    app.use('/getCommand', function (req, res) {
        var queue = findElement(raspId);
        if (queue.operation.length > 0 && getOperationToProcess(queue.operation) != null) {
            var operationToProcess = getOperationToProcess(queue.operation);
            operationToProcess.isProcessed = true;
            res.json(operationToProcess);
        }
        else {
            sb.subscribe(raspId, function () {
                var operationToProcess = getOperationToProcess(queue.operation);
                operationToProcess.isProcessed = true;
                res.json(operationToProcess);
            });
        }
    });

    app.post('/updateProgress', function (req, res) {
        var deviceId = req.body.deviceId;
        var status = req.body.status;
        var operation = raspId + req.body.deviceId + req.body.description;
        var queue = findElement(raspId);
        removeItemForQueue(queue.operation, req.body.id);
        sb.publish(raspId + "_Notification", req.body.deviceDetails);
        res.json({ 'status': 'success' });
    });

    app.post('/performOperation', function (req, res) {
        var uniqueId = generateUUID();
        var data = req.body;
        var deviceId = data.deviceId;
        var queue = findElement(raspId);
        if (queue.operation.length == 0) {
            queue.operation.push({ description: "post", deviceId: deviceId, isProcessed: false, id: uniqueId });
            sb.publish(raspId);
        }
        else {
            var isDuplicate = isDuplicateOperation(raspId, deviceId, "post");
            if (!isDuplicate) {
                queue.operation.push({ description: "post", deviceId: deviceId, isProcessed: false, id: uniqueId });
            }
        }
        var operation = raspId + req.body.deviceId + "post";
        res.json({ "Status": "Done" });
    });

    app.use('/getDevices', function (req, res) {
        var queue = findElement(raspId);
        if (queue.operation.length == 0) {
            queue.operation.push({ description: "get", deviceId: "0", isProcessed: false, id: generateUUID() });
            sb.publish(raspId);
        }
        else {
            var isDuplicate = isDuplicateOperation(raspId, 0, "get")
            console.log("Duplicate : " + isDuplicate);
            if (!isDuplicate) {
                queue.operation.push({ description: "get", deviceId: "0", isProcessed: false, id: generateUUID() });
            }
        }
        sb.subscribe(raspId + "_Notification", function (deviceDetails) {
            res.json(deviceDetails);
        });
    });

    app.use('/subscribe', function (req, res) {
        sb.subscribe(raspId + "_Notification", function (deviceDetails) {
            res.json(deviceDetails[0]);
        });
    });
}

function findElement(raspId) {
    for (var i = 0; i < operationQueue.length; i++) {
        if (operationQueue.raspId == raspId) {
            return operationQueue[i];
        }
    }
    operationQueue.push({ raspId: raspId, operation: [] });
    return operationQueue[0];
}

function isDuplicateOperation(raspId, deviceId, description) {
    var rasp = findElement(raspId);
    var operations = rasp.operation;
    for (var i = 0; i < operations.length; i++) {
        if (operations[i].deviceId == deviceId && operations[i].description == description && !operations[i].isProcessed) {
            return true;
        }
    }
    return false;
}

function getOperationToProcess(operations) {
    for (var i = 0; i < operations.length; i++) {
        if (!operations[i].isProcessed) {
            return operations[i];
        }
    }
    return null;
}

function removeItemForQueue(operations, id) {
    var index = -1;
    for (var i = 0; i < operations.length; i++) {
        if (operations[i].id == id) {
            index = i;
            break;
        }
    }

    if (index > -1) {
        operations.splice(index, 1);
    }
}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
