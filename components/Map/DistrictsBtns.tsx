import React from 'react'


type Props = {
    districts: string
    districtsClickHandler: (x:Districts) => void
}

const DistrictsBtns = ({districts,districtsClickHandler}:Props) => {
    return (
        <div className="absolute top-[44px] left-[464px] flex gap-[20px] z-20">
            <div className={`flex justify-start items-end p-[6px] w-[65px] h-[65px] font-bold text-[10px] text-navy ${districts === "assembly" ? "bg-blue_selected" : "bg-blue_background"}  rounded-[8px] cursor-pointer`} onClick={() => districtsClickHandler("assembly")}>Assembly Districts</div>
            <div className={`flex justify-start items-end p-[6px] w-[65px] h-[65px] font-bold text-[10px] text-navy ${districts === "senate" ? "bg-blue_selected" : "bg-blue_background"} rounded-[8px] cursor-pointer`} onClick={() => districtsClickHandler("senate")}>Senate Districts</div>
        </div>
    )
}

export default DistrictsBtns