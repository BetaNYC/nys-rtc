"use client";
import React, { useState, useEffect } from 'react';
import Map from '../components/Map/Map'
import Landing from '@/components/Landing';
import SidePanel from '@/components/SidePanel/SidePanel';


import { MapProvider } from "../context/MapContext";


export default function Home() {

  // if (window !== undefined) {
  //   const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  //   useEffect(() => {
  //     const windowSizeHandler = () => setWindowWidth(window.innerWidth)

  //     window.addEventListener("resize", windowSizeHandler);

  //     return () => window.removeEventListener("resize", windowSizeHandler);
  //   }, [windowWidth])
  // }



  return (
    <div className='relative w-[100vw] max-h-[100vh] leading-[1.2]'>
      <MapProvider >
        <SidePanel />
        <Map />
      </MapProvider>
    </div>
  )
}
