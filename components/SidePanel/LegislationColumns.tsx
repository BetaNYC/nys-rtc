import React from 'react'

import VotesVisualization from './VotesVisualization'

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'

type Props = {
    legislation: Legislations
    name: string
    number: string
    content: string
    expand: boolean
    legislationsClickHandler: () => void
}

const LegislationColumns = ({ legislation, name, number, content, expand, legislationsClickHandler }: Props) => {

    return (
        <div className={`flex flex-col px-[25px] pt-[12px] lg:pt-[10.5px] pb-[20px] text-rtc_navy ${expand ? " h-[calc(100vh-112px-230px)] xl:h-[calc(100vh-112px-180px)] bg-white  overflow-y-hidden" : "h-[40px] bg-background_blue overflow-y-hidden"} border-b-[1px] border-grey_1  cursor-pointer`} onClick={legislationsClickHandler}>
            <div className={`flex justify-between items-center ${expand ? "mb-0" : "mb-5"}`}>
                <h2 className="font-semibold  text-[13px] lg:text-title uppercase">{name}</h2>
                {
                    expand ? <ChevronUpIcon className="w-[20px] h-[20px] cursor-pointer" /> : <ChevronDownIcon className="w-[20px] h-[20px] cursor-pointer" />
                }
            </div>
            <div className='mb-[20px] font-regular text-label'>{number}</div>
            <div className='flex-1 overflow-y-scroll'>
                <VotesVisualization legislation={legislation} />
                <div>
                    <h2 className='mb-[14px] font-semibold text-[13px] lg:text-title'>{name} ({number})</h2>
                    <p className='font-regular text-[12px] lg:text-body overflow-y-scroll'>{content}</p>
                </div>
            </div>
        </div>
    )
}

export default LegislationColumns