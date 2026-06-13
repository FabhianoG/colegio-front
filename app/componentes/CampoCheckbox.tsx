'use client'

import React from 'react'
import { CampoFormularioField } from './CampoFormulario.types'

interface CampoCheckboxProps {
  field: CampoFormularioField
  value?: boolean
  onChange?: (name: string, value: boolean) => void
}

const CampoCheckbox: React.FC<CampoCheckboxProps> = ({ field, value = false, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return
    onChange(field.name, event.target.checked)
  }

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        name={field.name}
        defaultChecked={onChange ? undefined : value}
        checked={onChange ? value : undefined}
        disabled={field.disabled}
        onChange={handleChange}
        className="w-4 h-4 accent-black border-2 border-black"
      />
      <span className="text-xs font-bold uppercase">{field.label}</span>
    </label>
  )
}

export default CampoCheckbox
