"use client"

import React, { useEffect, useState } from 'react'
import Boton from '../componentes/Boton'
import CampoSelect from '../componentes/CampoSelect'
import { CampoFormularioField } from '../componentes/CampoFormulario.types'
import CampoTexto from '../componentes/CampoTexto'
import Tabla, { TablaColumn, TablaRow } from '../componentes/Tabla'
import BarraLateral from '../componentes/BarraLateral'
import {
  listarSeccionesProfesorSeccionSolicitud,
  listarAlumnosSeccionSolicitud,
  ProfesorSeccionResponseData,
  AlumnoSeccionResponseData,
} from '../../lib/api/login/secciones'
import {
  obtenerReporteGrupalExcel,
  obtenerReporteGrupalPdf,
  obtenerReporteIndividualExcel,
  obtenerReporteIndividualPdf,
} from '../../lib/api/login/reportes'

const PAGE_SIZE = 10

type ReporteRecienteData = {
  id: number
  fecha: string
  tipoFiltro: string
  usuario: string
}

const columnas: TablaColumn[] = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'tipoFiltro', label: 'Tipo / Filtro' },
  { key: 'usuario', label: 'Usuario' },
]

const filasDatos: ReporteRecienteData[] = [
  {
    id: 1,
    fecha: '13/04/2026',
    tipoFiltro: 'Grupal - Secc. 4to "A"',
    usuario: 'Prof. [Nombre]',
  },
  {
    id: 2,
    fecha: '12/04/2026',
    tipoFiltro: 'Individual - Alumno [X]',
    usuario: 'Admin [Juan J.]',
  },
]

const page = () => {
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [filtroSeccion, setFiltroSeccion] = useState('')
  const [filtroAlumno, setFiltroAlumno] = useState('')
  const [paginaActual, setPaginaActual] = useState(0)
  const [secciones, setSecciones] = useState<ProfesorSeccionResponseData[]>([])
  const [alumnos, setAlumnos] = useState<AlumnoSeccionResponseData[]>([])
  const [loadingSecciones, setLoadingSecciones] = useState(false)
  const [loadingAlumnos, setLoadingAlumnos] = useState(false)
  const [seccionesError, setSeccionesError] = useState('')
  const [alumnosError, setAlumnosError] = useState('')

  const tiposDisponibles = Array.from(new Set(filasDatos.map((fila) => fila.tipoFiltro)))
  const usuariosDisponibles = Array.from(new Set(filasDatos.map((fila) => fila.usuario)))
  const seccionSeleccionada = secciones.find((sec) => String(sec.idSeccion) === filtroSeccion)

  const seccionOptions = loadingSecciones
    ? ['Cargando...']
    : secciones.map((seccion) => ({
        label: `${seccion.nombreSeccion} - ${seccion.valAnio}`,
        value: String(seccion.idSeccion),
      }))

  const alumnoOptions = loadingAlumnos
    ? ['Cargando...']
    : alumnos.map((alumno) => ({
        label: `${alumno.desApellidos}, ${alumno.desNombres}`,
        value: String(alumno.idUsuario),
      }))

  const alumnoField: CampoFormularioField = {
    type: 'select',
    name: 'alumnoEspecifico',
    label: 'Alumno Específico (Opcional)',
    disabled: !filtroSeccion || loadingAlumnos,
    options: alumnoOptions,
  }

  const filasFiltradas = filasDatos.filter((fila) => {
    const term = busqueda.trim().toLowerCase()
    const matchesTexto =
      term === '' ||
      fila.fecha.toLowerCase().includes(term) ||
      fila.tipoFiltro.toLowerCase().includes(term) ||
      fila.usuario.toLowerCase().includes(term)

    const matchesTipo = filtroTipo === '' || fila.tipoFiltro === filtroTipo
    const matchesUsuario = filtroUsuario === '' || fila.usuario === filtroUsuario
    const matchesSeccion =
      filtroSeccion === '' ||
      (seccionSeleccionada ? fila.tipoFiltro.includes(seccionSeleccionada.nombreSeccion) : true)

    return matchesTexto && matchesTipo && matchesUsuario && matchesSeccion
  })

  const totalElementos = filasFiltradas.length
  const totalPaginas = Math.max(1, Math.ceil(totalElementos / PAGE_SIZE))
  const inicio = totalElementos === 0 ? 0 : paginaActual * PAGE_SIZE + 1
  const fin = Math.min((paginaActual + 1) * PAGE_SIZE, totalElementos)

  const filasPaginadas = filasFiltradas
    .slice(paginaActual * PAGE_SIZE, paginaActual * PAGE_SIZE + PAGE_SIZE)
    .map((fila) => ({
      ...fila,
      fecha: <span className="font-bold italic text-black">{fila.fecha}</span>,
      tipoFiltro: <span className="font-bold uppercase text-black">{fila.tipoFiltro}</span>,
      usuario: <span className="font-bold uppercase text-black">{fila.usuario}</span>,
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

  const getToken = () => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? ''
  }

  const cargarSecciones = async () => {
    setLoadingSecciones(true)
    setSeccionesError('')

    try {
      const response = await listarSeccionesProfesorSeccionSolicitud({}, getToken())
      setSecciones(response.datos ?? [])
    } catch (error) {
      setSeccionesError(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar las secciones disponibles.',
      )
      setSecciones([])
    } finally {
      setLoadingSecciones(false)
    }
  }

  const cargarAlumnos = async (idSeccion: number) => {
    setLoadingAlumnos(true)
    setAlumnosError('')

    try {
      const response = await listarAlumnosSeccionSolicitud(idSeccion, getToken())
      setAlumnos(response.datos ?? [])
    } catch (error) {
      setAlumnosError(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar los alumnos de la sección.',
      )
      setAlumnos([])
    } finally {
      setLoadingAlumnos(false)
    }
  }

  useEffect(() => {
    if (filtroSeccion) {
      setFiltroAlumno('')
      cargarAlumnos(Number(filtroSeccion))
    } else {
      setAlumnos([])
      setFiltroAlumno('')
      setAlumnosError('')
    }
  }, [filtroSeccion])

  const descargarBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const handleDownloadReporte = async (formato: 'pdf' | 'excel') => {
    if (!filtroSeccion) {
      alert('Seleccione primero una sección.')
      return
    }

    try {
      const idSeccion = Number(filtroSeccion)
      const filenameBase = filtroAlumno
        ? `reporte-individual-alumno-${filtroAlumno}-curso-${seccionSeleccionada?.idCurso ?? '0'}`
        : `reporte-grupal-seccion-${idSeccion}`
      const extension = formato === 'pdf' ? 'pdf' : 'xlsx'
      let blob: Blob

      if (filtroAlumno) {
        const idAlumno = Number(filtroAlumno)
        if (formato === 'pdf') {
          blob = await obtenerReporteIndividualPdf(idAlumno, seccionSeleccionada?.idCurso ?? 0, getToken())
        } else {
          blob = await obtenerReporteIndividualExcel(idAlumno, seccionSeleccionada?.idCurso ?? 0, getToken())
        }
      } else {
        if (formato === 'pdf') {
          blob = await obtenerReporteGrupalPdf(idSeccion, getToken())
        } else {
          blob = await obtenerReporteGrupalExcel(idSeccion, getToken())
        }
      }

      descargarBlob(blob, `${filenameBase}.${extension}`)
    } catch (error) {
      console.error('Error al descargar el reporte:', error)
      alert(
        `No se pudo descargar el reporte.${
          error instanceof Error ? ` ${error.message}` : ''
        }`,
      )
    }
  }

  useEffect(() => {
    cargarSecciones()
  }, [])

  const handleBuscar = () => {
    setPaginaActual(0)
  }

  const handlePageClick = (pagina: number) => {
    if (pagina !== paginaActual) {
      setPaginaActual(pagina)
    }
  }

  return (
    <>
      <BarraLateral />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-50">
        <div className="p-8 max-w-5xl mx-auto w-full pb-20">
          <div className="mb-10 border-b-4 border-black pb-6">
            <h1 className="text-3xl font-bold uppercase text-black">
              Generador de Reportes Académicos
            </h1>
            <p className="text-gray-700 font-bold uppercase mt-2 text-sm tracking-widest">
              Exportación de datos para informes y seguimiento académico
            </p>
          </div>

          <div className="bg-white border-2 border-black p-8 mb-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <h2 className="text-xl font-bold uppercase mb-6 bg-black text-white inline-block px-3 py-1">
              1. Configurar Filtros
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold uppercase mb-2 tracking-widest text-gray-800">
                  Sección
                </label>
                <CampoSelect
                  field={{
                    type: 'select',
                    name: 'seccionGrupo',
                    label: 'Sección / Grupo',
                    options: seccionOptions,
                  }}
                  value={filtroSeccion}
                  onChange={(_: string, value: string) => setFiltroSeccion(value)}
                />
                {seccionesError && (
                  <p className="text-xs text-red-600 font-bold uppercase mt-2">
                    {seccionesError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2 tracking-widest text-gray-800">
                  Alumno Específico (Opcional)
                </label>
                <CampoSelect
                  field={alumnoField}
                  value={filtroAlumno}
                  onChange={(_: string, value: string) => setFiltroAlumno(value)}
                />
                {alumnosError && (
                  <p className="text-xs text-red-600 font-bold uppercase mt-2">
                    {alumnosError}
                  </p>
                )}
              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border-2 border-black p-8 text-center flex flex-col items-center hover:bg-gray-50 transition-colors shadow-[8px_8px_0_0_rgba(0,0,0,0.1)]">
              <div className="w-16 h-16 border-2 border-black mb-4 flex items-center justify-center text-3xl text-black">
                <i className="fa-solid fa-file-pdf"></i>
              </div>

              <h3 className="font-bold text-lg uppercase mb-2 text-black">Exportar como PDF</h3>
              <p className="text-xs text-gray-600 uppercase mb-6 font-bold leading-relaxed">
                Ideal para informes impresos y evidencias oficiales.
              </p>

              <Boton
                variant="wire"
                size="md"
                fullWidth
                onClick={() => handleDownloadReporte('pdf')}
                disabled={!filtroSeccion}
              >
                Descargar .PDF
              </Boton>
            </div>

            <div className="bg-white border-2 border-black p-8 text-center flex flex-col items-center hover:bg-gray-50 transition-colors shadow-[8px_8px_0_0_rgba(0,0,0,0.1)]">
              <div className="w-16 h-16 border-2 border-black mb-4 flex items-center justify-center text-3xl text-black">
                <i className="fa-solid fa-file-excel"></i>
              </div>

              <h3 className="font-bold text-lg uppercase mb-2 text-black">Exportar como Excel</h3>
              <p className="text-xs text-gray-600 uppercase mb-6 font-bold leading-relaxed">
                Ideal para análisis estadístico y manipulación de datos.
              </p>

              <Boton
                variant="wire"
                size="md"
                fullWidth
                onClick={() => handleDownloadReporte('excel')}
                disabled={!filtroSeccion}
              >
                Descargar .XLSX
              </Boton>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}

export default page