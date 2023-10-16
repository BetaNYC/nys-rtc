import React, { useState, useEffect, useContext } from "react";

import { MapContext, MapContextType } from '../../context/MapContext'

import VotesVisualization from "./VotesVisualization";
import Introduction from "./Introduction";
import Toggler from "../elements/Toggler";

import { ChevronDownIcon } from '@heroicons/react/24/solid'

const name = ["Statewide RTC (S2721 / A1493)", "Winter Eviction Moratorium", "Defend RTC"]
const content = [
    "The COVID-19 pandemic made New York State's eviction crisis even worse. With more than 175,000 active eviction cases across the state (as of September 2023), New York communities need long term solutions that will keep them safe and securely housed. We're calling on NY State to pass Statewide Right to Counsel (S2721 / A1493), so ALL tenants across New York State have the right to a lawyer when facing an eviction.",
    "Local Right to Counsel laws must be defended! We know that 84% of tenants who have a lawyer are able to stay in their home. RTC is only effective if tenants are given the time they need to find a lawyer. The NYS legislature must pass our Defend Right to Counsel Legislation (S3254 / A4993)  to ensure that tenants in localities that have passed a Right to Counsel law are given the time they need to be connected to legal representation!",
    "Evictions tear apart families and communities, result in homelessness, and can cause serious mental and physical health problems. Especially during the winter months, New Yorkers need stable housing to keep kids in school, protect from infectious disease, and stay safe from the brutal cold. We're calling on NY State to pass a Winter Eviction Moratorium (S1403/A4093), to keep New Yorkers in their homes and out of the cold."
]

const legislationsData = {
    "Statewide RTC": "The COVID-19 pandemic made New York State's eviction crisis even worse. With more than 175,000 active eviction cases across the state (as of September 2023), New York communities need long term solutions that will keep them safe and securely housed. We're calling on NY State to pass Statewide Right to Counsel (S2721 / A1493), so ALL tenants across New York State have the right to a lawyer when facing an eviction.",
    "Winter Eviction Moratorium": "Local Right to Counsel laws must be defended! We know that 84% of tenants who have a lawyer are able to stay in their home. RTC is only effective if tenants are given the time they need to find a lawyer. The NYS legislature must pass our Defend Right to Counsel Legislation (S3254 / A4993)  to ensure that tenants in localities that have passed a Right to Counsel law are given the time they need to be connected to legal representation!",
    "Defend RTC": "Evictions tear apart families and communities, result in homelessness, and can cause serious mental and physical health problems. Especially during the winter months, New Yorkers need stable housing to keep kids in school, protect from infectious disease, and stay safe from the brutal cold. We're calling on NY State to pass a Winter Eviction Moratorium (S1403/A4093), to keep New Yorkers in their homes and out of the cold."
}


const SidePanel = () => {

    const { map } = useContext(MapContext) as MapContextType

    const [legislations, setLegislations] = useState({
        previous: "Statewide RTC" as Legislations,
        current: "Statewide RTC" as Legislations
    })

    const [organizations, setOrganizations] = useState({
        Members: false,
        Endorsers: false,
    })

    const organizationsClickHandler = (org: Organizations) => {
        let newOrg = { ...organizations }
        newOrg[org] = !newOrg[org]
        setOrganizations(newOrg)

    }

    const legislationsSelectHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as Legislations
        console.log(value)
        const newLegislations = {
            previous: legislations["current"],
            current: value
        }
        setLegislations(newLegislations)
    }

    useEffect(() => {
        if (organizations["Members"]) {
            map?.setLayoutProperty('organizations_members', "visibility", "visible")
        } else {
            map?.setLayoutProperty('organizations_members', "visibility", "none")
        }
        if (organizations["Endorsers"]) {
            map?.setLayoutProperty('organizations_endorsers', "visibility", "visible")
        } else {
            map?.setLayoutProperty('organizations_endorsers', "visibility", "none")
        }
    }, [organizations])

    useEffect(() => {
        map?.setPaintProperty('districts', 'fill-opacity', [
            "case",
            ["in", `${legislations['current']}`, ["get", "HCMC support"]],
            1, 0
        ])
    }, [legislations])







    return (
        <div className="absolute p-[23px] w-[424px] h-full bg-blue_background z-20">
            <div className="mb-[42px]">
                <h3 className="font-regular text-[12px] text-[#A0A0A0] ">Housing Courts Must Change! Campaign Legislation</h3>
                <select className='mt-[3px] px-[15px] py-[20px] w-full text-[16px] text-black bg-blue_selected rounded-[8px] cursor-pointer ' onChange={legislationsSelectHandler}>
                    <option value="Statewide RTC">Statewide Right to Counsel (S2721 / A1493)</option>
                    <option value="Winter Eviction Moratorium">Winter Eviction Moratorium (S1403/A4093)</option>
                    <option value="Defend RTC">Defend Right to Counsel Legislation (S3254 / A4993)</option>
                </select>
            </div>
            <div className="mb-[26px]">
                <VotesVisualization preLegislations={legislations["previous"]} legislations={legislations["current"]} />
            </div>
            <div className="mb-[97px]">
                <Introduction title={legislations["current"]} content={legislationsData[legislations["current"]]} />
            </div>
            <div>
                <h3 className={`mb-[15px] pl-[16px] pb-[8px] font-bold text-[20px] text-black border-b-[1px] border-[#C7C7C7]`}>RTC Coalition Membership</h3>
                <div className={`flex justify-between items-center mb-[15px] pb-[8px] pl-[16px]  text-[16px] border-b-[1px] border-[#C7C7C7]  cursor-pointer`} >
                    <div className='font-semibold text-black border-[#C7C7C7]'>Member Organizations</div>
                    <div className="flex items-center gap-[20px]">
                        <ChevronDownIcon className='ml-[100px] w-[15px] h-[15px] text-[#7B7B7B]' />
                        <Toggler show={organizations["Members"]} clickHandler={() => organizationsClickHandler("Members")} />
                    </div>

                </div>
                <div className={`flex justify-between items-center pb-[8px] pl-[16px]  text-[16px] border-b-[1px] border-[#C7C7C7]  cursor-pointer`}>
                    <div className='font-semibold text-black border-[#C7C7C7]'>Endorsers</div>
                    <div className="flex items-center gap-[20px]">
                        <ChevronDownIcon className='w-[15px] h-[15px] text-[#7B7B7B]' />
                        <Toggler show={organizations["Endorsers"]} clickHandler={() => organizationsClickHandler("Endorsers")} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SidePanel