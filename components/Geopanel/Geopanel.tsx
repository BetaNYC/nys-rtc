import React, { useContext, Dispatch, SetStateAction, MouseEvent, useState, useEffect } from 'react'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { MapContext, MapContextType } from '@/context/MapContext'
import GeoInfoBtns from './GeoInfoBtns'




import assembly from "../../public/assembly.geo.json"
import senate from "../../public/senate.geo.json"

import assemblyOverlapped from "../../public/assembly_overlapping_boundaries.json"
import senateOverlapped from "../../public/senate_overlapping_boundaries.json"

import mapboxgl, { EventData, MapMouseEvent } from 'mapbox-gl';



type Props = {
    selectedDistrictFeatures: selectedDistrictFeatures,
    setSelectedDistrictFeatures: Dispatch<SetStateAction<selectedDistrictFeatures>>,
    selectedDistrictOverlappedData: selectedDistrictOverlappedData,
    setSelectedDistrictOverlappedData: Dispatch<SetStateAction<selectedDistrictOverlappedData>>
}



const Geopanel = ({ selectedDistrictFeatures, setSelectedDistrictFeatures, selectedDistrictOverlappedData, setSelectedDistrictOverlappedData }: Props) => {

    const { map, districts, setDistricts, legislations, mapClickHandler, panelShown, defaultMapHandler } = useContext(MapContext) as MapContextType
    const districtBtnClickHandler = (e: MouseEvent<HTMLElement>, district: Districts) => {
        const overlappedData = district === "senate" ? senateOverlapped : assemblyOverlapped
        const selectedDistrict = (e.target as HTMLElement).innerText
        const clickedDistrictData = {
            features: ((district === "assembly" ? assembly : senate) as GeoJson).features.filter((d, i) => d.properties.District.toString() === selectedDistrict)
        }
        /* @ts-ignore */
        mapClickHandler(map!, clickedDistrictData, legislations)
        setSelectedDistrictFeatures(clickedDistrictData.features[0])
        setSelectedDistrictOverlappedData((overlappedData).filter(d => d.district === clickedDistrictData.features[0]?.properties.District)[0])
        setDistricts(district)
    }

    const zipcodeMouseEnterHandler = (e: MouseEvent<HTMLElement>) => {
        console.log("aa")
        const selectedZipcodes = (e.target as HTMLElement).innerText
        map?.setPaintProperty("zipcodes", "fill-opacity", [
            "case",
            ['all', ['==', ['get', "ZCTA5CE10"], selectedZipcodes]],
            .5, 0
        ])
    }

    const countyMouseEnterHandler = (e: MouseEvent<HTMLElement>) => {
        const selectedCounty = (e.target as HTMLElement).innerText
        map?.setPaintProperty("counties_borders", "fill-opacity", [
            "case",
            ['all', ['==', ['get', "name"], selectedCounty + " County"]],
            .5, 0
        ])
        map?.setPaintProperty("counties_labels", "text-opacity", [
            "case",
            ['all', ['==', ['get', "name"], selectedCounty + " County"]],
            1, 0
        ])
    }

    const removeHoverEventHandler = () => {
        map?.setPaintProperty("counties_borders", "fill-opacity", 0)
        map?.setPaintProperty("counties_labels", "text-opacity", 0)
        map?.setPaintProperty("zipcodes", "fill-opacity", 0)
    }

    useEffect(() => {
        /* @ts-ignore */
        map?.getSource("districts").setData({
            type: "FeatureCollection",
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
                <div className='flex flex-col absolute top-0 right-0 w-[14%] h-full z-20 overflow-y-scroll'>
                    {/* @ts-ignore */}
                    <div className={`flex items-start justify-between p-[18px]  w-full ${selectedDistrictFeatures?.properties.Party_x === "Democratic" ? "bg-demo_1" : "bg-rep_1"} `}>
                        <div>
                            <div className='text-label'>New York State {districts.charAt(0).toUpperCase() + districts.slice(1)}</div>
                            {/* @ts-ignore */}
                            <div className='font-bold text-subheadline'>District {selectedDistrictFeatures?.properties!.District}</div>
                        </div>
                        <XMarkIcon className=' w-[20px] h-[20px] text-white cursor-pointer' onClick={() => defaultMapHandler(legislations)} />
                    </div>
                    <div className='flex-1 p-[18px] w-full bg-white'>
                        <div className='text-[10px] text-regular text-grey_1'>HCMC Campaign Support</div>
                        <div className="flex flex-col gap-[5px] mt-[6px] text-rtc_navy">
                            <div className="flex items-center gap-[5px] ">
                                <img src={selectedDistrictFeatures?.properties!["HCMC support"].includes("Statewide RTC") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                                <div className="font-bold text-label">Statewide RTC</div>
                            </div>
                            <div className="flex items-center gap-[5px]">
                                <img src={selectedDistrictFeatures?.properties!["HCMC support"].includes("Winter Eviction Moratorium") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                                <div className="font-bold text-label">Winter Eviction Moratorium</div>
                            </div>
                            <div className="flex items-center gap-[5px]">
                                <img src={selectedDistrictFeatures?.properties!["HCMC support"].includes("Defend RTC") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                                <div className="font-bold text-label">Defend RTC</div>
                            </div>
                            <div className="flex items-center gap-[5px]">

                                <img src={selectedDistrictFeatures?.properties!["HCMC support"].includes("Fund Local Law 53") ? "/icons/checked.svg" : "/icons/empty.svg"} alt="" className="w-[16px] h-[16px]" />
                                <div className="font-bold text-label">Power to Organize:<br /> Fund Local Law 53</div>
                            </div>
                        </div>
                        <div className='my-[12px] w-full h-[1px] bg-grey_1'></div>
                        <div className='text-[10px] text-regular text-grey_1'>{districts.charAt(0).toUpperCase() + districts.slice(1)} District General Info</div>
                        <div className="flex flex-col gap-[16px] mt-[6px] text-rtc_navy">
                            <div className="flex items-center gap-[12px]">
                                <img src="/icons/person.svg" alt="" className="w-[16px] h-[16px]" />
                                <div className={`w-[120px] font-regular text-label ${selectedDistrictFeatures?.properties.Party_x === "Democratic" ? "text-demo_1" : "text-rep_1"}`}><span className='font-bold'>{selectedDistrictFeatures?.properties!.NAME}</span><br /> Democrat</div>
                            </div>
                            {
                                (selectedDistrictFeatures?.properties.Address) !== undefined &&
                                <div className="flex items-center gap-[12px]">
                                    <img src="/icons/apartment.svg" alt="" className="w-[16px] h-[16px]" />
                                    <div className="w-[120px] font-regular text-label">{selectedDistrictFeatures?.properties.Address}</div>
                                </div>
                            }
                            <div className="flex items-center gap-[12px]">
                                <img src="/icons/phone.svg" alt="" className="w-[16px] h-[16px]" />
                                <div className="font-regular text-label">{selectedDistrictFeatures?.properties.Phone}</div>
                            </div>
                            {
                                (selectedDistrictFeatures?.properties.email) !== undefined &&
                                (
                                    <div className="flex items-center gap-[12px]">
                                        <img src="/icons/email.svg" alt="" className="w-[16px] h-[16px]" />
                                        <div className="font-regular text-label">{selectedDistrictFeatures?.properties.email}</div>
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
                                                return <GeoInfoBtns key={i} name={c.toString()} clickHandler={(e) => districtBtnClickHandler(e, "assembly")} />
                                            if (districts === 'assembly')
                                                return <GeoInfoBtns key={i} name={c.toString()} clickHandler={(e) => districtBtnClickHandler(e, "senate")} />
                                        }

                                        )
                                }
                            </div>
                        </div>
                        <div className='my-[16px]'>
                            <div className='mb-[5px] text-[10px] text-grey_1'>Counties</div>
                            <div className='grid grid-cols-2 gap-[12px]'>
                                {
                                    selectedDistrictOverlappedData &&
                                    selectedDistrictOverlappedData.counties.map((c, i) =>
                                        <GeoInfoBtns key={i} name={c.replace("County", "")} mouseEnterHandler={countyMouseEnterHandler} mouseOutHandler={removeHoverEventHandler} />)
                                }
                            </div>
                        </div>
                        <div>
                            <div className='mb-[5px] text-[10px] text-grey_1'>Zip Codes</div>
                            <div className='grid grid-cols-3 gap-[12px]'>
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

