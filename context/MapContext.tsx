"use client";
import { createContext, useState, Dispatch, SetStateAction, ReactNode, } from "react";

import mapboxgl, { EventData, MapMouseEvent } from 'mapbox-gl';

import * as turf from "@turf/turf";

export type MapContextType = {
    map: mapboxgl.Map | null,
    setMap: Dispatch<SetStateAction<mapboxgl.Map | null>>
    districts: Districts
    setDistricts: Dispatch<SetStateAction<Districts>>
    membershipShown: boolean
    setMembershipShown: Dispatch<SetStateAction<boolean>>
    panelShown: {
        geopanelShown: boolean,
        memberpanelShown: boolean
    },
    setPanelShown: Dispatch<SetStateAction<{
        geopanelShown: boolean,
        memberpanelShown: boolean
    }>>
    legislations: Legislations
    setLegislations: Dispatch<SetStateAction<Legislations>>
    mapClickHandler: (m: mapboxgl.Map, e: MapMouseEvent & EventData, legislations: Legislations) => void
    defaultMapHandler: (legislations: Legislations) => void
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


    const mapClickHandler = (m: mapboxgl.Map, e: MapMouseEvent & EventData, legislations: Legislations) => {

        const district = e.features[0].properties.District

        if (e.features[0].properties["HCMC support"].includes(legislations)) {
            m.setPaintProperty("districts", "fill-opacity", [
                "case",
                ["all", ["==", ["get", "District"], district], ["in", legislations, ["get", "HCMC support"]]],
                .75,
                ["in", legislations, ["get", "HCMC support"]],
                .05,
                0
            ])
            m.setPaintProperty("pattern", "fill-opacity", [
                "case",
                ["all", ["!", ["in", legislations, ["get", "HCMC support"]]]],
                .25, 0
            ])
        }

        if (!e.features[0].properties["HCMC support"].includes(legislations)) {
            m.setPaintProperty("districts", "fill-opacity", [
                "case",
                ["in", legislations, ["get", "HCMC support"]],
                .05, 0
            ])
            m.setPaintProperty("pattern", "fill-opacity", [
                "case",
                ["all", ["==", ["get", "District"], district]],
                .75,
                ["all", ["!", ["in", legislations, ["get", "HCMC support"]]]],
                .25, 0
            ])
        }

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

        map?.setPaintProperty("district_label", "text-opacity", 1)


        m.flyTo({
            center: targetCentroid as [number, number],
            zoom: 8
        })

        setPanelShown({ ...panelShown, geopanelShown: true })

    }

    const defaultMapHandler = (legislations: Legislations) => {
        map?.setPaintProperty("districts", "fill-opacity", [
            "case",
            ["in", `${legislations}`, ["get", "HCMC support"]],
            .75, 0
        ])
        map?.setPaintProperty("pattern", "fill-opacity", [
            "case",
            ["all", ["!", ["in", legislations, ["get", "HCMC support"]]]],
            .5, 0
        ]
        )


        map?.flyTo({
            center: [-78.5, 43.05] as [number, number],
            zoom: -6.25
        })


        /* @ts-ignore */
        map?.getSource("district_label").setData({
            type: "FeatureCollection",
            features: []
        })

        // map?.setPaintProperty("organizations", "circle-color", [
        //     'case',
        //     ["in", `Member`, ["get", "Membership Status"]],
        //     "#802948", "#ffffff"
        // ])

        // map?.setPaintProperty("organizations", "circle-stroke-color", "#802948")


        setPanelShown({ ...panelShown, geopanelShown: false, memberpanelShown: false })
    }






    return <MapContext.Provider value={{ map, setMap, districts, setDistricts, membershipShown, setMembershipShown, panelShown, setPanelShown, legislations, setLegislations, mapClickHandler, defaultMapHandler }}>
        {children}
    </MapContext.Provider>
}

export { MapContext, MapProvider }