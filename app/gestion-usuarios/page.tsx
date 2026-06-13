'use client'

import React, { useEffect, useState } from 'react'
import Boton from '../componentes/Boton'
import CampoTexto from '../componentes/CampoTexto'
import CampoSelect from '../componentes/CampoSelect'
import CampoRadio from '../componentes/CampoRadio'
import Etiquetas from '../componentes/Etiquetas'
import Tabla, { TablaColumn, TablaRow } from '../componentes/Tabla'
import BarraLateral from '../componentes/BarraLateral'
import {
  actualizarEstadoUsuarioSolicitud,
  listarUsuariosSolicitud,
  UsuarioRolResponseData,
} from '../../lib/api/login/usuarios'
import FormUsuario from './form/FormUsuario'
import FormCambiarContrasena from './form/FormCambiarContrasena'
import Link from 'next/link'

const PAGE_SIZE = 10

const ETIQUETA_ROL: Record<string, string> = {
  ROL_ADMIN: 'Administrador',
  ROL_PROFESOR: 'Docente',
  ROL_ALUMNO: 'Alumno',
}

const columnas: TablaColumn[] = [
  { key: 'usuario', label: 'Usuario' },
  { key: 'rol', label: 'Rol Actual' },
  { key: 'estado', label: 'Estado' },
  { key: 'fecUltimoAcceso', label: 'Último Acceso' },
]

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? ''
}

function formatFecha(fecha: any): string {
  if (!fecha) return 'Nunca'
  try {
    let d: Date
    // Si el backend envía la fecha como un array de números [yyyy, mm, dd, hh, mm, ss]
    if (Array.isArray(fecha) && fecha.length >= 3) {
      d = new Date(fecha[0], fecha[1] - 1, fecha[2], fecha[3] || 0, fecha[4] || 0, fecha[5] || 0)
    } else {
      d = new Date(fecha)
    }
    if (isNaN(d.getTime())) return String(fecha)
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return String(fecha)
  }
}

function usuarioAFila(u: UsuarioRolResponseData): TablaRow {
  const rolLabel = ETIQUETA_ROL[u.rol] ?? u.rol
  const icono = u.rol === 'ROL_ALUMNO' ? 'fa-user-graduate' : u.rol === 'ROL_PROFESOR' ? 'fa-chalkboard-user' : 'fa-user-shield'

  return {
    id: u.idUsuario,
    usuario: (
      <div className={`flex items-center space-x-3 ${!u.activo ? 'opacity-60' : ''}`}>
        <div className={`w-8 h-8 border-2 ${u.activo ? 'border-black bg-gray-200' : 'border-dashed border-gray-400 bg-gray-100'} flex items-center justify-center`}>
          <i className={`fa-solid ${icono} text-xs ${!u.activo ? 'text-gray-400' : ''}`}></i>
        </div>
        <div>
          <p className={`font-bold uppercase text-base ${!u.activo ? 'text-gray-500' : ''}`}>
            {u.apellidos}, {u.nombres}
          </p>
          <p className={`text-xs font-bold ${!u.activo ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
            {u.correo}
          </p>
        </div>
      </div>
    ),
    rol: <Etiquetas variant="neutral">{rolLabel}</Etiquetas>,
    estado: u.activo
      ? <Etiquetas variant="success">Activo</Etiquetas>
      : <Etiquetas variant="danger">Inactivo</Etiquetas>,
    fecUltimoAcceso: (
      <span className={`text-xs font-bold uppercase ${!u.activo ? 'text-gray-400' : 'text-gray-500'}`}>
        {formatFecha(u.fecUltimoAcceso)}
      </span>
    ),
  }
}


const page = () => {
  const [usuarios, setUsuarios] = useState<UsuarioRolResponseData[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [paginaActual, setPaginaActual] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalElementos, setTotalElementos] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroSeccion, setFiltroSeccion] = useState('')
  const [mostrarFormUsuario, setMostrarFormUsuario] = useState(false)
  const [usuarioCambioContrasena, setUsuarioCambioContrasena] = useState<UsuarioRolResponseData | null>(null)

  const ROL_MAP: Record<string, string> = {
    ADMINISTRADOR: 'ROL_ADMIN',
    DOCENTE: 'ROL_PROFESOR',
    ALUMNO: 'ROL_ALUMNO',
  }

  const [filtrosAplicados, setFiltrosAplicados] = useState({
    busqueda: '',
    rol: '',
    estado: '',
    seccion: '',
  })

  const cargarUsuarios = (pagina: number, filtrosParaUsar?: typeof filtrosAplicados) => {
    setCargando(true)
    setError('')

    const filtros = filtrosParaUsar ?? filtrosAplicados

    // Preparamos los parámetros para enviarlos a la API (si el backend soporta los filtros)
    const params: Record<string, any> = { page: pagina, size: PAGE_SIZE }
    if (filtros.busqueda) params.busqueda = filtros.busqueda
    if (filtros.rol) params.rol = filtros.rol
    if (filtros.estado === 'ACTIVOS') params.estActivo = true
    if (filtros.estado === 'INACTIVOS / BANEADOS') params.estActivo = false
    if (filtros.seccion === 'SIN SECCIÓN') params.sinSeccion = true

    listarUsuariosSolicitud(params, getToken())
      .then((res) => {
        const datos = (res.datos ?? res) as typeof res.datos
        if (datos && 'content' in datos) {
          setUsuarios(datos.content)
          setTotalPaginas(datos.totalPages)
          setTotalElementos(datos.totalElements)
          setPaginaActual(datos.number)
        } else {
          setError('No se pudo cargar la lista de usuarios.')
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error al cargar usuarios.')
      })
      .finally(() => setCargando(false))
  }

  const handleBuscar = () => {
    const nuevosFiltros = {
      busqueda: busqueda.trim().toLowerCase(),
      rol: filtroRol ? ROL_MAP[filtroRol] : '',
      estado: filtroEstado,
      seccion: filtroSeccion,
    }
    setFiltrosAplicados(nuevosFiltros)
    cargarUsuarios(0, nuevosFiltros)
  }

  useEffect(() => {
    cargarUsuarios(0)
  }, [])

  const filas: TablaRow[] = usuarios.map(usuarioAFila)

  const inicio = totalElementos === 0 ? 0 : paginaActual * PAGE_SIZE + 1
  const fin = Math.min((paginaActual + 1) * PAGE_SIZE, totalElementos)

  const paginasVisibles = (() => {
    const total = Math.max(0, totalPaginas)
    const maxVisible = 10

    // Si hay 10 o menos páginas en total, las mostramos todas (de 0 a total - 1)
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i)
    }

    // Si hay más de 10 páginas, centramos el rango en la página actual
    const mitad = Math.floor(maxVisible / 2)
    let start = Math.max(0, paginaActual - mitad)
    let end = Math.min(total - 1, start + maxVisible - 1)

    // Ajuste por si estamos en las últimas páginas (para mantener 10 botones)
    start = Math.max(0, end - maxVisible + 1)

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })()

  const cambiarEstadoUsuario = (activo: boolean, idUsuario: number) => {
    if (activo) {
      actualizarEstadoUsuarioSolicitud(idUsuario, { activo: false }, getToken())
        .then(() => cargarUsuarios(paginaActual))
        .catch((err) => setError(err instanceof Error ? err.message : 'Error al actualizar estado de usuario.'))
    } else {
      actualizarEstadoUsuarioSolicitud(idUsuario, { activo: true }, getToken())
        .then(() => cargarUsuarios(paginaActual))
        .catch((err) => setError(err instanceof Error ? err.message : 'Error al actualizar estado de usuario.'))
    }
  }

  return (
    <>
      <BarraLateral />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-50 relative text-gray-900">
        <div className="p-8 max-w-7xl mx-auto w-full pb-20">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold uppercase text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-700 font-bold uppercase mt-2 text-sm tracking-widest">
                Control de accesos y roles (RBAC)
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/registro-usuarios/">
                <Boton variant="wire" size="md" icon={<span className="text-sm">＋</span>} className="cursor-pointer">
                  Nuevo Usuario
                </Boton>
              </Link>
              <Link href="/carga-masiva/">
                <Boton variant="wire" size="md" icon={<span className="text-sm">＋</span>} className="cursor-pointer">
                  Carga Masiva
                </Boton>
              </Link>
            </div>
          </div>

          <div className="bg-white border-2 border-black p-4 mb-8 flex flex-col lg:flex-row gap-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-gray-900">
            <div className="flex-1">
              <CampoTexto
                field={{
                  type: 'search',
                  name: 'buscarUsuario',
                  label: 'Buscar usuario',
                  placeholder: 'BUSCAR POR NOMBRE O CORREO...',
                  icon: 'fa-solid fa-search',
                }}
                value={busqueda}
                onChange={(_, v) => setBusqueda(v)}
              />
            </div>

            <div className="w-full lg:w-48">
              <CampoSelect
                field={{
                  type: 'select',
                  name: 'rol',
                  label: 'Rol',
                  options: ['ADMINISTRADOR', 'DOCENTE', 'ALUMNO'],
                }}
                value={filtroRol}
                onChange={(_, v) => setFiltroRol(v)}
              />
            </div>

            <div className="w-full lg:w-48">
              <CampoSelect
                field={{
                  type: 'select',
                  name: 'estado',
                  label: 'Estado',
                  options: ['ACTIVOS', 'INACTIVOS / BANEADOS'],
                }}
                value={filtroEstado}
                onChange={(_, v) => setFiltroEstado(v)}
              />
            </div>

            <div className="w-full lg:w-48">
              <CampoSelect
                field={{
                  type: 'select',
                  name: 'seccion',
                  label: 'Sección',
                  options: ['SIN SECCIÓN'],
                }}
                value={filtroSeccion}
                onChange={(_, v) => setFiltroSeccion(v)}
              />
            </div>

            <div className="flex items-end">
              <Boton
                variant="primary"
                size="md"
                icon={<i className="fa-solid fa-magnifying-glass text-xs"></i>}
                onClick={handleBuscar}
              >
                Buscar
              </Boton>
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold uppercase text-red-600 mb-4">{error}</p>
          )}

          <div className="bg-white border-2 border-black overflow-x-auto shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            {cargando ? (
              <div className="p-12 text-center">
                <p className="text-xs font-bold uppercase text-gray-500">Cargando usuarios...</p>
              </div>
            ) : (
              <Tabla
                columns={columnas}
                rows={filas}
                renderAction={(row) => {
                  const u = usuarios.find((x) => x.idUsuario === row.id)
                  if (!u) return null
                  return (
                    <div className="flex justify-center gap-2">
                      <Link href={`/registro-usuarios?id=${u.idUsuario}`}>
                        <button
                          title="Editar Datos"
                          className="min-w-10.5 h-8 px-2 border-2 border-black font-bold text-[10px] uppercase transition-colors hover:bg-black hover:text-white"
                        >
                          Edit
                        </button>
                      </Link>

                      <button
                        title={u.activo ? 'Suspender Cuenta' : 'Activar Cuenta'}
                        className="min-w-10.5 h-8 px-2 border-2 border-black font-bold text-[10px] uppercase transition-colors hover:bg-black hover:text-white"
                        onClick={() => cambiarEstadoUsuario(u.activo, u.idUsuario)}
                      >
                        {u.activo ? 'Off' : 'On'}
                      </button>

                      <button
                        title={u.activo ? 'Cambiar contraseña' : 'Activar cuenta para cambiar contraseña'}
                        disabled={!u.activo}
                        className={`min-w-10.5 h-8 px-2 border-2 font-bold text-[10px] uppercase transition-colors ${!u.activo ? 'border-gray-400 text-gray-400 cursor-not-allowed' : 'border-black hover:bg-black hover:text-white'}`}
                        onClick={() => u.activo && setUsuarioCambioContrasena(u)}
                      >
                        Key
                      </button>
                    </div>
                  )
                }}
                className="max-w-none mx-0 space-y-0"
              />
            )}

            <div className="p-4 border-t-2 border-black flex items-center justify-between bg-white">
              <span className="text-xs font-bold uppercase text-gray-500">
                {totalElementos > 0
                  ? `Mostrando ${inicio} a ${fin} de ${totalElementos} usuarios`
                  : 'Sin resultados'}

              </span>

              <div className="flex space-x-2">
                <button
                  onClick={() => cargarUsuarios(paginaActual - 1)}
                  disabled={paginaActual === 0 || cargando}
                  className="border-2 border-black px-3 py-1 font-bold uppercase text-sm hover:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                {paginasVisibles.map((p) => (
                  <button
                    key={p}
                    onClick={() => p !== paginaActual && cargarUsuarios(p)}
                    disabled={cargando}
                    className={`border-2 px-3 py-1 font-bold text-sm ${p === paginaActual ? 'bg-black text-white border-black cursor-default' : 'border-black hover:bg-gray-200'}`}
                  >
                    {p + 1}
                  </button>
                ))}

                <button
                  onClick={() => cargarUsuarios(paginaActual + 1)}
                  disabled={paginaActual >= totalPaginas - 1 || cargando}
                  className="border-2 border-black px-3 py-1 font-bold uppercase text-sm hover:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
        {mostrarFormUsuario && (
          <FormUsuario
            onClose={() => setMostrarFormUsuario(false)}
            onSuccess={() => {
              setMostrarFormUsuario(false)
              cargarUsuarios(0) // Recarga la tabla de usuarios desde la página 0 tras crear uno nuevo
            }}
          />
        )}

        {usuarioCambioContrasena && (
          <FormCambiarContrasena
            idUsuario={usuarioCambioContrasena.idUsuario}
            nombreUsuario={`${usuarioCambioContrasena.apellidos}, ${usuarioCambioContrasena.nombres}`}
            onClose={() => setUsuarioCambioContrasena(null)}
            onSuccess={() => {
              setUsuarioCambioContrasena(null)
              cargarUsuarios(paginaActual)
            }}
          />
        )}
      </main>
    </>
  )
}

export default page