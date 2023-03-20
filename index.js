// set up express and app
const { json } = require("express");
const express = require("express");
// require the env file, in order to safely retrieve the MongoDB URI. need to specify the path of the file, otherwise
// will return undefined! require dotenv just finds a file called '.env' by default.
require('dotenv').config();
// import ObjectID so that we can use it for mongo documents.
const {ObjectId} = require("mongodb");
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
    app.post("/user", async (req, res) => {
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

    // for posting a new comment, you need to create a new ObjectId()
    // for posting to an embedded field, you do a POST request, updateOne, and then $push with the req body being the innermost params
    // POST request to the posts collection
    app.post("/post", async () =>{
        console.log("POST request received");
            if (!req.body.name){
                // error 400
                res.status(400);
                res.json({
                    "Error": "Please provide a post name!"
                });
                // end the function, skip the rest of the code.
                return;
            }

            let deckList;
            // find all of the cards first
            try{
                // find decks
            } catch (e) {
                                res.status(503);
                res.send({
                    error: "Internal server error. Please contact Haikal."
                });
                console.log(e);
            }

            try{
            // insert a new document to the posts collection
            const result = await db.collection(POSTS_COLLECTION).insertOne({
                // all of the params for the post document

                // get all the cards first and then insert it into the deck, be flexible in thinking process
                "name": req.body.name,
                "deck": deckList,//this should be an array at the end of the day find all the carsd based on the ID yo uinsert
                // array of objects of cards,
                "postInfo": {
                    "overview": req.body.overview
                }

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


    // Filtering. Filter by deck to test archetype I guess, need to test on the posts collection
    app.get("/search", async (req,res) => {
        console.log("Req query: " + req.query);
        // this will log if the query string (anything after ? in the url) has an email key value pair (e.g. "<url>/?email=<email value>") logs email value
        // console.log(req.query.email);

        let listings;
        // if statement to validate if the user wants to search by a query, check if our specific query string is undefined first (archetype), if not then they are searching
        if (req.query.archetype === undefined){
            // if there is no search, just retrieve everything
            console.log("query.archetype is undefined");
            listings = await db.collection(POSTS_COLLECTION)
                            .find({})
                            .toArray();
        } else {
            // otherwise, filter
            // create the empty filter object, will be updated based on the query string
            console.log("query archetype is not undefined");
            // req.query.archetype first character always defaults to lowercase by default.
            console.log(req.query.archetype);
            const filter = {};
            // convert the query first char to uppercase, then slice the String from index 1 to the end to concat together
            upperArchetype = req.query.archetype.charAt(0).toUpperCase() + req.query.archetype.slice(1);
            console.log(upperArchetype);
            filter.archetype = upperArchetype;
            console.log(filter.archetype);
            listings = await db.collection(POSTS_COLLECTION)
                            .find(filter)
                            .toArray();
        }

        res.status(200);
        res.json({listings});
    });

    // PUT replaces one existing resource with an ENTIRELY NEW RESOURCE
    // when writing in the URL, just put the ID, no need for a colon
    app.put("/user/:_id", async (req, res) => {
        const userID = req.params._id;

        const response = await db.collection(USERS_COLLECTION)
                               .updateOne({
                                    // the id of the document to be updated
                                    "_id": new ObjectId(userID)
                               }, {
                                // $set updates in mongoDB
                                // update each parameter with the body parameters.
                                "$set": {
                                    "username": req.body.username,
                                    "email": req.body.email,
                                    "favoriteCard": req.body.favoriteCard
                                    // if you don't want to change it, you can send back the OG. everything needs to be written for put,
                                    // since it is updating it completely by replacing with new data.
                                }
                               });
        res.status(200);
        res.json(response);

        // works! just remember to do content-type: Application/json, and raw in body in postman!
    });

    // now for the final part of CRUD functionality - D - delete.
    app.delete("/deletion/:_id", async (req, res) => {
        console.log("delete request received!");
        const userID = req.params._id;

        const response = await db.collection(USERS_COLLECTION)
                                .deleteOne({
                                    // the ID of the document to be deleted
                                    "_id": new ObjectId(userID)
                                });
        res.status(200);
        res.json({
            "status": "okay",
            "result": response
        });    
    });
}

// call main before listening
main();


//  we can write listen first, so that we can ensure every route goes before listening.
app.listen(PORT, function(){
    console.log(`Server has started at http://localhost:${PORT}`);
})