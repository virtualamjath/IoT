var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;
// var fs  = require('fs');
var count = 0, websockloop = true, webSockInterval;
var reconnectInterval = 100;
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json','utf8'));

var connectionString = config['DeviceConnectionString'];

var client = clientFromConnectionString(connectionString);

var connectCallback = function (err) {
  if (err) {
    console.log('Could not connect: ' + err);
  } else {
    console.log('Client connected');
  }
    // Create a message and send it to the IoT Hub every second
  //console.log('About to call getlatestValues method ');
  //getLatestValues();
  //console.log( 'get latest Values Method finished calling') ;
};

client.open(connectCallback);

function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
};



var initIOMapping, latestData;
var rawData = {}, date = Date();
var newRawData = {};
console.log('Initializing console log ') ;



const WebSocket = require('ws');
var ws;   

var latestData = {} , initIOMapping = {} ,  latestData = {} ; 

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

		var rawDataMessage = new Message( JSON.stringify (newRawData));
		//console.log("Sending rawDataMessage: " + rawDataMessage.getData());

        console.log(new Date().toUTCString());
		client.sendEvent( rawDataMessage, printResultFor('send'));
		
		
      // fs.writeFile( 'myjson', JSON.stringify (rawData) , 'utf8', function () { console.log('written to file');}    ) ;
				
	}
	else {
		//console.log('did not went int loop');
	}
	
} ;

function reconnectWebsocket(){
	console.log('Reconnect function called');
	connect();
		
}

function connect () {
	    count = count + 1 ;
	    console.log('creating web socket');
		ws = new WebSocket('ws://localhost:2012/');
		console.log('finished creating websocket');
		console.log('in connect function ---******');
		
		 ws.on('open', function() {
			 
			 if( websockloop == false){
			    clearInterval(webSockInterval);
				websockloop = true;
		    }
			console.log('Established connection to web Socket');
			if(ws.readyState === WebSocket.OPEN){
				console.log('------------------Web Socket is in open state going to make call ***PLC*** -----------------');
				ws.send(JSON.stringify({
					"Cmd": "RequestPLCIOMapping",
					"data": [
					{
						"deviceName": "CBM"
					}
					]
				}
				));
				
			console.log('Request is sent');
			}
		});	

   /* when you recieve message from websocket */
		ws.on('message', function(data, flags) {
			// console.log('i am in websocket Response');
			// Here You are parsing the data to be a JSON object
		data = JSON.parse(data);
	
        if(data.Cmd === 'ResponsePLCIOMapping') {
	        console.log('----------------I am in ResponsePLCIOMapping--------------------------');
	        initIOMapping = data.data;
	       
			if(ws.readyState === WebSocket.OPEN){ 
				ws.send(JSON.stringify({
                "Cmd": "RequestEventValuesUpdate",
                "data": ""}) ); 
			}
	  //console.log(initIOMapping);
  	    } 
		else if(data.Cmd === 'ResponseEventValuesUpdate') {
	        //console.log('I am in ResponseEventValuesUpdate');
	        latestData = data.data;
	        //console.log(latestData);
	       //console.log('latestdata');
	        joinData();
	        console.log('Response  Event Update');
	  
	  	        setTimeout( function () { 	
							//console.log('web socket checking');
			               if(ws.readyState === WebSocket.OPEN) {
						           ws.send(JSON.stringify({
                                    "Cmd": "RequestEventValuesUpdate",
                                   "data": ""}) ); 
						    } 
							    //console.log('web socket is in Open State');
							}	
					  , 1000 );
	  
       }
   });


    ws.on('error', function() {
        console.log('socket error');
    });
    ws.on('close', function() {
		
        console.log('----------------------socket closing-------------------');
		console.log('count in recursive function = %d', count);
		if( websockloop == true ){
			
			websockloop = false;
			console.log('in websocket websock is false');
			webSockInterval = setInterval ( reconnectWebsocket , 5000 ) ;
		}
		// setTimeout( function(){ connect(); }, reconnectInterval  );
        
    });
		
		
}
connect();





  
   
 