import CycleText from '@/components/cycle-text'
import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { ToolIcon } from '@/components/tool-icon'

export default function Home() {
  return (
    <>
      <HeroSection />

      <div className="font-sans max-w-[1200px] mx-auto py-4 px-4 relative sm:pointer-events-none">
        <Header />
        <main className="flex flex-col ">
          <div className="space-y-20 py-80 sm:py-72">
            <h1
              className="text-balance leading-tight"
              style={{
                textShadow: '0 5px 15px rgba(0,0,0,.9)',
              }}
            >
              Hello. I&apos;m Torben, <br /> and I&apos;m a <br className="block md:hidden" />
              <CycleText
                className="ml-0 md:ml-4"
                textArray={[
                  'full-stack developer.',
                  'ML engineer.',
                  'UI designer.',
                  'data scientist.',
                  'entrepreneur.',
                ]}
              />
            </h1>
            <div>
              <p className="text-balance md:max-w-1/2">
                BSc in Data Science from ITU Copenhagen, MSc in Technology Entrepreneurship from
                DTU.
              </p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col xl:flex-row flex-wrap space-y-8">
              <div className="space-y-6 flex-1">
                <h3 className="text-center sm:text-start">Full-stack development</h3>
                <div className="flex gap-4 flex-wrap justify-center sm:justify-start">
                  {[
                    'figma',
                    'nextjs',
                    'nodejs',
                    'prisma',
                    'react',
                    'tailwind',
                    'threejs',
                    'typescript',
                    'vercel',
                    'vuejs',
                  ].map((icon) => (
                    <ToolIcon key={icon} name={icon} />
                  ))}
                </div>
              </div>
              <div className="space-y-6 flex-1">
                <h3 className="text-center sm:text-start">Data science & ML</h3>
                <div className="flex gap-4 flex-wrap justify-center sm:justify-start">
                  {['fastapi', 'huggingface', 'python', 'pytorch', 'yolo'].map((icon) => (
                    <ToolIcon key={icon} name={icon} />
                  ))}
                </div>
              </div>
              <div className="space-y-6 flex-1">
                <h3 className="text-center sm:text-start">DevOps & cloud</h3>
                <div className="flex gap-4 flex-wrap justify-center sm:justify-start ">
                  {['aws', 'azure', 'docker', 'gcp', 'vercel'].map((icon) => (
                    <ToolIcon key={icon} name={icon} />
                  ))}
                </div>
              </div>
            </div>

            <div className="">
              <h2>Projects</h2>
            </div>
          </div>
        </main>
        <footer></footer>
      </div>
    </>
  )
}
