import React, { useRef, useEffect, useContext, useState } from 'react'
import { MapContext, MapContextType } from '../../context/MapContext'

import { GeoJSONSource } from 'mapbox-gl';


import votes from "../../public/legislations_votes.json"


import senateGeoJson from "../../public/senate.geo.json"
import assemblyGeoJson from "../../public/assembly.geo.json"


import * as d3 from "d3"


import Image from 'next/image'
import "./voteVisualization.css"

type Props = {
    legislation: | "Statewide RTC"
    | "Defend RTC"
    | "Winter Eviction Moratorium";
};


type labels = "senateDemoVotes" | 'senateRepVotes' | 'assemblyDemoVotes' | 'assemblyRepVotes' | 'simpleMajority' | 'superMajority' | 'senateTotalVotes' | 'assemblyTotalVotes'

const VotesVisualization = ({ legislation }: Props) => {
    const { map, legislations, districts, setDistricts, defaultMapHandler } = useContext(MapContext) as MapContextType

    const [labelShown, setLabelShown] = useState(
        {
            senateDemoVotes: false,
            senateRepVotes: false,
            assemblyDemoVotes: false,
            assemblyRepVotes: false,
            simpleMajority: false,
            superMajority: false,
            senateTotalVotes: true,
            assemblyTotalVotes: true
        }
    )

    /* @ts-ignore */
    const senateFeatures = (senateGeoJson as GeoJson).features
    /* @ts-ignore */
    const assemblyFeatures = (assemblyGeoJson as GeoJson).features


    const districtsClickHandler = (districts: Districts) => {
        setDistricts(districts)

        switch (districts) {
            case "senate":
                (map?.getSource("districts") as GeoJSONSource).setData({
                    type: "FeatureCollection",
                    features: senateFeatures
                });
                break
            case "assembly":
                (map?.getSource("districts") as GeoJSONSource).setData({
                    type: "FeatureCollection",
                    features: assemblyFeatures
                });
                break
        }

        defaultMapHandler(legislations)
    }




    // const labelMouseoverHandler = (l: labels) => {
    //     console.log('bb')
    //     let newLabelShown = { ...labelShown }
    //     let keys = Object.keys({ ...labelShown }) as labels[]
    //     keys.forEach(n => n === l ? newLabelShown[n] = true : newLabelShown[n] = false)
    //     setLabelShown(newLabelShown)
    // }

    // const labelMouseoutHandler = () => {
    //     console.log('aaa')
    //     setLabelShown({
    //         senateDemoVotes: false,
    //         senateRepVotes: false,
    //         assemblyDemoVotes: false,
    //         assemblyRepVotes: false,
    //         simpleMajority: false,
    //         superMajority: false,
    //         senateTotalVotes: true,
    //         assemblyTotalVotes: true
    //     })
    // }


    const senateRef = useRef<SVGSVGElement | null>(null)
    const assemblyRef = useRef<SVGSVGElement | null>(null)

    const senate = votes.filter(v => v["House"] === "Senate")
    const assembly = votes.filter(v => v["House"] === "Assembly")

    const senateTotalVotes = +senate[0][legislation] + (+senate[1][legislation])
    const assemblyTotalVotes = +assembly[0][legislation] + (+assembly[1][legislation])

    const senateData = votes.filter(v => v.House === 'Senate')
    const senateDemo = senateData.filter(s => s.Party === "Democrat")
    const senateRep = senateData.filter(s => s.Party === 'Republican')

    const assemblyData = votes.filter(v => v.House === "Assembly")
    const assemblyDemo = assemblyData.filter(s => s.Party === "Democrat")
    const assemblyRep = assemblyData.filter(s => s.Party === 'Republican')


    useEffect(() => {

        const height = senateRef.current!.clientHeight
        const width = senateRef.current!.clientWidth

        const barChartHeight = 32

        const senateSvg = d3.select(senateRef.current)
        const assemblySvg = d3.select(assemblyRef.current)

        const senateX = d3.scaleLinear().domain([0, 63]).range([0, width])
        const assemblyX = d3.scaleLinear().domain([0, 150]).range([0, width])


        senateSvg
            .append("rect")
            .attr("x", 0)
            .attr("y", 2)
            .attr("width", width)
            .attr('height', barChartHeight)
            .attr('fill', "#EEEEEE")
            .on("mouseover", () => setLabelShown({
                senateDemoVotes: false,
                senateRepVotes: false,
                assemblyDemoVotes: false,
                assemblyRepVotes: false,
                simpleMajority: false,
                superMajority: false,
                senateTotalVotes: true,
                assemblyTotalVotes: true
            }))

        assemblySvg
            .append("rect")
            .attr("x", 0)
            .attr("y", 2)
            .attr("width", width)
            .attr('height', barChartHeight)
            .attr('fill', "#EEEEEE")
            .on("mouseover", () => setLabelShown({
                senateDemoVotes: false,
                senateRepVotes: false,
                assemblyDemoVotes: false,
                assemblyRepVotes: false,
                simpleMajority: false,
                superMajority: false,
                senateTotalVotes: true,
                assemblyTotalVotes: true
            }))

        senateSvg
            .selectAll("senateDemoRect")
            .data(senateDemo)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", 2)
            .attr("width", d => senateX(+d[legislation]))
            .attr('height', barChartHeight)
            .attr('fill', "#007CEE")
            .on("mouseover", () => setLabelShown({
                senateDemoVotes: true,
                senateRepVotes: false,
                assemblyDemoVotes: true,
                assemblyRepVotes: false,
                simpleMajority: false,
                superMajority: false,
                senateTotalVotes: false,
                assemblyTotalVotes: false
            }))

        senateSvg
            .selectAll("senateRepRect")
            .data(senateRep)
            .enter()
            .append("rect")
            .attr("x", (d, i) => senateX(+senateDemo[i][legislation]))
            .attr("y", 2)
            .attr("width", d => senateX(+d[legislation]))
            .attr('height', barChartHeight)
            .attr('fill', "#D04E40")
            .on("mouseover", () => setLabelShown({
                senateDemoVotes: false,
                senateRepVotes: true,
                assemblyDemoVotes: false,
                assemblyRepVotes: true,
                simpleMajority: false,
                superMajority: false,
                senateTotalVotes: false,
                assemblyTotalVotes: false
            }))

        assemblySvg
            .selectAll("assemblyDemoRect")
            .data(assemblyDemo)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", 2)
            .attr("width", d => assemblyX(+d[legislation]))
            .attr('height', barChartHeight)
            .attr('fill', "#007CEE")
            .on("mouseover", () => setLabelShown({
                senateDemoVotes: true,
                senateRepVotes: false,
                assemblyDemoVotes: true,
                assemblyRepVotes: false,
                simpleMajority: false,
                superMajority: false,
                senateTotalVotes: false,
                assemblyTotalVotes: false
            }))

        assemblySvg
            .selectAll("assemblyRepRect")
            .data(assemblyRep)
            .enter()
            .append("rect")
            .attr("x", (d, i) => assemblyX(+assemblyDemo[i][legislation]))
            .attr("y", 2)
            .attr("width", d => assemblyX(+d[legislation]))
            .attr('height', barChartHeight)
            .attr('fill', "#D04E40")
            .on("mouseover", () => setLabelShown({
                senateDemoVotes: false,
                senateRepVotes: true,
                assemblyDemoVotes: false,
                assemblyRepVotes: true,
                simpleMajority: false,
                superMajority: false,
                senateTotalVotes: false,
                assemblyTotalVotes: false
            }))

        senateSvg
            .append("line")
            .attr("x1", (width) / 2)
            .attr("y1", 0)
            .attr("x2", (width) / 2)
            .attr("y2", height)
            .style("stroke", "#7B7B7B")
            .style("stroke-dasharray", ("2, 3"))
            .on("mouseover", () => setLabelShown({
                senateDemoVotes: false,
                senateRepVotes: false,
                assemblyDemoVotes: false,
                assemblyRepVotes: false,
                simpleMajority: true,
                superMajority: false,
                senateTotalVotes: true,
                assemblyTotalVotes: true
            }))

        senateSvg
            .append("rect")
            .attr("x", (width) / 2 - 10)
            .attr("y", 2)
            .attr("width", 20)
            .attr('height', barChartHeight)
            .attr("fill-opacity", 0)
            .on("mouseover", () => setLabelShown({
                senateDemoVotes: false,
                senateRepVotes: false,
                assemblyDemoVotes: false,
                assemblyRepVotes: false,
                simpleMajority: true,
                superMajority: false,
                senateTotalVotes: true,
                assemblyTotalVotes: true
            }))

        assemblySvg
            .append("line")
            .attr("x1", (width) / 2)
            .attr("y1", 0)
            .attr("x2", (width) / 2)
            .attr("y2", height)
            .style("stroke", "#7B7B7B")
            .style("stroke-dasharray", ("2, 3"))
            .on("mouseover", () => setLabelShown({
                senateDemoVotes: false,
                senateRepVotes: false,
                assemblyDemoVotes: false,
                assemblyRepVotes: false,
                simpleMajority: true,
                superMajority: false,
                senateTotalVotes: true,
                assemblyTotalVotes: true
            }))

        assemblySvg
            .append("rect")
            .attr("x", (width) / 2 - 10)
            .attr("y", 2)
            .attr("width", 20)
            .attr('height', barChartHeight)
            .attr("fill-opacity", 0)
            .on("mouseover", () => setLabelShown({
                senateDemoVotes: false,
                senateRepVotes: false,
                assemblyDemoVotes: false,
                assemblyRepVotes: false,
                simpleMajority: true,
                superMajority: false,
                senateTotalVotes: true,
                assemblyTotalVotes: true
            }))

        senateSvg
            .append("line")
            .attr("x1", (width) / 4 * 3)
            .attr("y1", 0)
            .attr("x2", (width) / 4 * 3)
            .attr("y2", height)
            .style("stroke", "#7B7B7B")
            .style("stroke-dasharray", ("2, 3"))
            .on("mouseover", () => setLabelShown({
                senateDemoVotes: false,
                senateRepVotes: false,
                assemblyDemoVotes: false,
                assemblyRepVotes: false,
                simpleMajority: false,
                superMajority: true,
                senateTotalVotes: true,
                assemblyTotalVotes: true
            }))

        senateSvg
            .append("rect")
            .attr("x", (width) / 4 * 3 - 10)
            .attr("y", 2)
            .attr("width", 20)
            .attr('height', barChartHeight)
            .attr("fill-opacity", 0)
            .on("mouseover", () => setLabelShown({
                senateDemoVotes: false,
                senateRepVotes: false,
                assemblyDemoVotes: false,
                assemblyRepVotes: false,
                simpleMajority: false,
                superMajority: true,
                senateTotalVotes: true,
                assemblyTotalVotes: true
            }))

        assemblySvg
            .append("line")
            .attr("x1", (width) / 4 * 3)
            .attr("y1", 0)
            .attr("x2", (width) / 4 * 3)
            .attr("y2", height)
            .style("stroke", "#7B7B7B")
            .style("stroke-dasharray", ("2, 3"))
            .on("mouseover", () => setLabelShown({
                senateDemoVotes: false,
                senateRepVotes: false,
                assemblyDemoVotes: false,
                assemblyRepVotes: false,
                simpleMajority: false,
                superMajority: true,
                senateTotalVotes: true,
                assemblyTotalVotes: true
            }))

        assemblySvg
            .append("rect")
            .attr("x", (width) / 4 * 3 - 10)
            .attr("y", 2)
            .attr("width", 20)
            .attr('height', barChartHeight)
            .attr("fill-opacity", 0)
            .on("mouseover", () => setLabelShown({
                senateDemoVotes: false,
                senateRepVotes: false,
                assemblyDemoVotes: false,
                assemblyRepVotes: false,
                simpleMajority: false,
                superMajority: true,
                senateTotalVotes: true,
                assemblyTotalVotes: true
            }))


        return () => {
            d3.selectAll("rect").remove()
            d3.selectAll("line").remove()
        }
    })


    return (
        <div className='px-[20px] mb-[20px] w-full  text-rtc_navy bg-white rounded-[8px] '>
            <div className='mb-[20px]'>
                <div className='flex items-center gap-[8px] mb-[4px]'>
                    <Image
                        src={districts === "senate" ? '/icons/districts_fill.svg' : "/icons/districts_empty.svg"}
                        width={16}
                        height={16}
                        alt="districts"
                        onClick={() => districtsClickHandler('senate')}
                    />
                    <h3 className='font-semibold text-[13px] lg:text-title'>Senate Support</h3>
                </div>
                <div className='relative mb-[2px] w-full font-regular text-[10px] lg:text-label text-end'>
                    <div className={`absolute top-0 left-0 font-semibold text-[10px] lg:text-label`}>{Math.round(senateTotalVotes / 63 * 100)}%</div>
                    <div>Total 63 seats</div>
                </div>
                <svg className='relative w-full h-[42px]' ref={senateRef}>
                    {/* <div className='absolute left-[50%] top-0 w-[20px] h-[40px] bg-black'>aaa</div> */}
                </svg>
                <div className='relative'>
                    <div className={`absolute top-0 left-[calc(50%+2px)] font-regular text-[10px] lg:text-label text-grey_1 ${labelShown['simpleMajority'] ? 'opacity-1' : "opacity-0"}`}>32 votes<br />Simple Majority</div>
                    <div className={`absolute top-0 left-[calc(75%+2px)] font-regular text-[10px] lg:text-label text-grey_1 ${labelShown['superMajority'] ? 'opacity-1' : "opacity-0"}`}>42 votes<br />Supermajority</div>
                    {
                        labelShown['senateDemoVotes'] &&
                        (<div className={`font-semibold text-[10px] lg:text-label text-demo`}>{+senateDemo[0][legislation]} Democratic sponsors</div>)
                    }
                    {
                        labelShown['senateRepVotes'] &&
                        (<div className={`font-semibold text-[10px] lg:text-label text-rep`}>{+senateRep[0][legislation]} Republican sponsors</div>)
                    }
                    {
                        labelShown['senateTotalVotes'] &&
                        (<div className={`font-semibold text-[10px] lg:text-label text-rtc_navy`}>{senateTotalVotes} sponsors</div>)
                    }


                </div>

            </div>
            <div className=''>
                <div className='flex items-center gap-[8px] mb-[4px]'>
                    <Image
                        src={districts === "assembly" ? '/icons/districts_fill.svg' : "/icons/districts_empty.svg"}
                        width={16}
                        height={16}
                        alt="districts"
                        onClick={() => districtsClickHandler('assembly')}
                    />
                    <h3 className='font-semibold text-[13px] lg:text-title'>Assembly Support</h3>
                </div>
                <div className='relative mb-[2px] w-full font-regular text-[10px] lg:text-label text-end'>
                    <div className={`absolute top-0 left-0 font-semibold text-[10px] lg:text-label`}>{Math.round(assemblyTotalVotes / 150 * 100)}%</div>
                    <div>Total 150 seats</div>
                </div>
                <svg className='w-full h-[42px]' ref={assemblyRef}></svg>
                <div className='relative'>
                    <div className={`absolute top-0 left-[calc(50%+2px)] font-regular text-[10px] lg:text-label text-grey_1 ${labelShown['simpleMajority'] ? 'opacity-1' : "opacity-0"}`}>75 votes<br />Simple Majority</div>
                    <div className={`absolute top-0 left-[calc(75%+2px)] font-regular text-[10px] lg:text-label text-grey_1 ${labelShown['superMajority'] ? 'opacity-1' : "opacity-0"}`}>100 votes<br />Supermajority</div>
                    {
                        labelShown['assemblyDemoVotes'] &&
                        (<div className={`font-semibold text-[10px] lg:text-label text-demo`}>{+assemblyDemo[0][legislation]} Democratic sponsors</div>)
                    }
                    {
                        labelShown['assemblyRepVotes'] &&
                        (<div className={`font-semibold text-[10px] lg:text-label text-rep`}>{+assemblyRep[0][legislation]} Republican sponsors</div>)
                    }

                    {
                        labelShown['assemblyTotalVotes'] &&
                        (<div className={`font-semibold text-[10px] lg:text-label text-rtc_navy`}>{assemblyTotalVotes} sponsors</div>)
                    }
                </div>
            </div>
        </div>
    )
}

export default VotesVisualization