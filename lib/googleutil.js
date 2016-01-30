'use strict';

var https = require('https');

let fns = {};
let API_KEY = process.env['GOOGLE_PLACES_API_KEY'];

//helpers........



//TODO: locatorifying of google search results

let replaceWithLocatorKeys = (obj)=>{
    let string = JSON.stringify(obj);
    let replaced = string.replace('name','title'); //this is for the location title

    return JSON.parse(replaced);

};

let query = https.get(googleURL, (res) => {
    let answer = [];
    res.setEncoding('utf8');
    console.log('statusCode: ', res.statusCode);

    res.on('data', (data) => {
       // replaceWithLocatorKeys(answer);
        answer.push(replaceWithLocatorKeys(data));
       // answer.push(data);
    });

    res.on('end',function(){

        return answer;

    });

    }).on('error', (err) => {//TODO: error handling, also when wrong status code
    throw new Error(err.message);
});


//routes........

fns.searchNearbyPlaces = (request) =>{
    let lat = request.params.lat;
    let long = request.params.long;
    let radius = request.params.maxDistance;

    let googleURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?&location='+lat+','+long+'&radius='+radius+'&key='+API_KEY;
    console.log(googleURL); //so jshint is happy
    //TODO: search, strip,locatorify, send back

};

fns.findNameOfPosition = (request)=>{
    let lat = request.params.lat;
    let long = request.params.long;

    let googleURL = 'https://maps.googleapis.com/maps/api/place/radarsearch/json?location='+lat+','+long+'&radius=100&key='+API_KEY;
    console.log(googleURL); //so jshint is happy
    //TODO: search, take first location id, do a place detail request,

  //  let placeURL = 'https://maps.googleapis.com/maps/api/place/details/json?placeid='+placeID+'&key='+API_KEY;

    //TODO: get from "address-components" the fourth and the fifth "long-name" and return


};


//answer: returns an array in locator-format
fns.findByTitle = (request) =>{

    let text = request.params.locationName;
    let lat = request.params.lat;
    let long = request.params.long;


    let answer = [];

    let googleURL = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query='+text+'&key='+API_KEY+'&location='+lat+','+long+'&radius=100';

    https.get(googleURL, (res) => {
        res.setEncoding('utf8');
        console.log('statusCode: ', res.statusCode);

        res.on('data', (data) => {
            answer.push(data);
        });

        res.on('end',function(){

            //for all with index >4 remove because we don't need so much
            answer.forEach(function (item, index) {
                if (index > 4){
                    answer.splice(index);
                }
            });

            replaceWithLocatorKeys(answer);
         return answer;

        });
    }).on('error', (err) => {//TODO: error handling, also when wrong status code
        console.log('Got error: ' + err.message);
    }).on('success',() =>{
        console.log(answer);
    });

};






module.exports = fns;
