'use strict';

const turf = require('@turf/turf');

module.exports = createListFeature;
module.exports.default = createListFeature;

/**
 * Tạo list các feature và split
 * @param {Feature} inputFeature 
 * @returns 
 */
function createListFeature(inputFeature){
    if(inputFeature.geometry.type == "MultiPolygon"){
        var list = [];
        var temp = splitMultiPolygonToFeatures(inputFeature);
        temp.forEach(f => {
            var v = processPolygon(f);
            v.forEach(x => {
                list.push(x);
            });
        });
        return list;
    }
    else if(inputFeature.geometry.type == "Polygon"){
        return processPolygon(inputFeature);
    }
}

/**
 * Tìm chiều dài của polygon
 * @param {Polygon} polygon 
 * @returns number
 */
function length(polygon){
    var length = 0;
    polygon.forEach(x => {
        x.forEach(r => {
            length += r.length;
        })
    });
    return length;
}

/**
 * Split multi polygon ra những features
 * @param {Feature} inputFeature 
 * @returns 
 */
function splitMultiPolygonToFeatures(inputFeature){
    if(inputFeature.geometry.type == "MultiPolygon"){
        var list = [];
        var max = 0;
        inputFeature.geometry.coordinates.forEach(e => {
            var x = length(e);
            if(x > max){
                max = x;
            }
        });
        inputFeature.geometry.coordinates.forEach(e => {
            var l = length(e);
            var p = JSON.parse(JSON.stringify(inputFeature.properties));
            if(l != max){
                p["numberOfClusters"] = null;
            }
            var newFeature = {
                "type": "Feature",
                "properties": p,
                "geometry": {
                    "type": "Polygon",
                    "coordinates": e
                }
            };
            list.push(newFeature);
        });
        return list;
    }
}

/**
 * Xử lý từ feature một
 * @param {Feature} inputFeature 
 * @returns 
 */
function processPolygon(inputFeature){
    let numberOfClusters = 8;
    if (inputFeature.properties != null && inputFeature.properties["numberOfClusters"] != null && typeof inputFeature.properties["numberOfClusters"] == 'number') {
        numberOfClusters = inputFeature.properties["numberOfClusters"];
    }
    if(numberOfClusters < 2){
        console.log("numberOfClusters < 2");
    }
    var polygonBbox = turf.bbox(inputFeature);
    var random = 1000;
    if(numberOfClusters > random){
        random = numberOfClusters * 10;
    }
    var points = turf.randomPoint(random, {
        bbox: polygonBbox
    });
    points.features = points.features.filter((feature) => {
        return turf.booleanPointInPolygon(
            feature.geometry.coordinates,
            inputFeature);
    });
    var clustered = turf.clustersKmeans(points, {
        numberOfClusters: numberOfClusters,
    });
    const clusterGroups = {};
    clustered.features.forEach((feature) => {
        if (!clusterGroups.hasOwnProperty(feature.properties.cluster)) {
            clusterGroups[feature.properties.cluster] = [];
        }
        clusterGroups[feature.properties.cluster].push(feature);
    });

    var centroids = [];
    Object.keys(clusterGroups).forEach((i) => {
        const features = clusterGroups[i];
        const centroid = turf.centroid({
            type: "FeatureCollection",
            features: features,
        });
        centroids.push(centroid);
    });
    var voronoiPolygons = turf.voronoi({
        type: "FeatureCollection",
        features: centroids,
    }, {
        bbox: polygonBbox,
    });

    var features = voronoiPolygons.features.map((feature) => {
        return turf.intersect(feature.geometry, inputFeature);
    });
    return features;
}