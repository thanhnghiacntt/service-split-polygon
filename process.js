'use strict';

const turf = require('@turf/turf');

module.exports = createListFeature;
module.exports.default = createListFeature;


function createListFeature(inputFeature){
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