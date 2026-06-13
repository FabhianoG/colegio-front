import React from 'react'

export interface TarjetaEstadisticaProps {
  title: string
  value: string | number
  icon?: string
  className?: string
}

const TarjetaEstadistica: React.FC<TarjetaEstadisticaProps> = ({
  title,
  value,
  icon,
  className = '',
}) => {
  return (
    <article className={`bg-white p-6 border-2 border-black flex items-center justify-between ${className}`.trim()}>
      <div>
        <p className="text-sm font-bold text-gray-600 uppercase mb-1">{title}</p>
        <p className="text-4xl font-bold text-black">{value}</p>
      </div>
      <div className="w-16 h-16 rounded-full border-4 border-black border-dashed flex items-center justify-center">
        {icon ? <i className={`${icon} text-xl`} /> : null}
      </div>
    </article>
  )
}

export default TarjetaEstadistica
