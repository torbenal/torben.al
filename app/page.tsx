import CycleText from '@/components/cycle-text'
import Ing from '@/components/fluid-canvas'
import Image from 'next/image'

export default function Home() {
  return (
    <>
      <div className="absolute inset-0 z-[0] h-[100vh]">
        <Ing />
      </div>
      <div className="font-sans max-w-[1200px] mx-auto py-4 px-8 relative pointer-events-none">
        <header
          className="bg-[#13121299] px-8 py-7 backdrop-blur-md rounded-xl justify-between flex sticky top-4 z-[1] items-center"
          style={{
            boxShadow: 'inset 0 1.5px 1px 0 hsla(0, 0%, 100%, .2)',
            // border: '1px solid hsla(0, 0%, 100%, .1)',
          }}
        >
          <span className="font-mono font-bold text-lg">
            <span className="text-[rgba(255,255,255,.3)]">https://</span>torben.al
          </span>
          <nav className="flex gap-6">
            <a href="#" className="flex">
              <Image src="/linkedin.svg" width={20} height={20} alt="LinkedIn" />
            </a>
            <a href="#" className="flex">
              <Image src="/github.svg" width={20} height={20} alt="GitHub" />
            </a>
            <a href="#" className="flex">
              <button
                className="bg-white rounded-md py-1 px-2 flex items-center gap-2 text-[#131212] font-medium text-sm"
                style={{
                  boxShadow: 'inset 0 -1px .4px 0 rgba(0,0,0,.2),inset 0 1px .4px 0 #fff',
                }}
              >
                Download CV
              </button>
            </a>
          </nav>
        </header>
        <main className="flex flex-col gap-8 ">
          <div className="py-40">
            <h1
              className="text-5xl font-medium"
              style={{
                textShadow: '0 0 10px rgba(0,0,0,.5)',
              }}
            >
              Hello. My name is Torben, <br /> and I'm a
              <CycleText
                textArray={[
                  'full-stack developer.',
                  'ML engineer.',
                  'UI designer.',
                  'data scientist.',
                  'entrepreneur.',
                ]}
              />
            </h1>
          </div>
          <div className="py-40">
            <h1>Hello.</h1>
          </div>
          <div className="py-40">
            <h1>Hello.</h1>
          </div>
        </main>
        <footer></footer>
      </div>
    </>
  )
}
