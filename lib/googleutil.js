'use strict';

let Wreck = require('wreck');

let fns = {};
let API_KEY = process.env['GOOGLE_PLACES_API_KEY'];


//additionally to our locations we search google
fns.searchNearbyPlaces = (request, reply) => {
    let lat = request.params.lat;
    let long = request.params.long;
    let radius = request.params.maxDistance;

    let googleURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?&location=' + lat + ',' + long + '&radius=' + radius + '&key=' + API_KEY;

    Wreck.get(googleURL, {json: true}, (err, res, payload) => {
        if (err) {
            console.log('nearby error');
            reply([]);
        }
        let googleArr = [];

        payload.results.forEach(location => {
            googleArr.push({
                '_id': location.place_id,
                'title': location.name,
                'geotag': {
                    'type': 'Point',
                    'coordinates': [
                        location.geometry.location.lat,
                        location.geometry.location.lng
                    ]
                }
            });
        });

        reply(googleArr);
    });
};

//cityname and id for coordinates
fns.findNameOfPosition = (long, lat)=> {
    return new Promise((resolve, reject) => {
        // let googleURL = 'https://maps.googleapis.com/maps/api/place/radarsearch/json?location=' + lat + ',' + long + '&radius=100&key=' + API_KEY;
        let googleURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?&location=' + lat + ',' + long + '&radius=100&key=' + API_KEY;


        Wreck.get(googleURL, {json: true}, (err, res, payload) => {
            if (err) {
                console.log('cityname search error');
                reject(err);
                return {};
            }

            let placeId = payload.results[0].place_id;

            let placeURL = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=' + placeId + '&key=' + API_KEY;

            Wreck.get(placeURL, {json: true}, (err, res, payload) => {
                if (err) {
                    console.log('cityname details error');
                    resolve({
                        'title': '',
                        'place_id': ''
                    });
                }
                let city = {
                    'title': payload.result.address_components[1].long_name,
                    'place_id': payload.result.place_id
                };

                resolve(city);

            });
        });
    });

};


//titlesearch for extra locations
fns.findByTitle = (request) => {

    return new Promise((resolve, reject) => {


        let text = request.params.locationName;
        let lat = request.params.lat;
        let long = request.params.long;

        let googleURL = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + text + '&key=' + API_KEY + '&location=' + lat + ',' + long + '&radius=100';

        Wreck.get(googleURL, {json: true}, (err, res, payload) => {
            if (err) {
                return reject(err);
            }
            let googleArr = [];

            let counter = 5; //only 5 results needed
            payload.results.forEach(location => {
                if (counter > 0) {
                    counter--;
                }
                else {
                    return googleArr;
                }
                googleArr.push({
                    '_id': location.place_id,
                    'title': location.name,
                    'geotag': {
                        'type': 'Point',
                        'coordinates': [
                            location.geometry.location.lat,
                            location.geometry.location.lng
                        ]
                    }
                });
            });

            resolve(googleArr);
        });

    });
};


module.exports = fns;