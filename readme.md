# Hướng dẫn sử dụng

## Checkout về
```
git clone git@github.com:thanhnghiacntt/service-split-polygon.git
```
## Cài đặt module
```
cd service-split-polygon
```
```
npm install
```
```
node server.js
```
## Test bằng postman
```
curl --location --request POST 'http://localhost:8888' \
--header 'Content-Type: application/json' \
--data-raw '{
      "type": "Feature",
      "properties": {
          "numberOfClusters": 10
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              107.92282104492188,
              15.849068195031153
            ],
            [
              108.369140625,
              15.849068195031153
            ],
            [
              108.369140625,
              16.13553885395344
            ],
            [
              107.92282104492188,
              16.13553885395344
            ],
            [
              107.92282104492188,
              15.849068195031153
            ]
          ]
        ]
      }
}'
```