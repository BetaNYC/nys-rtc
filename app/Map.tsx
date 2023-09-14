"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { MapContext, MapContextType } from "./Context/MapContext";

import mapboxgl from 'mapbox-gl';
import senate from "../public/state_senate.geo.json"
import coalitionMember from "../public/coalition_member.geo.json"
import campaignMember from "../public/campaign_member.geo.json"
import nonMember from "../public/non_member.geo.json"

import marker from "/public/marker.png"

const Map = () => {
    const mapContainer = useRef<HTMLInputElement>(null);

    const { setMap } = useContext(MapContext) as MapContextType

    const senateFeatures = (senate as GeoJson).features
    const coalitionMemberFeatures = (coalitionMember as GeoJson).features
    const campaignMemberFeatures = (campaignMember as GeoJson).features
    const nonMemberFeatures = (nonMember as GeoJson).features

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

            m.addSource("coalition_member", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: coalitionMemberFeatures,
                },
            })

            m.addSource("campaign_member", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: campaignMemberFeatures,
                },
            })

            m.addSource("non_member", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: nonMemberFeatures,
                },
            })


            // // @ts-ignore
            // m.loadImage(marker, (error, image) => {
            //     if (error) throw error;
            //     // @ts-ignore
            //     m.addImage("marker", image, {
            //         sdf: true,
            //     });
            // });

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

            // m.addLayer({
            //     id: 'coalition_member',
            //     type: 'circle',
            //     source: 'coalition_member',
            //     layout: {},
            //     paint: {
            //         "circle-radius": 4,
            //         "circle-stroke-width": 1,
            //         "circle-opacity": 0.8,
            //         "circle-color": "#FFBF00"
            //     },
            // })

            // m.addLayer({
            //     id: 'campaign_member',
            //     type: 'circle',
            //     source: 'campaign_member',
            //     layout: {},
            //     paint: {
            //         "circle-radius": 4,
            //         "circle-stroke-width": 1,
            //         "circle-opacity": 0.8,
            //         "circle-color": "#ff7f7f"
            //     },
            // })

            m.addLayer({
                id: 'non_member',
                type: 'circle',
                source: 'non_member',
                layout: {},
                paint: {
                    "circle-radius": 4,
                    "circle-stroke-width": 1,
                    "circle-opacity": 0.8,
                    "circle-color": "#FFBF00"
                },
            })
        })
        return () => {
            m.remove();
        };
    }, [])



    return <div className="absolute w-[100vw] h-[100vh] z-10" ref={mapContainer}>
    </div>;
}

export default Map