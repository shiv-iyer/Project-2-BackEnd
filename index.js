// set up express and app
const { json } = require("express");
const express = require("express");
// require the env file, in order to safely retrieve the MongoDB URI. need to specify the path of the file, otherwise
// will return undefined! require dotenv just finds a file called '.env' by default.
require('dotenv').config();
const app = express();
const PORT = 3000;

// app.use
app.use(express.json());

// retrieve URI (sensitive info) from .env file
const mongoURI = process.env.MONGO_URI;
// the database will be the main database to access
const DATABASE = "RoyaleRavesDB";
const POSTS_COLLECTION = "posts";
const USERS_COLLECTION = "users";

// for Express to talk to Mongo, we need a client
// this client is for nodejs

// require("mongodb") returns an Object with many key/value pairs, we are only interested in MongoClient
 const MongoClient = require("mongodb").MongoClient;

 // MongoClient.connect is async, so seeing as we await it, the connect function needs to be async
async function connect(uri, dbName){
    // in order to connect to MongoDB, we need two pieces of information:
    // 1. a connection string
    // 2. a configuration object - in summary, this simplifies our access to MongoDB
    const client = await MongoClient.connect(uri, {"useUnifiedTopology": true});
    const db = client.db(dbName);
    return db;
}


// main has to be an async function. we only want the routes to load once we are connected to the database
async function main(){
    // mongo db to connect to, HAVE TO AWAIT
    const db = await connect(mongoURI, DATABASE);

    // sanity test to see that our server works
    // first route, the home page

    // if we are doing await in app.get, the function needs to be an async function
    app.get("/", async function(req,res){
        // send any data to the server
        //res.send("YOOOOOooooo");
        console.log("req received");
        // select the first 3 documents
        // equivalent: db.posts.find({}).limit(3)
        // will take a while because it's an async function
        const listings = await db.collection(USERS_COLLECTION)
        .find({})
        .limit(20 )
        .toArray();

        // console log the listings to ensure that it works
        console.log(listings);
        res.send(listings);
    })

    // async can be an ARROW FUNCTION
    app.post("/", async (req, res) => {
        console.log("req received")
        console.log("Req.body: " + req.body);
        // what must the document have? adding a new post test...
        // if req.body doesn't have a username
        if (!req.body.username){
            // error 400
            res.status(400);
            res.json({
                "Error": "Please provide a username!"
            });
            // end the function, skip the rest of the code.
            return;
        }   

        try{
            // this inserts one  document to the database!
            const result = await db.collection(USERS_COLLECTION).insertOne({
                // when posting the request, you have to get the values from the post request's body itself, not from this app.
                // ex. req.body.username would be "username: <value>" in the request's body.
                "username": req.body.username,
                "email": req.body.email,
                "favoriteCard": req.body.favoriteCard
            });
            res.status(200);
            // send to the response body
            //res.send(result);
            res.json({result:result})
            console.log("Request sent!");
            
        } catch (e){
            res.status(503);
            res.send({
                error: "Internal server error. Please contact Haikal."
            });
            console.log(e);
        }
    });

    // NEW APP.GET
    app.get("/filtering", (req,res) => {
        res.send("Filter yay");
        console.log("Req query: " + req.query);
        // this will log if the query string (anything after ? in the url) has an email key value pair (e.g. "<url>/?email=<email value>") logs email value
        console.log(req.query.email);
    });
}

// call main before listening
main();


//  we can write listen first, so that we can ensure the route goes before
app.listen(PORT, function(){
    console.log(`Server has started at http://localhost:${PORT}`);
})