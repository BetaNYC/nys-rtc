import React, { useContext, Dispatch, SetStateAction, MouseEvent, useState, useEffect } from 'react'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { MapContext, MapContextType } from '@/context/MapContext'
import GeoInfoBtns from './GeoInfoBtns'


import * as turf from "@turf/turf";

import assembly from "../../public/assembly.geo.json"
import senate from "../../public/senate.geo.json"
import counties from "../../public/nys_counties.geo.json"

import assemblyOverlapped from "../../public/assembly_overlapping_boundaries.json"
import senateOverlapped from "../../public/senate_overlapping_boundaries.json"

import { EventData, MapMouseEvent } from 'mapbox-gl';



const Geopanel = () => {

    const { map, districts, setDistricts, legislations, mapClickHandler, panelShown, defaultMapHandler, selectedDistrictFeatures, setSelectedDistrictFeatures, selectedDistrictOverlappedData, setSelectedDistrictOverlappedData } = useContext(MapContext) as MapContextType

    /* @ts-ignore */
    const countiesFeatures = (counties as GeoJson).features

    const districtBtnClickHandler = (e: MouseEvent<HTMLElement>, district: Districts) => {
        const selectedDistrict = (e.target as HTMLElement).innerText
        /* @ts-ignore */
        const clickedDistrictData = {
            /* @ts-ignore */
            features: ((district === "assembly" ? assembly : senate) as GeoJson).features.filter((d, i) => d.properties.District.toString() === selectedDistrict)
        }

        /* @ts-ignore */
        mapClickHandler(map!, clickedDistrictData, legislations)

        setDistricts(district)
        setSelectedDistrictFeatures(clickedDistrictData.features[0])
        setSelectedDistrictOverlappedData((district === "senate" ? senateOverlapped : assemblyOverlapped).filter(d => d.district === clickedDistrictData.features[0]?.properties.District)[0])


        // map?.moveLayer("background", "districts")
        // map?.moveLayer("background", "pattern")
        // map?.moveLayer("pattern", 'districts_outline')
        // map?.moveLayer("districts", 'districts_outline')
    }

    const districtMouseEnverHandler = (e: MouseEvent<HTMLElement>, district: Districts) => {
        const targetDistrict = (e.target as HTMLElement).innerText

        const hoveredDistrctData = {
            /* @ts-ignore */
            features: ((district === "assembly" ? assembly : senate) as GeoJson).features.filter((d, i) => d.properties.District.toString() === targetDistrict)
        }
        /* @ts-ignore */
        map?.getSource("districts_hovered").setData({
            type: "FeatureCollection",
            features: hoveredDistrctData.features
        })

        let coordinatesArray = hoveredDistrctData.features[0].geometry.coordinates[0]
        while (coordinatesArray.length === 1) coordinatesArray = coordinatesArray[0]
        const targetPolygon = turf.polygon([coordinatesArray])
        /* @ts-ignore */
        const targetCentroid = turf.center(targetPolygon).geometry.coordinates
        const labelData = {
            'type': 'FeatureCollection',
            'features': [
                {
                    "type": "Feature",
                    "properties": {
                        "label": hoveredDistrctData.features[0].properties.House + " " + hoveredDistrctData.features[0].properties.District.toString(),
                        "party": hoveredDistrctData.features[0].properties.Party_x
                    },
                    "geometry": {
                        'type': 'Point',
                        'coordinates': targetCentroid
                    }
                }
            ]
        }

        /* @ts-ignore */
        map?.getSource("districts_hovered_label").setData({
            type: "FeatureCollection",
            features: labelData.features as GeoJson["features"]
        })

        map?.setPaintProperty("districts_hovered_label", "text-opacity", 1)


    }

    const zipcodeMouseEnterHandler = (e: MouseEvent<HTMLElement>) => {
        const selectedZipcodes = (e.target as HTMLElement).innerText
        map?.setPaintProperty("zipcodes", "fill-opacity", [
            "case",
            ['all', ['==', ['get', "ZCTA5CE10"], selectedZipcodes]],
            .7, 0
        ])



        map?.moveLayer("background", "zipcodes")
        map?.moveLayer("districts", "zipcodes")
        map?.moveLayer('pattern', "zipcodes")
        map?.moveLayer('districts_outline', "zipcodes")
        map?.moveLayer('districts_clicked_outline', "zipcodes")

    }

    const countyMouseEnterHandler = (e: MouseEvent<HTMLElement>) => {
        const selectedCounty = (e.target as HTMLElement).innerText

        const hoveredCountyData = {
            /* @ts-ignore */
            features: (counties as GeoJson).features.filter((d, i) => d.properties.name === selectedCounty + " County")
        }


        let coordinatesArray = hoveredCountyData.features[0].geometry.coordinates[0]
        while (coordinatesArray.length === 1) coordinatesArray = coordinatesArray[0]
        const targetPolygon = turf.polygon([coordinatesArray])
        /* @ts-ignore */
        const targetCentroid = turf.center(targetPolygon).geometry.coordinates
        const labelData = {
            'type': 'FeatureCollection',
            'features': [
                {
                    "type": "Feature",
                    "properties": {
                        "label": hoveredCountyData.features[0].properties.name,
                    },
                    "geometry": {
                        'type': 'Point',
                        'coordinates': targetCentroid
                    }
                }
            ]
        }

        /* @ts-ignore */
        map?.getSource("counties_label").setData({
            type: "FeatureCollection",
            features: labelData.features as GeoJson["features"]
        })

        map?.setPaintProperty("counties_borders", "fill-opacity", [
            "case",
            ['all', ['==', ['get', "name"], selectedCounty + " County"]],
            .7, 0
        ])
        map?.setPaintProperty("counties_labels", "text-opacity", 1)

        map?.moveLayer("background", "counties_borders")
        map?.moveLayer("districts", "counties_borders")
        map?.moveLayer('pattern', "counties_borders")
        map?.moveLayer('pattern', "counties_labels")
        map?.moveLayer('districts_outline', "counties_borders")
        map?.moveLayer('districts_clicked_outline', "counties_borders")
        map?.moveLayer('districts_outline', "counties_labels")
        map?.moveLayer('districts_clicked_outline', "counties_labels")
    }

    const removeHoverEventHandler = () => {
        map?.setPaintProperty("counties_borders", "fill-opacity", 0)
        map?.setPaintProperty("counties_labels", "text-opacity", 0)
        map?.setPaintProperty("districts_hovered_label", "text-opacity", 0)
        map?.setPaintProperty("zipcodes", "fill-opacity", 0)
        /* @ts-ignore */
        map?.getSource("districts_hovered").setData({
            type: "FeatureCollection",
            features: []
        })
    }

    useEffect(() => {
        /* @ts-ignore */
        map?.getSource("districts").setData({
            type: "FeatureCollection",
            /* @ts-ignore */
            features: ((districts === "assembly" ? assembly : senate) as GeoJson).features
        });

        map?.on("click", "districts", (e: MapMouseEvent & EventData) => {
            setSelectedDistrictFeatures(e.features[0])
            setSelectedDistrictOverlappedData((districts === "senate" ? senateOverlapped : assemblyOverlapped).filter(d => +d.district === +e.features[0]?.properties.District)[0])
            mapClickHandler(map, e, legislations)
        })
    }, [selectedDistrictOverlappedData])

    return (
        <>
            {panelShown["geopanelShown"] && (
                <div className='flex flex-col absolute top-0 right-0 w-[20%] min-w-[200px] lg:w-[15%] h-full z-20 '>
                    {/* @ts-ignore */}
                    <div className={`flex items-start justify-between p-[18px]  w-full ${selectedDistrictFeatures?.properties.Party_x === "Democratic" ? "bg-demo_1" : "bg-rep_1"} `}>
                        <div className='text-white'>
                            <div className='text-label'>New York State {districts.charAt(0).toUpperCase() + districts.slice(1)}</div>
                            {/* @ts-ignore */}
                            <div className='font-bold text-subheadline'>District {selectedDistrictFeatures?.properties!.District}</div>
                        </div>
                        <XMarkIcon className=' w-[20px] h-[20px] text-white cursor-pointer' onClick={() => defaultMapHandler(legislations)} />
                    </div>
                    <div className='flex-1 p-[18px] pl-[19px] w-full bg-white overflow-y-scroll'>
                        <div className='text-[10px] text-regular text-grey_1'>HCMC Campaign Support</div>
                        <div className="flex flex-col gap-[5px] mt-[6px] text-rtc_navy">
                            <div className="flex items-start gap-[5px] ">
                                <img src={selectedDistrictFeatures?.properties!["HCMC support"].includes("Statewide RTC") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                                <div className="font-bold text-label">Statewide Right to Counsel</div>
                            </div>
                            <div className="flex items-start gap-[5px]">
                                <img src={selectedDistrictFeatures?.properties!["HCMC support"].includes("Defend RTC") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                                <div className="font-bold text-label">Defend Right to Counsel</div>
                            </div>
                            <div className="flex items-start gap-[5px]">
                                <img src={selectedDistrictFeatures?.properties!["HCMC support"].includes("Winter Eviction Moratorium") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                                <div className="font-bold text-label">Winter Eviction Moratorium</div>
                            </div>
                        </div>
                        <div className='my-[12px] w-full h-[1px] bg-grey_1'></div>
                        <div className='text-[10px] text-regular text-grey_1'>{districts.charAt(0).toUpperCase() + districts.slice(1)} District General Info</div>
                        <div className="flex flex-col gap-[16px] mt-[6px] text-rtc_navy">
                            <div className="flex items-start gap-[8px]">
                                <img src="/icons/person.svg" alt="" className="w-[16px] h-[16px]" />
                                <div className={`w-[120px] font-regular text-label ${selectedDistrictFeatures?.properties.Party_x === "Democratic" ? "text-demo_1" : "text-rep_1"}`}><span className='font-bold'>{selectedDistrictFeatures?.properties!.NAME}</span><br /> {selectedDistrictFeatures?.properties!.Party_x}</div>
                            </div>
                            {
                                (selectedDistrictFeatures?.properties.Address) !== undefined &&
                                <div className="flex items-start gap-[8px]">
                                    <img src="/icons/apartment.svg" alt="" className="w-[16px] h-[16px]" />
                                    <div className="w-[120px] font-regular text-label">{selectedDistrictFeatures?.properties.Address}</div>
                                </div>
                            }
                            {
                                (selectedDistrictFeatures?.properties.Phone) !== undefined &&
                                <div className="flex items-start gap-[8px]">
                                    <img src="/icons/phone.svg" alt="" className="w-[16px] h-[16px]" />
                                    <div className="font-regular text-label">{selectedDistrictFeatures?.properties.Phone}</div>
                                </div>
                            }
                            {
                                (selectedDistrictFeatures?.properties.email) !== undefined &&
                                (
                                    <div className="flex items-start gap-[8px] w-full">
                                        <img src="/icons/email.svg" alt="" className="w-[16px] h-[16px]" />
                                        <div className="font-regular text-[11.5px] overflow-wrap">{selectedDistrictFeatures?.properties.email}</div>
                                    </div>
                                )
                            }
                        </div>
                        <div className='my-[12px] w-full h-[1px] bg-grey_1'></div>
                        <div className='mb-[20px] text-[10px] text-grey_1'>
                            Click below to view intersecting geographic boundaries with {districts.charAt(0).toUpperCase() + districts.slice(1)} District {selectedDistrictFeatures?.properties!.District}.
                        </div>
                        <div>
                            <div className='mb-[5px] text-[10px] text-grey_1'>{districts === "senate" ? "Assembly" : "Senate"} Districts</div>
                            <div className='grid grid-cols-4 gap-[8px]'>
                                {
                                    selectedDistrictOverlappedData &&
                                    selectedDistrictOverlappedData.districts
                                        .map((c, i) => {
                                            if (districts === 'senate')
                                                return <GeoInfoBtns key={i} name={c.toString()} clickHandler={(e) => districtBtnClickHandler(e, "assembly")} mouseEnterHandler={(e) => districtMouseEnverHandler(e, "assembly")} mouseOutHandler={removeHoverEventHandler} />
                                            if (districts === 'assembly')
                                                return <GeoInfoBtns key={i} name={c.toString()} clickHandler={(e) => districtBtnClickHandler(e, "senate")} mouseEnterHandler={(e) => districtMouseEnverHandler(e, "senate")} mouseOutHandler={removeHoverEventHandler} />
                                        }

                                        )
                                }
                            </div>
                        </div>
                        <div className='my-[16px]'>
                            <div className='mb-[5px] text-[10px] text-grey_1'>Counties</div>
                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-[12px]'>
                                {
                                    selectedDistrictOverlappedData &&
                                    selectedDistrictOverlappedData.counties.map((c, i) =>
                                        <GeoInfoBtns key={i} name={c.replace("County", "")} mouseEnterHandler={countyMouseEnterHandler} mouseOutHandler={removeHoverEventHandler} />)
                                }
                            </div>
                        </div>
                        <div>
                            <div className='mb-[5px] text-[10px] text-grey_1'>Zip Codes</div>
                            <div className='grid grid-cols-2 lg:grid-cols-3 gap-[12px]'>
                                {
                                    selectedDistrictOverlappedData &&
                                    selectedDistrictOverlappedData.zip_codes.map((z, i) =>
                                        <GeoInfoBtns key={i} name={z} mouseEnterHandler={zipcodeMouseEnterHandler} mouseOutHandler={removeHoverEventHandler} />)
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )

}

export default Geopanel

