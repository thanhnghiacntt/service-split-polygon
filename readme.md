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
Body là geojson, numberOfClusters trong properties là muốn chia vùng này thành bao nhiêu ô. Nếu không có thì mặc định là 8
### Ví dụ curl trong postman
```
curl --location 'http://localhost:8888' \
--header 'Content-Type: application/json' \
--data '{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
          "numberOfClusters": 10
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              105.77362060546875,
              21.55017532555692
            ],
            [
              105.5511474609375,
              20.797201434307
            ],
            [
              106.1993408203125,
              20.365227537412434
            ],
            [
              106.76239013671875,
              21.189533621502626
            ],
            [
              106.28448486328125,
              21.570610571132665
            ],
            [
              105.77362060546875,
              21.55017532555692
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              105.4193115234375,
              20.161676573791507
            ],
            [
              105.3973388671875,
              19.93720533223859
            ],
            [
              105.029296875,
              19.78738018198621
            ],
            [
              105.46051025390625,
              19.531318700282522
            ],
            [
              106.35589599609375,
              19.91913050246103
            ],
            [
              105.4193115234375,
              20.161676573791507
            ]
          ]
        ]
      }
    }
  ]
}'
```
### Ví dụ về hình ảnh trước vào sau khi chia
#### Trước
![plot](./first.png)
#### Sau
![plot](./last.png)