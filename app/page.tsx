"use client";
import React, { useState } from 'react';
import Map from '../components/Map/Map'
import Landing from '@/components/Landing';
import SidePanel from '@/components/SidePanel/SidePanel';


import { MapProvider } from "../context/MapContext";


export default function Home() {



  return (
    <div className='relative w-[100vw] max-h-[100vh]'>
      <MapProvider >
        <SidePanel />
        <Map/>
      </MapProvider>
    </div>
  )
}
