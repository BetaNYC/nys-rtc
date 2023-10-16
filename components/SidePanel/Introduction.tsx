import React from 'react'

type Props = {
    title: string,
    content: string
}

function Introduction({title, content}: Props) {
    return (
        <div className='pr-[30px] pl-[16px] py-[20px]  w-full text-black bg-gray_background rounded-[8px]'>
            <h3 className='font-semibold text-[16px]'>{title}</h3>
            <p className='mt-[12px] font-regular text-[14px] leading-normal'>
                {content}
            </p>
        </div>
    )
}

export default Introduction