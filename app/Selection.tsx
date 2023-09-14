"use client";
import React, { useState, useContext } from 'react'
import { MapContext, MapContextType } from './Context/MapContext'

import assembly from "../public/state_assembly_districts.geo.json"
import senate from "../public/state_senate.geo.json"

import { GeoJSONSource, GeoJSONSourceRaw } from 'mapbox-gl';
import { type } from 'os';


function Selection() {

    const { map } = useContext(MapContext) as MapContextType

    const senateFeatures = (senate as GeoJson).features
    const assemblyFeatures = (assembly as GeoJson).features

    const changeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        switch (value) {
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


    return (
        <>
            <select className='absolute py-[5px] top-[40px] left-[20px] text-black z-50' onChange={changeHandler}>
                <option value="senate">Senate</option>
                <option value="assembly">Assembly</option>
            </select>
        </>

    )
}

export default Selection