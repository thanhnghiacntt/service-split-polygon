'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const turf = require('@turf/turf');
const app = express();
const polylabel = require('./polylabel');
const convertFeature = require("./process");
const log = require('./log');
const fs = require('fs');
app.use(bodyParser.urlencoded({
    extended: true
}));
// parse application/json
app.use(bodyParser.json({
    limit: '50mb'
}));


app.post('/', (req, res) => {    
    var geojson = req.body;
    try{
        var features = geojson.features;
        var rs = {
            "type": "FeatureCollection",
            "features": []
        };
        features.forEach(f =>{
            var list = convertFeature(f);
            list.forEach(v => {
                rs.features.push(v);
            });
        });
        res.json(rs)
    }catch (e) {
        log.info(e);
        log.info(JSON.stringify(geojson));
        console.error(e);
        res.json(null);
    };
});
app.post('/feature', (req, res) => {
    var inputFeature = req.body;
    try {
        var features = convertFeature(inputFeature);
        var geojson = {
            "type": "FeatureCollection",
            "features": []
        };
        features.forEach((e) => {
            e.properties = inputFeature.properties;
            geojson.features.push(e)
        });
        console.log("Response Ok");
        res.json(geojson);
    } catch (e) {
        log.info(e);
        log.info(JSON.stringify(geojson));
        console.error(e);
        res.json(null);
    }
});
app.post('/center', (req, res) => {
    var inputFeature = req.body;
    try {
        var polygon = null;
        var hasReponse = false;
        if(inputFeature.geometry.type == "Polygon"){
            polygon = inputFeature.geometry.coordinates;
        }else if(inputFeature.geometry.type == "MultiPolygon"){
            polygon = inputFeature.geometry.coordinates[0];
        }
        if(polygon != null){
            var p = polylabel(polygon, 0.0000001, false);
            if(p.length >= 2){
                hasReponse = true;
                console.log(p);
                res.json({"lng":p[0], "lat":p[1]});
            }
        }
        if(!hasReponse){
            res.json({"error":"Không tìm được"});
        }
    } catch (e) {
        console.log(inputFeature);
        res.json(null);
    }
});

app.listen(process.env.PORT || 8888, () => console.log(`App listening on port ${process.env.PORT || 8888}!`))
