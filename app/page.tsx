import CycleText from '@/components/cycle-text'
import { geistMono } from '@/lib/fonts'

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] max-w-[1200px] mx-auto py-4 relative">
      <header
        className="bg-[#22222250] px-8 py-5 backdrop-blur-sm rounded-xl justify-between flex sticky top-4"
        style={{
          boxShadow: 'inset 0 1px 1px 0 hsla(0, 0%, 100%, .15)',
        }}
      >
        <span className={geistMono.variable}>torben.al</span>
        <nav className="flex gap-4">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Projects</a>
          <a href="#">Contact</a>
        </nav>
      </header>
      <main className="flex flex-col gap-8">
        <div className="py-40 text-6xl">
          <h1>
            Hello. My name is Torben, <br /> and I'm a
            <CycleText textArray={['developer.', 'designer.', 'creator.']} />
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
  )
}
