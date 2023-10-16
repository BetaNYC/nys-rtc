"use client";
import React, { useState, useContext } from 'react'
import { MapContext, MapContextType } from '../../context/MapContext'

import assembly from "../../public/nys_assembly.geo.json"
import senate from "../../public/nys_senate.geo.json"

import { GeoJSONSource } from 'mapbox-gl';



function Selection() {

    const { map } = useContext(MapContext) as MapContextType

    const senateFeatures = (senate as GeoJson).features
    const assemblyFeatures = (assembly as GeoJson).features

    const districtsChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districts = e.target.value
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


    }

    const legislationsChnageHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const legislations = e.target.value

        map?.setPaintProperty("districts", "fill-opacity", [
            "case",
            ["in", `${legislations}`, ["get", "HCMC support"]],
            1, 0
        ])
    }


    return (
        <>
            <select className='absolute py-[5px] top-[40px] left-[20px] text-black z-50' onChange={districtsChangeHandler}>
                <option value="senate">Senate</option>
                <option value="assembly">Assembly</option>
            </select>
            <select className='absolute py-[5px] top-[120px] left-[20px] text-black z-50' onChange={legislationsChnageHandler}>
                <option value="Statewide RTC">Statewide RTC</option>
                <option value="Winter Eviction Moratorium">Winter Eviction Moratorium</option>
                <option value="DEFEND RTC">Defend RTC</option>
            </select>
        </>

    )
}

export default Selection