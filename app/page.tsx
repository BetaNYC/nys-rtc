"use client";

import Map from './Map'
import Selection from './Selection';

import { MapProvider } from "./Context/MapContext";

export default function Home() {
  return (
    <div className='relative'>
      <MapProvider >
        <Selection />
        <Map />
      </MapProvider>
    </div>
  )
}
