'use client'

import React, { useEffect, useState } from 'react'
import Boton from '../componentes/Boton'
import CampoTexto from '../componentes/CampoTexto'
import CampoSelect from '../componentes/CampoSelect'
import Tabla, { TablaColumn, TablaRow } from '../componentes/Tabla'
import Etiquetas from '../componentes/Etiquetas'
import BarraLateral from '../componentes/BarraLateral'
import {
  CursoDetalleResponseData,
  listarCursosPublicadosSolicitud,
} from '../../lib/api/login/cursos'
import { crearSeccionSolicitud, listarSeccionesSolicitud, SeccionDetalleResponseData } from '../../lib/api/login/secciones'
import {
  ResumenAnioEscolarResponseData,
  obtenerResumenAnioEscolarSolicitud,
} from '../../lib/api/login/ano_escolar'
import {
  listarUsuariosSolicitud,
  UsuarioRolResponseData,
} from '../../lib/api/login/usuarios'

const PAGE_SIZE = 10

const columnas: TablaColumn[] = [
  { key: 'seccion', label: 'Sección' },
  { key: 'anio', label: 'Año Escolar', className: 'text-center' },
  { key: 'curso', label: 'Curso' },
  { key: 'docente', label: 'Docente' },
  { key: 'alumnos', label: 'Alumnos', className: 'text-center' },
  { key: 'estado', label: 'Estado', className: 'text-center' },
]

const page = () => {
  const [secciones, setSecciones] = useState<SeccionDetalleResponseData[]>([])
  const [seccionVincular, setSeccionVincular] = useState('')
  const [seccionesPage, setSeccionesPage] = useState(0)
  const [seccionesTotalPages, setSeccionesTotalPages] = useState(1)
  const [seccionesTotalElements, setSeccionesTotalElements] = useState(0)
  const [loadingSecciones, setLoadingSecciones] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCurso, setFiltroCurso] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busquedaAlumno, setBusquedaAlumno] = useState('')

  const [filtrosAplicados, setFiltrosAplicados] = useState({
    busqueda: '',
    curso: '',
    estado: '',
  })

  const cargarSecciones = async (
    pageNumber = 0,
    filtrosParaUsar?: typeof filtrosAplicados,
  ): Promise<SeccionDetalleResponseData[]> => {
    setLoadingSecciones(true)
    setErrorMessage('')

    try {
      const filtros = filtrosParaUsar ?? filtrosAplicados
      const params: Record<string, any> = { page: pageNumber, size: PAGE_SIZE }
      if (filtros.busqueda) params.busqueda = filtros.busqueda
      if (filtros.curso) params.curso = filtros.curso
      if (filtros.estado === 'ACTIVOS') params.activo = true
      if (filtros.estado === 'INACTIVOS') params.activo = false

      const response = await listarSeccionesSolicitud(params, getToken())

      const datos = response.datos
      if (datos && Array.isArray(datos.content)) {
        setSecciones(datos.content)
        setSeccionesTotalPages(datos.totalPages)
        setSeccionesTotalElements(datos.totalElements)
        setSeccionesPage(datos.number)
      } else {
        setSecciones([])
        setSeccionesTotalPages(1)
        setSeccionesTotalElements(0)
        setSeccionesPage(0)
      }
      return datos?.content ?? []
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar las secciones disponibles.',
      )
      setSecciones([])
      setSeccionesTotalPages(1)
      setSeccionesTotalElements(0)
      setSeccionesPage(0)
      return []
    } finally {
      setLoadingSecciones(false)
    }
  }

  const [cursos, setCursos] = useState<CursoDetalleResponseData[]>([])
  const [nombreGrupo, setNombreGrupo] = useState('')
  const [anioEscolar, setAnioEscolar] = useState('')
  const [cursoSeleccionado, setCursoSeleccionado] = useState('')
  const [aniosEscolares, setAniosEscolares] = useState<ResumenAnioEscolarResponseData[]>([])
  const [loadingCursos, setLoadingCursos] = useState(false)
  const [loadingAniosEscolares, setLoadingAniosEscolares] = useState(false)
  const [creatingSeccion, setCreatingSeccion] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showCrearModal, setShowCrearModal] = useState(false)
  const [showVincularModal, setShowVincularModal] = useState(false)
  const [alumnosVinculados, setAlumnosVinculados] = useState<UsuarioRolResponseData[]>([])
  const [alumnosDisponibles, setAlumnosDisponibles] = useState<UsuarioRolResponseData[]>([])

  const getToken = () => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? ''
  }

  const cargarAlumnosDisponibles = async () => {
    setErrorMessage('')

    try {
      const response = await listarUsuariosSolicitud({ sinSeccion: true, size: 1000 }, getToken())
      const datos = response.datos
      if (datos && Array.isArray(datos.content)) {
        setAlumnosDisponibles(datos.content)
      } else {
        setAlumnosDisponibles([])
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar los alumnos disponibles.',
      )
      setAlumnosDisponibles([])
    }
  }

  const cargarAniosEscolares = async (seccionesCargadas: SeccionDetalleResponseData[]) => {
    const idsUnicos = Array.from(
      new Set(seccionesCargadas.map((seccion) => seccion.idAnioEscolar)),
    )

    if (idsUnicos.length === 0) {
      setAniosEscolares([])
      return
    }

    setLoadingAniosEscolares(true)
    setErrorMessage('')

    try {
      const resumenes = await Promise.all(
        idsUnicos.map(async (idAnio) => {
          const response = await obtenerResumenAnioEscolarSolicitud(idAnio, getToken())
          return response.datos
        }),
      )

      setAniosEscolares(resumenes.filter((resumen): resumen is ResumenAnioEscolarResponseData => !!resumen))
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar los años escolares disponibles.',
      )
      setAniosEscolares([])
    } finally {
      setLoadingAniosEscolares(false)
    }
  }

  useEffect(() => {
    const loadCursos = async () => {
      setLoadingCursos(true)
      setErrorMessage('')

      try {
        const response = await listarCursosPublicadosSolicitud({}, getToken())
        const datos = response.datos
        if (datos && Array.isArray(datos.content)) {
          setCursos(datos.content)
        } else {
          setCursos([])
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar la lista de cursos publicados.',
        )
        setCursos([])
      } finally {
        setLoadingCursos(false)
      }
    }

    const loadInicial = async () => {
      await loadCursos()
      const seccionesCargadas = await cargarSecciones(0)
      await cargarAniosEscolares(seccionesCargadas)
      await cargarAlumnosDisponibles()
    }

    loadInicial()
  }, [])

  const handleBuscar = () => {
    const nuevosFiltros = {
      busqueda: busqueda.trim().toLowerCase(),
      curso: filtroCurso,
      estado: filtroEstado,
    }
    setFiltrosAplicados(nuevosFiltros)
    cargarSecciones(0, nuevosFiltros)
  }

  const filas: TablaRow[] = secciones.map((seccion) => ({
    id: seccion.idSeccion,
    seccion: <span className="font-bold uppercase text-gray-900">{seccion.desNombre}</span>,
    anio: <span className="font-bold text-gray-900">{seccion.valAnio}</span>,
    curso: <span className="text-gray-900">{seccion.desCurso}</span>,
    docente: <span className="text-gray-900">{seccion.desProfesor || 'Sin asignar'}</span>,
    alumnos: <span className="font-bold text-gray-900">-</span>,
    estado: seccion.estActivo
      ? <Etiquetas variant="success">Activa</Etiquetas>
      : <Etiquetas variant="warning">Inactiva</Etiquetas>,
  }))

  const inicio = seccionesTotalElements === 0 ? 0 : seccionesPage * PAGE_SIZE + 1
  const fin = Math.min((seccionesPage + 1) * PAGE_SIZE, seccionesTotalElements)

  const paginasVisibles = (() => {
    const total = Math.max(0, seccionesTotalPages)
    const maxVisible = 10

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i)
    }

    const mitad = Math.floor(maxVisible / 2)
    let start = Math.max(0, seccionesPage - mitad)
    let end = Math.min(total - 1, start + maxVisible - 1)
    start = Math.max(0, end - maxVisible + 1)

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })()

  const handlePageClick = (pageNumber: number) => {
    if (pageNumber !== seccionesPage) {
      cargarSecciones(pageNumber)
    }
  }

  const openCrearModal = () => {
    setErrorMessage('')
    setStatusMessage('')
    setShowCrearModal(true)
  }

  const closeCrearModal = () => {
    setShowCrearModal(false)
  }

  const openVincularModal = (seccionId: number) => {
    setErrorMessage('')
    setStatusMessage('')
    setSeccionVincular(String(seccionId))
    setShowVincularModal(true)
  }

  const closeVincularModal = () => {
    setShowVincularModal(false)
  }

  const handleCreateSection = async () => {
    setStatusMessage('')
    setErrorMessage('')

    if (!nombreGrupo.trim() || !anioEscolar.trim() || !cursoSeleccionado) {
      setErrorMessage('Complete todos los campos antes de crear la sección.')
      return
    }

    setCreatingSeccion(true)

    try {
      const result = await crearSeccionSolicitud(
        {
          idCurso: Number(cursoSeleccionado),
          idAnioEscolar: Number(anioEscolar),
          desNombre: nombreGrupo.trim(),
        },
        getToken(),
      )

      if (result.exito) {
        setStatusMessage('Sección creada correctamente.')
        setNombreGrupo('')
        setAnioEscolar('')
        setCursoSeleccionado('')
        setShowCrearModal(false)
        cargarSecciones(0)
      } else {
        setErrorMessage(result.mensaje || 'No se pudo crear la sección.')
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al crear la sección.',
      )
    } finally {
      setCreatingSeccion(false)
    }
  }

  const handleVincularAlumno = (idUsuario: number) => {
    const alumno = alumnosDisponibles.find((alumno) => alumno.idUsuario === idUsuario)
    if (!alumno) return

    setAlumnosDisponibles((prev) => prev.filter((item) => item.idUsuario !== idUsuario))
    setAlumnosVinculados((prev) => [...prev, alumno])
  }

  const handleDesvincularAlumno = (idUsuario: number) => {
    const alumno = alumnosVinculados.find((alumno) => alumno.idUsuario === idUsuario)
    if (!alumno) return

    setAlumnosVinculados((prev) => prev.filter((item) => item.idUsuario !== idUsuario))
    setAlumnosDisponibles((prev) => [...prev, alumno])
  }

  const alumnosVinculadosFiltrados = alumnosVinculados.filter((a) =>
    a.nombres.toLowerCase().includes(busquedaAlumno.toLowerCase()) ||
    a.apellidos.toLowerCase().includes(busquedaAlumno.toLowerCase()) ||
    a.correo.toLowerCase().includes(busquedaAlumno.toLowerCase()),
  )

  const alumnosDisponiblesFiltrados = alumnosDisponibles.filter((a) =>
    a.nombres.toLowerCase().includes(busquedaAlumno.toLowerCase()) ||
    a.apellidos.toLowerCase().includes(busquedaAlumno.toLowerCase()) ||
    a.correo.toLowerCase().includes(busquedaAlumno.toLowerCase()),
  )

  return (
    <>
      <BarraLateral />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-50 text-gray-900">
        <header className="md:hidden bg-white border-b-2 border-black p-4 flex justify-between items-center">
          <span className="font-bold uppercase text-gray-900">[ LOGO ]</span>
          <button className="text-black cursor-pointer">
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full pb-20">
          <div className="text-xs font-bold uppercase text-gray-700 mb-6 tracking-widest">
            <a href="#" className="hover:text-black hover:underline cursor-pointer">
              Académico
            </a>
            <i className="fa-solid fa-angle-right mx-2 text-black"></i>
            <span className="text-black border-b-2 border-black">Gestión Secciones</span>
          </div>

          <div className="mb-8 border-b-4 border-black pb-4">
            <h1 className="text-3xl font-bold uppercase text-gray-900">Gestión de Secciones</h1>
            <p className="text-gray-700 font-bold uppercase mt-2 text-sm tracking-widest">
              Crear grupos y vincular alumnos a un año escolar
            </p>
          </div>

          <div className="flex justify-between items-end mb-4 gap-4">
            <h2 className="text-xl font-bold uppercase bg-black text-white inline-block px-3 py-1">
              Secciones Disponibles
            </h2>

            <Boton
              variant="primary"
              onClick={openCrearModal}
              title="Crear nueva sección"
              type="button"
              size="md"
              icon={<span className="text-sm">＋</span>}
            >
              Crear nueva sección
            </Boton>
          </div>

          <div className="mb-8 bg-white border-2 border-black p-4 flex flex-col lg:flex-row gap-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-gray-900">
            <div className="flex-1">
              <CampoTexto
                field={{
                  type: 'search',
                  name: 'buscarSeccion',
                  label: 'Buscar sección',
                  placeholder: 'BUSCAR POR NOMBRE O CURSO...',
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
                  name: 'curso',
                  label: 'Curso',
                  options: cursos.map((curso) => ({
                    label: curso.desNombre,
                    value: String(curso.idCurso),
                  })),
                }}
                value={filtroCurso}
                onChange={(_, v) => setFiltroCurso(v)}
              />
            </div>

            <div className="w-full lg:w-48">
              <CampoSelect
                field={{
                  type: 'select',
                  name: 'estado',
                  label: 'Estado',
                  options: ['ACTIVOS', 'INACTIVOS'],
                }}
                value={filtroEstado}
                onChange={(_, v) => setFiltroEstado(v)}
              />
            </div>

            <div className="flex items-end gap-4">
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

          <div className="bg-white border-2 border-black overflow-x-auto shadow-[8px_8px_0_0_rgba(0,0,0,1)] mb-4 text-gray-900">
            {loadingSecciones ? (
              <div className="p-12 text-center">
                <p className="text-xs font-bold uppercase text-gray-500">Cargando secciones...</p>
              </div>
            ) : (
              <Tabla
                columns={columnas}
                rows={filas}
                renderAction={(row) => {
                  const seccionId = Number(row.id)
                  return (
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => openVincularModal(seccionId)}
                        title="Vincular alumnos"
                        className="min-w-13 h-8 px-2 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors text-[10px] font-bold uppercase cursor-pointer text-gray-900"
                      >
                        Vinc
                      </button>

                    </div>
                  )
                }}
                className="max-w-none mx-0 space-y-0"
              />
            )}

            <div className="p-4 border-t-2 border-black flex items-center justify-between bg-white">
              <span className="text-xs font-bold uppercase text-gray-500">
                {seccionesTotalElements > 0
                  ? `Mostrando ${inicio} a ${fin} de ${seccionesTotalElements} secciones`
                  : 'Sin resultados'}
              </span>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => cargarSecciones(seccionesPage - 1)}
                  disabled={seccionesPage === 0 || loadingSecciones}
                  className="border-2 border-black px-3 py-1 font-bold uppercase text-sm hover:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                {paginasVisibles.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageClick(p)}
                    disabled={loadingSecciones}
                    className={`border-2 px-3 py-1 font-bold text-sm ${p === seccionesPage ? 'bg-black text-white border-black cursor-default' : 'border-black hover:bg-gray-200'}`}
                  >
                    {p + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => cargarSecciones(seccionesPage + 1)}
                  disabled={seccionesPage >= seccionesTotalPages - 1 || loadingSecciones}
                  className="border-2 border-black px-3 py-1 font-bold uppercase text-sm hover:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>

          {showCrearModal ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <div className="relative w-full max-w-3xl bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-6">
                <button
                  type="button"
                  onClick={closeCrearModal}
                  className="absolute right-4 top-4 text-black border-2 border-black rounded-full w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white"
                >
                  ×
                </button>

                <div className="absolute -top-4 -left-4 bg-black text-white px-4 py-1 text-xs font-bold uppercase border-2 border-black">
                  Crear Nueva Sección
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <CampoTexto
                    field={{
                      type: 'text',
                      name: 'nombreGrupo',
                      label: 'Nombre del Grupo',
                      placeholder: 'Ej: Taller de Programación - A',
                    }}
                    value={nombreGrupo}
                    onChange={(_, value) => setNombreGrupo(value)}
                  />

                  <CampoSelect
                    field={{
                      type: 'select',
                      name: 'anioEscolar',
                      label: 'Año Escolar',
                      options: aniosEscolares.map((anio) => ({
                        label: `${anio.valAnio} - ${anio.desDescripcion}`,
                        value: String(anio.idAnioEscolar),
                      })),
                    }}
                    value={anioEscolar}
                    onChange={(_, value) => setAnioEscolar(value)}
                  />

                  <CampoSelect
                    field={{
                      type: 'select',
                      name: 'curso',
                      label: 'Curso',
                      options: cursos.map((curso) => ({
                        label: curso.desNombre,
                        value: String(curso.idCurso),
                      })),
                    }}
                    value={cursoSeleccionado}
                    onChange={(_, value) => setCursoSeleccionado(value)}
                  />
                </div>

                {loadingCursos ? (
                  <div className="mt-4 text-sm text-gray-600">Cargando cursos publicados...</div>
                ) : null}

                {statusMessage ? (
                  <div className="mt-4 rounded border border-green-600 bg-green-50 px-4 py-3 text-sm text-green-800">
                    {statusMessage}
                  </div>
                ) : null}

                {errorMessage ? (
                  <div className="mt-4 rounded border border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeCrearModal}
                    className="border-2 border-black px-4 py-2 font-bold uppercase text-sm hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <Boton
                    type="button"
                    variant="primary"
                    size="md"
                    icon={<span className="text-sm">＋</span>}
                    onClick={handleCreateSection}
                    disabled={creatingSeccion}
                  >
                    {creatingSeccion ? 'Creando sección...' : 'Crear Nueva Sección'}
                  </Boton>
                </div>
              </div>
            </div>
          ) : null}

          {showVincularModal ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <div className="relative w-full max-w-5xl bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-6 text-gray-900">
                <button
                  type="button"
                  onClick={closeVincularModal}
                  className="absolute right-4 top-4 text-black border-2 border-black rounded-full w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white"
                >
                  ×
                </button>

                <div className="absolute -top-4 -left-4 bg-black text-white px-4 py-1 text-xs font-bold uppercase border-2 border-black">
                  Vincular Alumnos
                </div>

                <p className="text-sm uppercase font-bold text-gray-700 mb-4">
                  Sección: {secciones.find((s) => String(s.idSeccion) === seccionVincular)?.desNombre ?? 'Sin sección seleccionada'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <CampoSelect
                    field={{
                      type: 'select',
                      name: 'seccionVincular',
                      label: 'Seleccionar Sección',
                      options: secciones.map((seccion) => ({
                        value: String(seccion.idSeccion),
                        label: seccion.desNombre,
                      })),
                    }}
                    value={seccionVincular}
                    onChange={(_, value) => setSeccionVincular(value)}
                  />

                  <CampoTexto
                    field={{
                      type: 'search',
                      name: 'buscarAlumno',
                      label: 'Buscar Alumno',
                      placeholder: 'BUSCAR ALUMNO...',
                      icon: 'fa-solid fa-search',
                    }}
                    value={busquedaAlumno}
                    onChange={(_, value) => setBusquedaAlumno(value)}
                  />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 border-2 border-black p-4 text-gray-900">
                    <p className="text-xs font-bold uppercase text-gray-700 mb-2">
                      Alumnos Vinculados a la Sección
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {alumnosVinculadosFiltrados.length > 0 ? (
                        alumnosVinculadosFiltrados.map((alumno) => (
                          <div key={alumno.idUsuario} className="border-2 border-black bg-white px-4 py-3 text-sm text-gray-900 flex justify-between items-center group">
                            <span className="font-bold uppercase">{alumno.apellidos}, {alumno.nombres} <span className="font-normal text-xs normal-case block text-gray-500">{alumno.correo}</span></span>
                            <button
                              type="button"
                              onClick={() => handleDesvincularAlumno(alumno.idUsuario)}
                              className="text-black hover:text-white hover:bg-red-500 w-8 h-8 flex items-center justify-center border-2 border-black transition-colors"
                              title="Desvincular"
                            >
                              <i className="fa-solid fa-minus"></i>
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">No se encontraron alumnos vinculados.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 border-2 border-black p-4 text-gray-900">
                    <p className="text-xs font-bold uppercase text-gray-700 mb-2">
                      Alumnos Disponibles
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {alumnosDisponiblesFiltrados.length > 0 ? (
                        alumnosDisponiblesFiltrados.map((alumno) => (
                          <div key={alumno.idUsuario} className="border-2 border-black bg-white px-4 py-3 text-sm text-gray-900 flex justify-between items-center group">
                            <span className="font-bold uppercase">{alumno.apellidos}, {alumno.nombres} <span className="font-normal text-xs normal-case block text-gray-500">{alumno.correo}</span></span>
                            <button
                              type="button"
                              onClick={() => handleVincularAlumno(alumno.idUsuario)}
                              className="text-black hover:text-white hover:bg-black w-8 h-8 flex items-center justify-center border-2 border-black transition-colors"
                              title="Vincular"
                            >
                              <i className="fa-solid fa-plus"></i>
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">No se encontraron alumnos disponibles.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center border-t-4 border-black pt-6">
                  <button
                    type="button"
                    onClick={closeVincularModal}
                    className="border-2 border-black px-4 py-2 font-bold uppercase text-sm hover:bg-gray-200"
                  >
                    Cerrar
                  </button>
                  <Boton
                    type="button"
                    variant="primary"
                    size="md"
                    icon={<span className="text-sm">＋</span>}
                    onClick={closeVincularModal}
                  >
                    Guardar Cambios
                  </Boton>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </>
  )
}

export default page