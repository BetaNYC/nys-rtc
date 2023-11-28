"use client";
import React, { useState } from 'react'

type Props = {
    show:{},
    clickHandler: () => void
}

function Toggler({show, clickHandler}: Props) {

    return (
        <div className={`flex ${show ? "justify-end bg-[#802948]" : "justify-start bg-grey_1"} items-center p-[3px] w-[31px] h-[19px]  rounded-[38.5px] cursor-pointer`} onClick={clickHandler}>
            <div className={`w-[14px] h-[14px] bg-white rounded-full`}></div>
        </div>
    )



}

export default Toggler