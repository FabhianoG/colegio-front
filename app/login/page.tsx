'use client'

import React, { useState } from 'react'
import Boton from '../componentes/Boton'
import { loginSolicitud } from '../../lib/api/login/auth'

const page = () => {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [recordar, setRecordar] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!correo.trim() || !contrasena.trim()) {
      setError('Por favor completa correo y contraseña antes de continuar.')
      return
    }

    try {
      setLoading(true)
      const response = await loginSolicitud({ correo: correo.trim(), contrasena })

      console.log('[LOGIN] Respuesta de la API:', response)

      // La API puede devolver los datos en la raíz o dentro de `datos`
      const datos = response.datos ?? response
      const token = (datos as typeof response).token ?? response.token
      const rol = (datos as typeof response).rol ?? response.rol

      if (!token) {
        const message = response.mensaje || 'Credenciales incorrectas o cuenta inactiva.'
        throw new Error(message)
      }

      const storage = recordar ? localStorage : sessionStorage
      storage.setItem('token', token)
      storage.setItem(
        'usuario',
        JSON.stringify({
          id: (datos as typeof response).idUsuario ?? response.idUsuario,
          nombres: (datos as typeof response).nombres ?? response.nombres,
          apellidos: (datos as typeof response).apellidos ?? response.apellidos,
          correo: (datos as typeof response).correo ?? response.correo,
          rol,
        }),
      )

      // Guardar en cookies para que el middleware pueda leerlas
      const cookieOpts = `path=/; SameSite=Strict${recordar ? '; Max-Age=604800' : ''}`
      document.cookie = `token=${token}; ${cookieOpts}`
      document.cookie = `rol=${rol ?? ''}; ${cookieOpts}`

      const rutasPorRol: Record<string, string> = {
        ROL_ALUMNO: '/dashboard-alumno',
        ROL_PROFESOR: '/gestion-secciones',
        ROL_ADMIN: '/gestion-secciones',
      }
      const destino = rutasPorRol[rol ?? ''] ?? '/dashboard-alumno'

      console.log('[LOGIN] Rol:', rol, '→ Redirigiendo a:', destino)

      setSuccess('Inicio de sesión exitoso. Redirigiendo...')
      window.location.replace(destino)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="w-full bg-white border-4 border-black flex flex-col lg:flex-row shadow-[16px_16px_0_0_rgba(0,0,0,1)] overflow-hidden">
          <div className="w-full lg:w-1/2 bg-gray-200 border-b-4 lg:border-b-0 lg:border-r-4 border-black p-10 flex flex-col justify-center items-center text-center">
            <div className="w-20 h-20 border-4 border-black flex items-center justify-center font-bold text-4xl bg-white mb-6">
              L
            </div>

            <h1 className="text-3xl font-bold uppercase tracking-widest mb-3 text-[color:var(--primary)]">
              [ LOGO SISTEMA ]
            </h1>

            <p className="text-sm font-bold text-gray-800 uppercase">
              Plataforma educativa de labor social
            </p>

          </div>

          <div className="w-full lg:w-1/2 p-10 bg-white">
            <h2 className="text-2xl font-bold uppercase mb-2 text-black">Iniciar Sesión</h2>
            <p className="text-xs font-bold text-gray-700 uppercase mb-8 tracking-widest border-b-2 border-gray-200 pb-4">
              Ingresa tus credenciales para continuar
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 no-validate">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-black" htmlFor="correo">
                  Correo Institucional o Usuario
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-600">
                    <i className="fa-regular fa-envelope"></i>
                  </div>

                  <input
                    id="correo"
                    name="correo"
                    type="email"
                    value={correo}
                    onChange={(event) => setCorreo(event.target.value)}
                    placeholder="ejemplo@colegio.edu.pe"
                    className="w-full border-2 border-black pl-10 pr-3 py-3 font-bold text-sm outline-none focus:border-dashed focus:bg-gray-50 transition-colors text-black placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-black" htmlFor="contrasena">
                    Contraseña
                  </label>

                  <a
                    href="#recuperacion"
                    className="text-xs font-bold uppercase border-b border-black text-black hover:text-gray-600 transition-colors self-start sm:self-auto"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-600">
                    <i className="fa-solid fa-lock"></i>
                  </div>

                  <input
                    id="contrasena"
                    name="contrasena"
                    type="password"
                    value={contrasena}
                    onChange={(event) => setContrasena(event.target.value)}
                    placeholder="••••••••"
                    className="w-full border-2 border-black pl-10 pr-10 py-3 font-bold text-sm outline-none focus:border-dashed focus:bg-gray-50 transition-colors text-black placeholder:text-gray-500"
                  />

                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-black"
                    title="Mostrar u ocultar contraseña"
                  >
                    <i className="fa-regular fa-eye"></i>
                  </button>
                </div>

                <p className="text-[10px] font-bold uppercase mt-2 text-gray-700 leading-relaxed">
                  Puedes visualizar u ocultar la contraseña antes de enviar el formulario.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="recordar"
                  type="checkbox"
                  checked={recordar}
                  onChange={(event) => setRecordar(event.target.checked)}
                  className="w-4 h-4 accent-black border-2 border-black cursor-pointer"
                />
                <label
                  htmlFor="recordar"
                  className="text-xs font-bold uppercase cursor-pointer text-black hover:text-gray-700 transition-colors"
                >
                  Mantener sesión iniciada
                </label>
              </div>

              {error ? (
                <p className="text-sm font-bold uppercase text-red-700">{error}</p>
              ) : null}

              {success ? (
                <p className="text-sm font-bold uppercase text-green-700">{success}</p>
              ) : null}

              <Boton type="submit" variant="wire" size="lg" fullWidth disabled={loading}>
                {loading ? 'Validando...' : 'Ingresar al Sistema'}
              </Boton>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
