"use client"
import React, { useState } from 'react'

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'

import { Columns } from './SidePanel'
import Link from 'next/link'

type Props = {
    expand: {
        "About": boolean,
        "Statewide RTC": boolean,
        "Winter Eviction Moratorium": boolean,
        "Defend RTC": boolean
    },
    legislationsClickHandler: (l: Columns) => void
}

const About = ({ expand, legislationsClickHandler }: Props) => {

    const [selectedContent, setSelectedContent] = useState<"intro" | "credits">("intro")

    const contentClickHandler = (c: "intro" | "credits") => setSelectedContent(c)


    return (
        <div className={`flex flex-col pt-[12px] lg:pt-[10.5px] pb-[0px] text-rtc_navy ${expand["About"] ? "h-[calc(100vh-112px-230px)] xl:h-[calc(100vh-112px-200px)] bg-white overflow-y-hidden" : "h-[40px] bg-background_blue overflow-y-hidden"} border-y-[1px] border-grey_1 `} onClick={() => legislationsClickHandler("About")}>
            <div className={`flex justify-between items-center px-[20px] cursor-pointer`}>
                <h2 className="font-semibold text-[13px] lg:text-title ">ABOUT</h2>
                {
                    expand["About"] ? <ChevronUpIcon className="w-[20px] h-[20px] cursor-pointer" onClick={() => legislationsClickHandler("About")} /> : <ChevronDownIcon className="w-[20px] h-[20px] cursor-pointer"  />
                }
            </div>
            <div className="flex justify-between items-start my-[16px] px-[20px]">
                <h2 className={`pb-[3px] mr-12 font-semibold text-[13px] lg:text-title border-b-2 leading-[1.2] hover:text-rtc_navy hover:border-rtc_navy  ${selectedContent === "intro" ? "text-rtc_navy  border-rtc_navy" : "text-grey_1 border-white "}  cursor-pointer`} onClick={() => contentClickHandler("intro")}>HCMC! Campaign Legislation Map</h2>
                <h2 className={`font-semibold text-[13px] lg:text-title border-b-2 hover:text-rtc_navy hover:border-rtc_navy ${selectedContent === "credits" ? "text-rtc_navy  border-rtc_navy" : "text-grey_1 border-white "} cursor-pointer`} onClick={() => contentClickHandler("credits")}>Credits</h2>
            </div>
            {
                selectedContent === "intro" && (
                    <div className='flex-1 flex flex-col justify-between  overflow-y-scroll'>
                        <div className="text-[12px] lg:text-body mx-[20px]">
                            <p>
                                <a className='hover:underline' target='_blank' href='https://www.righttocounselnyc.org/hcmc'>Housing Courts Must Change! (HCMC)</a> is a statewide campaign launched by the Right to Counsel NYC Coalition in 2020 to transform the courts across New York State (NYS) from an “eviction machine” to a place that holds landlords accountable, upholds tenants’ rights, and enables tenants to remain in their homes.
                            </p>
                            <div className="my-[20px]">
                                NYS legislative support for the HCMC campaign platform is shown on the map through Senate and Assembly districts. The HCMC campaign focuses on our legislative demands:
                                <li><a className='hover:underline' target='_blank' href='https://www.nysenate.gov/legislation/bills/2023/S2721'>Statewide Right to Counsel (S2721 / A1493)</a></li>
                                <li><a className='hover:underline' target='_blank' href='https://www.nysenate.gov/legislation/bills/2023/S1403#:~:text=2023%2DS1403%20(ACTIVE)%20%2D%20Summary,properties%20during%20the%20winter%20months.'>Defend Right to Counsel (S3254 / A4993)</a></li>
                                <li><a className='hover:underline' target='_blank' href='https://www.nysenate.gov/legislation/bills/2023/S3254'>Winter Eviction Moratorium (S1403 / A4093)</a></li>
                                <li><a className='hover:underline' target='_blank' href='https://nyassembly.gov/leg/?default_fld=&leg_video=&bn=A00490&term=&Summary=Y&Actions=Y'>Clean Hands (A490)</a></li>
                            </div>
                            <p className='mb-[20px]'>
                                Explore the map to view co-located geographic support between the Right to Counsel NYC Coalition’s base support, zip code boundaries, counties, assembly districts, and senate districts.
                            </p>
                            <p>
                                To take action in support of our campaign, go to:<a className='underline' target='_blank' href='https://www.righttocounselnyc.org/takeaction' >https://www.righttocounselnyc.org/takeaction</a>
                            </p>
                        </div>
                        <div className="mx-[20px] mt-[20px] mb-[60px] font-semibold text-title text-rtc_purple">
                            Click on the map to begin exploring!
                        </div>
                    </div>
                )
            }
            {
                selectedContent === "credits" && (
                    <div className="text-[12px] lg:text-body overflow-y-scroll">
                        <p className='mx-[20px]'>
                            This project was designed and developed by BetaNYC’s Civic Innovation Lab in collaboration with the Right to Counsel NYC Coalition, through a BetaNYC service called Research and Data Assistance Request (RADAR).
                        </p>
                        <div className="m-[20px]">
                            <p className='mb-[8px] font-semibold text-title'><a className='hover:text-grey_1 hover:underline' target='_blank' href="https://www.righttocounselnyc.org/hcmc">Right to Counsel NYC Coalition</a></p>
                            <p>The Right to Counsel NYC Coalition is a tenant-led coalition that formed in 2014 to disrupt Housing Court as a center of displacement and stop the eviction crisis that has threatened our families, our neighborhoods, and our homes for too long. Our Coalition is made up of tenants, organizers, advocates, legal services organizations and more! Our work is rooted in principles of dignity, diversity, equity, humanity, and justice. After a hard fought, three-year grassroots campaign, we won and became the first city in the nation to establish a Right to Counsel for tenants facing eviction.</p>
                        </div>
                        <div className="m-[20px]">
                            <p className='mb-[8px] font-semibold text-title'><a className='hover:text-grey_1 hover:underline' target='_blank' href="https://beta.nyc/">BetaNYC</a></p>
                            <p>BetaNYC is a civic organization dedicated to improving lives in New York through civic design, technology, and data. With an aim to improve access to public interest technology, the Civic Innovation Lab at BetaNYC provides assistance with research, data analysis, and data visualization. The Civic Innovation Lab at BetaNYC created this project in response to a Research and Data Assistance Request (RADAR) submitted by the Right to Counsel NYC Coalition.Follow this link&#20;
                                <a className='underline' target='_blank' href={"https://beta.nyc/products/research-and-data-assistance-requests/"}>to learn more about RADARs and how to submit a request!</a></p>
                        </div>
                        <div className="m-[20px] mb-[40px] ">
                            <p className='font-semibold text-body'>BetaNYC Civic Innovation Lab Team</p>
                            <p>Ashley Louie (Director), Hao Lun Hung (Project Lead), Erik Brown, Hailee Hoa Luong</p>

                        </div>
                    </div>
                )
            }



        </div>
    )
}

export default About