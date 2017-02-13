var http = require('http');
var gpio = require('ms-gpio');
var host = "rpiservice.azurewebsites.net";


var getOptions = {
    host: host,
    path: '/getCommand',
    //port: '9000',
    headers: { 'raspId': '1' }
};


callback = function (response) {
    var str = ''
    response.on('data', function (chunk) {
        str += chunk;
    });

    response.on('end', function () {
        console.log("Triggered");
        processRequest();
        performOperation(str);
    });
}

processRequest();

function performOperation(str) {
    var operation = JSON.parse(str);
    var deviceDetails = [];
    switch (operation.description) {
        case "get":
            deviceDetails = getRegisteredDevices();
            break;
        case "post":
            deviceDetails.push(getDeviceDetails(operation.deviceId));
            break;
        default:
            break;
    }


    var data = JSON.stringify({
        'deviceId': operation.deviceId,
        'description': operation.description,
        'deviceDetails': deviceDetails,
        'status': 'success',
        'id': operation.id
    });


    var postOptions = {
        host: host,
        path: '/updateProgress',
        method: "POST",
        json: true,
        //port: '9000',
        headers: {
            'Content-Type': 'application/json',
            "Content-Length": Buffer.byteLength(data)
        }
    };


    var req = http.request(postOptions, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
        });

        res.on('end', function () {
        });
    });
    req.write(data);
    req.end();
}

function processRequest() {
    var req = http.request(getOptions, callback);
    req.end();
}

function getDeviceDetails(deviceId) {
    var deviceId = deviceId;
    gpio.setup(deviceId, gpio.OUTPUT_MODE);
    return setApplianceState(deviceId, !gpio.read(deviceId));
}

function getRegisteredDevices() {
    var devices = [
        {
            deviceId: 15, status: false, device: "fan"
        },
        {
            deviceId: 16, status: false, device: "bulb"
        },
        {
            deviceId: 18, status: false, device: "washer"
        },
        {
            deviceId: 19, status: false, device: "tv"
        }
    ];

    for (var i = 0; i < devices.length; i++) {
        gpio.setup(devices[i].deviceId);
        devices[i].status = gpio.read(devices[i].deviceId);
    }

    return devices;
}

function setApplianceState(pinNo, setState) {
    gpio.write(pinNo, setState);
    return { "status": setState, "deviceId": pinNo };
}