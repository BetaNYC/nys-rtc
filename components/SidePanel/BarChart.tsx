import React, { useRef, useEffect, forwardRef } from 'react'

import * as d3 from "d3"

type Props = {
    house: "Assembly" | "Senate"
    preLegislations: Legislations;
    legislations: Legislations;
}

const BarChart = ({ house, preLegislations, legislations }: Props) => {

    // const ref = useRef<HTMLInputElement>(null)
    const assemblyRef = useRef<HTMLInputElement>(null)
    const senateRef = useRef<HTMLInputElement>(null)
    let ref = house === "Assembly" ? assemblyRef : senateRef

    useEffect(() => {

        const height = ref.current!.clientHeight
        const width = ref.current!.clientWidth

        d3.csv("/legislation_seats.csv").then(data => {
            const houseData = data.filter(d => d["House"] === house)
            const demo = houseData.filter(d => d['Party'] === "Democrat")
            const rep = houseData.filter(d => d['Party'] === "Republican")

            const x = house === "Assembly" ? d3.scaleLinear().domain([0, 150]).range([0, width]) : d3.scaleLinear().domain([0, 63]).range([0, width])
            const y = d3.scaleBand().domain(demo.map(d => d.House)).range([0, height]).padding(0.5);

            d3.selectAll(".barChart").remove()

            let svg = d3
                .select(ref.current)
                .append("svg")
                .attr("class", "barChart")
                .attr("width", width)
                .attr("height", height)

            svg.selectAll('defaultRects')
                .data(demo)
                .join('rect')
                .attr("class", "defaultRects")
                .attr("x", x(0))
                .attr("y", d => y(d.House) as number)
                .attr("width", width - 32)
                .attr('height', y.bandwidth())
                .attr('fill', "#EEEEEE")

            svg.selectAll('demoRects')
                .data(demo)
                .join('rect')
                .attr("class", "demoRects")
                .attr("x", x(0))
                .attr("y", d => y(d.House) as number)
                .attr("width", d => x(+d[preLegislations]))
                .attr('height', y.bandwidth())
                .attr('fill', "#007CEE")

            svg.selectAll("repRects")
                .data(rep)
                .join("rect")
                .attr("class", "repRects")
                .attr("x", (d, i) => x(+demo[i][preLegislations]))
                .attr("y", d => y(d.House) as number)
                .attr("width", d => x(+d[preLegislations]))
                .attr('height', y.bandwidth())
                .attr('fill', "#D04E40")

            svg.selectAll(".demoRects")
                .transition()
                .duration(1500)
                .attr("width", (d: unknown, i) => x(+(d as dataType)[legislations]))

            svg.selectAll(".repRects")
                .transition()
                .duration(1500)
                .attr("width", (d: unknown, i) => x(+(d as dataType)[legislations]))
        })
    }, [legislations])

    return (
        <div className='w-full h-[50%] border-2' ref={ref}></div>
    )
}

export default BarChart