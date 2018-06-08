'use strict';

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;
// var fs  = require('fs');

var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json','utf8'));

var connectionString = config['DeviceConnectionString'];
var DeviceName = config['DeviceId'];

var client = clientFromConnectionString(connectionString);

function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
};

var WebSocket = require('ws');
var initIOMapping, latestData;
var rawData = {}, date = Date();
var newRawData = {};
console.log('Initializing console log ') ;

var ws ; 

function ConnectoWebsocket () {
  ws =  new WebSocket(config['websocketAddress']);
  ws.on( 'error' , function(err) { 
    console.log('error due to connectivity of websocket-inside'); 
    console.log(err);
    setTimeout( ConnectoWebsocket , 2000 ); 
    
 } ) ;
}; 
ConnectoWebsocket();
/*
ws.on( 'error' , function(err) { 
  setTimeout( ConnectoWebsocket , 10000 );   
  console.log('error due to connectivity of websocket-outside'); 
  console.log(err);
} ) ;
*/

/* when Web sockets starts it will connect to the websocket and get the latest mapping of the Values */
ws.on('open', function() {
	console.log('Established connection to web Socket');
 	ws.send(JSON.stringify({
			"Cmd": "RequestPLCIOMapping",
			"data": [
				{
					"deviceName": "CBM"
				}
			]
		}));
});

/* when you recieve message from websocket */
ws.on('message', function(data, flags) {
	// console.log('i am in websocket Response');
	// Here You are parsing the data to be a JSON object
	data = JSON.parse(data);
	
  if(data.Cmd === 'ResponsePLCIOMapping') {
	  console.log('I am in ResponsePLCIOMapping');
	  initIOMapping = data.data;
	  //console.log(initIOMapping);
  } else if(data.Cmd === 'ResponseEventValuesUpdate') {
	  //console.log('I am in ResponseEventValuesUpdate');
	  latestData = data.data;
	 // console.log(latestData);
	 //console.log('latestdata');
	  joinData();
  }
});



/* This function will be called once when it connects to the cloud */
var getLatestValues = function () { 

console.log('I am inside Get latest Values method');

/* Here for Every one second we are requesting to get latest PLCupdated values for all variables */
  setInterval( function() {
        try {
	 ws.send(JSON.stringify({
    "Cmd": "RequestEventValuesUpdate",
    "data": ""}) );
           } 
	catch ( e ) {  console.log('Websocket is not in open state error occured'); }
	//console.log('');
    
} , 1000 ) ;
};




var joinData = function() { 
	console.log('i am inside joining function');
	if(initIOMapping  && latestData) {
		//console.log('Logging Data is not null');
		
		for ( var len1=0;len1 < initIOMapping.length ; len1++ ) {
			
			for ( var len2 = 0 ; len2 < latestData.length ; len2++ ) {
				if(initIOMapping[len1].EventId == latestData[len2].eventId){
					//console.log('eventId matched');
					rawData[initIOMapping[len1].EventName] = latestData[len2].rawVal;
					break;
				}
			}
			rawData['currentTime'] = Date.now();
			rawData['MessageType'] = 1 ;
 		}
	
		
		for ( var key in rawData ) { 
			var value = rawData[key];
			newRawData[ key.replace("\:" , "_") ] = value ;
			//console.log(  key.replace("\:" , "_")  + " : " + value ) ; 
		}
		newRawData['devicename'] = DeviceName ; 
		var rawDataMessage = new Message( JSON.stringify (newRawData));
		console.log("Sending rawDataMessage: " + rawDataMessage.getData());


		client.sendEvent( rawDataMessage, printResultFor('send'));
		
		
      // fs.writeFile( 'myjson', JSON.stringify (rawData) , 'utf8', function () { console.log('written to file');}    ) ;
				
	}
	else {
		//console.log('did not went int loop');
	}
	
} ;


var connectCallback = function (err) {
  if (err) {
    console.log('Could not connect: ' + err);
  } else {
    console.log('Client connected');
  }
    // Create a message and send it to the IoT Hub every second
  //console.log('About to call getlatestValues method ');
  getLatestValues();
  //console.log( 'get latest Values Method finished calling') ;
};

client.open(connectCallback);
