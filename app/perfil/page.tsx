'use client'

import React, { useEffect, useState } from 'react'
import Boton from '../componentes/Boton'
import CampoTexto from '../componentes/CampoTexto'
import Etiquetas from '../componentes/Etiquetas'
import BarraLateral from '../componentes/BarraLateral'
import { obtenerUsuarioMeSolicitud, UsuarioRolResponseData } from '../../lib/api/login/usuarios'
import { cambiarContrasenaSolicitud } from '../../lib/api/login/auth'

const ETIQUETAS_ROL: Record<string, string> = {
  ROL_ADMIN: 'Administrador',
  ROL_PROFESOR: 'Docente',
  ROL_ALUMNO: 'Alumno',
}

function getTokenYId(): { token: string; idUsuario: number } | null {
  try {
    const token =
      sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? ''
    const raw =
      sessionStorage.getItem('usuario') ?? localStorage.getItem('usuario') ?? ''
    const u = JSON.parse(raw) as { id?: number }
    if (!token || !u.id) return null
    return { token, idUsuario: u.id }
  } catch {
    return null
  }
}

function validarContrasena(pwd: string) {
  return {
    min8: pwd.length >= 8,
    mayus: /[A-Z]/.test(pwd),
    numero: /[0-9]/.test(pwd),
    simbolo: /[@#$%^&*!?.,;:_\-+=|~`'"<>{}()[\]\\/]/.test(pwd),
  }
}

const page = () => {
  const [usuario, setUsuario] = useState<UsuarioRolResponseData | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  // Seguridad y Acceso
  const [contrasenaActual, setContrasenaActual] = useState('')
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [loadingPwd, setLoadingPwd] = useState(false)
  const [errorPwd, setErrorPwd] = useState('')
  const [errorNueva, setErrorNueva] = useState('')
  const [successPwd, setSuccessPwd] = useState('')

  const validacion = validarContrasena(nuevaContrasena)

  const handleCambiarContrasena = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorPwd('')
    setErrorNueva('')
    setSuccessPwd('')

    if (!contrasenaActual.trim()) {
      setErrorPwd('Ingresa tu contraseña actual.')
      return
    }
    if (!validacion.min8 || !validacion.mayus || !validacion.numero || !validacion.simbolo) {
      setErrorNueva('La nueva contraseña no cumple todos los requisitos de seguridad.')
      return
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setErrorPwd('La nueva contraseña y la confirmación no coinciden.')
      return
    }

    const auth = getTokenYId()
    const token = auth?.token ?? ''

    try {
      setLoadingPwd(true)
      await cambiarContrasenaSolicitud(
        { contrasenaActual, nuevaContrasena, confirmarContrasena },
        token,
      )
      setSuccessPwd('Contraseña actualizada correctamente.')
      setContrasenaActual('')
      setNuevaContrasena('')
      setConfirmarContrasena('')
    } catch (err) {
      setErrorPwd(err instanceof Error ? err.message : 'Error al actualizar la contraseña.')
    } finally {
      setLoadingPwd(false)
    }
  }

  useEffect(() => {
    const auth = getTokenYId()
    if (!auth) {
      setErrorCarga('No se encontró sesión activa.')
      setCargando(false)
      return
    }

    obtenerUsuarioMeSolicitud(auth.token)
      .then((res) => {
        const datos = (res.datos ?? res) as UsuarioRolResponseData
        if (datos?.idUsuario) {
          setUsuario(datos)
        } else {
          setErrorCarga('No se pudieron cargar los datos del perfil.')
        }
      })
      .catch((err: unknown) => {
        setErrorCarga(err instanceof Error ? err.message : 'Error al cargar perfil.')
      })
      .finally(() => setCargando(false))
  }, [])

  const rolLabel = usuario ? (ETIQUETAS_ROL[usuario.rol] ?? usuario.rol) : '—'

  return (
    <>
      <BarraLateral />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-50">
        <header className="md:hidden bg-white border-b-2 border-black p-4 flex justify-between items-center">
          <span className="font-bold uppercase">[ LOGO ]</span>
          <button className="text-black">
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full pb-20">
          <div className="mb-10 border-b-4 border-black pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold uppercase text-black">Configuración de Perfil</h1>
              <p className="text-gray-700 font-bold uppercase mt-2 text-sm tracking-widest">
                Actualiza tus datos personales y gestiona tu seguridad
              </p>
            </div>

            <div className="hidden sm:block">
              <Etiquetas variant="outline">Rol: {rolLabel}</Etiquetas>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 mb-12">
            <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative">
              <div className="absolute -top-4 -left-4 bg-white border-2 border-black px-4 py-1 text-sm font-bold uppercase z-10 text-gray-800">
                Información Personal
              </div>

              <div className="flex flex-col items-center mb-8 mt-4">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 border-4 border-black rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <i className="fa-solid fa-user text-6xl text-gray-400"></i>
                  </div>

                  <div className="absolute inset-0 bg-black/80 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fa-solid fa-camera text-white text-xl mb-1"></i>
                    <span className="text-white text-xs font-bold uppercase">Cambiar</span>
                  </div>
                </div>
              </div>

              {cargando && (
                <p className="text-xs font-bold uppercase text-gray-500 mb-4">Cargando datos...</p>
              )}
              {errorCarga && (
                <p className="text-xs font-bold uppercase text-red-600 mb-4">{errorCarga}</p>
              )}
              <form className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CampoTexto
                    field={{
                      type: 'text',
                      name: 'nombres',
                      label: 'Nombres',
                      placeholder: 'Ej. Juan José',
                    }}
                    value={usuario?.nombres ?? ''}
                    onChange={() => {}}
                  />

                  <CampoTexto
                    field={{
                      type: 'text',
                      name: 'apellidos',
                      label: 'Apellidos',
                      placeholder: 'Ej. Pérez Soto',
                    }}
                    value={usuario?.apellidos ?? ''}
                    onChange={() => {}}
                  />
                </div>

                <div>
                  <CampoTexto
                    field={{
                      type: 'email',
                      name: 'correo',
                      label: 'Correo Electrónico',
                      disabled: true,
                    }}
                    value={usuario?.correo ?? ''}
                    onChange={() => {}}
                  />
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-2 text-right">
                    Contacte a soporte para modificar su correo.
                  </p>
                </div>
              </form>
            </div>

            <div className="bg-gray-100 border-2 border-black p-8 relative shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
              <div className="absolute -top-4 -left-4 bg-black text-white border-2 border-black px-4 py-1 text-sm font-bold uppercase z-10">
                Seguridad y Acceso
              </div>

              {/* <div className="mb-6 mt-4 p-4 border-2 border-black bg-white flex items-start space-x-3">
                <i className="fa-solid fa-circle-info text-xl pt-1 text-black"></i>
                <div>
                  <p className="text-sm font-bold uppercase text-black">
                    Último cambio de contraseña
                  </p>
                  <p className="text-xs text-gray-600 font-bold uppercase mt-1">
                    Hace 3 meses (15 Enero 2026)
                  </p>
                </div>
              </div> */}

              <form className="space-y-5" onSubmit={handleCambiarContrasena}>
                {errorPwd && (
                  <p className="text-xs font-bold uppercase text-red-600">{errorPwd}</p>
                )}
                {successPwd && (
                  <p className="text-xs font-bold uppercase text-green-600">{successPwd}</p>
                )}

                <CampoTexto
                    field={{
                      type: 'password',
                      name: 'contrasenaActual',
                      label: 'Contraseña Actual',
                      placeholder: '••••••••',
                    }}
                    value={contrasenaActual}
                    onChange={(_, v) => setContrasenaActual(v)}
                  />

                <div>
                  <CampoTexto
                      field={{
                        type: 'password',
                        name: 'nuevaContrasena',
                        label: 'Nueva Contraseña',
                        placeholder: '••••••••',
                      }}
                      value={nuevaContrasena}
                      onChange={(_, v) => { setNuevaContrasena(v); setErrorNueva('') }}
                    />
                  {errorNueva && (
                    <p className="text-xs font-bold uppercase text-red-600 mt-2">{errorNueva}</p>
                  )}

                  <div className="bg-white border-2 border-dashed border-gray-400 p-3 mt-3">
                    <p className="text-xs font-bold text-gray-700 uppercase mb-2 border-b-2 border-gray-200 pb-1">
                      Requisitos de seguridad
                    </p>
                    <ul className="text-xs font-bold uppercase space-y-1">
                      <li className={validacion.min8 ? 'text-green-600' : 'text-gray-500'}>
                        <i className={`fa-solid ${validacion.min8 ? 'fa-check' : 'fa-xmark'} mr-2`}></i>
                        Mínimo 8 caracteres
                      </li>
                      <li className={validacion.mayus ? 'text-green-600' : 'text-gray-500'}>
                        <i className={`fa-solid ${validacion.mayus ? 'fa-check' : 'fa-xmark'} mr-2`}></i>
                        Al menos una mayúscula
                      </li>
                      <li className={validacion.numero ? 'text-green-600' : 'text-gray-500'}>
                        <i className={`fa-solid ${validacion.numero ? 'fa-check' : 'fa-xmark'} mr-2`}></i>
                        Al menos un número
                      </li>
                      <li className={validacion.simbolo ? 'text-green-600' : 'text-gray-500'}>
                        <i className={`fa-solid ${validacion.simbolo ? 'fa-check' : 'fa-xmark'} mr-2`}></i>
                        Un símbolo especial (@, #, $, etc.)
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <CampoTexto
                      field={{
                        type: 'password',
                        name: 'confirmarContrasena',
                        label: 'Confirmar Nueva Contraseña',
                        placeholder: '••••••••',
                      }}
                      value={confirmarContrasena}
                      onChange={(_, v) => setConfirmarContrasena(v)}
                    />
                  <p className="text-[10px] font-bold uppercase mt-2 text-gray-500">
                    La nueva contraseña debe coincidir con la confirmación.
                  </p>
                </div>

                <div className="pt-4 border-t-2 border-black mt-6">
                  <Boton type="submit" variant="primary" size="md" fullWidth disabled={loadingPwd}>
                    {loadingPwd ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </Boton>
                </div>
              </form>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-gray-400 pt-4 pb-12 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Auditoría del sistema: todas las actualizaciones quedan registradas bajo su ID de
              usuario.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

export default page