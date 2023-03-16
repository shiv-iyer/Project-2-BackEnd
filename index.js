// set up express and app
const express = require("express");
const app = express();

// sanity test to see that our server works
app.get("/", function(req,res){
    // log in the terminal
    console.log("Hello world");
    console.log("hi");
    // send any data to the server
    res.send("YOOOOO");
})

//  we can write listen first, so that we can ensure the route goes before
app.listen(3000, function(){
    console.log("Server has started");
})