'use client'
import FluidCanvas from './fluid-canvas'

export const HeroSection = () => {
  return (
    <>
      <div className="relative h-screen w-full">
        <div className="absolute inset-0 z-[0]">
          <FluidCanvas />
        </div>
        <div className="absolute top-[60vh] h-[40vh] w-full bg-gradient-to-b from-[#0A0A0A00] to-[#0A0A0A] pointer-events-none" />
       
      </div>
    </>
  )
}
