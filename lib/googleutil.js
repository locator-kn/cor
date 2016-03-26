'use strict';

let Wreck = require('wreck');
let GeoPoint = require('geopoint');
const boom = require('boom');

let fns = {};
let API_KEY = process.env['GOOGLE_PLACES_API_KEY'];
let OSM_KEY = process.env['OSM_API_KEY'];
const logger = require('ms-utilities').logger;

let distanceCheck = (lat1, lat2, long1, long2) => {
    let p1 = new GeoPoint(lat1, long1);
    let p2 = new GeoPoint(lat2, long2);
    return p1.distanceTo(p2, true);
};


//reverse search to google (only use if openstreetmap fails)
fns.findNameOfPosition = (long, lat)=> {
    return new Promise((resolve, reject) => {

        let googleURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?&location=' + lat + ',' + long + '&radius=100&key=' + API_KEY;


        Wreck.get(googleURL, {json: true}, (err, res, payload) => {
            if (err) {
                console.log('cityname search error');
                return reject(err);
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

    return new Promise((resolve, reject) => {
        let mapURL = 'http://open.mapquestapi.com/nominatim/v1/reverse.php?key=' + OSM_KEY + '&format=json&lat=' + lat + '&lon=' + long;
        Wreck.get(mapURL, {json: true}, (err, res, payload) => {
            if (err) {
                console.log('cityname search error');
                return reject(err);
            }

            if (payload.hasOwnProperty('error') || !payload.hasOwnProperty('address')) {
                console.log('cityname search error');
                return reject(boom.badRequest());
            }

            let place = payload.address;

            let cityname = place.city || place.town || place.village || place.county || place.state || place.country || 'Unknown';

            resolve({
                'title': cityname,
                'place_id': payload.place_id  //OSM id!!!
            });
        });
    });
};

fns.locationSearch = (text, lat, long) => {
    return new Promise((resolve) => {

        let googleURL;
        let radius = 200;//Meter

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
                let d = distanceCheck(lat, location.geometry.location.lat, long, location.geometry.location.lng);

                if (counter > 0) {
                    counter--;
                }
                else {
                    return googleArr;
                }
                if (d < 100) { //Kilometer
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
                        }
                    );
                }
            });

            resolve(googleArr);
        });

    });
};


module.exports = fns;
