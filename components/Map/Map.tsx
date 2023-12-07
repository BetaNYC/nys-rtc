"use client";

import React, { useState, useRef, useEffect, useContext } from "react";
import { MapContext, MapContextType } from "../../context/MapContext";

import mapboxgl, { EventData, MapMouseEvent } from 'mapbox-gl';
import { GeoJSONSource } from 'mapbox-gl';

import assembly from "../../public/assembly.geo.json"
import senate from "../../public/senate.geo.json"
import member from "../../public/rtc_members.geo.json"


import Legend from "./Legend";
import MapLayers from "./MapLayers";
import Geopanel from "../Geopanel/Geopanel";
import Membershippanel from "../Geopanel/Membershippanel";

import "./Map.css"

import pattern_red from "../../public/patterns/red.svg"
import pattern_blue from "../../public/patterns/blue.svg"

import * as d3 from "d3"


const Map = () => {
    const mapContainer = useRef<HTMLInputElement>(null);
    const { map, setMap, setDistricts, setPanelShown, legislations, mapClickHandler, defaultMapHandler } = useContext(MapContext) as MapContextType
    /* @ts-ignore */
    const senateFeatures = (senate as GeoJson).features
    /* @ts-ignore */
    const assemblyFeatures = (assembly as GeoJson).features
    /* @ts-ignore */
    const memberFeatures = (member as GeoJson).features

    const [lng, setLng] = useState(-78.5);
    const [lat, setLat] = useState(43.05);
    const [zoom, setZoom] = useState(-6.25);


    const [selectedMemberFeatures, setSelectedMemberFeatures] = useState<selectedMemberFeatures | null>(null)


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

            m.addSource("district_label", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: []
                },
            })

            m.addSource("districts_hovered", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: []
                },
            })

            m.addSource("members", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: memberFeatures
                },
            })

            m.addSource("members_label", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: []
                },
            })


            let patternRepImg = new Image(80, 80)
            patternRepImg.onload = () => m.addImage("pattern_rep", patternRepImg, {
                sdf: true,
            })
            patternRepImg.src = pattern_red.src

            let patternDemoImg = new Image(80, 80)
            patternDemoImg.onload = () => m.addImage("pattern_demo", patternDemoImg, {
                sdf: true,
            })
            patternDemoImg.src = pattern_blue.src

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
                        1, 0
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
                'id': 'districts_clicked_outline',
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
                    'line-width': 0
                }
            });

            m.addLayer({
                'id': 'districts_hovered',
                'type': 'fill',
                'source': 'districts_hovered',
                'layout': {},
                'paint': {
                    'fill-color': "black",
                    'fill-opacity': 1
                },
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
                        "#121D3E",
                        "#121D3E"
                    ],
                    'text-halo-color': 'white',
                    "text-halo-width": 0.6
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
                        1, 0
                    ]
                }
            })


            m.addLayer({
                'id': 'members',
                'type': 'circle',
                'source': 'members',
                'layout': {
                    "visibility": "none"
                },
                'paint': {
                    "circle-radius": 4,
                    'circle-color': [
                        "case",
                        ["all", ["in", "Member", ["get", "Membership Status"]]],
                        "#812948",
                        "white"
                    ],
                    "circle-stroke-width": 2.5,
                    "circle-stroke-color": "#812948"
                },
            });

            m.addLayer({
                id: "members_label",
                type: 'symbol',
                source: 'members_label',
                layout: {
                    'text-field': ['get', "label"],
                    'text-justify': 'auto',
                    'text-size': 14,
                    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                    // 'text-radial-offset': 0.5,
                    'text-font': ["Arial Unicode MS Bold"],
                    "text-offset": [0, -1.5]
                },
                paint: {
                    'text-opacity': 1,
                    "text-color": "#121D3E",
                    'text-halo-color': 'white',
                    "text-halo-width": 0.6
                }
            })



            m.moveLayer("districts", "members")


            m.on("click", "districts", (e: MapMouseEvent & EventData) => {

                mapClickHandler(m, e, legislations)

            })

            m.on('click', "members", (e: MapMouseEvent & EventData) => {
                setSelectedMemberFeatures(e.features[0])
                setPanelShown({ geopanelShown: false, memberpanelShown: true })

                const labelData = {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            "type": "Feature",
                            "properties": {
                                "label": e.features[0].properties.Name,
                            },
                            "geometry": {
                                'type': 'Point',
                                'coordinates': [e.features[0].properties.lon, e.features[0].properties.lat]
                            }
                        }
                    ]
                }


                /* @ts-ignore */
                m.getSource("members_label").setData({
                    type: "FeatureCollection",
                    features: labelData.features as GeoJson["features"]
                })

                m.setPaintProperty("members", "circle-color", [
                    "case",
                    ["all", ["==", ["get", "Name"], e.features[0].properties.Name], ["in", "Member", ["get", "Membership Status"]]],
                    "#812948",
                    ["all", ["!=", ["get", "Name"], e.features[0].properties.Name], ["in", "Member", ["get", "Membership Status"]]],
                    "#AB8190",
                    "white"
                ])

                m.setPaintProperty("members", "circle-stroke-color", [
                    "case",
                    ["all", ["==", ["get", "Name"], e.features[0].properties.Name]],
                    "#812948", "#AB8190"
                ])


                m.moveLayer("districts_outline", "members_label")
                m.moveLayer("districts_outline", "members")

            })


            const districtTooptipGenerator = (properties: any) => {
                return (`<div class="relative z-30">
                <div class="px-[17px] py-[10px] width-full ${properties.Party_x === "Democratic" ? "bg-demo_1" : "bg-rep_1"}   rounded-t-[20px]">
                <div class="col-start-1 col-end-2 font-bold text-white text-[18px]">${properties.House} District ${properties.District}</div>
                </div>
            <div class="px-[17px] pt-[8px] pb-[12px] text-navy bg-white rounded-b-[20px]">
                <div class="font-regular text-[8px] text-[#7F7F7F]">Housing Courts Must Change! Campaign Support</div>
                <div class="flex flex-col gap-[5px] mt-[6px] mb-[8px]">
                    <div class="flex items-center gap-[5px]">
                        <img src=${properties["HCMC support"].includes("Statewide RTC") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                        <div class="font-bold text-rtc_navy text-[12px]">Statewide Right to Counsel</div>
                    </div>
                    <div class="flex items-center gap-[5px]">
                        <img src=${properties["HCMC support"].includes("Winter Eviction Moratorium") ? "/icons/checked.svg" : "/icons/empty.svg"}  alt="" className="w-[16px] h-[16px]" />
                        <div class="font-bold text-rtc_navy text-[12px]">Winter Eviction Moratorium</div>
                    </div>
                    <div class="flex items-center gap-[5px]">
                        <img src=${properties["HCMC support"].includes("Defend RTC") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                        <div class="font-bold text-rtc_navy text-[12px]">Defend Right to Counsel</div>
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


            let tooltip = d3.select("body").append("div").attr("class", "tooltip").style("z-index", 1200)

            m.on("mousemove", "districts", (e: MapMouseEvent & EventData) => {
                const { properties } = e.features[0]

                let content = districtTooptipGenerator(properties)
                tooltip.html(content).style("visibility", "visible");
                tooltip
                    /* @ts-ignore */
                    .style("top", e.point.y - (tooltip.node().clientHeight + 5) + "px")
                    /* @ts-ignore */
                    .style("left", e.point.x - tooltip.node().clientWidth / 2.0 + "px")

                m.setPaintProperty("districts_outline", 'line-width', [
                    "case",
                    ["all", ["==", ["get", "District"], properties.District]],
                    3.5,
                    1
                ])

                m.moveLayer("districts", "districts_outline")
            })

            m.on("mouseleave", "districts", () => {
                tooltip.style("visibility", "hidden")
                m.setPaintProperty("districts_outline", 'line-width', 1)
            })

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
                    <div class="flex items-start gap-[5px]">
                        <img src=${properties["Legislation"].includes("Statewide RTC") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                        <div class="font-bold text-rtc_navy text-[12px]">Statewide Right to Counsel</div>
                    </div>
                    <div class="flex items-start gap-[5px]">
                        <img src=${properties["Legislation"].includes("Winter Eviction Moratorium") ? "/icons/checked.svg" : "/icons/empty.svg"}  alt="" className="w-[16px] h-[16px]" />
                        <div class="font-bold text-rtc_navy text-[12px]">Winter Eviction Moratorium</div>
                    </div>
                    <div class="flex items-start gap-[5px]">
                        <img src=${properties["Legislation"].includes("Defend RTC") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                        <div class="font-bold text-rtc_navy text-[12px]">Defend Right to Counsel</div>
                    </div>
                    <div class="flex items-start gap-[5px]">
                        <img src=${properties["Legislation"].includes("Fund Local Law 53") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                        <div class="font-bold text-rtc_navy text-[12px]">Power to Organize:<br /> Fund Local Law 53</div>
                    </div>
                </div>
                <div class="font-regular text-[12px] text-grey_2 underline">
                    Click the map for further details   
                </div>
            </div>
            </div>`
                tooltip.html(content).style("visibility", "visible");
                tooltip
                    /* @ts-ignore */
                    .style("top", e.point.y - (tooltip.node().clientHeight + 5) + "px")
                    /* @ts-ignore */
                    .style("left", e.point.x - tooltip.node().clientWidth / 2.0 + "px")
            })

            m.on("mouseleave", 'members', () => tooltip.style("visibility", "hidden"))

            // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            //     }

        })
        return () => {
            m.remove();
        };
    }, [])

    // useEffect(() => {
    //     const cover = d3.select("body")
    //         .append("div")
    //         .attr('class', 'cover')
    //         .attr('fill', "#121D3E")

    //     if (mapShown === false) cover.attr("visibility", "visible")
    // }, [mapShown])



    return (
        <>
            <div className="absolute w-[100vw] h-[100vh] z-10" ref={mapContainer} >
            </div >
            <Legend />
            <MapLayers districtsClickHandler={districtsClickHandler} />
            <Geopanel />
            <Membershippanel selectedMemberFeatures={selectedMemberFeatures} setSelectedMemberFeatures={setSelectedMemberFeatures} />
        </>
    )

}

export default Map