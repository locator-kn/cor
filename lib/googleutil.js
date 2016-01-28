'use strict';

var https = require('https');

let fns = {};
let API_KEY = process.env['GOOGLE_PLACES_API_KEY'];

//TODO:fns.searchNearbyPlaces

//TODO: fns.findNameOfPosition



//answer: returns an array in locator-format
fns.findByTitle = (request) =>{

    let text = request.params.locationName;
   // let lat = request.params.lat;
   // let long = request.params.long;


    let answer = [];
    let lat = 47.647096;
    let long = 9.173318;
    let googleURL = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query='+text+'&key='+API_KEY+'&location='+lat+','+long+'&radius=100';

    https.get(googleURL, (res) => {
        res.setEncoding('utf8');
        console.log('statusCode: ', res.statusCode);

        res.on('data', (data) => {
            answer.push(data);
        });

        res.on('end',function(){

            //for all with index >5 remove
            answer.forEach(function (item, index) {
                if (index > 4){
                    answer.splice(index);
                }
            });
            console.log(answer);
         return answer;

        });
    }).on('error', (err) => {//TODO: error handling, also when wrong status code
        console.log('Got error: ' + err.message);
    });

};


module.exports = fns;
