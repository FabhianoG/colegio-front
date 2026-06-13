'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Boton from '../componentes/Boton'
import Etiquetas from '../componentes/Etiquetas'
import BarraLateral from '../componentes/BarraLateral'
import { crearUsuarioSolicitud, actualizarDatosUsuarioSolicitud, obtenerUsuarioPorIdSolicitud } from '../../lib/api/login/usuarios'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? ''
}

const RegistroUsuarioForm = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const idParam = searchParams.get('id')
  const isEditMode = !!idParam

  const [nombres, setNombres] = useState('')
  const [apellidoPaterno, setApellidoPaterno] = useState('')
  const [apellidoMaterno, setApellidoMaterno] = useState('')
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEditMode && idParam) {
      const fetchUserData = async () => {
        setLoading(true)
        try {
          const res = await obtenerUsuarioPorIdSolicitud(Number(idParam), getToken())
          if (res.exito && res.datos) {
            setNombres(res.datos.nombres)
            // Asumiendo que apellidos vienen separados por espacio en la respuesta (paterno materno)
            const apellidosSplit = res.datos.apellidos.split(' ')
            setApellidoPaterno(apellidosSplit[0] || '')
            setApellidoMaterno(apellidosSplit.slice(1).join(' ') || '')
            setCorreo(res.datos.correo)
          } else {
            setError('No se pudo cargar la información del usuario.')
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al cargar usuario.')
        } finally {
          setLoading(false)
        }
      }
      fetchUserData()
    }
  }, [isEditMode, idParam])

  const validarCorreo = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (
      !nombres.trim() ||
      !apellidoPaterno.trim() ||
      !apellidoMaterno.trim() ||
      !correo.trim()
    ) {
      setError('Por favor complete todos los campos obligatorios.')
      return
    }

    if (!validarCorreo(correo)) {
      setError('Ingrese un correo electrónico válido.')
      return
    }

    setLoading(true)

    try {
      if (isEditMode) {
        const result = await actualizarDatosUsuarioSolicitud(
          Number(idParam),
          {
            desNombres: nombres.trim(),
            desApellidos: `${apellidoPaterno.trim()} ${apellidoMaterno.trim()}`,
            desCorreo: correo.trim(),
          },
          getToken()
        )
        if (result.exito) {
          setSuccess('Usuario actualizado correctamente.')
          setTimeout(() => router.push('/gestion-usuarios'), 2000)
        } else {
          setError(result.mensaje || 'No se pudo actualizar el usuario.')
        }
      } else {
        const result = await crearUsuarioSolicitud(
          {
            nombres: nombres.trim(),
            apellidos: `${apellidoPaterno.trim()} ${apellidoMaterno.trim()}`,
            correo: correo.trim(),
          },
          getToken(),
        )

        if (result.exito) {
          setSuccess('Usuario creado correctamente.')
          setTempPassword(result.datos?.contrasenaTemporal ?? '')
          setNombres('')
          setApellidoPaterno('')
          setApellidoMaterno('')
          setCorreo('')
        } else {
          setError(result.mensaje || 'No se pudo crear el usuario.')
          setTempPassword('')
        }
      }
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : `Ocurrió un error al ${isEditMode ? 'actualizar' : 'crear'} el usuario.`,
      )
      setTempPassword('')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyPassword = async () => {
    if (!tempPassword) return

    try {
      await navigator.clipboard.writeText(tempPassword)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('No se pudo copiar la contraseña temporal.')
    }
  }

  return (
    <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-50">
      <header className="md:hidden bg-white border-b-2 border-black p-4 flex justify-between items-center">
        <span className="font-bold uppercase text-black">[ LOGO ]</span>
        <button className="text-black">
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
      </header>

      <div className="p-8 max-w-5xl mx-auto w-full pb-20">
        <div className="text-xs font-bold uppercase text-gray-600 mb-6 tracking-widest">
          <Link href="/gestion-usuarios" className="hover:text-black hover:underline">
            Gestión Usuarios
          </Link>
          <i className="fa-solid fa-angle-right mx-2 text-black"></i>
          <span className="text-black border-b-2 border-black">
            {isEditMode ? 'Editar Registro' : 'Nuevo Registro'}
          </span>
        </div>

        <div className="mb-8 border-b-4 border-black pb-4">
          <h1 className="text-3xl font-bold uppercase text-black">
            {isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h1>
          <p className="text-gray-700 font-bold uppercase mt-2 text-sm tracking-widest">
            {isEditMode ? 'Actualización manual individual' : 'Registro manual individual'}
          </p>
        </div>

        <div className="bg-white border-4 border-black p-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative">
          <div className="absolute -top-4 -right-4 bg-black text-white px-4 py-1 text-xs font-bold uppercase border-2 border-black">
            Formulario de Ingreso
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {error ? (
              <div className="rounded border border-red-500 bg-red-50 p-4 text-sm font-bold uppercase text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded border border-green-500 bg-green-50 p-4 text-sm font-bold uppercase text-green-700">
                {success}
              </div>
            ) : null}

            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold uppercase border-b-2 border-dashed border-gray-400 inline-block pb-1 text-black">
                  1. Datos Personales
                </h2>
                <Etiquetas variant="outline">Obligatorio</Etiquetas>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-black">
                    Nombres
                  </label>
                  <input
                    type="text"
                    value={nombres}
                    onChange={(event) => setNombres(event.target.value)}
                    placeholder="Ej. Carlos Alberto"
                    className="w-full border-2 border-black p-3 font-bold outline-none transition-colors duration-200 bg-white focus:bg-gray-50 text-black placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-black">
                    Apellido Paterno
                  </label>
                  <input
                    type="text"
                    value={apellidoPaterno}
                    onChange={(event) => setApellidoPaterno(event.target.value)}
                    placeholder="Ej. Mendoza"
                    className="w-full border-2 border-black p-3 font-bold outline-none transition-colors duration-200 bg-white focus:bg-gray-50 text-black placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-black">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    value={apellidoMaterno}
                    onChange={(event) => setApellidoMaterno(event.target.value)}
                    placeholder="Ej. Ruiz"
                    className="w-full border-2 border-black p-3 font-bold outline-none transition-colors duration-200 bg-white focus:bg-gray-50 text-black placeholder:text-gray-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-black">
                    Correo Electrónico Institucional
                  </label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(event) => setCorreo(event.target.value)}
                    placeholder="ejemplo@colegio.edu.pe"
                    className="w-full border-2 border-black p-3 font-bold outline-none transition-colors duration-200 bg-white focus:bg-gray-50 text-black placeholder:text-gray-500"
                  />

                  <p className="text-[10px] font-bold uppercase mt-2 text-gray-600">
                    El sistema validará que el correo no pertenezca a otra cuenta activa.
                  </p>
                </div>

                {!isEditMode && tempPassword ? (
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start w-full">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-black">
                        Contraseña Temporal
                      </label>
                      <input
                        type="text"
                        value={tempPassword}
                        readOnly
                        className="w-full border-2 border-black p-3 font-bold outline-none bg-gray-200 text-black"
                      />
                    </div>
                    <div className="flex items-end">
                      <Boton
                        type="button"
                        variant="secondary"
                        size="md"
                        onClick={handleCopyPassword}
                        className="self-end"
                      >
                        <span className="fa-solid fa-copy text-sm"></span>
                        <span>{copied ? 'Copiado' : 'Copiar'}</span>
                      </Boton>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-end border-t-4 border-black">
              <Link href="/gestion-usuarios/">
                <Boton variant="ghost" size="md" type="button" onClick={() => {
                  if (!isEditMode) {
                    setNombres('')
                    setApellidoPaterno('')
                    setApellidoMaterno('')
                    setCorreo('')
                    setError('')
                    setSuccess('')
                    setTempPassword('')
                    setCopied(false)
                  }
                }}>
                  Cancelar
                </Boton>
              </Link>

              <Boton
                variant="wire"
                size="md"
                icon={<span className="text-sm">＋</span>}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Procesando...' : isEditMode ? 'Actualizar Usuario' : 'Registrar Usuario'}
              </Boton>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

const page = () => {
  return (
    <>
      <BarraLateral />
      <Suspense fallback={<div>Cargando...</div>}>
        <RegistroUsuarioForm />
      </Suspense>
    </>
  )
}

export default page