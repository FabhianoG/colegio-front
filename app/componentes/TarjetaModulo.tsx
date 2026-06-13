import React from 'react'
import Etiquetas, { EtiquetaVariant } from './Etiquetas'

export interface TarjetaModuloProps {
  status?: string
  statusVariant?: EtiquetaVariant
  title: string
  description: string
  buttonLabel?: string
  onButtonClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
}

const TarjetaModulo: React.FC<TarjetaModuloProps> = ({
  status,
  statusVariant = 'neutral',
  title,
  description,
  buttonLabel = 'Continuar',
  onButtonClick,
  className = '',
}) => {
  return (
    <article className={`bg-white border-2 border-black p-5 relative transition-all hover:shadow-lg ${className}`.trim()}>

      {status && (
        <div className="absolute top-[-12px] right-[-12px] p-3">
          <Etiquetas variant={statusVariant}>{status}</Etiquetas>
        </div>
      )}

      <h3 className="font-bold text-lg uppercase mb-2 text-gray-800">
        {title}
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        {description}
      </p>

      <button
        type="button"
        onClick={onButtonClick}
        className="
          w-full py-2 border-2 border-black text-sm font-bold uppercase
          cursor-pointer
          transition-all duration-200
          hover:bg-black hover:text-white
          active:scale-[0.97]
        "
      >
        {buttonLabel}
      </button>

    </article>
  )
}

export default TarjetaModulo