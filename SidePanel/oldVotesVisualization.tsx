import React, { useRef, useEffect, useContext } from 'react'
import { MapContext, MapContextType } from '../../context/MapContext'

import { GeoJSONSource } from 'mapbox-gl';

import assembly from "../../public/assembly.geo.json"
import senate from "../../public/senate.geo.json"

import * as d3 from "d3"

import "./voteVisualization.css"


type Props = {
  legislation: Legislations;
};



function VotesVisualization({ legislation }: Props) {

  const { map, districts, setDistricts } = useContext(MapContext) as MapContextType

  const ref = useRef<SVGSVGElement | null>(null)
  const effectRan = useRef(false)

  const senateFeatures = (senate as GeoJson).features
  const assemblyFeatures = (assembly as GeoJson).features

  const districtsClickHandler = (districts: Districts) => {
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
    setDistricts(districts)

    map?.setPaintProperty("districts", "fill-opacity", [
      "case",
      ["in", `${legislation}`, ["get", "HCMC support"]],
      1, 0
    ])
    map?.setPaintProperty("pattern_rep", "fill-opacity", [
      "case",
      ["all", ["==", ["get", "Party_x"], "Republican"], ["!", ["in", legislation, ["get", "HCMC support"]]]],
      0.2, 0
    ]
    )
    map?.setPaintProperty("pattern_demo", "fill-opacity", [
      "case",
      ["all", ["==", ["get", "Party_x"], "Democratic"], ["!", ["in", legislation, ["get", "HCMC support"]]]],
      .2, 0
    ])
  }

  useEffect(() => {

    const height = ref.current!.clientHeight
    const width = ref.current!.clientWidth

    const svg = d3.select(ref.current)

    d3.csv("/legislation_seats.csv").then(data => {
      const demo = data.filter(d => d['Party'] === "Democrat")
      const rep = data.filter(d => d['Party'] === "Republican")

      const senate = data.filter(d => d["House"] === "Senate")
      const assembly = data.filter(d => d["House"] === "Assembly")

      const senateTotalVotes = +senate[0][legislation] + (+senate[1][legislation])
      const assemblyTotalVotes = +assembly[0][legislation] + (+assembly[1][legislation])

      const assemblyX = d3.scaleLinear().domain([0, 150]).range([0, width])
      const senateX = d3.scaleLinear().domain([0, 63]).range([0, width])
      const y = d3.scaleBand().domain(demo.map(d => d.House)).range([0, height]).padding(0.5);

      // Rects  
      svg.selectAll('defaultRects')
        .data(demo)
        .join('rect')
        .attr("class", "defaultRects")
        .attr("x", assemblyX(0))
        .attr("y", (d, i) => i === 0 ? y(d.House) as number : y(d.House) as number + 20)
        .attr("width", width)
        .attr('height', y.bandwidth() / 1.5)
        .attr('fill', "#EEEEEE")

      svg.selectAll('demoRects')
        .data(demo)
        .join('rect')
        .attr("class", d => `demoRects${d.House}`)
        .attr("x", assemblyX(0))
        .attr("y", (d, i) => i === 0 ? y(d.House) as number : y(d.House) as number + 20)
        .attr("width", d => d.House === "Assembly" ? assemblyX(+d[legislation]) : senateX(+d[legislation]))
        .attr('height', y.bandwidth() / 1.5)
        .attr('fill', "#007CEE")
        .on("mouseover", (e, i) => {
          if (e.target.className.baseVal === `demoRectsSenate`) {
            svg.selectAll(".totalVotes").attr("fill-opacity", (d, i) => (d as { House: "Senate" | "Assembly" }).House === "Senate" ? 0 : 1)
            svg.selectAll(".demoPartyVotes").attr("fill-opacity", (d, i) => i === 0 ? 1 : 0)
          }
          if (e.target.className.baseVal === `demoRectsAssembly`) {
            svg.selectAll(".totalVotes").attr("fill-opacity", (d, i) => (d as { House: "Senate" | "Assembly" }).House === "Assembly" ? 0 : 1)
            svg.selectAll(".demoPartyVotes").attr("fill-opacity", (d, i) => i === 1 ? 1 : 0)
          }
        })
        .on("mouseout", () => {
          svg.selectAll(".demoPartyVotes").attr("fill-opacity", 0)
          svg.selectAll(".totalVotes").attr("fill-opacity", 1)
        })

      svg.selectAll("repRects")
        .data(rep)
        .join("rect")
        .attr("class", d => `repRects${d.House}`)
        .attr("x", (d, i) => d.House === "Assembly" ? assemblyX(+demo[i][legislation]) : senateX(+demo[i][legislation]))
        .attr("y", (d, i) => i === 0 ? y(d.House) as number : y(d.House) as number + 20)
        .attr("width", d => d.House === "Assembly" ? assemblyX(+d[legislation]) : senateX(+d[legislation]))
        .attr('height', y.bandwidth() / 1.5)
        .attr('fill', "#D04E40")
        .on("mouseover", (e, i) => {
          if (e.target.className.baseVal === `repRectsSenate`) {
            svg.selectAll(".totalVotes").attr("fill-opacity", (d, i) => (d as { House: "Senate" | "Assembly" }).House === "Senate" ? 0 : 1)
            svg.selectAll(".repPartyVotes").attr("fill-opacity", (d, i) => i === 0 ? 1 : 0)
          }
          if (e.target.className.baseVal === `repRectsAssembly`) {
            svg.selectAll(".totalVotes").attr("fill-opacity", (d, i) => (d as { House: "Senate" | "Assembly" }).House === "Assembly" ? 0 : 1)
            svg.selectAll(".repPartyVotes").attr("fill-opacity", (d, i) => i === 1 ? 1 : 0)
          }
        })
        .on("mouseout", () => {
          svg.selectAll(".repPartyVotes").attr("fill-opacity", 0)
          svg.selectAll(".totalVotes").attr("fill-opacity", 1)
        })

      // Labels
      svg.selectAll('districtSupport')
        .data(demo)
        .enter()
        .append("text")
        .attr("class", "districtSupport")
        .attr("x", assemblyX(0) + 25)
        .attr("y", (d, i) => i === 0 ? y(d.House) as number - 30 : y(d.House) as number - 10)
        .attr('fill', "#121D3E")
        .attr("shape-rendering", "geometricPrecision")
        .attr("font-weight", 400)
        .attr("font-smooth", "none")
        .text(d => `${d.House} Support`)

      svg.selectAll("totalSeats")
        .data(demo)
        .enter()
        .append("text")
        .attr("class", 'totalSeats')
        .attr("x", (d, i) => i === 0 ? width - 40 : width - 46)
        .attr("y", (d, i) => i === 0 ? y(d.House) as number - 10 : y(d.House) as number + 10)
        .style('fill', "#121D3E")
        .style("font-size", 12)
        .style("font-weight", 300)
        .text((d, i) => i === 0 ? "63 seats" : "150 seats")

      svg.selectAll("supportPercentage")
        .data(demo)
        .enter()
        .append("text")
        .attr("class", 'supportPercentage')
        .attr("x", 0)
        .attr("y", (d, i) => i === 0 ? y(d.House) as number - 10 : y(d.House) as number + 10)
        .style('fill', "#121D3E")
        .style("font-size", 13)
        .style("font-weight", 400)
        .text((d, i) => i === 0 ? `${Math.round(senateTotalVotes / 63 * 100)}%` : `${Math.round(assemblyTotalVotes / 150 * 100)}%`)

      svg.selectAll('totalVotes')
        .data(demo)
        .enter()
        .append("text")
        .attr('class', "totalVotes")
        .attr("x", 0)
        .attr("y", (d, i) => i === 0 ? y(d.House) as number + y.bandwidth() + 2 : y(d.House) as number + y.bandwidth() + 22)
        .style('fill', "#121D3E")
        .style("font-size", 13)
        .style("font-weight", 400)
        .text((d, i) => i === 0 ? `${senateTotalVotes} votes` : `${assemblyTotalVotes} votes`)

      svg.selectAll('demoPartyVotes')
        .data(demo)
        .enter()
        .append("text")
        .attr('class', "demoPartyVotes")
        .attr("x", 0)
        .attr("y", (d, i) => i === 0 ? y(d.House) as number + y.bandwidth() + 2 : y(d.House) as number + y.bandwidth() + 22)
        .attr('fill', "#0057A8")
        .attr("fill-opacity", 0)
        .style("font-size", "13px")
        .style("font-weight", 400)
        .text(d => `${+d[legislation]} Democratic votes`)

      svg.selectAll('repPartyVotes')
        .data(rep)
        .enter()
        .append("text")
        .attr('class', 'repPartyVotes')
        .attr("x", 0)
        .attr("y", (d, i) => i === 0 ? y(d.House) as number + y.bandwidth() + 2 : y(d.House) as number + y.bandwidth() + 22)
        .attr('fill', "#D04E40")
        .attr("fill-opacity", 0)
        .style("font-size", "13px")
        .style("font-weight", "semiBold")
        .text(d => `${+d[legislation]} Republican votes`)

      svg.selectAll('majorityLabels')
        .data(demo)
        .enter()
        .append("text")
        .attr('class', "majorityLabels")
        .attr("x", (width) / 2 + 2)
        .attr("y", (d, i) => i === 0 ? y(d.House) as number + y.bandwidth() + 2 : y(d.House) as number + y.bandwidth() + 22)
        .attr('fill', "#7B7B7B")
        .attr("fill-opacity", 0)
        .style("font-size", "13px")
        .style("font-weight", 300)
        .text((d, i) => `${i === 0 ? "33" : "76"} votes`)

      svg.selectAll('majorityLabelsSecond')
        .data(demo)
        .enter()
        .append("text")
        .attr('class', "majorityLabels")
        .attr("x", (width) / 2 + 2)
        .attr("y", (d, i) => i === 0 ? y(d.House) as number + y.bandwidth() + 17 : y(d.House) as number + y.bandwidth() + 37)
        .attr('fill', "#7B7B7B")
        .attr("fill-opacity", 0)
        .style("font-size", "13px")
        .style("font-weight", 300)
        .text(`simple majority`)

      svg.selectAll('superMajorityLabels')
        .data(demo)
        .enter()
        .append("text")
        .attr('class', "superMajorityLabels")
        .attr("x", (width) / 4 * 3 + 2)
        .attr("y", (d, i) => i === 0 ? y(d.House) as number + y.bandwidth() + 2 : y(d.House) as number + y.bandwidth() + 22)
        .attr('fill', "#7B7B7B")
        .attr("fill-opacity", 0)
        .style("font-size", "13px")
        .style("font-weight", 300)
        .text((d, i) => `${i === 0 ? "42" : "100"} votes`)

      svg.selectAll('superMajorityLabelsSecond')
        .data(demo)
        .enter()
        .append("text")
        .attr('class', "superMajorityLabels")
        .attr("x", (width) / 4 * 3 + 2)
        .attr("y", (d, i) => i === 0 ? y(d.House) as number + y.bandwidth() + 17 : y(d.House) as number + y.bandwidth() + 37)
        .attr('fill', "#7B7B7B")
        .attr("fill-opacity", 0)
        .style("font-size", "13px")
        .style("font-weight", 300)
        .text(`supermajority`)


      svg.selectAll("text").style("stroke", "none").style("shape-rendering", "crispEdges")


      // Icons
      // svg.selectAll(".districtsIcons").remove()

      svg
        .selectAll("districtsIcons")
        .data(demo)
        .enter()
        .append("image")
        .attr('class', "districtsIcons")
        .attr("id", (d, i) => i === 0 ? "senate" : "assembly")
        .attr("x", assemblyX(0))
        .attr("y", (d, i) => i === 0 ? y(demo[0].House) as number - 44 : y(demo[1].House) as number - 24)
        .attr('width', 16)
        .attr("height", 16)
        .attr("xlink:href", (d, i) => {
          if (districts === "senate") {
            if (i === 0) return "/icons/districts_fill.svg"
            if (i === 1) return "/icons/districts_empty.svg"
          } else {
            if (i === 0) return "/icons/districts_empty.svg"
            if (i === 1) return "/icons/districts_fill.svg"
          }
          return ""
        }
        )
        .on('click', (e) => {
          const id = e.target.id
          if (id === "senate") districtsClickHandler("senate")
          if (id === "assembly") districtsClickHandler("assembly")
        })



      // Dash Lines
      svg.selectAll("majorityLine")
        .data(demo)
        .enter()
        .append("line")
        .attr("x1", (width) / 2)
        .attr("y1", (d, i) => i === 0 ? y(d.House) as number - 10 : y(d.House) as number + 10)
        .attr("x2", (width) / 2)
        .attr("y2", (d, i) => i === 0 ? y(d.House) as number - 10 + y.bandwidth() + 2 : y(d.House) as number + 10 + y.bandwidth() + 2)
        .style("stroke", "#7B7B7B")
        .style("stroke-dasharray", ("2, 3"))
      // .on("mouseover", () => {
      //   svg.selectAll(".majorityLabels").attr("fill-opacity", 1)
      // })
      // .on("mouseout", () => {
      //   svg.selectAll(".majorityLabels").attr("fill-opacity", 0)
      // })

      svg.selectAll("majorityRect")
        .data(demo)
        .enter()
        .append("rect")
        .attr("width", 15)
        .attr("height", y.bandwidth() + 2)
        .attr("x", (width) / 2 - 7.5)
        .attr("y", (d, i) => i === 0 ? y(d.House) as number - 10 : y(d.House) as number + 10)
        .attr("opacity", 0)
        .style("fill", "#7B7B7B")
        .on("mouseover", () => {
          svg.selectAll(".majorityLabels").attr("fill-opacity", 1)
        })
        .on("mouseout", () => {
          svg.selectAll(".majorityLabels").attr("fill-opacity", 0)
        })

      svg.selectAll("superMajorityLine")
        .data(demo)
        .enter()
        .append("line")
        .attr("x1", (width) / 4 * 3)
        .attr("y1", (d, i) => i === 0 ? y(d.House) as number - 10 : y(d.House) as number + 10)
        .attr("x2", (width) / 4 * 3)
        .attr("y2", (d, i) => i === 0 ? y(d.House) as number - 10 + y.bandwidth() + 2 : y(d.House) as number + 10 + y.bandwidth() + 2)
        .style("stroke", "#7B7B7B")
        .style("stroke-dasharray", ("2, 3"))
        .on("mouseover", () => {
          svg.selectAll(".superMajorityLabels").attr("fill-opacity", 1)
        })
        .on("mouseout", () => {
          svg.selectAll(".superMajorityLabels").attr("fill-opacity", 0)
        })

      svg.selectAll("superMajorityRect")
        .data(demo)
        .enter()
        .append("rect")
        .attr("width", 15)
        .attr("height", y.bandwidth() + 2)
        .attr("x", (width) / 4 * 3 - 7.5)
        .attr("y", (d, i) => i === 0 ? y(d.House) as number - 10 : y(d.House) as number + 10)
        .attr("opacity", 0)
        .style("fill", "#7B7B7B")
        .on("mouseover", () => {
          svg.selectAll(".superMajorityLabels").attr("fill-opacity", 1)
        })
        .on("mouseout", () => {
          svg.selectAll(".superMajorityLabels").attr("fill-opacity", 0)
        })

    })

    return () => { effectRan.current = true }

  })


  return (

    <svg className='w-full h-[251px] text-black bg-white rounded-[8px] ' ref={ref}>
    </svg>
  )
}

export default VotesVisualization
// "origin/main is the main branch on the remote repo and origin/HEAD is the active branch on the remote repo."
// above 600
// git status
// git diff
// make the commit message tot be concise


//     const targetPolygon = turf.polygon([e.features[0].geometry.coordinates[0]])

//     const filtered = zipcodeFeatures.filter((z, i) => i !== 1299).filter((z, i) => i !== 1407)
//     const filteredZipcodesFeatures = filtered.filter((z, i) => {
//         let zipcodesPolygon
//         if (z.geometry.coordinates[0].length === 1) {
//             zipcodesPolygon = turf.polygon([z.geometry.coordinates[0][0]])
//             if (turf.booleanOverlap(zipcodesPolygon, targetPolygon) || turf.booleanContains(targetPolygon, zipcodesPolygon)) return true
//             return false
//         } else {
//             zipcodesPolygon = turf.polygon([z.geometry.coordinates[0]])
//             if (turf.booleanOverlap(zipcodesPolygon, targetPolygon) || turf.booleanContains(targetPolygon, zipcodesPolygon)) return true
//             return false
//         }

//     })

//     m.getSource("zipcodes").setData({
//         "type": "FeatureCollection",
//         "features": filteredZipcodesFeatures
// })

// const zipcodeFeaturesArray = []

// for (let i = 0; i < senateFeatures.length; i++) {
//     console.log(i)
//     if (i !== 25) {
//         const senatePolygon = turf.polygon([senateFeatures[i].geometry.coordinates[0]])
//         const filtered = zipcodeFeatures.filter((z, i) => i !== 1299).filter((z, i) => i !== 1407)
//         const filteredZipcodesFeatures = filtered.filter((z, i) => {
//             let zipcodesPolygon
//             if (z.geometry.coordinates[0].length === 1) {
//                 zipcodesPolygon = turf.polygon([z.geometry.coordinates[0][0]])
//                 if (turf.booleanOverlap(zipcodesPolygon, senatePolygon) || turf.booleanContains(senatePolygon, zipcodesPolygon)) return true
//                 return false
//             } else {
//                 zipcodesPolygon = turf.polygon([z.geometry.coordinates[0]])
//                 if (turf.booleanOverlap(zipcodesPolygon, senatePolygon) || turf.booleanContains(senatePolygon, zipcodesPolygon)) return true
//                 return false
//             }
//         })
//         zipcodeFeaturesArray.push(filteredZipcodesFeatures)
//     } else {
//         zipcodeFeaturesArray.push([])
//     }
// }

// senateFeatures.forEach((s, i) => {
//     senateFeatures[i].properties.zipCodes = []
// })
// useEffect(() => {
// senateFeatures.forEach((s, i) => {
//     senateFeatures[i].properties.zipCodes = []
// })
// const senatePolygon = turf.polygon([senateFeatures[0].geometry.coordinates[0]])
// const filtered = zipcodeFeatures.filter((z, i) => i !== 1299).filter((z, i) => i !== 1407)
// const filteredZipcodesFeatures = filtered.filter((z, i) => {
//     let zipcodesPolygon
//     if (z.geometry.coordinates[0].length === 1) {
//         zipcodesPolygon = turf.polygon([z.geometry.coordinates[0][0]])
//         if (turf.booleanOverlap(zipcodesPolygon, senatePolygon) || turf.booleanContains(senatePolygon, zipcodesPolygon)) return true
//         return false
//     } else {
//         zipcodesPolygon = turf.polygon([z.geometry.coordinates[0]])
//         if (turf.booleanOverlap(zipcodesPolygon, senatePolygon) || turf.booleanContains(senatePolygon, zipcodesPolygon)) return true
//         return false
//     }

// })
// }, [])
