'use strict';

let https = require('https');

let fns = {};
let API_KEY = process.env['GOOGLE_PLACES_API_KEY'];

//helpers........




let replaceWithLocatorKeys = (obj,replaced)=>{
    let string = JSON.stringify(obj);
     replaced = string.replace("name","title"); //because of difference between google and locator params
    console.log(JSON.parse(replaced));

};

let googleQuery = (googleURL, callback) => {

    https.get(googleURL, (res,answer) => {

        res.setEncoding('utf8');
        console.log('statusCode: ', res.statusCode);

        res.on('data', (data) => {
            answer += data;
        });

        res.on('end', function () {
            callback(null, answer);
        });
        res.on('error', (err) => {//TODO: error handling, also when wrong status code
            console.log('Got error: ' + err.message);
            callback(err);
        });
    });

};

//routes........

//additionally to our locations we search google
fns.searchNearbyPlaces = (request) =>{
    let lat = request.params.lat;
    let long = request.params.long;
    let radius = request.params.maxDistance;

    let googleURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?&location='+lat+','+long+'&radius='+radius+'&key='+API_KEY;

    //TODO: search, strip,locatorify, send back


};

//cityname and id for coordinates
fns.findNameOfPosition = (request,reply)=>{
    let lat = request.params.lat;
    let long = request.params.long;

    let googleURL = 'https://maps.googleapis.com/maps/api/place/radarsearch/json?location='+lat+','+long+'&radius=100&key='+API_KEY;


    googleQuery(googleURL, (err,result) => {
        if (err) {
            // do some error handling
            console.log('position error');
        }
        // do something with result
        //TODO: take first location id, do a place detail request,

    });



    //TODO: get from "address-components" the fourth and the fifth "long-name" and return
    /*let city = {'title': complete.title,
                'place_id': placeID
    };*/


};

//titlesearch for extra locations
fns.findByTitle = (request,reply) =>{

    let text = request.params.locationName;
    let lat = request.params.lat;
    let long = request.params.long;

    let googleURL = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query='+text+'&key='+API_KEY+'&location='+lat+','+long+'&radius=100';

    googleQuery(googleURL, (err,result) => {
        if (err) {
            //TODO:error handling
            console.log('title error');
        }

     //TODO: break google result into separate json objects

        reply(result);
    });
};






module.exports = fns;
