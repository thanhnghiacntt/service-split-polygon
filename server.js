const express = require('express');
const bodyParser = require('body-parser');
const turf = require('@turf/turf');
const app = express();
app.use(bodyParser.urlencoded({
        extended: true
    }));
// parse application/json
app.use(bodyParser.json({
        limit: '50mb'
    }));

app.post('/', (req, res) => {
    var inputFeature = req.body;
    try {
		console.log(inputFeature);
        let numberOfClusters = 8;
        if (inputFeature.properties != null && inputFeature.properties["numberOfClusters"] != null && typeof inputFeature.properties["numberOfClusters"] == 'number') {
            numberOfClusters = inputFeature.properties["numberOfClusters"];
        }
		if(numberOfClusters < 2){
			console.log("numberOfClusters < 2");
		}
        var polygonBbox = turf.bbox(inputFeature);
        var points = turf.randomPoint(1000, {
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

        centroids = [];
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

        var clipped = voronoiPolygons.features.map((feature) => {
            return turf.intersect(feature.geometry, inputFeature);
        });
        var geojson = {
            "type": "FeatureCollection",
            "features": []
        };
        clipped.forEach((e) => {
            e.properties = inputFeature.properties;
            geojson.features.push(e)
        });
        res.json(geojson);
    } catch (e) {
        console.log(inputFeature);
        res.json(null);
    }
});
app.listen(process.env.PORT || 8888, () => console.log(`App listening on port ${process.env.PORT || 8888}!`))
