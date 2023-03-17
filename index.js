// set up express and app
const express = require("express");
// require the env file, in order to safely retrieve the MongoDB URI. need to specify the path of the file, otherwise
// will return undefined! require dotenv just finds a file called '.env' by default.
require('dotenv').config();
const app = express();

// retrieve URI (sensitive info) from .env file
const mongoURI = process.env.MONGO_URI;
// the database will be the main database to access
const DATABASE = "RoyaleRavesDB";
const COLLECTION = "posts";

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
    // first route, the home page

    // if we are doing await in app.get, the function needs to be an async function
    app.get("/", async function(req,res){
        // log in the terminal
        console.log("Hello world");
        console.log("hi");
        // send any data to the server
        res.send("YOOOOOooooo");
        
        // select the first 3 documents
        // equivalent: db.RoyaleRayesDB.find({}).limit(3)
        // will take a while because it's an async function
        const listings = await db.collection(COLLECTION)
        .find({})
        .limit(3)
        .toArray();
        console.log(listings);
    })
}

/*
async function connect(uri, dbname){
    let client = await MongoClient.connect(uri, {"useUnifiedTopology": true});
}
*/

// call main before listening
main();

//  we can write listen first, so that we can ensure the route goes before
app.listen(3000, function(){
    console.log("Server has started");
})