'use client'
import clsx from 'clsx'
import { useState } from 'react'

type Props = {
  rollPath: string
  images: string[]
}

export const FilmRoll = (p: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  const [rollName, rollStock] = p.rollPath.split('.')

  return (
    <div className="flex w-full h-[230px]" key={p.rollPath}>
      <div
        className="relative h-full z-[2] peer hover:cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src="/assets/film-roll.svg" alt="1" className="h-full object-contain " />
        <img
          src={`/assets/stocks/${rollStock}.jpg`}
          alt="2"
          className="h-1/2 w-[85%] object-contain absolute top-[46.5%] -translate-y-1/2 -left-[5%] -rotate-90"
        />
        <div className="absolute top-1/2 right-0 translate-x-[10%] -translate-y-[75%] -rotate-90 w-4/5 overflow-hidden">
          <h2 className="text-sm text-center text-black">{rollName}</h2>
        </div>
      </div>
      <div
        className={clsx(
          'flex w-full overflow-x-clip overflow-y-hidden -translate-x-10 transition-all duration-500 hover:cursor-pointer',
          !isOpen && `peer-hover:-translate-x-6 hover:-translate-x-6`,
          isOpen && `peer-hover:-translate-x-14 hover:-translate-x-14`
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {p.images.map((imagePath, i) => {
          return (
            <div
              key={imagePath}
              className={clsx('mt-[2%] transition-all duration-1000 min-w-[130px]')}
              style={{ transform: isOpen ? 'translateX(0)' : `translateX(-${(i + 1) * 127}px)` }}
            >
              <div className="relative">
                <img src="/assets/film-border.png" />
                <img
                  key={imagePath}
                  src={`/assets/rolls/${p.rollPath}/compressed/${imagePath}`}
                  alt={imagePath}
                  className="absolute top-[15%] border-x-[4px] border-[#290000]"
                />
                <span className="absolute top-[0.3px] right-[36%] text-[6px] font-bold text-[#AF944F]">
                  {i + 1}
                </span>
                <span className="absolute bottom-[0.3px] right-[36%] text-[6px] font-bold text-[#AF944F]">
                  {i + 1}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
