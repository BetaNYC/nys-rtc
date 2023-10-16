"use client";

import Map from '../components/Map/Map'
import Landing from '@/components/Landing';
import SidePanel from '@/components/SidePanel/SidePanel';

import { MapProvider } from "../context/MapContext";

export default function Home() {
  return (
    <div className='relative w-[100vw] h-[100vh] font-sans'>
      <MapProvider >
        <Landing />
        <SidePanel />
        <Map />
      </MapProvider>
    </div>
  )
}
