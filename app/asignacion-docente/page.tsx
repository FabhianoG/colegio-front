"use client"

import React, { useEffect, useMemo, useState } from 'react'
import Boton from '../componentes/Boton'
import CampoTexto from '../componentes/CampoTexto'
import CampoCheckbox from '../componentes/CampoCheckbox'
import CampoSelect from '../componentes/CampoSelect'
import Tabla, { TablaColumn, TablaRow } from '../componentes/Tabla'
import Etiquetas from '../componentes/Etiquetas'
import BarraLateral from '../componentes/BarraLateral'
import {
  listarProfesoresSeccionSolicitud,
  ProfesorSeccionData,
} from '../../lib/api/login/profesores'
import {
  listarUsuariosSolicitud,
  UsuarioRolResponseData,
} from '../../lib/api/login/usuarios'
import {
  listarSeccionesSinProfesorSolicitud,
  asignarProfesorSeccionesSolicitud,
  removerProfesorSeccionSolicitud,
  SeccionDetalleResponseData,
} from '../../lib/api/login/secciones'

const PAGE_SIZE = 10

const columnasAsignaciones: TablaColumn[] = [
  { key: 'docente', label: 'Docente Titular' },
  { key: 'curso', label: 'Curso / Sección Asignada' },
  { key: 'fecha', label: 'Fecha Vinculación', className: 'text-center' },
]

type AsignacionData = ProfesorSeccionData

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? ''
}

export default function Page() {
  const [busqueda, setBusqueda] = useState('')
  const [filtroDocente, setFiltroDocente] = useState('')
  const [filtroCurso, setFiltroCurso] = useState('')
  const [paginaActual, setPaginaActual] = useState(0)
  const [asignaciones, setAsignaciones] = useState<AsignacionData[]>([])
  const [loadingAsignaciones, setLoadingAsignaciones] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [docentes, setDocentes] = useState<UsuarioRolResponseData[]>([])
  const [loadingDocentes, setLoadingDocentes] = useState(false)
  const [docenteError, setDocenteError] = useState('')
  const [seccionesDisponibles, setSeccionesDisponibles] = useState<SeccionDetalleResponseData[]>([])
  const [loadingSeccionesDisponibles, setLoadingSeccionesDisponibles] = useState(false)
  const [seccionesDisponiblesError, setSeccionesDisponiblesError] = useState('')

  // 1. ESTADOS
  const [docenteBusqueda, setDocenteBusqueda] = useState('')
  const [selectedDocenteId, setSelectedDocenteId] = useState<number | null>(null)
  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState<string[]>([])

  // Mock de datos (Esto vendría de tu API / backend)

  // 2. LÓGICA DE FILTRADO (Live Search más eficiente que presionar un botón)
  const docentesFiltrados = useMemo(() => {
    if (!docenteBusqueda) return [];
    return docentes.filter((d) =>
      `${d.nombres} ${d.apellidos}`.toLowerCase().includes(docenteBusqueda.toLowerCase())
    );
  }, [docenteBusqueda, docentes]);

  // 3. HANDLERS
  const toggleSeccion = (idSeccion: string) => {
    setSeccionesSeleccionadas((prev) =>
      prev.includes(idSeccion)
        ? prev.filter((id) => id !== idSeccion)
        : [...prev, idSeccion]
    )
  }

  const docenteSeleccionadoObj = docentes.find(d => d.idUsuario === selectedDocenteId);


  const cursosDisponibles = Array.from(new Set(asignaciones.map((fila) => fila.nombreCurso))).map((curso) => ({
    label: curso,
    value: curso,
  }))
  const docentesDisponibles = Array.from(
    new Set(asignaciones.map((fila) => `${fila.apellidosProfesor} ${fila.nombresProfesor}`)),
  ).map((docente) => ({
    label: docente,
    value: docente,
  }))

  const filasFiltradas = asignaciones.filter((fila) => {
    const term = busqueda.trim().toLowerCase()
    const nombreDocente = `${fila.apellidosProfesor} ${fila.nombresProfesor}`
    const cursoNombre = fila.nombreCurso
    const matchesTexto =
      term === '' ||
      nombreDocente.toLowerCase().includes(term) ||
      cursoNombre.toLowerCase().includes(term)

    const matchesDocente = filtroDocente === '' || nombreDocente === filtroDocente
    const matchesCurso = filtroCurso === '' || cursoNombre === filtroCurso

    return matchesTexto && matchesDocente && matchesCurso
  })

  const totalElementos = filasFiltradas.length
  const totalPaginas = Math.max(1, Math.ceil(totalElementos / PAGE_SIZE))
  const inicio = totalElementos === 0 ? 0 : paginaActual * PAGE_SIZE + 1
  const fin = Math.min((paginaActual + 1) * PAGE_SIZE, totalElementos)

  const filasPaginadas = filasFiltradas
    .slice(paginaActual * PAGE_SIZE, paginaActual * PAGE_SIZE + PAGE_SIZE)
    .map((fila) => ({
      id: fila.idProfesorSeccion,
      idSeccion: fila.idSeccion,
      docente: (
        <span className="font-bold uppercase text-gray-900">
          [{fila.apellidosProfesor} {fila.nombresProfesor}]
        </span>
      ),
      curso: (
        <Etiquetas variant="outline">
          {fila.nombreCurso} / {fila.nombreSeccion}
        </Etiquetas>
      ),
      fecha: (
        <span className="text-xs font-bold text-gray-700 uppercase">
          {new Date(fila.fecAsignacion).toLocaleDateString('es-PE')}
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

  const handleBuscar = () => {
    setPaginaActual(0)
  }

  const cargarDocentes = async (busqueda = '') => {
    setLoadingDocentes(true)
    setDocenteError('')

    try {
      const response = await listarUsuariosSolicitud(
        { rol: 'ROL_PROFESOR', busqueda: busqueda.trim().toLowerCase(), size: 1000 },
        getToken(),
      )

      const datos = response.datos
      if (datos && Array.isArray(datos.content)) {
        setDocentes(datos.content)
      } else {
        setDocentes([])
      }
    } catch (error) {
      setDocenteError(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar los docentes.',
      )
      setDocentes([])
    } finally {
      setLoadingDocentes(false)
    }
  }

  const cargarSeccionesDisponibles = async () => {
    setLoadingSeccionesDisponibles(true)
    setSeccionesDisponiblesError('')

    try {
      const response = await listarSeccionesSinProfesorSolicitud(getToken())
      setSeccionesDisponibles(response.datos ?? [])
    } catch (error) {
      setSeccionesDisponiblesError(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar las secciones disponibles.',
      )
      setSeccionesDisponibles([])
    } finally {
      setLoadingSeccionesDisponibles(false)
    }
  }

  const cargarAsignaciones = async () => {
    setLoadingAsignaciones(true)
    setFetchError('')

    try {
      const response = await listarProfesoresSeccionSolicitud({}, getToken())
      setAsignaciones(response.datos ?? [])
    } catch (error) {
      setFetchError(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar las asignaciones activas.',
      )
      setAsignaciones([])
    } finally {
      setLoadingAsignaciones(false)
    }
  }

  useEffect(() => {
    cargarAsignaciones()
    cargarDocentes()
    cargarSeccionesDisponibles()
  }, [])

  const handlePageClick = (pagina: number) => {
    if (pagina !== paginaActual) {
      setPaginaActual(pagina)
    }
  }

  const handleRemoverProfesor = async (idSeccion: number) => {
    setLoadingAsignaciones(true)
    setFetchError('')

    try {
      await removerProfesorSeccionSolicitud(idSeccion, getToken())
      await cargarAsignaciones()
      await cargarSeccionesDisponibles()
    } catch (error) {
      setFetchError(
        error instanceof Error
          ? error.message
          : 'No se pudo remover el profesor de la sección.',
      )
    } finally {
      setLoadingAsignaciones(false)
    }
  }

  const handleConfirmarAsignacion = async () => {
    if (!selectedDocenteId || seccionesSeleccionadas.length === 0) return

    setLoadingAsignaciones(true)
    setFetchError('')

    try {
      await asignarProfesorSeccionesSolicitud(
        selectedDocenteId,
        {
          idsSeccion: seccionesSeleccionadas.map((id) => Number(id)),
        },
        getToken(),
      )

      setSeccionesSeleccionadas([])
      await cargarAsignaciones()
      await cargarSeccionesDisponibles()
    } catch (error) {
      setFetchError(
        error instanceof Error
          ? error.message
          : 'No se pudo asignar el profesor a las secciones.',
      )
    } finally {
      setLoadingAsignaciones(false)
    }
  }

  return (
    <>
      <BarraLateral />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-50 text-gray-900">
        <header className="md:hidden bg-white border-b-2 border-black p-4 flex justify-between items-center">
          <span className="font-bold uppercase text-gray-900">[ LOGO ]</span>
          <button className="text-black cursor-pointer hover:text-gray-600 transition-all">
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full pb-20">
          <div className="text-xs font-bold uppercase text-gray-700 mb-6 tracking-widest">
            <a href="#" className="hover:text-black hover:underline cursor-pointer">
              Académico
            </a>
            <i className="fa-solid fa-angle-right mx-2 text-black"></i>
            <span className="text-black border-b-2 border-black">Asignación Docente</span>
          </div>

          <div className="mb-8 border-b-4 border-black pb-4">
            <h1 className="text-3xl font-bold uppercase text-gray-900">Vinculación Académica</h1>
            <p className="text-gray-700 font-bold uppercase mt-2 text-sm tracking-widest">
              Asignar profesores a cursos y secciones
            </p>
          </div>

          <div className="bg-white border-4 border-black p-6 md:p-8 mb-12 shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative text-gray-900 max-w-5xl mx-auto">
            <div className="absolute -top-4 -left-4 bg-black text-white px-4 py-1 text-xs font-bold uppercase border-2 border-black z-10">
              Nueva Asignación Masiva
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4">
              {/* ==========================================
            PASO 1: SELECCIONAR DOCENTE
        ========================================== */}
              <div>
                <h2 className="text-lg font-bold uppercase mb-4 border-b-2 border-dashed border-gray-400 inline-block pb-1 text-gray-900">
                  1. Seleccionar Docente
                </h2>

                {/* Si ya hay un docente seleccionado, mostramos su tarjeta directamente */}
                {selectedDocenteId ? (
                  <div className="bg-gray-100 border-2 border-black p-4 text-gray-900 relative">
                    <button
                      onClick={() => setSelectedDocenteId(null)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold"
                      title="Cambiar docente"
                    >
                      <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center text-xl">
                        <i className="fa-solid fa-chalkboard-user"></i>
                      </div>
                      <div>
                        <p className="font-bold uppercase tracking-widest text-sm text-gray-900">
                          Docente asignado
                        </p>
                        <p className="text-xs font-bold text-gray-700 uppercase">
                          {docenteSeleccionadoObj?.apellidos ?? ''} {docenteSeleccionadoObj?.nombres ?? ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Si no hay docente, mostramos el buscador interactivo */
                  <div className="mb-6 flex flex-col gap-2">
                    <CampoTexto
                      field={{
                        type: 'search',
                        name: 'buscarProfesor',
                        label: 'Buscar docente',
                        placeholder: 'Ej. Mendoza...',
                        icon: 'fa-solid fa-search',
                      }}
                      value={docenteBusqueda}
                      onChange={(_, value) => setDocenteBusqueda(value)}
                    />

                    {/* Lista dinámica de resultados de búsqueda */}
                    {docenteBusqueda && (
                      <div className="border-2 border-black bg-white max-h-40 overflow-y-auto mt-1">
                        {docentesFiltrados.length > 0 ? (
                          docentesFiltrados.map((doc) => (
                            <div
                              key={doc.idUsuario}
                              onClick={() => {
                                setSelectedDocenteId(doc.idUsuario);
                                setDocenteBusqueda(''); // Limpiamos la búsqueda
                              }}
                              className="p-2 border-b-2 border-gray-200 hover:bg-gray-100 cursor-pointer text-sm font-bold uppercase transition-colors"
                            >
                              {doc.apellidos}, {doc.nombres}
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-sm text-gray-500 italic">No se encontraron docentes.</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ==========================================
            PASO 2: ASIGNAR SECCIONES
        ========================================== */}
              <div>
                <h2 className="text-lg font-bold uppercase mb-4 border-b-2 border-dashed border-gray-400 inline-block pb-1 text-gray-900">
                  2. Asignar Secciones
                </h2>

                <div className="border-2 border-black bg-white h-48 overflow-y-auto p-3 space-y-3 text-gray-900">
                  {/* Renderizado dinámico de la lista de secciones usando .map() */}
                  {seccionesDisponibles.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 uppercase">
                      {loadingSeccionesDisponibles
                        ? 'Cargando secciones disponibles...'
                        : seccionesDisponiblesError
                          ? seccionesDisponiblesError
                          : 'No hay secciones disponibles para asignar.'}
                    </div>
                  ) : (
                    seccionesDisponibles.map((sec) => {
                      const idKey = String(sec.idSeccion)
                      const estaSeleccionada = seccionesSeleccionadas.includes(idKey)

                      return (
                        <div
                          key={sec.idSeccion}
                          className={`border-2 p-3 transition-colors ${estaSeleccionada
                              ? 'bg-gray-100 border-black'
                              : 'border-gray-300 bg-white hover:border-black'
                            }`}
                        >
                          <CampoCheckbox
                            field={{
                              type: 'checkbox',
                              name: idKey,
                              label: `${sec.desNombre} - ${sec.valAnio}`,
                              disabled: false,
                            }}
                            value={estaSeleccionada}
                            onChange={() => toggleSeccion(idKey)}
                          />
                          <p className="text-[10px] font-bold text-gray-700 uppercase ml-7 mt-1">
                            {`Curso ${sec.desCurso} · ID Sección ${sec.idSeccion}`}
                          </p>
                        </div>
                      )
                    })
                  )}
                </div>

                <p className="text-[10px] font-bold text-gray-700 uppercase mt-2 text-right">
                  * Puede seleccionar múltiples secciones.
                </p>
              </div>
            </div>

            {/* ==========================================
          BOTÓN DE CONFIRMACIÓN REACTIVO
      ========================================== */}
            <div className="mt-8 pt-6 border-t-4 border-black flex justify-between items-center">
              <p className="text-sm font-bold text-red-600">
                {!selectedDocenteId && '* Debe seleccionar un docente primero'}
              </p>

              <Boton
                variant="primary"
                size="md"
                className="cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.97]"
                disabled={!selectedDocenteId || seccionesSeleccionadas.length === 0}
                onClick={handleConfirmarAsignacion}
              >
                Confirmar Asignación ({seccionesSeleccionadas.length} Secciones)
              </Boton>
            </div>
          </div>

          <div className="flex justify-between items-end mb-4 gap-4">
            <h2 className="text-xl font-bold uppercase bg-black text-white inline-block px-3 py-1">
              Directorio de Asignaciones Activas
            </h2>
          </div>

          <div className="bg-white border-2 border-black p-4 mb-8 flex flex-col lg:flex-row gap-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-gray-900">
            <div className="flex-1">
              <CampoTexto
                field={{
                  type: 'search',
                  name: 'buscarAsignacion',
                  label: 'Buscar asignación',
                  placeholder: 'BUSCAR POR DOCENTE O CURSO... ',
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
                  name: 'docente',
                  label: 'Docente',
                  options: docentesDisponibles,
                }}
                value={filtroDocente}
                onChange={(_, v) => setFiltroDocente(v)}
              />
            </div>

            <div className="w-full lg:w-48">
              <CampoSelect
                field={{
                  type: 'select',
                  name: 'curso',
                  label: 'Curso',
                  options: cursosDisponibles,
                }}
                value={filtroCurso}
                onChange={(_, v) => setFiltroCurso(v)}
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

          <div className="bg-white border-2 border-black overflow-x-auto shadow-[8px_8px_0_0_rgba(0,0,0,1)] mb-4 text-gray-900">
            {loadingAsignaciones ? (
              <div className="p-6 text-center text-sm font-bold uppercase text-gray-500">
                Cargando asignaciones activas...
              </div>
            ) : fetchError ? (
              <div className="p-6 text-center text-sm font-bold uppercase text-red-600">
                {fetchError}
              </div>
            ) : (
              <Tabla
                columns={columnasAsignaciones}
                rows={filasPaginadas}
                renderAction={(row) => (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Esta acción no se puede deshacer. ¿Desea continuar?')) {
                          handleRemoverProfesor(Number(row.idSeccion))
                        }
                      }}
                      title="Desvincular Profesor"
                      className="min-w-14 h-8 px-2 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-all text-[10px] font-bold uppercase cursor-pointer active:scale-[0.95] text-gray-900"
                    >
                      Del
                    </button>
                  </div>
                )}
                className="max-w-none mx-0 space-y-0"
              />
            )}

            <div className="p-4 border-t-2 border-black flex items-center justify-between bg-white">
              <span className="text-xs font-bold uppercase text-gray-500">
                {totalElementos > 0
                  ? `Mostrando ${inicio} a ${fin} de ${totalElementos} asignaciones`
                  : 'Sin resultados'}
              </span>

              <div className="flex space-x-2">
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