import React, { useState, useEffect, useContext } from 'react'

import { MapContext, MapContextType } from '../../context/MapContext'

import Toggler from '../elements/Toggler'

import Image from 'next/image'
import { XMarkIcon } from '@heroicons/react/24/solid'


type Props = {
    districtsClickHandler: (x: Districts) => void
}



const MapLayers = ({ districtsClickHandler }: Props) => {

    const { map, districts, membershipShown, setMembershipShown } = useContext(MapContext) as MapContextType

    const [panelShown, setPanelShown] = useState(false)


    const panelClickHandler = (b: boolean) => {
        setPanelShown(b)
    }

    const membershipClickHandler = () => {
        setMembershipShown(!membershipShown)

    }



    useEffect(() => {
        membershipShown ? map?.setLayoutProperty('members', "visibility", "visible") : map?.setLayoutProperty('members', "visibility", "none")
    }, [membershipShown])



    return (

        <>
            <div className='absolute left-[37%] md:left-[34%] lg:left-[32%] xl:left-[30%] bottom-[20px]  drop-shadow-xl cursor-pointer z-20 '>
                <Image
                    src="/icons/map_layer_active.svg"
                    width={50}
                    height={50}
                    alt="active control panel"
                    onClick={() => panelClickHandler(true)}
                    className=''
                />
            </div>
            {panelShown && (
                <div className='absolute left-[37%] md:left-[34%] lg:left-[32%]  xl:left-[30%] bottom-[20px] p-[25px] min-w-[250px] lg:w-[18%] text-rtc_navy bg-white rounded-[18.23px] drop-shadow-xl z-20'>
                    <div className='flex items-center justify-between gap-[29px] pb-[12px] border-b-[1px] border-grey_1'>
                        <h2 className='font-bold text-[13px] lg:text-title'>Map Layers</h2>
                        <XMarkIcon className='w-[22px] h-[22px] text-grey_2 cursor-pointer' onClick={() => panelClickHandler(false)} />
                    </div>
                    <div className='flex flex-col gap-[9px] pt-[12px] pb-[17px] w-full border-b-[1px] border-grey_1'>
                        <h2 className='font-bold text-[13px] lg:text-title'>Districts Boundaries</h2>
                        <div className='flex w-full cursor-pointer'>
                            <div className={`flex justify-center items-center p-[8px] w-[50%] font-semibold text-label ${districts === "senate" ? "text-white bg-rtc_purple border-[2px] border-rtc_purple" : "text-grey_1 bg-white border-[3px] border-grey_1 "}  rounded-l-[8px]`}
                                onClick={() => districtsClickHandler("senate")}>Senate
                            </div>
                            <div className={`flex justify-center items-center p-[8px] w-[50%] font-semibold text-label ${districts === "assembly" ? "text-white bg-rtc_purple border-[2px] border-rtc_purple" : "text-grey_1 bg-white border-[3px] border-grey_1 "} rounded-r-[8px]`}
                                onClick={() => districtsClickHandler("assembly")}>Assembly
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col gap-[9px] pt-[12px]'>
                        {/* <h2 className='font-bold text-title'>RTC Coalition Membership</h2> */}
                        <div className='flex flex-col gap-[15px]'>
                            <div className='flex justify-between items-start'>
                                {/* <h3 className='font-semibold text-label'>Member Organizations</h3> */}
                                <h2 className='font-bold text-[13px] leading-[1.2] lg:text-title'>Right to Counsel Coalition Membership</h2>
                                <Toggler show={membershipShown} clickHandler={membershipClickHandler} />
                            </div>
                            {/* <div className='flex justify-between items-center'>
                                <h3 className='font-semibold text-label'>Member Organizations</h3>
                                <Toggler show={organizations["Members"]} clickHandler={() => organizationsClickHandler("Members")} />
                            </div>
                            <div className='flex justify-between items-center'>
                                <h3 className='font-semibold text-label'>Supporters</h3>
                                <Toggler show={organizations["Supporters"]} clickHandler={() => organizationsClickHandler("Supporters")} />
                            </div>
                            <div className='flex justify-between items-center'>
                                <h3 className='font-semibold text-label'>Endorsers</h3>
                                <Toggler show={organizations["Endorsers"]} clickHandler={() => organizationsClickHandler("Endorsers")} />
                            </div> */}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default MapLayers