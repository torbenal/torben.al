import { FilmRoll } from '@/components/FilmRoll'
import { promises as fs } from 'fs'
import path from 'path'
import { gillSans } from './layout'

export default async function Home() {
  const rollsDirectory = path.join(process.cwd(), '/public/assets/rolls')
  const rollsPaths = await fs.readdir(rollsDirectory)
  const rolls = rollsPaths.filter((rollPath) => rollPath !== '.DS_Store')

  return (
    <div className="h-full">
      <h1 className={gillSans.className}>My rolls</h1>
      <div className="flex flex-wrap">
        {rolls.map(async (rollPath) => {
          const imageDirectory = path.join(
            process.cwd(),
            `/public/assets/rolls/${rollPath}/compressed`
          )
          const imagePaths = await fs.readdir(imageDirectory)
          const images = imagePaths.filter((imagePath) => imagePath.includes('_medium.webp'))
          return <FilmRoll key={rollPath} rollPath={rollPath} images={images} />
        })}
      </div>
    </div>
  )
}
