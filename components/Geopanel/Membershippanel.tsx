import React, { useContext, Dispatch, SetStateAction, MouseEvent, useEffect } from 'react'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { MapContext, MapContextType } from '@/context/MapContext'
import GeoInfoBtns from './GeoInfoBtns'

import * as turf from "@turf/turf";

import assembly from "../../public/assembly.geo.json"
import senate from "../../public/senate.geo.json"

import assemblyOverlapped from "../../public/assembly_overlapping_boundaries.json"
import senateOverlapped from "../../public/senate_overlapping_boundaries.json"
import membersOverlapped from "../../public/rtc_members.geo.json"
import membersInfo from "../../public/rtc_members_info.json"
import { EventData, MapMouseEvent } from 'mapbox-gl';


type Props = {
    selectedMemberFeatures: selectedMemberFeatures | null,
    setSelectedMemberFeatures: Dispatch<SetStateAction<selectedMemberFeatures | null>>
}


const Membershippanel = ({ selectedMemberFeatures, setSelectedMemberFeatures }: Props) => {

    const { map, setDistricts, legislations, panelShown, setPanelShown, defaultMapHandler, mapClickHandler, setSelectedDistrictFeatures, setSelectedDistrictOverlappedData } = useContext(MapContext) as MapContextType
    const selectedMemberOverlappedData = (membersOverlapped.features).filter(m => m.properties.Name === selectedMemberFeatures?.properties.Name)[0]?.properties


    const districtClickHandler = (e: MouseEvent<HTMLElement>, district: Districts) => {
        const selectedDistrict = (e.target as HTMLElement).innerText
        /* @ts-ignore */
        map?.getSource("districts").setData({
            type: "FeatureCollection",
            /* @ts-ignore */
            features: ((district === "assembly" ? assembly : senate) as GeoJson).features
        });

        const clickedDistrictData = {
            /* @ts-ignore */
            features: ((district === "assembly" ? assembly : senate) as GeoJson).features.filter((d, i) => d.properties.District.toString() === selectedDistrict)
        }

        /* @ts-ignore */
        mapClickHandler(map!, clickedDistrictData, legislations)
        setSelectedDistrictFeatures(clickedDistrictData.features[0])
        setSelectedDistrictOverlappedData((district === "senate" ? senateOverlapped : assemblyOverlapped).filter(d => d.district === clickedDistrictData.features[0]?.properties.District)[0])
        setDistricts(district)
        setPanelShown({ ...panelShown, memberpanelShown: false, geopanelShown: true })
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



    const countyMouseEnterHandler = (e: MouseEvent<HTMLElement>) => {
        const selectedCounty = (e.target as HTMLElement).innerText
        map?.setPaintProperty("counties_borders", "fill-opacity", [
            "case",
            ['all', ['==', ['get', "name"], selectedCounty + " County"]],
            .7, 0
        ])

        map?.setPaintProperty("counties_labels", "text-opacity", [
            "case",
            ['all', ['==', ['get', "name"], selectedCounty + " County"]],
            1, 0
        ])

        map?.moveLayer("background", "counties_borders")
        map?.moveLayer("districts", "counties_borders")
        map?.moveLayer('pattern', "counties_borders")
        map?.moveLayer('pattern', "counties_labels")
        map?.moveLayer('districts_outline', "counties_borders")
        map?.moveLayer('districts_clicked_outline', "counties_borders")
        map?.moveLayer('districts_outline', "counties_labels")
        map?.moveLayer('districts_clicked_outline', "counties_labels")
    }

    const zipcodeMouseEnterHandler = (e: MouseEvent<HTMLElement>) => {
        const selectedZipcodes = (e.target as HTMLElement).innerText
        map?.setPaintProperty("zipcodes", "fill-opacity", [
            "case",
            ['all', ['==', ['get', "ZCTA5CE10"], selectedZipcodes]],
            .7, 0
        ])
        map?.moveLayer("districts", "zipcodes")
    }

    const removeHoverEventHandler = () => {
        map?.setPaintProperty("counties_borders", "fill-opacity", 0)
        map?.setPaintProperty("counties_labels", "text-opacity", 0)
        map?.setPaintProperty("counties_labels", "text-opacity", 0)
        map?.setPaintProperty("zipcodes", "fill-opacity", 0)

        /* @ts-ignore */
        map?.getSource("districts_hovered").setData({
            type: "FeatureCollection",
            features: []
        })
        map?.moveLayer("districts", "counties_borders")
        map?.setPaintProperty("districts_hovered_label", "text-opacity", 0)
    }


    useEffect(() => {
        map?.on('click', "members", (e: MapMouseEvent & EventData) => {
            setSelectedMemberFeatures(e.features[0])
            setPanelShown({ ...panelShown, geopanelShown: false, memberpanelShown: true })

            const targetCentroid = [e.features[0].geometry.coordinates[0], e.features[0].geometry.coordinates[1]]
            map?.flyTo({
                center: targetCentroid as [number, number],
                zoom: targetCentroid[0] > -74.15 && targetCentroid[1] < 41.05 ? 13 : 8
            })


            map?.moveLayer("districts_outline", "members_label")
            map?.moveLayer("districts_outline", "members")
            map?.moveLayer("districts_clicked_outline", "members_label")
            map?.moveLayer("districts_clicked_outline", "members")
        })
    })

    return (
        <>
            {panelShown["memberpanelShown"] && (
                <div className='flex flex-col absolute top-0 right-0 w-[14%] min-w-[200px] h-full z-20 overflow-y-scroll'>
                    <div className='px-[18px] py-[12px] w-full bg-rtc_purple'>
                        <div className={`flex items-start justify-between my-[12px] w-full text-white`}>
                            <div className='w-[75%] font-bold text-subheadline text-white'>{selectedMemberFeatures?.properties.Name.toUpperCase()}</div>
                            <XMarkIcon className='w-[20px] h-[20px] text-white cursor-pointer' onClick={() => defaultMapHandler(legislations)} />
                        </div>
                        <div className='flex items-center gap-[6px]'>
                            <img src={selectedMemberFeatures?.properties["Membership Status"].includes("Member") ? "/icons/checked_member.svg" : "/icons/empty_member.svg"} alt="" className='w-[20px] h-[20px]' />
                            <div>
                                <div className='text-[10px] text-white'>Right to Counsel NYC Coalition</div>
                                <div className={`font-semibold text-label text-white `}>{selectedMemberFeatures?.properties["Membership Status"].includes("Member") ? "Campaign Member" : "Endorser"}</div>
                            </div>
                        </div>
                    </div>
                    <div className='flex-1 p-[18px] pl-[19px] w-full bg-white'>
                        <div className='text-[10px] text-regular text-grey_1'>HCMC Campaign Support</div>
                        <div className="flex flex-col gap-[5px] mt-[6px] text-rtc_navy">
                            <div className="flex items-start gap-[5px] ">
                                {/* @ts-ignore */}
                                <img src={selectedMemberFeatures?.properties!["Legislation"].includes("Statewide Right to Counsel") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                                <div className="font-bold text-label">Statewide Right to Counsel</div>
                            </div>
                            <div className="flex items-start gap-[5px]">
                                {/* @ts-ignore */}
                                <img src={selectedMemberFeatures?.properties!["Legislation"].includes("Defend Right to Counsel") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                                <div className="font-bold text-label">Defend Right to Counsel</div>
                            </div>
                            <div className="flex items-start gap-[5px]">
                                {/* @ts-ignore */}
                                <img src={selectedMemberFeatures?.properties!["Legislation"].includes("Winter Eviction Moratorium") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                                <div className="font-bold text-label">Winter Eviction Moratorium</div>
                            </div>
                        </div>
                        <div className='my-[12px] w-full h-[1px] bg-grey_1'></div>
                        <div className='text-[10px] text-regular text-grey_1'>Right to Counsel NYC {selectedMemberFeatures?.properties["Membership Status"]} General Information
                        </div>
                        <div className="flex flex-col gap-[16px] mt-[6px] text-rtc_navy">
                            {
                                (selectedMemberFeatures?.properties.Address) !== undefined &&
                                <div className="flex items-start gap-[8px]">
                                    <img src="/icons/apartment.svg" alt="" className="w-[16px] h-[16px]" />
                                    <div className="w-[120px] font-regular text-label">{selectedMemberFeatures?.properties.Address}</div>
                                </div>
                            }
                            {
                                (selectedMemberFeatures?.properties.Phone) !== undefined &&
                                <div className="flex items-start gap-[8px]">
                                    <img src="/icons/phone.svg" alt="" className="w-[16px] h-[16px]" />
                                    <div className="font-regular text-label">{selectedMemberFeatures?.properties.Phone}</div>
                                </div>
                            }

                            {
                                (selectedMemberFeatures?.properties.Website) !== undefined &&
                                (
                                    <div className="flex items-start gap-[8px] w-full">
                                        <img src="/icons/email.svg" alt="" className="w-[16px] h-[16px]" />
                                        <div className="font-regular text-[11.5px] overflow-wrap">{selectedMemberFeatures?.properties.Website}</div>
                                    </div>
                                )
                            }
                        </div>
                        <div className='my-[12px] w-full h-[1px] bg-grey_1'></div>
                        <div className='mb-[20px] text-[10px] text-grey_1'>
                            Click below to view intersecting geographic boundaries with {selectedMemberFeatures?.properties.Name}.
                        </div>
                        <div>
                            <div className='mb-[5px] text-[10px] text-grey_1'>Senate Districts</div>
                            <div className='grid grid-cols-4 gap-[8px]'>
                                 {/* @ts-ignore */}
                                <GeoInfoBtns name={selectedMemberOverlappedData['Senate_District'].toString()} clickHandler={(e) => districtClickHandler(e, "senate")} mouseEnterHandler={(e) => districtMouseEnverHandler(e, "senate")} mouseOutHandler={removeHoverEventHandler} />
                            </div>
                        </div>
                        <div className='my-[16px]'>
                            <div className='mb-[5px] text-[10px] text-grey_1'>Assembly Districts</div>
                            <div className='grid grid-cols-4 gap-[8px]'>
                                 {/* @ts-ignore */}
                                <GeoInfoBtns name={selectedMemberOverlappedData['Assembly_District'].toString()} clickHandler={(e) => districtClickHandler(e, "assembly")} mouseEnterHandler={(e) => districtMouseEnverHandler(e, "assembly")} mouseOutHandler={removeHoverEventHandler} />
                            </div>
                        </div>
                        <div className='my-[16px]'>
                            <div className='mb-[5px] text-[10px] text-grey_1'>Counties</div>
                            <div className='grid grid-cols-2 gap-[12px]'>
                                 {/* @ts-ignore */}
                                <GeoInfoBtns name={selectedMemberOverlappedData['County'].toString().replace(" County", "")} mouseEnterHandler={countyMouseEnterHandler} mouseOutHandler={removeHoverEventHandler} />
                            </div>
                        </div>
                        <div>
                            <div className='mb-[5px] text-[10px] text-grey_1'>Zip Codes</div>
                            <div className='grid grid-cols-3 gap-[12px]'>
                                 {/* @ts-ignore */}
                                <GeoInfoBtns name={selectedMemberOverlappedData['Zip_Code'].toString()} mouseEnterHandler={zipcodeMouseEnterHandler} mouseOutHandler={removeHoverEventHandler} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Membershippanel