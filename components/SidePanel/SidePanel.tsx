import React, { useState, useEffect, useContext } from "react";

import { MapContext, MapContextType } from '../../context/MapContext'

import LegislationColumns from "./LegislationColumns";
import About from "./About";

import Image from 'next/image'

import legislationsInfo from "../../public/legislations_info.json"

export type Columns = "About" | "Statewide RTC" | "Winter Eviction Moratorium" | "Defend RTC"


const SidePanel = () => {
    const { legislations, setLegislations, mapClickHandler, defaultMapHandler } = useContext(MapContext) as MapContextType
    const [expand, setExpand] = useState({
        "About": true,
        "Statewide RTC": false,
        "Winter Eviction Moratorium": false,
        "Defend RTC": false
    })


    const legislationsClickHandler = (l: Columns) => {
        const newExpand = { ...expand } as {
            "About": boolean,
            "Statewide RTC": boolean,
            "Winter Eviction Moratorium": boolean,
            "Defend RTC": boolean
        }
        (Object.keys(newExpand) as Columns[]).forEach((e: Columns) => e === l ? newExpand[e] = true : newExpand[e] = false)
        setExpand(newExpand)

        if (l !== "About") {
            setLegislations(l)
        }
    }





    useEffect(() => {
        defaultMapHandler(legislations)
    }, [legislations])


    return (
        <div className="absolute flex flex-col justify-between w-[35%] md:w-[32%] lg:w-[30%]  xl:w-[28%]  h-[100vh] bg-background_blue z-50">
            <div className="flex flex-col justify-between">
                <div>
                    <div className="mt-[20px] mb-[20px] px-[25px]">
                        <h1 className="mb-[5px] font-bold text-[24px] text-rtc_purple leading-[1.25]">Housing Courts Must Change!</h1>
                        <h2 className="font-bold text-subheadline text-rtc_navy">NY State Right to Counsel Map for HCMC Support</h2>
                    </div>
                    <About expand={expand} legislationsClickHandler={legislationsClickHandler} />
                </div>
                <div>
                    <LegislationColumns legislation={"Statewide RTC"} name={legislationsInfo[0]["Bill Name"]} number={legislationsInfo[0]["Senate Number"] + " / " + legislationsInfo[0]["Assembly Number"]} content={legislationsInfo[0]["Bill Description"]} expand={expand["Statewide RTC"]} legislationsClickHandler={() => legislationsClickHandler("Statewide RTC")} />
                    <LegislationColumns legislation={"Defend RTC"} name={legislationsInfo[2]["Bill Name"]} number={legislationsInfo[2]["Senate Number"] + " / " + legislationsInfo[2]["Assembly Number"]} content={legislationsInfo[2]["Bill Description"]} expand={expand["Defend RTC"]} legislationsClickHandler={() => legislationsClickHandler("Defend RTC")} />
                    <LegislationColumns legislation={"Winter Eviction Moratorium"} name={legislationsInfo[3]["Bill Name"]} number={legislationsInfo[3]["Senate Number"] + " / " + legislationsInfo[3]["Assembly Number"]} content={legislationsInfo[3]["Bill Description"]} expand={expand["Winter Eviction Moratorium"]} legislationsClickHandler={() => legislationsClickHandler("Winter Eviction Moratorium")} />
                </div>
            </div>
            <div className="flex items-center gap-[15px] px-[30px] pb-[10px]">
                <Image
                    src="/logos/RTC.png"
                    width={131.79*0.8}
                    height={30}
                    alt="RTC"
                />
                <Image
                    src="/logos/betaNYC.svg"
                    width={97.65*0.8}
                    height={40}
                    alt="BetaNYC"
                />
            </div>
        </div>
    )
}

export default SidePanel