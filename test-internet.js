var internetAvailable = require("internet-available");

// Set a timeout and a limit of attempts to check for connection
internetAvailable({
    timeout: 250,
    retries: 2,
}).then(function(){
    console.log("Internet available");
}).catch(function(){
    console.log("No internet");
});


/*

var internetAvailable = require("internet-available");

// Make it with a different verification address
internetAvailable({
    domainName: "ourcodeworld.com",
    port: 53,
    host: '8.8.8.8'
}).then(() => {
    console.log("Internet available");
}).catch(() => {
    console.log("No internet");
});

// by default it uses Google public DNS 
*/
