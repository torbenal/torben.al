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
      <div className="flex w-full overflow-x-auto overflow-y-hidden -translate-x-24 peer-hover:-translate-x-10 transition-all z-[1]">
        {p.images.map((imagePath, i) => {
          return (
            <div
              key={imagePath}
              className={clsx(
                'flex items-center h-full min-w-[130px] max-w-[130px] transition-all duration-500',
                !isOpen && i < p.images.length - 1 && 'hidden'
              )}
            >
              <div className="relative object-cover">
                <img src="/assets/film-border.png" className="object-contain" />
                <img
                  key={imagePath}
                  src={`/assets/rolls/${p.rollPath}/${imagePath}`}
                  alt={imagePath}
                  className="object-contain absolute top-[15%] border-x-[4px] border-[#290000]"
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
