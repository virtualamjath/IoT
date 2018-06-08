var initIOMapping, latestData;
var rawData = {}, date = Date();
var newRawData = {};
console.log('Initializing console log ') ;



const WebSocket = require('ws');
var reconnectInterval = 5000;
var ws;   

function connect () {
	try { 
	    console.log('creating web socket');
		ws = new WebSocket('ws://localhost:2012/');
		console.log('finished creating websocket');
	}
	catch (e){
		console.log('websocket cannot be opened');
	}
   console.log('in connect function ---******');
}
connect();
  
    ws.on('open', function() {
	console.log('Established connection to web Socket');
	if(ws.readyState === WebSocket.OPEN){
    	 	ws.send(JSON.stringify({
			"Cmd": "RequestPLCIOMapping",
			"data": [
				{
					"deviceName": "CBM"
				}
			]
		}));
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
	        setTimeout( function () { 	if(ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({
                        "Cmd": "RequestEventValuesUpdate",
                       "data": ""}) ); } , 1000 );
	
	  //console.log(initIOMapping);
  	    } 
		else if(data.Cmd === 'ResponseEventValuesUpdate') {
	        //console.log('I am in ResponseEventValuesUpdate');
	        latestData = data.data;
	        //console.log(latestData);
	       //console.log('latestdata');
	        //joinData();
	        console.log('Response  Event Update');
	  
	  	    setTimeout( function () { 	
							console.log('web socket checking');
			               if(ws.readyState === WebSocket.OPEN) {
						           ws.send(JSON.stringify({
                                    "Cmd": "RequestEventValuesUpdate",
                                   "data": ""}) ); 
						    } 
							    console.log('web socket is in Open State');
							}	
					  , 1000 );
	  
       }
   });


    ws.on('error', function() {
        console.log('socket error');
    });
    ws.on('close', function() {
        console.log('socket close');
        connect();
    });
 