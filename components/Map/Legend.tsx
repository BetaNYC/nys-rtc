import React, { useState, useContext } from 'react'

import { MapContext, MapContextType } from '../../context/MapContext'

import Image from 'next/image'
import { XMarkIcon } from '@heroicons/react/24/solid'





type Props = {
    districtsClickHandler: (x: Districts) => void
}


const Legend = () => {

    const { districts, membershipShown, legislations } = useContext(MapContext) as MapContextType

    const [panelShown, setPanelShown] = useState(true)
    const panelClickHandler = (b: boolean) => {
        setPanelShown(b)
    }

    return (
        <>
            <div className='absolute left-[37%] md:left-[34%] lg:left-[32%] xl:left-[30%] top-[20px] drop-shadow-xl cursor-pointer z-20 '>
                <div className='w-[48px] h-[48px] bg-rtc_purple rounded-full'></div>
                <Image
                    src="/icons/legend_active.svg"
                    width={30}
                    height={30}
                    alt="active control panel"
                    onClick={() => panelClickHandler(true)}
                    className='absolute top-[calc(50%-15px)] left-[calc(50%-15px)] text-white'
                />
            </div>
            {panelShown && (
                <div className='absolute left-[37%] md:left-[34%] lg:left-[32%] xl:left-[30%] top-[20px] p-[15px] w-[24%] md:w-[26%] lg:w-[30%] text-rtc_navy bg-white rounded-[8px] drop-shadow-xl z-20'>
                    <div className='flex justify-between'>
                        <h2 className='mb-[8px] font-bold text-title leading-[22.5px]'>
                            {legislations === "Statewide RTC" ? "Statewide Right to Counsel " : legislations === "Defend RTC" ? "Defend Right to Counsel " : "Winter Eviction Moratorium "}
                            {districts.charAt(0).toUpperCase() + districts.slice(1)} District Support Map
                        </h2>
                        <XMarkIcon className='ml-[12px] w-[22px] h-[22px] text-grey_2 cursor-pointer' onClick={() => panelClickHandler(false)} />
                    </div>
                    <div className='flex gap-[30px]'>
                        <div className='flex flex-col gap-[5px]'>
                            <div className='flex items-center gap-[10px]'>
                                <div className='w-[16px] h-[16px] bg-demo'></div>
                                <div className='text-label'>Support, Democrat</div>
                            </div>
                            <div className='flex items-center gap-[10px]'>
                                <div className='w-[16px] h-[16px] bg-rep'></div>
                                <div className='text-label'>Support, Republican</div>
                            </div>
                        </div>
                        <div className='flex flex-col gap-[5px]'>
                            <div className='flex items-center gap-[10px]'>
                                <Image
                                    src="/icons/pattern_demo.svg"
                                    width={16}
                                    height={16}
                                    alt="No Support, Democrat"
                                />
                                <div className='text-label'>No Support, Democrat</div>
                            </div>
                            <div className='flex items-center gap-[10px]'>
                                <Image
                                    src="/icons/pattern_rep.svg"
                                    width={16}
                                    height={16}
                                    alt="No Support, Republican"
                                />
                                <div className='text-label '>No Support, Republican</div>
                            </div>
                        </div>
                        {membershipShown && (
                            <div className='flex flex-col gap-[5px]'>
                                <div className='flex items-center gap-[10px]'>
                                    <div className='w-[16px] h-[16px] bg-[#802948] border-[2px] border-[#802948] rounded-full'></div>
                                    <div className='text-label'>Member, Right to Counsel Coalition </div>
                                </div>
                                <div className='flex items-center gap-[10px]'>
                                    <div className='w-[16px] h-[16px] bg-white border-[2px] border-[#802948] rounded-full'></div>
                                    <div className='text-label'>Endorser, Right to Counsel Coalition </div>
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            )}
        </>



    )
}

export default Legend