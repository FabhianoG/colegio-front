'use client'

'use client'

import React from 'react'
import { CampoFormularioField } from './CampoFormulario.types'

interface CampoSelectProps {
  field: CampoFormularioField
  value?: string
  onChange?: (name: string, value: string) => void
}

const CampoSelect: React.FC<CampoSelectProps> = ({ field, value = '', onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onChange) return
    onChange(field.name, event.target.value)
  }

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-2">
        {field.label}
      </label>
      <select
        name={field.name}
        defaultValue={onChange ? undefined : value}
        value={onChange ? value : undefined}
        disabled={field.disabled}
        onChange={handleChange}
        className="w-full border-2 border-black font-bold uppercase outline-none transition-colors duration-200 p-3 bg-gray-100 focus:bg-white cursor-pointer"
      >
        <option value="">[ Seleccione ]</option>
        {field.options?.map((option) => {
          if (typeof option === 'string') {
            return (
              <option key={option} value={option}>
                {option}
              </option>
            )
          }

          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )
        })}
      </select>
    </div>
  )
}

export default CampoSelect
