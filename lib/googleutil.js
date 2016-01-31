'use strict';

let https = require('https');

let fns = {};
let API_KEY = process.env['GOOGLE_PLACES_API_KEY'];

//helpers........



//locatorifying of google search results

let replaceWithLocatorKeys = (obj)=>{
    let string = JSON.stringify(obj);
    let replaced = string.replace('name','title'); //this is for the location title

    return JSON.parse(replaced);

};

let googleQuery = (googleURL) => {

        https.get(googleURL, (res,answer) => {

        res.setEncoding('utf8');
        console.log('statusCode: ', res.statusCode);

        res.on('data', (data) => {
            answer += data;
        });

        res.on('end', function () {
            console.log('finish query');
        });
        res.on('error', (err) => {//TODO: error handling, also when wrong status code
            console.log('Got error: ' + err.message);
        });
            console.log(answer);

            //replaceWithLocatorKeys(data);
    });

};

//routes........

//additionally to our locations we search google
fns.searchNearbyPlaces = (request) =>{
    let lat = request.params.lat;
    let long = request.params.long;
    let radius = request.params.maxDistance;

    let googleURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?&location='+lat+','+long+'&radius='+radius+'&key='+API_KEY;
    console.log(googleURL); //so jshint is happy
    //TODO: search, strip,locatorify, send back

};

//cityname and id for coordinates
fns.findNameOfPosition = (request)=>{
    let lat = request.params.lat;
    let long = request.params.long;

    let googleURL = 'https://maps.googleapis.com/maps/api/place/radarsearch/json?location='+lat+','+long+'&radius=100&key='+API_KEY;


    //TODO: search, take first location id, do a place detail request,

    let allLoc = googleQuery(googleURL);
    let al = allLoc[0];
    let placeID = al.place_id;
    let placeURL = 'https://maps.googleapis.com/maps/api/place/details/json?placeid='+placeID+'&key='+API_KEY;
console.log(placeURL);
 /*   let results = query(placeURL);
    let complete = replaceWithLocatorKeys(results);

    //TODO: get from "address-components" the fourth and the fifth "long-name" and return
    let city = {'title': complete.title,
                'place_id': placeID
    };

    return city;*/

};

//titlesearch for extra locations
fns.findByTitle = (request) =>{

    let text = request.params.locationName;
    let lat = request.params.lat;
    let long = request.params.long;

    let googleURL = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query='+text+'&key='+API_KEY+'&location='+lat+','+long+'&radius=100';
    console.log('util '+googleQuery(googleURL));
    //return googleQuery(googleURL);
};






module.exports = fns;
