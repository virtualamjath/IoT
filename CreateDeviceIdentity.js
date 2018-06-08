'use strict';

var iothub = require('azure-iothub');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json','utf8'));
console.log('parsed IoT hub connection String' + config['IoTHubConnectionString']);
console.log('parsed Device Connection String ' + config['DeviceConnectionString']);

var connectionString = config['IoTHubConnectionString'] ;

var registry = iothub.Registry.fromConnectionString( connectionString );

var device = {
  deviceId: config['DeviceId']
}


registry.create(device, function(err, deviceInfo, res) {
  if (err) {
    registry.get(device.deviceId, printDeviceInfo);
  }
  if (deviceInfo) {
    printDeviceInfo(err, deviceInfo, res)
  }
});

function printDeviceInfo(err, deviceInfo, res) {
  if (deviceInfo) {
    console.log('Device ID: ' + deviceInfo.deviceId);
    console.log('Device key: ' + deviceInfo.authentication.symmetricKey.primaryKey);
    config['DeviceSharedAccessKey'] = deviceInfo.authentication.symmetricKey.primaryKey;
    config['DeviceConnectionString'] = "HostName=" + config['HostName'] + ";DeviceId=" + config['DeviceId'] + ";SharedAccessKey=" + deviceInfo.authentication.symmetricKey.primaryKey ;
    var data = JSON.stringify(config, null , 2);

    function finished () {
    console.log('write to file Finished');
    }

    fs.writeFile('config.json', data , finished);
    
  }
}
