'use strict';

var https = require('https');

let fns = {};
let API_KEY = 'AIzaSyDQK59R5egP9FTKiUtm8IotuOr_HQ33Odw';

//TODO:fns.searchNearbyPlaces


//search: will need search term and location (lat/long)
//answer: returns an array in locator-format
fns.findByTitle = (search) =>{

 /*   let text = search.text;
    let lat = search.loc.lat;
    let long = search.loc.long;
*/
    let text = 'hotel';
    let lat = 47.647096;
    let long = 9.173318;
    let googleURL = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query='+text+'&key='+API_KEY+'&location='+lat+','+long+'&radius=100';

    https.get(googleURL, (res) => {
        res.on("data", function(chunk) {
            console.log("BODY: " + chunk);
        });
        res.resume();
    }).on('error', (e) => {
        console.log("Got error: " + e.message);
    });

   // return answer;


};


module.exports = fns;
