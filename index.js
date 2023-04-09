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

// need cors for Cross-Origin Resource Sharing, required to make requests for the API, for linking React to API
// npm install cors required to link
const cors = require("cors");

// also remember to npm install axios in React

// app.use
app.use(express.json());
app.use(cors());

// retrieve URI (sensitive info) from .env file
const mongoURI = process.env.MONGO_URI;
// the database will be the main database to access
const DATABASE = "RoyaleRavesDB";
const POSTS_COLLECTION = "posts";
const USERS_COLLECTION = "users";
const CARDS_COLLECTION = "cards";

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

    // async can be an ARROW FUNCTION
    // for adding a new user
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

    // card IDs can't be posted in as a route parameter, should be part of the request's body

    // POST Endpoint to create a new post in the posts collection
    app.post("/posts", async (req, res) => {
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

            // pass in the cards as an array, as part of the request's body
            console.log("Req.body.cards info");
            console.log(typeof(req.body.cards));
            console.log(req.body.cards);

            // create an empty array first, will push to this based on cards found from the query.
            const deckCards = [];

            // initialize as 0 so that JavaScript recognizes as an integer
            let totalDeckElixirCost = 0;
            // initialize empty array that will be populated later
            let deckElixirAggregate = [];

            const cardsFilter = {};

            // search by ID through the entire array, iterate through
            for (let cardID of req.body.cards){
                console.log("card ID: " + cardID);
                // create a new ObjectID for the ID to be searched in the database
                cardsFilter._id = new ObjectId(cardID);
                try {
                    // find by the ID
                    const listings = await db.collection(CARDS_COLLECTION)
                    .find(cardsFilter)
                    .toArray();
                    // test that this works first
                    console.log("listings: " + JSON.stringify(listings));
                    
                    // now, logic for adding to deckCards[] array and aggregating elixir info

                    // push card info to deckCards array
                    deckCards.push({
                        "cardName": listings[0].cardInfo.name, // card name in listings, cardInfo.name
                        "description": listings[0].cardInfo.description, // description in listings, cardInfo.description
                        "cardURL": listings[0].cardURL, // url in listings, listings.cardURL
                        "cardID": cardID
                    });

                    // for adding to elixir variables
                    const cardElixirCost = listings[0].cardInfo.elixirCost;

                    totalDeckElixirCost += cardElixirCost;
                    deckElixirAggregate.push(cardElixirCost);

                } catch (e) {
                    res.status(503);
                    res.send({
                        error: "Internal server error. Please contact Haikal."
                    });
                }
            }

            console.log("Logging information...");
            console.log(deckCards[0]);
            console.log(deckCards[1]);
            console.log(deckCards[2]);
            console.log(deckCards[3]);
            console.log(deckCards[4]);
            console.log(deckCards[5]);
            console.log(deckCards[6]);
            console.log(deckCards[7]);
            console.log("Total deck elixir cost: " + totalDeckElixirCost);
            console.log("Deck elixir aggregate array: " + deckElixirAggregate);

            // test

                

            // ultimately, deck will be an object. contains the array of cards and calculated elixir values

            const deck = {
                // cards will be an array of 8 objects
                "cards": deckCards,
                // average cost is the cost of 1 card, deck of 8 so divide by 8
                "averageCost": (totalDeckElixirCost / 8),
                "fourCardCycle": 7
            };

            // comments is also an array of objects, empty array first
            const comments = []

            try{
                // insert a new document to the posts collection
                const result = await db.collection(POSTS_COLLECTION).insertOne({
                    // all of the params for the post document

                    // get all the cards first and then insert it into the deck, be flexible in thinking process
                    "name": req.body.name,
                    "userThatPosted": req.body.userThatPosted,
                    "dateOfCreation": req.body.date,
                    "dateOfUpdation": null,
                    "deck": deck,//this should be an array at the end of the day find all the cards based on the ID you insert
                    // (array of objects of cards.)
                    "archetype": req.body.archetype,
                    "postInfo": {
                        "overview": req.body.overview,
                        "strategy": req.body.strategy,
                        "rating": parseInt(req.body.rating),
                        "difficultyLevel": parseInt(req.body.difficultyLevel)
                    },
                    "comments": comments
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

    // updating the post
    app.put("/posts/:post_id", async (req, res) => {
        console.log("received post request for updating a post!");

           // pass in the cards as an array, as part of the request's body, same as the post request
           console.log("Req.body.cards info");
           console.log(typeof(req.body.cards));
           console.log(req.body.cards);

           // create an empty array first, will push to this based on cards found from the query.
           const deckCards = [];

           // initialize as 0 so that JavaScript recognizes as an integer
           let totalDeckElixirCost = 0;
           // initialize empty array that will be populated later
           let deckElixirAggregate = [];

           const cardsFilter = {};

           // search by ID through the entire array, iterate through
           for (let cardID of req.body.cards){
               console.log("card ID: " + cardID);
               // create a new ObjectID for the ID to be searched in the database
               cardsFilter._id = new ObjectId(cardID);
               try {
                   // find by the ID
                   const listings = await db.collection(CARDS_COLLECTION)
                   .find(cardsFilter)
                   .toArray();
                   // test that this works first
                   console.log("listings: " + JSON.stringify(listings));
                   
                   // now, logic for adding to deckCards[] array and aggregating elixir info

                   // push card info to deckCards array
                   deckCards.push({
                       "cardName": listings[0].cardInfo.name, // card name in listings, cardInfo.name
                       "description": listings[0].cardInfo.description, // description in listings, cardInfo.description
                       "cardURL": listings[0].cardURL, // url in listings, listings.cardURL
                       "cardID": cardID
                   });

                   // for adding to elixir variables
                   const cardElixirCost = listings[0].cardInfo.elixirCost;

                   totalDeckElixirCost += cardElixirCost;
                   deckElixirAggregate.push(cardElixirCost);

               } catch (e) {
                   res.status(503);
                   res.send({
                       error: "Internal server error. Please contact Haikal."
                   });
               }
           }

           console.log("Logging information...");
           console.log(deckCards[0]);
           console.log(deckCards[1]);
           console.log(deckCards[2]);
           console.log(deckCards[3]);
           console.log(deckCards[4]);
           console.log(deckCards[5]);
           console.log(deckCards[6]);
           console.log(deckCards[7]);
           console.log("Total deck elixir cost: " + totalDeckElixirCost);
           console.log("Deck elixir aggregate array: " + deckElixirAggregate);

           // test

               

           // ultimately, deck will be an object. contains the array of cards and calculated elixir values

           const deck = {
               // cards will be an array of 8 objects
               "cards": deckCards,
               // average cost is the cost of 1 card, deck of 8 so divide by 8
               "averageCost": (totalDeckElixirCost / 8),
               "fourCardCycle": 7
           };

        const result = await db.collection(POSTS_COLLECTION).updateOne({
            // id of the post
            "_id": new ObjectId(req.params.post_id)
        }, {
            "$set": {
                "name": req.body.name,
                "dateOfUpdation": req.body.date,
                // "deck": deck,//this should be an array at the end of the day find all the cards based on the ID you insert
                // (array of objects of cards.) // do this later i guess
                // deck time
                "deck": deck,
                "archetype": req.body.archetype,
                "postInfo": {
                    "overview": req.body.overview,
                    "strategy": req.body.strategy,
                    "rating": req.body.rating,
                    "difficultyLevel": req.body.difficultyLevel
                },
            }
        });

        // res.json once update one is done
        res.json({
            "results": result
        });
    });

    // GET endpoint to retrieve all existing posts.
    // Also implemented: search engine, which will filter according to the query string.
    // If search engine criteria is empty, return back every post in the collection.
    app.get("/posts", async (req, res) => {
        console.log("GET request to retrieve posts received!");

        // Search engine

        // 1. define an empty object to contain all the criteria that will be utilized to search
        const searchCriteria = {};

        // 2. criteria

        // if each parameter exists in the query string, add it to the search criteria.

        if (req.query.name){
            // this MongoDB Regular Expression utilizes $options:"i" to perform a case-insensitive search.
            // further reference: https://www.mongodb.com/docs/manual/reference/operator/query/regex/
            // this looks to just include anything from the name, which is really useful!
            searchCriteria['name'] = {$regex: req.query.name, $options:"i"};
        }

        if (req.query.archetype && req.query.archetype.replace(/\s/g, '').length){
            console.log("There is an req.query.archetype, and it is " + req.query.archetype);
            // convert the first character in the string to uppercase, and then slice the remainder of the string, starting from index 1 till the end.
            // just another fun way to ensure that the final result from the query is uppercase, since archetypes in the database are stored with capitalization.
            // trim any archetype trailing spaces

            // so the issue is that leaving archetype blank results in it breaking, because there are no archetypes in the database that have a blank space.
            // solution should be fixed now! with the regex to check for empty spaces, ensure that it isn't empty spaces only
            searchCriteria['archetype'] = req.query.archetype.charAt(0).toUpperCase() + req.query.archetype.slice(1).trim();
        }

        // rating search will be ascending (greater than or equal to); users would likely want a specified rating or higher
        if (req.query.minRating) {
            console.log("There is a minimum rating specified. AND IT IS");
            console.log(req.query.minRating);
            // access the embedded field rating within the field postInfo, no need for the $ positional operator here.
            if (!searchCriteria['postInfo.rating']) {
              searchCriteria['postInfo.rating'] = {};
            }
            searchCriteria['postInfo.rating']['$gte'] = parseInt(req.query.minRating);
          }
          
                  // max difficulty will be descending (less than or equal to); users would likely want a specified max. difficulty ceiling
          if (req.query.maxDifficulty) {
            console.log("maximum difficulty: " + req.query.maxDifficulty);
            if (!searchCriteria['postInfo.difficultyLevel']) {
              searchCriteria['postInfo.difficultyLevel'] = {};
            }
            searchCriteria['postInfo.difficultyLevel']['$lte'] = parseInt(req.query.maxDifficulty);
          }

        // 3. return the listings 
        // when using .find(searchCriteria), do not put an extra pair of curly braces {}, it returns an empty result because it is incorrect.

        // serachCriteria should be an empty object if there isn't a query string; aka this route can still work
        // to retrieve all posts, if no criteria was specified.
        console.log(searchCriteria);

        const listings = await db.collection(POSTS_COLLECTION)
                         .find(searchCriteria)
                         .toArray();
        
        console.log("Listings:");
        console.log(listings);
        console.log("Number of listings found: " + listings.length);

        res.status(200);
        res.json({listings});
    });

    // DELETE endpoint to delete an existing post.
    app.delete("/posts/:post_id", async (req, res) => {
        console.log("Delete request received!");
        const postID = req.params.post_id;

        const response = await db.collection(POSTS_COLLECTION)
                                .deleteOne({
                                    // the ID of the document to be deleted
                                    "_id": new ObjectId(postID)
                                });
        res.status(200);
        res.json({
            "status": "okay",
            "result": response
        });    
    })

    // get all cards
    app.get("/cards", async (req, res) => {
        
        const listings = await db.collection(CARDS_COLLECTION)
                        // find all documents
                         .find({})
                         .toArray();
        
        console.log("Total card listings:");
        console.log(listings);
        console.log("Number of listings found: " + listings.length);

        res.status(200);
        res.json({listings});
    });
}

// call main before listening
main();


//  we can write the code for listen first, so that we can ensure every route goes before listening.
// include listen at the very end of everything
app.listen(process.env.PORT || 3000, function(){
    console.log(`Server has started at http://localhost:${PORT}`);
});