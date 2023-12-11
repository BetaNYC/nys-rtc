"use client";
import { createContext, useState, Dispatch, SetStateAction, ReactNode, } from "react";

import mapboxgl, { EventData, MapMouseEvent } from 'mapbox-gl';

import * as turf from "@turf/turf";

import assemblyOverlapped from "../public/assembly_overlapping_boundaries.json"
import senateOverlapped from "../public/senate_overlapping_boundaries.json"

export type MapContextType = {
    map: mapboxgl.Map | null,
    setMap: Dispatch<SetStateAction<mapboxgl.Map | null>>
    districts: Districts
    setDistricts: Dispatch<SetStateAction<Districts>>
    membershipShown: boolean
    setMembershipShown: Dispatch<SetStateAction<boolean>>
    legislations: Legislations
    setLegislations: Dispatch<SetStateAction<Legislations>>
    mapClickHandler: (m: mapboxgl.Map, e: MapMouseEvent & EventData, legislations: Legislations) => void
    defaultMapHandler: (legislations: Legislations) => void
    selectedDistrictFeatures: selectedDistrictFeatures,
    setSelectedDistrictFeatures: Dispatch<SetStateAction<selectedDistrictFeatures>>,
    selectedDistrictOverlappedData: selectedDistrictOverlappedData,
    setSelectedDistrictOverlappedData: Dispatch<SetStateAction<selectedDistrictOverlappedData>>
    panelShown: {
        geopanelShown: boolean,
        memberpanelShown: boolean
    },
    setPanelShown: Dispatch<SetStateAction<{
        geopanelShown: boolean,
        memberpanelShown: boolean
    }>>
    mapShown: boolean
    setMapShown: Dispatch<SetStateAction<boolean>>
}

type Props = {
    children: ReactNode
}


const MapContext = createContext<MapContextType | null>(null)

const MapProvider = ({ children }: Props) => {

    const [map, setMap] = useState<mapboxgl.Map | null>(null)
    const [districts, setDistricts] = useState<Districts>("senate")
    const [legislations, setLegislations] = useState<Legislations>("Statewide RTC")
    const [membershipShown, setMembershipShown] = useState(false)
    const [panelShown, setPanelShown] = useState({
        geopanelShown: false,
        memberpanelShown: false
    })
    const [mapShown, setMapShown] = useState<boolean>(true)

    const [selectedDistrictFeatures, setSelectedDistrictFeatures] = useState<selectedDistrictFeatures | null>(null)
    const [selectedDistrictOverlappedData, setSelectedDistrictOverlappedData] = useState<selectedDistrictOverlappedData | null>(null)



    const mapClickHandler = (m: mapboxgl.Map, e: MapMouseEvent & EventData, legislations: Legislations) => {

        const district = e.features[0].properties.District

        m.setPaintProperty("districts_clicked_outline", 'line-width', [
            "case",
            ["all", ["==", ["get", "District"], district]],
            3.5,
            0
        ])

        let coordinatesArray = e.features[0].geometry.coordinates[0]
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
                        "label": "District " + e.features[0].properties.District.toString(),
                        "party": e.features[0].properties.Party_x
                    },
                    "geometry": {
                        'type': 'Point',
                        'coordinates': targetCentroid
                    }
                }
            ]
        }

        /* @ts-ignore */
        m.getSource("district_label").setData({
            type: "FeatureCollection",
            features: labelData.features as GeoJson["features"]
        })

        m.setPaintProperty("district_label", "text-opacity", 1)


        m.moveLayer("districts", "districts_clicked_outline")
        m.moveLayer("districts", "members")
        m.moveLayer('districts', "counties_borders")
        m.moveLayer("districts", "zipcodes")
        m.moveLayer("districts_outline", "members")
        m.moveLayer('districts_outline', 'districts_clicked_outline')
        m.moveLayer("districts_clicked_outline", "members")
        m.moveLayer("districts_clicked_outline", "district_label")
        m.moveLayer("pattern", "district_label")
        m.moveLayer('pattern', 'districts_clicked_outline')
        m.moveLayer('pattern', 'members')







        m.flyTo({
            center: targetCentroid as [number, number],
            zoom: targetCentroid[0] > -74.15 && targetCentroid[1] < 41.05 ? 11 : 7.5
        })

        setPanelShown({ geopanelShown: true, memberpanelShown: false })
        setSelectedDistrictFeatures(e.features[0])
        setSelectedDistrictOverlappedData((e.features[0].properties.House.toLowerCase() === "senate" ? senateOverlapped : assemblyOverlapped).filter(d => +d.district === +e.features[0]?.properties.District)[0])
    }

    const defaultMapHandler = (legislations: Legislations) => {

        map?.setPaintProperty("districts_outline", 'line-width', 1)
        map?.setPaintProperty("districts_clicked_outline", 'line-width', 0)

        map?.flyTo({
            center: [-78.5, 43.05] as [number, number],
            zoom: -6.25
        })


        /* @ts-ignore */
        map?.getSource("district_label").setData({
            type: "FeatureCollection",
            features: []
        })

        /* @ts-ignore */
        map?.getSource("members_label").setData({
            type: "FeatureCollection",
            features: []
        })

        map?.setPaintProperty("members", "circle-color", [
            "case",
            ["all", ["in", "Member", ["get", "Membership Status"]]],
            "#812948",
            "white"
        ],)

        map?.setPaintProperty("members", "circle-stroke-color", "#812948")

        map?.moveLayer("districts_outline", "members")
        map?.moveLayer("districts_outline", "district_label")

        setPanelShown({ ...panelShown, geopanelShown: false, memberpanelShown: false })
    }






    return <MapContext.Provider value={{ map, setMap, districts, setDistricts, membershipShown, setMembershipShown, panelShown, setPanelShown, legislations, setLegislations, mapClickHandler, defaultMapHandler, selectedDistrictFeatures, setSelectedDistrictFeatures, selectedDistrictOverlappedData, setSelectedDistrictOverlappedData, mapShown, setMapShown }}>
        {children}
    </MapContext.Provider>
}

export { MapContext, MapProvider }