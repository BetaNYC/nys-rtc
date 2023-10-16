import React from 'react'

import Image from 'next/image'

const Legend = () => {
    return (
        <div className='absolute left-[464px] bottom-[23px] flex flex-col gap-[3px] p-[15px] bg-[rgba(255,255,255,.5)]  z-20'>
            <div className='flex items-center gap-[10px]'>
                <div className='w-[14px] h-[14px] bg-demo'></div>
                <div className='text-[14px] text-demo'>Support, Democrat</div>
            </div>
            <div className='flex items-center gap-[10px]'>
                <div className='w-[14px] h-[14px] bg-rep'></div>
                <div className='text-[14px] text-rep'>Support, Republican</div>
            </div>
            <div className='flex items-center gap-[10px]'>
                <Image
                    src="/pattern_demo.png"
                    width={14}
                    height={14}
                    alt="No Support, Democrat"
                />
                <div className='text-[14px] text-demo'>No Support, Democrat</div>
            </div>
            <div className='flex items-center gap-[10px]'>
                <Image
                    src="/pattern_rep.png"
                    width={14}
                    height={14}
                    alt="No Support, Republican"
                />
                <div className='text-[14px] text-rep'>No Support, Republican</div>
            </div>
            <div className='flex items-center gap-[10px]'>
                <div className='w-[14px] h-[14px] bg-[#802948] border-[2px] border-[#802948] rounded-full'></div>
                <div className='text-[14px] text-[#802948]'>Right to Counsel Member</div>
            </div>
            <div className='flex items-center gap-[10px]'>
                <div className='w-[14px] h-[14px] bg-white border-[2px] border-[#802948] rounded-full'></div>
                <div className='text-[14px] text-[#802948]'>Right to Counsel Endorsers</div>
            </div>
        </div>
    )
}

export default Legend