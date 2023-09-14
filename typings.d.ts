type geoFormat = {
    type: "FeatureCollection",
    name: string,
    crs: {}
    features: Feature<Geometry, GeoJsonProperties>[]
}