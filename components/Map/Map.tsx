"use client";

import React, { useState, useRef, useEffect, useContext } from "react";
import { MapContext, MapContextType } from "../../context/MapContext";

import mapboxgl, { EventData, MapMouseEvent } from 'mapbox-gl';
import { GeoJSONSource } from 'mapbox-gl';

import assembly from "../../public/assembly.geo.json"
import senate from "../../public/senate.geo.json"

import assemblyOverlapped from "../../public/assembly_overlapping_boundaries.json"
import senateOverlapped from "../../public/senate_overlapping_boundaries.json"

import Legend from "./Legend";
import MapLayers from "./MapLayers";
import Geopanel from "../Geopanel/Geopanel";
import Membershippanel from "../Geopanel/Membershippanel";

import "./Map.css"

import pattern_rep from "../../public/icons/pattern_rep.svg"
import pattern_demo from "../../public/icons/pattern_demo.svg"


const Map = () => {
    const mapContainer = useRef<HTMLInputElement>(null);
    const { map, setMap, districts, setDistricts, panelShown, setPanelShown, legislations, mapClickHandler, defaultMapHandler } = useContext(MapContext) as MapContextType
    /* @ts-ignore */
    const senateFeatures = (senate as GeoJson).features
    /* @ts-ignore */
    const assemblyFeatures = (assembly as GeoJson).features

    const [lng, setLng] = useState(-78.5);
    const [lat, setLat] = useState(43.05);
    const [zoom, setZoom] = useState(-6.25);

    const [selectedDistrictFeatures, setSelectedDistrictFeatures] = useState<selectedDistrictFeatures | null>(null)
    const [selectedMemberFeatures, setSelectedMemberFeatures] = useState<selectedMemberFeatures | null>(null)
    const [selectedDistrictOverlappedData, setSelectedDistrictOverlappedData] = useState<selectedDistrictOverlappedData | null>(null)


    const districtsClickHandler = (districts: Districts) => {
        setDistricts(districts)

        switch (districts) {
            case "senate":
                (map?.getSource("districts") as GeoJSONSource).setData({
                    type: "FeatureCollection",
                    features: senateFeatures
                });
                break
            case "assembly":
                (map?.getSource("districts") as GeoJSONSource).setData({
                    type: "FeatureCollection",
                    features: assemblyFeatures
                });
                break
        }
        defaultMapHandler(legislations)
    }

    useEffect(() => {
        mapboxgl.accessToken =
            "pk.eyJ1IjoiY2xvdWRsdW4iLCJhIjoiY2s3ZWl4b3V1MDlkejNkb2JpZmtmbHp4ZiJ9.MbJU7PCa2LWBk9mENFkgxw";
        const m = new mapboxgl.Map({
            container: mapContainer.current || "",
            style: "mapbox://styles/cloudlun/clm6k2n6y02gi01ns267c139m",
            center: [lng, lat],
            zoom: zoom,
            minZoom: 6,
            maxZoom: 12,
            interactive: true,
            doubleClickZoom: false,
        });

        m.dragRotate.disable();
        m.touchZoomRotate.disableRotation();

        m.addControl(new mapboxgl.NavigationControl())

        m.on("move", () => {
            setLng(Number(m.getCenter().lng.toFixed(4)));
            setLat(Number(m.getCenter().lat.toFixed(4)));
            setZoom(Number(m.getZoom()));
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


            m.addSource("districts_senate", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: senateFeatures,
                },
            })

            m.addSource("district_label", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: []
                },
            })


            let patternRepImg = new Image(100, 100)
            patternRepImg.onload = () => m.addImage("pattern_rep", patternRepImg, {
                sdf: true,
            })
            patternRepImg.src = pattern_rep.src

            let patternDemoImg = new Image(100, 100)
            patternDemoImg.onload = () => m.addImage("pattern_demo", patternDemoImg, {
                sdf: true,
            })
            patternDemoImg.src = pattern_demo.src

            m.addLayer({
                'id': 'districts',
                'type': 'fill',
                'source': 'districts',
                'layout': {},
                'paint': {
                    'fill-color': [
                        "case",
                        ["all", ["==", ["get", "Party_x"], "Democratic"]],
                        "#007CEE",
                        "#D04E40"
                    ],
                    'fill-opacity': [
                        "case",
                        ["in", legislations, ["get", "HCMC support"]],
                        .75, 0
                    ]
                },
            });

            m.addLayer({
                'id': 'districts_outline',
                'type': 'line',
                'source': 'districts',
                'layout': {},
                'paint': {
                    'line-color': [
                        "case",
                        ["all", ["==", ["get", "Party_x"], "Democratic"]],
                        "#006fd6",
                        "#D04E40"
                    ],
                    'line-width': 1
                }
            });


            m.addLayer({
                id: "district_label",
                type: 'symbol',
                source: 'district_label',
                layout: {
                    'text-field': ['get', 'label'],
                    'text-justify': 'auto',
                    'text-size': 14,
                    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                    // 'text-radial-offset': 0.5,
                    'text-font': ["Arial Unicode MS Bold"],
                    "text-offset": [0, -1.5]
                },
                paint: {
                    'text-opacity': 1,
                    "text-color": [
                        "case",
                        ["all", ["==", ["get", "party"], "Democratic"]],
                        "#007CEE",
                        "#D04E40"
                    ],
                    'text-halo-color': 'white',
                    "text-halo-width": 0.35
                }
            })

            m.addLayer({
                id: "pattern",
                type: "fill",
                source: 'districts',
                paint: {
                    "fill-pattern": [
                        "case",
                        ["all", ["==", ["get", "Party_x"], "Democratic"]],
                        "pattern_demo", "pattern_rep"
                    ],
                    'fill-opacity': [
                        "case",
                        ["all", ["!", ["in", legislations, ["get", "HCMC support"]]]],
                        .5, 0
                    ]
                }
            })

            m.setLayoutProperty('members', "visibility", "none")
            m.moveLayer("districts", "counties_borders")
            m.moveLayer("districts_outline", "counties_borders")
            m.moveLayer("districts", "counties_labels")
            m.moveLayer("districts_outline", "counties_labels")
            m.moveLayer("districts", "zipcodes")
            m.moveLayer("districts_outline", "zipcodes")
            m.moveLayer("districts", "members")
            m.moveLayer("districts_outline", "members")


            m.on("click", "districts", (e: MapMouseEvent & EventData) => {
                setSelectedDistrictFeatures(e.features[0])
                setSelectedDistrictOverlappedData((districts === "senate" ? senateOverlapped : assemblyOverlapped).filter(d => +d.district === +e.features[0]?.properties.District)[0])
                mapClickHandler(m, e, legislations)

            })

            m.on('click', "members", (e: MapMouseEvent & EventData) => {
                setSelectedMemberFeatures(e.features[0])
                setPanelShown({ geopanelShown: false, memberpanelShown: true })
                console.log([e.features[0].properties.lon, e.features[0].properties.lat])
                // m.flyTo({
                //     center: [e.features[0].properties.lon, e.features[0].properties.lat],
                //     zoom: e.features[0].properties.lon > -74.15 && e.features[0].properties.lat < 41.05 ? 12 : 3
                // })



            })


            const popup = new mapboxgl.Popup({
                offset: [0, 0],
                anchor: "bottom",
                closeButton: false,
                closeOnClick: true,
            })

            popup.setMaxWidth("1200px")

            const districtTooptipGenerator = (properties: any) => {
                return (`<div class="content">
                <div class="px-[17px] py-[10px] width-full ${properties.Party_x === "Democratic" ? "bg-demo_1" : "bg-rep_1"}   rounded-t-[20px]">
                <div class="col-start-1 col-end-2 font-bold text-white text-[18px]">${districts.charAt(0).toUpperCase() + districts.slice(1)} District ${properties.District}</div>
                </div>
            <div class="px-[17px] pt-[8px] pb-[12px] text-navy bg-white rounded-b-[20px]">
                <div class="font-regular text-[8px] text-[#7F7F7F]">Housing Courts Must Change! Campaign Support</div>
                <div class="flex flex-col gap-[5px] mt-[6px] mb-[8px]">
                    <div class="flex items-center gap-[5px]">
                        <img src=${properties["HCMC support"].includes("Statewide RTC") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                        <div class="font-bold text-rtc_navy text-[12px]">Statewide RTC</div>
                    </div>
                    <div class="flex items-center gap-[5px]">
                        <img src=${properties["HCMC support"].includes("Winter Eviction Moratorium") ? "/icons/checked.svg" : "/icons/empty.svg"}  alt="" className="w-[16px] h-[16px]" />
                        <div class="font-bold text-rtc_navy text-[12px]">Winter Eviction Moratorium</div>
                    </div>
                    <div class="flex items-center gap-[5px]">
                        <img src=${properties["HCMC support"].includes("Defend RTC") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                        <div class="font-bold text-rtc_navy text-[12px]">Defend RTC</div>
                    </div>
                    <div class="flex items-center gap-[5px]">
                        <img src=${properties["HCMC support"].includes("Fund Local Law 53") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                        <div class="font-bold text-rtc_navy text-[12px]">Power to Organize:<br /> Fund Local Law 53</div>
                    </div>
                </div>
                <div class="font-regular text-[12px] text-grey_2 underline">
                    Click the map for further details   
                </div>
            </div></div>`)
            }
            let districtNumber = 0

            m.on("mousemove", "districts", (e: MapMouseEvent & EventData) => {
                const { properties } = e.features[0]
                if (properties.District !== districtNumber) {
                    popup.remove()
                    let content = districtTooptipGenerator(properties)
                    popup.setLngLat([e.lngLat['lng'], e.lngLat["lat"]]).setHTML(content).addTo(m)
                    // districtNumber = properties.District
                }
            })

            m.on("mouseleave", "districts", () => popup.remove())

            m.on("mousemove", 'members', (e: MapMouseEvent & EventData) => {
                const { properties } = e.features[0]

                let content = `<div class="content">
                <div class="flex justify-between items-center px-[18px] py-[15px] w-[285px] text-white bg-[#96315F] rounded-t-[20px]">
                    <div class="w-[150px] font-bold text-[14px]">${properties.Name}</div>
                    <div class="flex flex-col items-center">
                        <img src=${properties['Membership Status'].includes('Member') ? "/icons/checked_member.svg" : "/icons/empty_member.svg"} alt="" className="w-[16px] h-[16px]" />
                        <div class="font-regular text-[8px] text-center">${properties['Membership Status']}</div>
                    </div>
                </div>
                <div class="px-[17px] pt-[8px] pb-[12px] text-navy bg-white rounded-b-[20px]">
                <div class="font-regular text-[8px] text-[#7F7F7F]">Housing Courts Must Change! Campaign Support</div>
                <div class="flex flex-col gap-[5px] mt-[6px] mb-[8px]">
                    <div class="flex items-center gap-[5px]">
                        <img src=${properties["Legislation"].includes("Statewide RTC") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                        <div class="font-bold text-rtc_navy text-[12px]">Statewide RTC</div>
                    </div>
                    <div class="flex items-center gap-[5px]">
                        <img src=${properties["Legislation"].includes("Winter Eviction Moratorium") ? "/icons/checked.svg" : "/icons/empty.svg"}  alt="" className="w-[16px] h-[16px]" />
                        <div class="font-bold text-rtc_navy text-[12px]">Winter Eviction Moratorium</div>
                    </div>
                    <div class="flex items-center gap-[5px]">
                        <img src=${properties["Legislation"].includes("Defend RTC") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                        <div class="font-bold text-rtc_navy text-[12px]">Defend RTC</div>
                    </div>
                    <div class="flex items-center gap-[5px]">
                        <img src=${properties["Legislation"].includes("Fund Local Law 53") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                        <div class="font-bold text-rtc_navy text-[12px]">Power to Organize:<br /> Fund Local Law 53</div>
                    </div>
                </div>
                <div class="font-regular text-[12px] text-grey_2 underline">
                    Click the map for further details   
                </div>
            </div>
            </div>`
                popup.setLngLat([e.lngLat['lng'], e.lngLat["lat"]]).setHTML(content).addTo(m)
            })

            m.on("mouseleave", "organizations", () => popup.remove())

            // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            //     }

        })
        return () => {
            m.remove();
        };
    }, [])



    return (
        <>
            <div className="absolute w-[100vw] h-[100vh] z-10" ref={mapContainer} >
            </div >
            <Legend />
            <MapLayers districtsClickHandler={districtsClickHandler} />
            <Geopanel selectedDistrictFeatures={selectedDistrictFeatures} setSelectedDistrictFeatures={setSelectedDistrictFeatures} selectedDistrictOverlappedData={selectedDistrictOverlappedData} setSelectedDistrictOverlappedData={setSelectedDistrictOverlappedData} />
            <Membershippanel selectedMemberFeatures={selectedMemberFeatures} setSelectedDistrictFeatures={setSelectedDistrictFeatures} setSelectedDistrictOverlappedData={setSelectedDistrictOverlappedData} setSelectedMemberFeatures={setSelectedMemberFeatures} />
        </>
    )

}

export default Map