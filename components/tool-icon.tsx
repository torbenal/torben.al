import Image from 'next/image'

export const ToolIcon = ({ name }: { name: string }) => {
  return (
    <div
      className="h-14 w-14 p-3 bg-white items-center justify-center flex rounded-2xl"
      style={{
        boxShadow:
          '0 0 14px 6px hsla(0,0%,100%,.19),inset 0 -3px .4px 0 rgba(0,0,0,.2),inset 0 1px .4px 0 #fff',
        borderLeft: '1px solid rgba(0,0,0,.2)',
        borderBottom: '1px solid rgba(0,0,0,.2)',
        borderRight: '1px solid rgba(0,0,0,.2)',
      }}
    >
      <Image src={`/logos/${name}.svg`} alt={name} width="56" height={56} />
    </div>
  )
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
