'use client'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'
import { Squash } from './burger/squash'

const headerLinks = [
  { href: '#', text: 'LinkedIn', icon: '/linkedin.svg' },
  { href: '#', text: 'GitHub', icon: '/github.svg' },
  { href: '#', text: 'Download CV', icon: '/download.svg' },
]

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full sticky top-4 z-[1]">
      <header
        className={clsx(
          'bg-[#13121299] px-4 md:px-8 py-4 md:py-7 backdrop-blur-md rounded-xl justify-between flex flex-col md:flex-row absolute w-full md:items-center gap-y-4',
          isOpen ? 'max-h-[200px]' : 'max-h-[calc(48px+2rem)]'
        )}
        style={{
          boxShadow: 'inset 0 2px 1px 0 hsla(0, 0%, 100%, .2)',
          borderBottom: '1px solid rgba(255,255,255,.05)',
          borderLeft: '1px solid rgba(255,255,255,.05)',
          borderRight: '1px solid rgba(255,255,255,.05)',
          transition: 'max-height 0.2s',
        }}
      >
        <div className="flex flex-1 justify-between items-center">
          <span className="font-mono font-bold text-lg items-center flex">
            <span className="text-[rgba(255,255,255,.3)]">https://</span>torben.al
            <div
              className="h-5 w-0.5 bg-[rgba(255,255,255,.3)] ml-1.5 inline-flex"
              style={{
                animation: 'blink 1.2s step-end infinite',
              }}
            />
          </span>
          <div className="pointer-events-auto block md:hidden">
            <Squash rounded size={24} onToggle={setIsOpen} toggled={isOpen} duration={0.2} />
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className={clsx('gap-4 flex-col md:hidden transition-all flex')}
            >
              {headerLinks.map((link, index) => (
                <motion.a
                  href={link.href}
                  key={index}
                  className="flex pointer-events-auto gap-3 items-center text-[rgba(255,255,255,.7)]"
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: 0.8 * index,
                  }}
                >
                  <Image src={link.icon} width={16} height={16} alt={link.text} />
                  <span>{link.text}</span>
                </motion.a>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        <nav className="md:flex gap-6 flex-col md:flex-row hidden">
          <a href="#" className="flex pointer-events-auto">
            <Image src="/linkedin.svg" width={20} height={20} alt="LinkedIn" />
          </a>
          <a href="#" className="flex pointer-events-auto">
            <Image src="/github.svg" width={20} height={20} alt="GitHub" />
          </a>
          <a href="#" className="flex pointer-events-auto">
            <button
              className="bg-white rounded-md py-1 px-2 flex items-center gap-2 text-[#131212] font-medium text-sm cursor-pointer"
              style={{
                boxShadow: 'inset 0 -2px .4px 0 rgba(0,0,0,.2),inset 0 1px .4px 0 #fff',
                borderLeft: '1px solid rgba(0,0,0,.2)',
                borderBottom: '1px solid rgba(0,0,0,.2)',
                borderRight: '1px solid rgba(0,0,0,.2)',
              }}
            >
              Download CV
            </button>
          </a>
        </nav>
      </header>
    </div>
  )
}
