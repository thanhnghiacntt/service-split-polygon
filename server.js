'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const polylabel = require('./polylabel');
const convertFeature = require("./process");
const log = require('./log');
const port = 8888;

/**
 * Sử dụng encode
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**
 * Sử dụng parser json tối đa là 50MB
 */
app.use(bodyParser.json({
    limit: '50mb'
}));

/**
 * Chia polygon hoặc multipolygon thành các vùng nhỏ một cách tự động
 */
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
    } catch (e) {
        log(e);
        log(JSON.stringify(geojson));
        console.error(e);
        res.json(null);
    };
});

/**
 * Split multipolygon sang từng polygon
 */
app.post('/split', (req, res) => {    
    var geojson = req.body;
    try{
        var features = geojson.features;
        var rs = {
            "type": "FeatureCollection",
            "features": []
        };
        features.forEach(f =>{
            if(f.geometry.type == "MultiPolygon"){
                f.geometry.coordinates.forEach(e => {
                    var feature = {
                        "type": "Feature",
                        "properties": f.properties,
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": e
                        }
                    }
                    rs.features.push(feature);
                });
            }else{
                rs.features.push(f);
            }
        });
        res.json(rs)
    } catch (e) {
        log(e);
        log(JSON.stringify(geojson));
        console.error(e);
        res.json(null);
    };
});

/**
 * Chia feature chưa polygon thành những vùng nhỏ
 */
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
        log(e);
        log(JSON.stringify(geojson));
        console.error(e);
        res.json(null);
    }
});

/**
 * Tìm điểm ở giữa polygon hoặc multipolygon
 */
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

/**
 * App lắng nghe port từ môi trường, nếu không thì sẽ mặt định port 8888
 */
app.listen(process.env.PORT || port, () => console.log(`App listening on port ${process.env.PORT || port}!`))
