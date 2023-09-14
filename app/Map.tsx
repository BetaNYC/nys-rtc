"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { MapContext, MapContextType } from "./Context/MapContext";

import mapboxgl from 'mapbox-gl';
import senate from "../public/state_senate.geo.json"

const Map = () => {
    const mapContainer = useRef<HTMLInputElement>(null);

    const { setMap } = useContext(MapContext) as MapContextType

    const  senateFeatures  = (senate as geoFormat).features 

    const [lng, setLng] = useState<number>(-75.914);
    const [lat, setLat] = useState<number>(42.84);
    const [zoom, setZoom] = useState<number>(6.6);

    useEffect(() => {
        mapboxgl.accessToken =
            "pk.eyJ1IjoiY2xvdWRsdW4iLCJhIjoiY2s3ZWl4b3V1MDlkejNkb2JpZmtmbHp4ZiJ9.MbJU7PCa2LWBk9mENFkgxw";
        const m = new mapboxgl.Map({
            container: mapContainer.current || "",
            style: "mapbox://styles/cloudlun/clm6k2n6y02gi01ns267c139m",
            center: [lng, lat],
            zoom: zoom,
            interactive: true,
            doubleClickZoom: false,
        });

        m.on("move", () => {
            setLng(Number(m.getCenter().lng.toFixed(4)));
            setLat(Number(m.getCenter().lat.toFixed(4)));
            setZoom(Number(m.getZoom().toFixed(2)));
        });

        m.on("load", () => {
            setMap(m);
            m.addSource("districts", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: senateFeatures,
                },
            })

            m.addLayer({
                'id': 'districts',
                'type': 'fill',
                'source': 'districts',
                'layout': {},
                'paint': {
                    'fill-color': '#ffb8c2',
                    'fill-opacity': 0.2
                }
            });

            m.addLayer({
                'id': 'districts_outline',
                'type': 'line',
                'source': 'districts',
                'layout': {},
                'paint': {
                    'line-color': '#ffb8c2',
                    'line-width': 1
                }
            });
        })
        return () => {
            m.remove();
        };
    }, [])



    return <div className="absolute w-[100vw] h-[100vh] z-10" ref={mapContainer}>
    </div>;
}

export default Map