"use client";

import React, { useState, useRef, useEffect, useContext } from "react";
import { MapContext, MapContextType } from "../../context/MapContext";

import mapboxgl, { EventData, MapMouseEvent } from 'mapbox-gl';
import { GeoJSONSource } from 'mapbox-gl';

import assembly from "../../public/nys_assembly.geo.json"
import senate from "../../public/nys_senate.geo.json"
import organizations from "../../public/rtc_coalition.geo.json"
import counties from "../../public/nys_counties.geo.json"
// import zipcodes from "../public/nys_zipcodes.geo.json"

import DistrictsBtns from "./DistrictsBtns";
import Legend from "./Legend";

import Image from 'next/image'
import "./Map.css"

const Map = () => {
    const mapContainer = useRef<HTMLInputElement>(null);

    const { map, setMap } = useContext(MapContext) as MapContextType

    const senateFeatures = (senate as GeoJson).features
    const assemblyFeatures = (assembly as GeoJson).features
    const organizationsMemberFeatures = (organizations as GeoJson).features.filter(o => o.properties.member === true)
    const organizationsEndorserFeatures = (organizations as GeoJson).features.filter(o => o.properties.member === false)
    const countiesFeatures = (counties as GeoJson).features
    // const zipcodeFeatures = (zipcodes as GeoJson).features

    const [lng, setLng] = useState(-77.9);
    const [lat, setLat] = useState(43.01);
    const [zoom, setZoom] = useState(6.6);

    const [districts, setDistricts] = useState<Districts>("senate")

    const districtsClickHandler = (districts: Districts) => {
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
        setDistricts(districts)

    }

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

            m.addSource("counties", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: countiesFeatures,
                },
            })

            // m.addSource("zipcodes", {
            //     type: "geojson",
            //     data: {
            //         type: "FeatureCollection",
            //         features: zipcodeFeatures,
            //     },
            // })

            m.addSource("organizations_members", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: organizationsMemberFeatures,
                },
            })

            m.addSource("organizations_endorsers", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: organizationsEndorserFeatures,
                },
            })

            m.loadImage("./pattern_rep.png", (error, image) => {
                if (error) throw error;
                m.addImage("pattern_rep", image as ImageBitmap, {
                    sdf: true,
                });
            });

            m.loadImage("./pattern_demo.png", (error, image) => {
                if (error) throw error;
                // @ts-ignore
                m.addImage("pattern_demo", image, {
                    sdf: true,
                });
            });

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
                        ["in", "Statewide RTC", ["get", "HCMC support"]],
                        .9, 0
                    ]
                },
            });

            m.addLayer({
                id: "pattern_rep",
                type: "fill",
                source: 'districts',
                paint: {
                    "fill-pattern": 'pattern_rep',
                    'fill-opacity': [
                        "case",
                        ["all", ["==", ["get", "Party_x"], "Republican"]],
                        .2, 0
                    ]
                }
            })


            m.addLayer({
                id: "pattern_demo",
                type: "fill",
                source: 'districts',
                paint: {
                    "fill-pattern": 'pattern_demo',
                    'fill-opacity': [
                        "case",
                        ["all", ["==", ["get", "Party_x"], "Democratic"]],
                        .2, 0
                    ]
                }
            })

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
                id: 'organizations_members',
                type: 'circle',
                source: 'organizations_members',
                layout: {
                    "visibility":"none"
                },
                paint: {
                    "circle-radius": 4,
                    "circle-stroke-width": 2.25,
                    "circle-opacity": 1,
                    "circle-color": "#802948",
                    "circle-stroke-color": "#802948",
                },
            })


            m.addLayer({
                id: 'organizations_endorsers',
                type: 'circle',
                source: 'organizations_endorsers',
                layout: {
                    "visibility":"none"
                },
                paint: {
                    "circle-radius": 4,
                    "circle-stroke-width": 2.25,
                    "circle-opacity": 1,
                    "circle-color": "#ffffff",
                    "circle-stroke-color": "#802948",
                },
            })

            // m.on("click", "districts", (e: MapMouseEvent & EventData) => {
            //     const { properties } = e.features[0]

            //     // console.log(properties)
            //     // ${properties.Geography.replaceAll("/"," ")}
            //     let content = `<div class="content">
            //     <div class="grid grid-cols-[1fr_0.3fr] justify-between items-start px-[17px] py-[10px] width-full text-white ${properties.Party_x === "Democratic" ? "bg-[#0058AB]" : "bg-[#B60000]"}   rounded-t-[20px]">
            //     <div class="col-start-1 col-end-2 font-bold text-[18px]">District ${properties.District}</div>
            //     <div class="col-start-3 col-end-4 font-bold text-[14px] text-start ">${properties.Name}</div>
            //     <div class="col-start-1 col-end-2 font-bold text-[11px] ">${properties.City}</div>
            //     <div class="col-start-3 col-end-4 font-bold text-[11px] text-start ">${properties.Party_y}</div>
            //     </div>
            // <div class="px-[17px] pt-[8px] pb-[12px] text-black bg-white rounded-b-[20px]">
            //     <div class="font-regular text-[8px] text-[#7F7F7F]">Housing Courts Must Change! Campaign Support</div>
            //     <div class="flex flex-col gap-[5px] mt-[6px] mb-[8px]">
            //         <div class="flex items-center gap-[5px]">
            //             <img src=${properties["HCMC support"].includes("Statewide RTC") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
            //             <div class="font-bold text-[12px]">Statewide RTC</div>
            //         </div>
            //         <div class="flex items-center gap-[5px]">
            //             <img src=${properties["HCMC support"].includes("Winter Eviction Moratorium") ? "/icons/checked.svg" : "/icons/empty.svg"}  alt="" className="w-[16px] h-[16px]" />
            //             <div class="font-bold text-[12px]">Winter Eviction Moratorium</div>
            //         </div>
            //         <div class="flex items-center gap-[5px]">
            //             <img src=${properties["HCMC support"].includes("Defend RTC") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
            //             <div class="font-bold text-[12px]">Defend RTC</div>
            //         </div>
            //         <div class="flex items-center gap-[5px]">
            //             <img src=${properties["HCMC support"].includes("Fund Local Law 53") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
            //             <div class="font-bold text-[12px]">Power to Organize:<br /> Fund Local Law 53</div>
            //         </div>
            //     </div>
            //     <a href="" class="font-regular text-[12px]">
            //         More Details
            //     </a>
            // </div></div>`

            //     const popup = new mapboxgl.Popup({
            //         offset: [0, -25],
            //         anchor: "bottom",
            //         closeButton: false,
            //         closeOnClick: true,
            //     })

            //     popup.setMaxWidth("1200px")
            //     popup.setLngLat([e.lngLat['lng'], e.lngLat["lat"]]).setHTML(content).addTo(m)
            // })

            m.on("click", "organizations_members", (e: MapMouseEvent & EventData) => {

                const { properties } = e.features[0]
                console.log(properties)

                let content = `<div class="content">
                <div class="flex justify-between items-center px-[17px] py-[10px] w-[249px] text-white bg-[#96315F] rounded-t-[20px]">
                    <div class="w-[150px] font-bold text-[14px]">${properties.Name}</div>
                    <div class="flex flex-col items-center">
                        <img src="/icons/checked_member.svg" alt="" className="w-[16px] h-[16px]" />
                        <div class="font-regular text-[10px] text-start ">${properties.org}</div>
                    </div>
                </div>
                <div class="flex flex-col gap-[16px] px-[18px] pt-[10px] pb-[20px] text-black">
                    <div class="flex items-center gap-[12px]">
                        <img src="/icons/apartment.svg" alt="" className="w-[16px] h-[16px]" />
                        <div class="w-[120px] font-regular text-[12px]">361 Main Street (Catskill Mill Storefront) Catskill, NY 12414</div>
                    </div>
                    <div class="flex items-center gap-[12px]">
                        <img src="/icons/phone.svg" alt="" className="w-[16px] h-[16px]" />
                        <div class="font-regular text-[12px]">519-291-9415</div>
                    </div>
                    <div class="flex items-center gap-[12px]">
                        <img src="/icons/email.svg" alt="" className="w-[16px] h-[16px]" />
                        <div class="font-regular text-[12px]">hchc@hudsoncatskillhousing.org</div>
                    </div>
                </div>
            </div>`

                const popup = new mapboxgl.Popup({
                    offset: [0, -25],
                    anchor: "bottom",
                    closeButton: false,
                    closeOnClick: true,
                })


                popup.setMaxWidth("1200px")
                popup.setLngLat([e.lngLat['lng'], e.lngLat["lat"]]).setHTML(content).addTo(m)
            })

            m.on("click", "organizations_endorsers", (e: MapMouseEvent & EventData) => {

                const { properties } = e.features[0]
                console.log(properties)

                let content = `<div class="content px-[18px]">
                <div class="flex justify-between items-center py-[10px] w-[249px] text-black bg-[#fff] rounded-t-[20px]">
                    <div class="w-[150px] font-bold text-[14px]">${properties.Name}</div>
                    <div class="flex flex-col items-center">
                        <img src="/icons/empty_member.svg" alt="" className="w-[16px] h-[16px]" />
                        <div class="font-regular text-[10px] text-start ">${properties.org}</div>
                    </div>
                </div>
                <div class="mt-[5px] w-full h-[1px] bg-black "></div>
                <div class="flex flex-col gap-[16px]  pt-[10px] pb-[20px] text-black">
                    <div class="flex items-center gap-[12px]">
                        <img src="/icons/apartment.svg" alt="" className="w-[16px] h-[16px]" />
                        <div class="w-[120px] font-regular text-[12px]">361 Main Street (Catskill Mill Storefront) Catskill, NY 12414</div>
                    </div>
                    <div class="flex items-center gap-[12px]">
                        <img src="/icons/phone.svg" alt="" className="w-[16px] h-[16px]" />
                        <div class="font-regular text-[12px]">519-291-9415</div>
                    </div>
                    <div class="flex items-center gap-[12px]">
                        <img src="/icons/email.svg" alt="" className="w-[16px] h-[16px]" />
                        <div class="font-regular text-[12px]">hchc@hudsoncatskillhousing.org</div>
                    </div>
                </div>
            </div>`

                const popup = new mapboxgl.Popup({
                    offset: [0, -25],
                    anchor: "bottom",
                    closeButton: false,
                    closeOnClick: true,
                })


                popup.setMaxWidth("1200px")
                popup.setLngLat([e.lngLat['lng'], e.lngLat["lat"]]).setHTML(content).addTo(m)
            })


        })
        return () => {
            m.remove();
        };
    }, [])



    return (
        <>
            <div className="absolute w-[100vw] h-[100vh] z-10" ref={mapContainer} >
            </div >
            <DistrictsBtns districts={districts} districtsClickHandler={districtsClickHandler} />
            <Legend />



        </>
    )

}

export default Map