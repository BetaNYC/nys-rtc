import React from 'react'

import VotesVisualization from './VotesVisualization'

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'

type Props = {
    legislation: Legislations
    name: string
    number: string
    content: string
    expand: boolean
    calulated: boolean
    legislationsClickHandler: () => void
}

const LegislationColumns = ({ legislation, name, number, content, expand, calulated, legislationsClickHandler }: Props) => {

    return (
        <div className={`flex flex-col pt-[12px] lg:pt-[10.5px] pb-[0px] w-full text-rtc_navy ${expand ? " h-[calc(100vh-112px-230px)] xl:h-[calc(100vh-112px-200px)] bg-white  overflow-y-hidden" : "h-[40px] bg-background_blue overflow-y-hidden"} border-b-[1px] border-grey_1  `} onClick={legislationsClickHandler}>
            <div className={`flex justify-between items-center mx-[20px] ${expand ? "mb-0" : "mb-5"} cursor-pointer`}>
                <h2 className="font-semibold  text-[13px] lg:text-title uppercase">{name}</h2>
                {
                    expand ? <ChevronUpIcon className="w-[20px] h-[20px] cursor-pointer" /> : <ChevronDownIcon className="w-[20px] h-[20px] cursor-pointer" />
                }
            </div>
            <div className='mx-[20px] mb-[20px] font-regular text-label'>{number}</div>
            <div className='flex-1 overflow-y-auto'>
                {
                    calulated && <VotesVisualization legislation={legislation as | "Statewide RTC"
                        | "Defend RTC"
                        | "Winter Eviction Moratorium"} />
                }

                <div className='mx-[20px] mb-[30px]'>
                    <h2 className='font-semibold text-[13px] lg:text-title'>{name}</h2>
                    <h2 className='mb-[14px] font-semibold text-[13px] lg:text-title'>({number})</h2>
                    <p className='mb-[14px] font-regular text-[12px] lg:text-body'>{content}</p>
                    <p className='font-regular text-[12px] lg:text-body'>A simple majority, more than half of the votes, is required to pass legislation in New York State. If legislation is passed with a supermajority, a two-thirds vote, the governor cannot override the legislation with a veto.</p>
                </div>
            </div>
        </div>
    )
}

export default LegislationColumns