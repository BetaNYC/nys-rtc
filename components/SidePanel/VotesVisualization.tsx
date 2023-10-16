import React, { useRef, useEffect } from 'react'

import * as d3 from "d3"

import BarChart from './BarChart';


type Props = {
  preLegislations: Legislations;
  legislations: Legislations;
};



function VotesVisualization({ preLegislations, legislations }: Props) {

  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const height = ref.current!.clientHeight
    const width = ref.current!.clientWidth

    d3.csv("/legislation_seats.csv").then(data => {
      console.log(data)
      const demo = data.filter(d => d['Party'] === "Democrat")
      const rep = data.filter(d => d['Party'] === "Republican")

      const assemblyX = d3.scaleLinear().domain([0, 150]).range([0, width])
      const senateX = d3.scaleLinear().domain([0, 63]).range([0, width])
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
        .attr("x", assemblyX(0))
        .attr("y", d => y(d.House) as number)
        .attr("width", width - 32)
        .attr('height', y.bandwidth() / 1.5)
        .attr('fill', "#EEEEEE")

      svg.selectAll('demoRects')
        .data(demo)
        .join('rect')
        .attr("class", "demoRects")
        .attr("x", assemblyX(0))
        .attr("y", d => y(d.House) as number)
        .attr("width", d => d.House === "Assembly" ? assemblyX(+d[preLegislations]) : senateX(+d[preLegislations]))
        .attr('height', y.bandwidth() / 1.5)
        .attr('fill', "#007CEE")

      svg.selectAll("repRects")
        .data(rep)
        .join("rect")
        .attr("class", "repRects")
        .attr("x", (d, i) => d.House === "Assembly" ? assemblyX(+demo[i][preLegislations]) : senateX(+demo[i][preLegislations]))
        .attr("y", d => y(d.House) as number)
        .attr("width", d => d.House === "Assembly" ? assemblyX(+d[preLegislations]) : senateX(+d[preLegislations]))
        .attr('height', y.bandwidth() / 1.5)
        .attr('fill', "#D04E40")

      svg.selectAll(".demoRects")
        .transition()
        .duration(1500)
        .attr("width", (d: unknown, i) => (d as dataType).House === "Assembly" ? assemblyX(+(d as dataType)[legislations]) : senateX(+(d as dataType)[legislations]))

      svg.selectAll(".repRects")
        .transition()
        .duration(1500)
        .attr("x", (d: unknown, i) => (d as dataType).House === "Assembly" ? assemblyX(+demo[i][legislations]) : senateX(+demo[i][legislations]))
        .attr("width", (d: unknown, i) => (d as dataType).House === "Assembly" ? assemblyX(+(d as dataType)[legislations]) : senateX(+(d as dataType)[legislations]))


  
      // svg.append("text").attr("x", 0).attr("y", 20).style("font-size", "18px").style("font-weight", "semiBold").text("Assembly Support")   
    })

  }, [legislations])


  return (
    <div className='px-[16px] w-[380px] h-[251px] text-black bg-white rounded-[8px]' ref={ref}>
      {/* <div className='w-full h-[50%] border-2'></div>
      <div className='w-full h-[50%] border-2'></div> */}
      {/* <BarChart  house={"Assembly"} preLegislations={preLegislations} legislations={legislations} /> */}
      {/* <BarChart  house={"Senate"} preLegislations={preLegislations} legislations={legislations} /> */}
    </div>
  )
}

export default VotesVisualization

// px-[16px] py-[22px]