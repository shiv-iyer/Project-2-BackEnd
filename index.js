// set up express and app
const express = require("express");
// require the env file, in order to safely retrieve the MongoDB URI. need to specify the path of the file, otherwise
// will return undefined! require dotenv just finds a file called '.env' by default.
require('dotenv').config();
const app = express();

const mongoURI = process.env.MONGO_URI;
const DATABASE = "RoyaleRavesDB"

// for Express to talk to Mongo, we need a client
// this client is for nodejs

// require("mongodb") returns an Object with many key/value pairs, we are only interested in MongoClient
 const MongoClient = require("mongodb").MongoClient;

// main has to be an async function. we only want the routes to load once we are connected to the database
async function main(){
    // in order to connect to MongoDB, we need two pieces of information:
    // 1. a connection string
    // 2. a configuration object - in summary, this simplifies our access to MongoDB
    // mongoclient.connect is async
    const client = await MongoClient.connect(mongoURI,
    {"useUnifiedTopology": true});

    // mongo db to connect to
    const db = client.db(DATABASE);


    // sanity test to see that our server works
    app.get("/", function(req,res){
        // log in the terminal
        console.log("Hello world");
        console.log("hi");
        // send any data to the server
        res.send("YOOOOOooooo");
    })
}

// call main before listening
main();

//  we can write listen first, so that we can ensure the route goes before
app.listen(3000, function(){
    console.log("Server has started");
})