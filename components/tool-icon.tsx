'use client'

import Image from 'next/image'
// import { useState } from 'react'
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const toolData: Record<string, { displayName: string; href?: string }> = {
  figma: { displayName: 'Figma', href: 'https://figma.com' },
  nextjs: { displayName: 'Next.js', href: 'https://nextjs.org' },
  nodejs: { displayName: 'Node.js', href: 'https://nodejs.org' },
  prisma: { displayName: 'Prisma', href: 'https://prisma.io' },
  react: { displayName: 'React', href: 'https://react.dev' },
  tailwind: { displayName: 'Tailwind CSS', href: 'https://tailwindcss.com' },
  threejs: { displayName: 'Three.js', href: 'https://threejs.org' },
  typescript: { displayName: 'TypeScript', href: 'https://typescriptlang.org' },
  vercel: { displayName: 'Vercel', href: 'https://vercel.com' },
  vuejs: { displayName: 'Vue.js', href: 'https://vuejs.org' },
  fastapi: { displayName: 'FastAPI', href: 'https://fastapi.tiangolo.com' },
  huggingface: { displayName: 'Hugging Face', href: 'https://huggingface.co' },
  python: { displayName: 'Python', href: 'https://python.org' },
  pytorch: { displayName: 'PyTorch', href: 'https://pytorch.org' },
  yolo: { displayName: 'YOLO', href: 'https://ultralytics.com/yolo' },
  aws: { displayName: 'AWS', href: 'https://aws.amazon.com' },
  azure: { displayName: 'Azure', href: 'https://azure.microsoft.com' },
  docker: { displayName: 'Docker', href: 'https://docker.com' },
  gcp: { displayName: 'Google Cloud', href: 'https://cloud.google.com' },
}

export const ToolIcon = ({ name }: { name: string }) => {
  // const [open, setOpen] = useState(false)
  const tool = toolData[name] || { displayName: name }

  return (
    <a
      href={tool.href}
      target="_blank"
      rel="noopener noreferrer"
      className="lifted h-14 w-14 p-3 items-center justify-center flex rounded-2xl cursor-pointer pointer-events-auto focus:outline-none"
      // onMouseEnter={() => setOpen(true)}
      // onMouseLeave={() => setOpen(false)}
    >
      <Image src={`/logos/${name}.svg`} alt={name} width="56" height={56} />
    </a>
  )

  // return (
  //   <Popover open={open} onOpenChange={setOpen}>
  //     <PopoverTrigger asChild>
  //       <a
  //         href={tool.href}
  //         target="_blank"
  //         rel="noopener noreferrer"
  //         className="lifted h-14 w-14 p-3 items-center justify-center flex rounded-2xl cursor-pointer pointer-events-auto focus:outline-none"
  //         onMouseEnter={() => setOpen(true)}
  //         onMouseLeave={() => setOpen(false)}
  //       >
  //         <Image src={`/logos/${name}.svg`} alt={name} width="56" height={56} />
  //       </a>
  //     </PopoverTrigger>
  //     <PopoverContent className="w-auto p-2 z-50 pointer-events-auto" side="top" sideOffset={8}>
  //       <span className="text-sm font-medium">{tool.displayName}</span>
  //     </PopoverContent>
  //   </Popover>
  // )
}

// export const ToolIcons = () => {
//   return (
//     <div className="flex gap-4 flex-wrap">
//       {toolIcons.map((icon) => (
//         <ToolIcon key={icon} name={icon} />
//       ))}
//     </div>
//   )
// }
