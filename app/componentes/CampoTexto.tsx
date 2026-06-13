'use client'

import React, { useState } from 'react'
import { CampoFormularioField } from './CampoFormulario.types'

interface CampoTextoProps {
  field: CampoFormularioField
  value?: string
  onChange?: (name: string, value: string) => void
}

const CampoTexto: React.FC<CampoTextoProps> = ({ field, value = '', onChange }) => {
  const [mostrarContrasena, setMostrarContrasena] = useState(false)

  const esPassword = field.type === 'password'
  const tipoEfectivo = esPassword && mostrarContrasena ? 'text' : field.type

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return
    onChange(field.name, event.target.value)
  }

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-2">
        {field.label}
      </label>
      <div className="relative">
        {field.icon ? (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <i className={field.icon}></i>
          </div>
        ) : null}
        <input
          type={tipoEfectivo}
          name={field.name}
          placeholder={field.placeholder}
          defaultValue={onChange ? undefined : value}
          value={onChange ? value : undefined}
          disabled={field.disabled}
          onChange={handleChange}
          className={`w-full border-2 border-black font-bold uppercase outline-none transition-colors duration-200 p-3 bg-white focus:bg-gray-50 text-sm ${field.icon ? 'pl-10' : ''} ${esPassword ? 'pr-10' : ''} ${field.disabled ? 'border-dashed border-gray-400 bg-gray-100 cursor-not-allowed' : ''}`}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setMostrarContrasena((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            title="Mostrar u ocultar contraseña"
          >
            <i className={`fa-solid ${mostrarContrasena ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        )}
      </div>
    </div>
  )
}

export default CampoTexto
