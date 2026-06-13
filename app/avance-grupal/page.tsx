"use client"

import React, { useEffect, useState } from 'react'
import Boton from '../componentes/Boton'
import CampoTexto from '../componentes/CampoTexto'
import CampoSelect from '../componentes/CampoSelect'
import Tabla, { TablaColumn, TablaRow } from '../componentes/Tabla'
import TarjetaEstadistica from '../componentes/TarjetaEstadistica'
import BarraLateral from '../componentes/BarraLateral'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  listarSeccionesProfesorSeccionSolicitud,
  ProfesorSeccionResponseData,
} from '../../lib/api/login/secciones'
import {
  obtenerProgresoSeccionSolicitud,
  obtenerProgresoNoAvanzanSolicitud,
  ProgresoSeccionResponseData,
  AlumnoProgresoData,
} from '../../lib/api/login/progreso'

const PAGE_SIZE = 6

const columnas: TablaColumn[] = [
  { key: 'estudiante', label: 'Estudiante' },
  { key: 'ultimaConexion', label: 'Última Conexión' },
  { key: 'progreso', label: 'Progreso' },
  { key: 'moduloActual', label: 'Módulo Actual' },
]

type RezagadoData = {
  id: number
  estudiante: string
  correo: string
  ultimaConexion: string
  progreso: number
  moduloActual: string
  estado: 'Rezagado' | 'Al Día'
}

const filasDatos: RezagadoData[] = [
  {
    id: 1,
    estudiante: '[ APELLIDO, NOMBRE 1 ]',
    correo: 'correo1@colegio.edu.pe',
    ultimaConexion: 'Hace 15 días',
    progreso: 12,
    moduloActual: 'Mod 1 - Pendiente',
    estado: 'Rezagado',
  },
  {
    id: 2,
    estudiante: '[ APELLIDO, NOMBRE 2 ]',
    correo: 'correo2@colegio.edu.pe',
    ultimaConexion: 'Hace 7 días',
    progreso: 35,
    moduloActual: 'Mod 2 - Examen Reprobado',
    estado: 'Rezagado',
  },
]

const page = () => {
  const [busqueda, setBusqueda] = useState('')
  const [filtroModulo, setFiltroModulo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [paginaActual, setPaginaActual] = useState(0)
  const [seccionesActivas, setSeccionesActivas] = useState<ProfesorSeccionResponseData[]>([])
  const [seccionActiva, setSeccionActiva] = useState('')
  const [progreso, setProgreso] = useState<ProgresoSeccionResponseData | null>(null)
  const [alumnos, setAlumnos] = useState<AlumnoProgresoData[]>([])
  const [atencionPrioritaria, setAtencionPrioritaria] = useState<AlumnoProgresoData[]>([])
  const [loadingProgreso, setLoadingProgreso] = useState(false)
  const [loadingAtencion, setLoadingAtencion] = useState(false)
  const [errorProgreso, setErrorProgreso] = useState('')
  const [errorAtencion, setErrorAtencion] = useState('')
  const [fechaInicio, setFechaInicio] = useState('2026-03-01')
  const [fechaFin, setFechaFin] = useState(() => {
    const hoy = new Date()
    return hoy.toISOString().slice(0, 10)
  })

  const getToken = (): string => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? ''
  }

  const getProfesorId = (): number | null => {
    if (typeof window === 'undefined') return null
    try {
      const raw = sessionStorage.getItem('usuario') ?? localStorage.getItem('usuario') ?? ''
      const usuario = JSON.parse(raw) as { id?: number }
      return usuario.id ?? null
    } catch {
      return null
    }
  }

  useEffect(() => {
    const cargarSeccionesActivas = async () => {
      const idProfesor = getProfesorId()
      if (idProfesor === null) {
        setSeccionesActivas([])
        return
      }

      try {
        const response = await listarSeccionesProfesorSeccionSolicitud(
          { idProfesor },
          getToken(),
        )
        const datos = response.datos
        if (datos && Array.isArray(datos)) {
          setSeccionesActivas(datos)
        }
      } catch {
        setSeccionesActivas([])
      }
    }

    cargarSeccionesActivas()
  }, [])

  const cargarAtencionPrioritaria = async (idSeccion: number) => {
    setErrorAtencion('')
    setLoadingAtencion(true)

    try {
      const response = await obtenerProgresoNoAvanzanSolicitud(
        idSeccion,
        { dias: 7, minAvance: 50 },
        getToken(),
      )
      const datos = response.datos
      if (Array.isArray(datos)) {
        setAtencionPrioritaria(datos)
      } else {
        setAtencionPrioritaria([])
      }
    } catch (error) {
      setErrorAtencion(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar la atención prioritaria.',
      )
      setAtencionPrioritaria([])
    } finally {
      setLoadingAtencion(false)
    }
  }

  useEffect(() => {
    if (!seccionActiva) {
      setAtencionPrioritaria([])
      return
    }

    const idSeccion = Number(seccionActiva)
    if (Number.isNaN(idSeccion)) {
      setAtencionPrioritaria([])
      return
    }

    cargarAtencionPrioritaria(idSeccion)
  }, [seccionActiva])

  const modulosDisponibles = atencionPrioritaria.length > 0
    ? Array.from(new Set(atencionPrioritaria.map((fila) => `${fila.leccionesCompletadas}/${fila.totalLeccionesObligatorias}`)))
    : Array.from(new Set(filasDatos.map((fila) => fila.moduloActual)))
  const estadosDisponibles = atencionPrioritaria.length > 0
    ? Array.from(new Set(atencionPrioritaria.map((fila) => (fila.porcentaje < 50 ? 'Rezagado' : 'Al Día'))))
    : Array.from(new Set(filasDatos.map((fila) => fila.estado)))
  const promedioPorcentaje = alumnos.length
    ? Number((alumnos.reduce((sum, alumno) => sum + alumno.porcentaje, 0) / alumnos.length).toFixed(1))
    : 0
  const totalRezagados = atencionPrioritaria.length
  const totalAlDia = alumnos.length - totalRezagados
  const barraData = alumnos.map((alumno) => ({
    nombre: `${alumno.apellidos} ${alumno.nombres}`,
    porcentaje: alumno.porcentaje,
  }))
  const estadoData = [
    { name: 'Al Día', value: totalAlDia },
    { name: 'Rezagados', value: totalRezagados },
  ]
  const PIE_COLORS = ['#000000', '#9CA3AF']

  const filasFiltradas = atencionPrioritaria.filter((fila) => {
    const term = busqueda.trim().toLowerCase()
    const nombreCompleto = `${fila.apellidos ?? ''} ${fila.nombres ?? ''}`
    const ultimaActividad = fila.ultimaActividad ?? ''
    const matchesTexto =
      term === '' ||
      nombreCompleto.toLowerCase().includes(term) ||
      ultimaActividad.toLowerCase().includes(term)

    const matchesModulo = filtroModulo === '' || `${fila.leccionesCompletadas}/${fila.totalLeccionesObligatorias}` === filtroModulo
    const matchesEstado = filtroEstado === '' || (fila.porcentaje < 50 ? 'Rezagado' : 'Al Día') === filtroEstado

    return matchesTexto && matchesModulo && matchesEstado
  })

  const totalElementos = progreso ? progreso.alumnos.totalElements : filasFiltradas.length
  const totalPaginas = progreso ? progreso.alumnos.totalPages : Math.max(1, Math.ceil(totalElementos / PAGE_SIZE))
  const inicio = filasFiltradas.length === 0 ? 0 : paginaActual * PAGE_SIZE + 1
  const fin = Math.min((paginaActual + 1) * PAGE_SIZE, filasFiltradas.length)

  const filasPaginadas = filasFiltradas.slice(paginaActual * PAGE_SIZE, paginaActual * PAGE_SIZE + PAGE_SIZE).map((fila) => ({
    id: fila.idAlumno,
    estudiante: (
      <div>
        <p className="font-bold uppercase text-black">[{fila.apellidos} {fila.nombres}]</p>
        <p className="text-xs text-gray-600 font-bold">{fila.ultimaActividad}</p>
      </div>
    ),
    ultimaConexion: <span className="text-gray-700 font-bold">{new Date(fila.ultimaActividad).toLocaleDateString('es-PE')}</span>,
    progreso: (
      <div className="flex items-center gap-2">
        <span className="font-bold text-black min-w-10">{fila.porcentaje}%</span>
        <div className="w-20 bg-gray-200 h-2 border border-black">
          <div className="bg-black h-full" style={{ width: `${fila.porcentaje}%` }}></div>
        </div>
      </div>
    ),
    moduloActual: (
      <span className="font-bold text-gray-700 uppercase">
        {fila.leccionesCompletadas}/{fila.totalLeccionesObligatorias}
      </span>
    ),
  }))

  const paginasVisibles = (() => {
    const total = Math.max(0, totalPaginas)
    const maxVisible = 10
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i)
    }

    const mitad = Math.floor(maxVisible / 2)
    let start = Math.max(0, paginaActual - mitad)
    let end = Math.min(total - 1, start + maxVisible - 1)
    start = Math.max(0, end - maxVisible + 1)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })()

  const cargarProgresoSeccion = async (idSeccion: number, page: number) => {
    setErrorProgreso('')
    setLoadingProgreso(true)

    try {
      const response = await obtenerProgresoSeccionSolicitud(
        idSeccion,
        { page, size: PAGE_SIZE },
        getToken(),
      )

      const datos = response.datos
      if (datos) {
        setProgreso(datos)
        setAlumnos(datos.alumnos.content ?? [])
        setPaginaActual(page)
      } else {
        setProgreso(null)
        setAlumnos([])
      }
    } catch (error) {
      setErrorProgreso(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el progreso de sección.',
      )
      setProgreso(null)
      setAlumnos([])
    } finally {
      setLoadingProgreso(false)
    }
  }

  const handleBuscar = async () => {
    if (!seccionActiva) {
      setErrorProgreso('Seleccione una sección activa.')
      return
    }

    const seccion = seccionesActivas.find(
      (sec) => String(sec.idProfesorSeccion) === seccionActiva,
    )

    if (!seccion) {
      setErrorProgreso('Seleccione una sección válida.')
      return
    }

    await Promise.all([
      cargarProgresoSeccion(Number(seccionActiva), 0),
      cargarAtencionPrioritaria(Number(seccionActiva)),
    ])
  }

  const handlePageClick = async (pageNumber: number) => {
    if (pageNumber !== paginaActual && seccionActiva) {
      await cargarProgresoSeccion(Number(seccionActiva), pageNumber)
    }
  }
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

        <div className="p-8 max-w-7xl mx-auto w-full pb-20">
          <div className="mb-8 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-bold uppercase text-black">Tablero de Avance Grupal</h1>
            <p className="text-gray-700 mt-2 text-sm font-bold uppercase tracking-widest">
              Supervisión de métricas y rendimiento por sección
            </p>
          </div>

          <div className="bg-white border-2 border-black p-6 mb-8 flex flex-col lg:flex-row gap-6 items-end shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <div className="w-full lg:w-1/3">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-widest mb-2">
                Seleccionar Sección Activa
              </label>
              <CampoSelect
                field={{
                  type: 'select',
                  name: 'seccionActiva',
                  label: ' ',
                  options: seccionesActivas.length > 0
                    ? seccionesActivas.map((seccion) => ({
                      label: `${seccion.nombreCurso} / ${seccion.nombreSeccion}`,
                      value: String(seccion.idProfesorSeccion),
                    }))
                    : ['Cargando secciones...'],
                }}
                value={seccionActiva}
                onChange={(_, v) => {
                  setSeccionActiva(v)
                }}
              />
            </div>


            <div className="w-full lg:w-1/4 flex gap-4 items-end">


              <Boton variant="primary" size="md" onClick={handleBuscar}>
                Filtrar
              </Boton>
            </div>
            {errorProgreso && (
              <p className="text-xs font-bold uppercase text-red-600 mt-2">
                {errorProgreso}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <TarjetaEstadistica
              title="Total Alumnos"
              value={progreso ? String(progreso.alumnos.totalElements) : '0'}
              icon="fa-solid fa-users"
            />
            <TarjetaEstadistica
              title="Promedio Grupo"
              value={progreso ? `${promedioPorcentaje}%` : '0%'}
              icon="fa-solid fa-chart-simple"
            />
            <TarjetaEstadistica
              title="Alumnos Rezagados"
              value={progreso ? String(totalRezagados) : '0'}
              icon="fa-solid fa-triangle-exclamation"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
              <h3 className="font-bold text-lg uppercase mb-6 border-b-2 border-dashed border-gray-400 pb-2 text-black">
                Avance Promedio por Módulo
              </h3>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barraData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="nombre" tick={{ fontSize: 12 }} interval={0} angle={-25} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="porcentaje" fill="#000000" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border-2 border-black p-6 flex flex-col shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
              <h3 className="font-bold text-lg uppercase mb-6 border-b-2 border-dashed border-gray-400 pb-2 text-black">
                Estado de la Clase
              </h3>

              <div className="flex-1 flex items-center justify-center gap-8 flex-col sm:flex-row">
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={estadoData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {estadoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      {/* <Legend verticalAlign="bottom" height={36} /> */}
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-black border-2 border-black"></div>
                    <div>
                      <p className="font-bold uppercase text-sm text-black">Al Día</p>
                      <p className="text-xs text-gray-700 font-bold">{totalAlDia} Alumnos</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-[#9CA3AF] border-2 border-black border-dashed"></div>
                    <div>
                      <p className="font-bold uppercase text-sm text-black">Rezagados</p>
                      <p className="text-xs text-gray-700 font-bold">{totalRezagados} Alumnos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end mb-4 gap-4">
            <h2 className="text-xl font-bold uppercase bg-black text-white inline-block px-3 py-1">
              Atención Prioritaria (Rezagados)
            </h2>

          </div>

          <div className="bg-white border-2 border-black p-4 mb-8 flex flex-col lg:flex-row gap-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-gray-900">
            <div className="flex-1">
              <CampoTexto
                field={{
                  type: 'search',
                  name: 'buscarRezagado',
                  label: 'Buscar rezagados',
                  placeholder: 'BUSCAR POR NOMBRE, CORREO O MÓDULO... ',
                  icon: 'fa-solid fa-search',
                }}
                value={busqueda}
                onChange={(_, v) => setBusqueda(v)}
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

          <div className="bg-white border-2 border-black overflow-hidden mb-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <Tabla
              columns={columnas}
              rows={filasPaginadas}
              renderAction={() => (
                <Boton variant="ghost" size="sm">
                  Ver Ficha
                </Boton>
              )}
              className="max-w-none mx-0 space-y-0"
            />

            <div className="p-4 border-t-2 border-black flex items-center justify-between bg-white">
              <span className="text-xs font-bold uppercase text-gray-500">
                {totalElementos > 0
                  ? `Mostrando ${inicio} a ${fin} de ${totalElementos} alumnos`
                  : 'Sin resultados'}
              </span>

              <div className="flex space-x-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handlePageClick(paginaActual - 1)}
                  disabled={paginaActual === 0}
                  className="border-2 border-black px-3 py-1 font-bold uppercase text-sm hover:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                {paginasVisibles.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageClick(p)}
                    className={`border-2 px-3 py-1 font-bold text-sm ${p === paginaActual ? 'bg-black text-white border-black cursor-default' : 'border-black hover:bg-gray-200'}`}
                  >
                    {p + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handlePageClick(paginaActual + 1)}
                  disabled={paginaActual >= totalPaginas - 1}
                  className="border-2 border-black px-3 py-1 font-bold uppercase text-sm hover:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default page