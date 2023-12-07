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



  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });



  useEffect(() => {

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  return (
    <>
      {(windowSize.width < 820) ?
        <div className='relative w-[100vw] h-[100vh] flex justify-center items-center leading-[1.2] font-bold text-headline text-rtc_navy bg-background_blue'>
          This website is best viewed on desktop
        </div> :
        <div className='relative w-[100vw] max-h-[100vh] leading-[1.2]'>
          <MapProvider >
            <SidePanel />
            <Map />
          </MapProvider>
        </div>

      }
    </>

  )
}
