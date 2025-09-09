'use client'
import { Rotate3D, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import FluidCanvas from './fluid-canvas'

export const HeroSection = () => {
  const [isControlsEnabled, setControlsEnabled] = useState(false)
  return (
    <>
      <div className="relative h-screen w-full">
        <div className="absolute inset-0 z-[0]">
          <FluidCanvas isControlsEnabled={isControlsEnabled} />
        </div>
        <div className="absolute top-[60vh] h-[40vh] w-full bg-gradient-to-b from-[#0A0A0A00] to-[#0A0A0A] pointer-events-none"></div>
        <div
          className="absolute right-0 bottom-0 m-10 p-2 z-[2] hover:cursor-pointer"
          onClick={() => setControlsEnabled(!isControlsEnabled)}
        >
          {isControlsEnabled ? <RotateCcw size={24} /> : <Rotate3D size={24} />}
        </div>
      </div>
    </>
  )
}
