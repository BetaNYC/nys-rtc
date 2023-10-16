import React, { useState } from 'react'

import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'

const name = ["STATEWIDE RIGHT TO COUNSEL", "WINTER EVICTION MORATORIUM", "DEFEND RIGHT TO COUNSEL"]
const content = [
    "The COVID-19 pandemic made New York State's eviction crisis even worse. With more than 175,000 active eviction cases across the state (as of September 2023), New York communities need long term solutions that will keep them safe and securely housed. We're calling on NY State to pass Statewide Right to Counsel (S2721 / A1493), so ALL tenants across New York State have the right to a lawyer when facing an eviction.",
    "Local Right to Counsel laws must be defended! We know that 84% of tenants who have a lawyer are able to stay in their home. RTC is only effective if tenants are given the time they need to find a lawyer. The NYS legislature must pass our Defend Right to Counsel Legislation (S3254 / A4993)  to ensure that tenants in localities that have passed a Right to Counsel law are given the time they need to be connected to legal representation!",
    "Evictions tear apart families and communities, result in homelessness, and can cause serious mental and physical health problems. Especially during the winter months, New Yorkers need stable housing to keep kids in school, protect from infectious disease, and stay safe from the brutal cold. We're calling on NY State to pass a Winter Eviction Moratorium (S1403/A4093), to keep New Yorkers in their homes and out of the cold."
]


function Landing() {

    const [legislation, setlegislation] = useState<number>(-1)
    const [shown, setShown] = useState<boolean>(true)

    const introClickHandler = (k: number) => {
        legislation === k ? setlegislation(-1) : setlegislation(k)
    }

    const showClickHandler = () => {
        setShown(!shown)
    }



    return (
        <div className={`${!shown ? "translate-x-[-100%] duration-200 ease-linear" : null} absolute px-[20px] py-[25px] w-[561px] h-full text-black bg-[#F1F4FA] z-30`}>
            <div className='flex justify-between items-center mb-[20px] pl-[16px] w-full h-[48px]'>
                <Image
                    src="/rtc.png"
                    width={211}
                    height={50}
                    alt="RTC"
                />
                <ChevronLeftIcon className='w-[20px] h-[20px] text-[#7B7B7B]  cursor-pointer' onClick={showClickHandler}/>
            </div>
            <div className='mb-[150px]'>
                <div className='mb-[20px] pl-[16px]'>
                    <h1 className='font-bold pb-[6px] text-[32px]'>Housing Courts Must Change!</h1>
                    <h2 className='font-bold text-[20px] text-[#878787]'>NYS Right to Counsel Map for HCMC Support</h2>
                </div>
                <div className='pr-[45px] pl-[16px] py-[20px]  w-full text-black bg-gray_background rounded-[8px]'>
                    <h3 className='font-semibold text-[16px]'>About the Map</h3>
                    <p className='pt-[7px] pb-[14px] font-regular text-[14px] leading-normal'>
                        Housing Courts Must Change! (HCMC) is a statewide campaign launched by the Right to Counsel NYC Coalition in 2020 to transform the courts from an “eviction machine” to a place that holds landlords accountable, upholds tenants’ rights, and enables tenants to remain in their homes.
                    </p>
                    <p className='font-regular text-[14px] leading-normal'>
                        New York State (NYS) support for HCMC campaign legislation is shown in the map through Senate and Assembly districts. Explore the map to view co-located geographic support between Right to Counsel NYC Coalition’s base support, zip code boundaries, counties, assembly districts, and senate districts.
                    </p>
                </div>
            </div>
            <div className={`relative ${legislation >= 0 ? "translate-y-[-132px]" : null}`}>
                <h3 className={`${legislation !== -1 ? "mb-[15px]" : "mb-[30px]"} pl-[5px] pb-[8px] font-bold text-[20px] border-b-[1px] border-[#C7C7C7]`}>HCMC!Campaign Legislation</h3>
                <div className='flex flex-col gap-[15px] pl-[5px]'>
                    {
                        name?.map((l, i) => {
                            return (
                                <div key={i} className={`${i <= legislation ? `translate-y-[0px]` : `translate-y-[-15px]`}`}>
                                    <div className={`flex justify-between items-center pb-[8px] text-[16px] border-b-[1px] border-[#C7C7C7]  cursor-pointer`} onClick={() => introClickHandler(i)}>
                                        <div className='font-semibold uppercase border-[#C7C7C7]'>{l}</div>
                                        {i === legislation ? <ChevronUpIcon className='w-[15px] h-[15px] text-[#7B7B7B] cursor-pointer' /> : <ChevronDownIcon className='w-[15px] h-[15px] text-[#7B7B7B]' />}
                                    </div>

                                    <div className={`${i === legislation ? "block" : "hidden"} transition-all`}>
                                        <p className='pt-[7px] pb-[14px] font-regular text-[14px] leading-normal'>{content[i]}</p>
                                    </div>
                                </div >


                            )
                        })
                    }
                </div>
                <div className='absolute bottom-[-65px] flex gap-[24px] pl-[5px]'>
                    <div className='px-[12px] py-[15px] font-semibold text-[16px] text-white bg-[#983561] rounded-[8px] cursor-pointer' onClick={showClickHandler}>Explore The Map</div>
                    <div className='px-[12px] py-[15px] font-semibold text-[#983561] border-[1.5px] border-[#983561] rounded-[8px] cursor-pointer'>Right to Counsel</div>
                </div>
            </div>
            <div className='absolute bottom-[10px] left-[26px] flex items-center gap-[5px] text-[14px]'>
                <p>Developed by</p>
                <Image
                    src="/betaNYC.png"
                    width={65}
                    height={50}
                    alt="BetaNYC"
                />
            </div>

        </div>
    )
}

export default Landing


// 