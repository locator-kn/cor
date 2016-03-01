'use strict';

let Wreck = require('wreck');

let fns = {};
let API_KEY = process.env['GOOGLE_PLACES_API_KEY'];
let OSM_KEY = process.env['OSM_API_KEY'];
const logger = require('ms-utilities').logger;


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

                // DIRTY HACK START
                let idx = payload.result.address_components.length > 1 ? 1 : 0;

                let city = {
                    'title': payload.result.address_components[idx].long_name,
                    'place_id': payload.result.place_id
                };

                resolve(city);

            });
        });
    });

};

//reverse search to openstreetmap
fns.findNameOfPosition2 = (long, lat) => {

    long = '9.1415';
    lat = '46.6739';

    return new Promise((resolve, reject) => {
       let mapURL = 'http://open.mapquestapi.com/nominatim/v1/reverse.php?key='+OSM_KEY+'&format=json&lat='+lat+'&lon='+long;
        Wreck.get(mapURL, {json: true}, (err, res, payload) => {
            if (err) {
                console.log('cityname search error');
                reject(err);
                return {};
            }
            let place = payload.address;
console.log(place)
            let cityname;

            if (place.hasOwnProperty('city')) {
                cityname = place.city;
            }
            else if (place.hasOwnProperty('town')) {
                cityname = place.town;
            }
            else if (place.hasOwnProperty('village')) {
                cityname = place.village;
            }
            else {
                cityname = '';
            }
            resolve({
                'title': cityname,
                'place_id': payload.place_id
            });
        });
    });
};

fns.locationSearch = (text, lat, long) => {
    return new Promise((resolve) => {

        let googleURL;
        let radius = 100;

        if (text) {
            googleURL = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + text + '&key=' + API_KEY + '&location=' + lat + ',' + long + '&radius=1000';
        }
        else {
            googleURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?&location=' + lat + ',' + long + '&radius=' + radius + '&key=' + API_KEY;
        }

        Wreck.get(googleURL, {json: true}, (err, res, payload) => {
            if (err) {
                resolve([]);
                logger.warn(err);
                return;
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
