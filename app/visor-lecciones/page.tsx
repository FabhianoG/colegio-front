"use client"

import React, { Suspense, useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Boton from '../componentes/Boton'
import BarraLateral from '../componentes/BarraLateral'
import { obtenerLeccionPorIdSolicitud, listarLeccionesPorModuloSolicitud, LeccionDetalleResponseData } from '../../lib/api/login/lecciones'
import { listarRecursosPorLeccionSolicitud, RecursoResponseData, descargarArchivoRecursoSolicitud } from '../../lib/api/login/recursos'
import { completarLeccionSolicitud, obtenerMiProgresoSolicitud } from '../../lib/api/login/progreso'
import { listarEvaluacionesPorModuloSolicitud, EvaluacionResponseData } from '../../lib/api/login/evaluaciones'

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? ''
}

const ICON_POR_TIPO: Record<string, string> = {
  PDF: 'fa-regular fa-file-pdf',
  VIDEO: 'fa-regular fa-file-video',
  ZIP: 'fa-regular fa-file-zipper',
  CODIGO: 'fa-regular fa-file-code',
  IMAGEN: 'fa-regular fa-file-image',
}

function iconRecurso(codTipo: string): string {
  return ICON_POR_TIPO[codTipo?.toUpperCase()] ?? 'fa-regular fa-file'
}

function VisorLeccionesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const idLeccion = Number(searchParams?.get('leccion'))
  const idModulo = Number(searchParams?.get('modulo'))
  const idCurso = Number(searchParams?.get('curso'))

  const [leccion,         setLeccion]         = useState<LeccionDetalleResponseData | null>(null)
  const [leccionesModulo, setLeccionesModulo] = useState<LeccionDetalleResponseData[]>([])
  const [recursos,        setRecursos]        = useState<RecursoResponseData[]>([])
  const [evaluaciones,    setEvaluaciones]    = useState<EvaluacionResponseData[]>([])
  const [moduloCompletado, setModuloCompletado] = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState('')
  const [completando,     setCompletando]     = useState(false)
  const [yaCompletada,    setYaCompletada]    = useState(false)
  const [menuAbierto,     setMenuAbierto]     = useState(false)

  // Scroll-lock: el botón de completar queda bloqueado hasta llegar al final
  const [haLlegadoAlFinal, setHaLlegadoAlFinal] = useState(false)
  const contenidoRef = useRef<HTMLDivElement>(null)

  const cargarLeccion = useCallback(async (id: number, moduloId: number, cursoId: number) => {
    setLoading(true)
    setError('')
    setHaLlegadoAlFinal(false)

    const token = getToken()

    try {
      const [resLeccion, resRecursos] = await Promise.all([
        obtenerLeccionPorIdSolicitud(id, token),
        listarRecursosPorLeccionSolicitud(id, token),
      ])
      setLeccion(resLeccion.datos ?? null)
      setRecursos(resRecursos.datos ?? [])
      setYaCompletada(false)

      // Cargar evaluaciones y estado del módulo en paralelo (silencioso si falla)
      if (moduloId) {
        Promise.allSettled([
          listarEvaluacionesPorModuloSolicitud(moduloId, token),
          obtenerMiProgresoSolicitud(token),
        ]).then(([resEvals, resProgreso]) => {
          if (resEvals.status === 'fulfilled') {
            setEvaluaciones((resEvals.value.datos ?? []).filter((e) => e.estActiva))
          }
          if (resProgreso.status === 'fulfilled') {
            const progresoCurso = (resProgreso.value.datos ?? []).find((p) => p.idCurso === cursoId)
            const progresoModulo = progresoCurso?.modulos.find((m) => m.idModulo === moduloId)
            setModuloCompletado(progresoModulo?.estado === 'COMPLETADO')
          }
        }).catch(() => {})
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la lección.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!idModulo) return
    const token = getToken()
    listarLeccionesPorModuloSolicitud(idModulo, token)
      .then((res) => {
        const sorted = (res.datos ?? []).sort((a, b) => a.valOrden - b.valOrden)
        setLeccionesModulo(sorted)
      })
      .catch(() => setLeccionesModulo([]))
  }, [idModulo])

  useEffect(() => {
    if (idLeccion) {
      cargarLeccion(idLeccion, idModulo, idCurso)
    }
  }, [idLeccion, idModulo, idCurso, cargarLeccion])

  // Detectar cuando el alumno llega al final del contenido
  useEffect(() => {
    const el = contenidoRef.current
    if (!el) return

    function onScroll() {
      if (!el) return
      const { scrollTop, scrollHeight, clientHeight } = el
      // Umbral: 50px antes del final
      if (scrollHeight - scrollTop - clientHeight < 50) {
        setHaLlegadoAlFinal(true)
      }
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    // Verificar de inmediato por si el contenido es corto
    onScroll()

    return () => el.removeEventListener('scroll', onScroll)
  }, [loading, leccion])

  const indiceActual = leccionesModulo.findIndex((l) => l.idLeccion === idLeccion)
  const leccionAnterior = indiceActual > 0 ? leccionesModulo[indiceActual - 1] : null
  const leccionSiguiente =
    indiceActual >= 0 && indiceActual < leccionesModulo.length - 1
      ? leccionesModulo[indiceActual + 1]
      : null

  function navegarALeccion(l: LeccionDetalleResponseData) {
    router.push(`/visor-lecciones?leccion=${l.idLeccion}&modulo=${idModulo}&curso=${idCurso}`)
    setMenuAbierto(false)
  }

  async function handleCompletar() {
    if (completando || yaCompletada || !idLeccion) return
    setCompletando(true)
    const token = getToken()

    try {
      await completarLeccionSolicitud(idLeccion, token)
      setYaCompletada(true)

      if (leccionSiguiente) {
        setTimeout(() => navegarALeccion(leccionSiguiente), 600)
      } else {
        setTimeout(() => router.push(`/curso/${idCurso}`), 600)
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al completar lección.')
    } finally {
      setCompletando(false)
    }
  }

  async function handleDescargar(recurso: RecursoResponseData) {
    const token = getToken()
    try {
      const blob = await descargarArchivoRecursoSolicitud(recurso.idRecurso, token)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = recurso.desNombre
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('No se pudo descargar el archivo.')
    }
  }

  if (!idLeccion) {
    return (
      <>
        <BarraLateral />
        <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-white">
          <div className="p-8 text-center">
            <p className="text-sm font-bold uppercase text-gray-600">
              Selecciona una lección desde el{' '}
              <button
                onClick={() =>
                  idCurso ? router.push(`/curso/${idCurso}`) : router.push('/catalogo-cursos')
                }
                className="underline hover:text-black"
              >
                catálogo de cursos
              </button>
              .
            </p>
          </div>
        </main>
      </>
    )
  }

  const botonBloqueado = !haLlegadoAlFinal && !yaCompletada

  return (
    <>
      <BarraLateral />

      <main className="flex-1 flex h-screen overflow-hidden bg-white">
        {/* ── Panel lateral de temario (desktop) ── */}
        <aside className="hidden lg:flex w-72 flex-col border-r-2 border-black bg-gray-50 overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b-2 border-black">
            <button
              onClick={() =>
                idCurso ? router.push(`/curso/${idCurso}`) : router.push('/catalogo-cursos')
              }
              className="flex items-center gap-2 text-xs font-bold uppercase text-gray-600 hover:text-black transition-colors"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Volver al curso
            </button>
          </div>

          <div className="p-4 border-b-2 border-dashed border-gray-300">
            <p className="text-xs font-bold uppercase text-gray-500 mb-1">Módulo</p>
            <p className="text-sm font-bold uppercase text-black">{leccion?.desModulo ?? '—'}</p>
          </div>

          <nav className="flex-1 py-2">
            {leccionesModulo.map((l, idx) => (
              <button
                key={l.idLeccion}
                onClick={() => navegarALeccion(l)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-bold transition-colors ${
                  l.idLeccion === idLeccion
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-black'
                }`}
              >
                <span className="w-5 text-center text-xs opacity-60">{idx + 1}</span>
                <span className="flex-1 leading-snug">{l.desNombre}</span>
                {l.estObligatoria && (
                  <span
                    className={`text-[10px] ${l.idLeccion === idLeccion ? 'text-gray-300' : 'text-gray-400'}`}
                  >
                    <i className="fa-solid fa-star"></i>
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Evaluación del módulo en el sidebar */}
          {evaluaciones.length > 0 && (
            <div className={`border-t-2 p-3 ${moduloCompletado ? 'border-black' : 'border-gray-200'}`}>
              <p className={`text-xs font-bold uppercase mb-2 flex items-center gap-1 ${moduloCompletado ? 'text-gray-600' : 'text-gray-400'}`}>
                <i className={`${moduloCompletado ? 'fa-solid fa-clipboard-check' : 'fa-solid fa-lock'}`}></i>
                Evaluación
              </p>
              {evaluaciones.map((ev) =>
                moduloCompletado ? (
                  <button
                    key={ev.idEvaluacion}
                    onClick={() =>
                      router.push(`/sala-evaluacion?evaluacion=${ev.idEvaluacion}&modulo=${idModulo}&curso=${idCurso}`)
                    }
                    className="w-full text-left px-3 py-2 text-xs font-bold uppercase border-2 border-black bg-white hover:bg-black hover:text-white transition-colors mb-1"
                  >
                    <i className="fa-solid fa-pen-to-square mr-2"></i>
                    {ev.desTitulo}
                  </button>
                ) : (
                  <div
                    key={ev.idEvaluacion}
                    className="w-full text-left px-3 py-2 text-xs font-bold uppercase border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 mb-1 cursor-not-allowed flex items-center gap-2"
                  >
                    <i className="fa-solid fa-lock"></i>
                    {ev.desTitulo}
                  </div>
                )
              )}
            </div>
          )}
        </aside>

        {/* ── Contenido principal ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header móvil */}
          <header className="lg:hidden border-b-2 border-black p-4 flex justify-between items-center bg-gray-100 sticky top-0 z-20">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="font-bold text-black uppercase text-sm"
            >
              <i className="fa-solid fa-bars text-xl mr-2"></i>
              Temario
            </button>
            <span className="font-bold uppercase text-xs truncate ml-4 text-black max-w-[60%]">
              {leccion?.desNombre ?? 'Cargando...'}
            </span>
          </header>

          {/* Menú móvil */}
          {menuAbierto && (
            <div className="lg:hidden border-b-2 border-black bg-white z-10">
              {leccionesModulo.map((l, idx) => (
                <button
                  key={l.idLeccion}
                  onClick={() => navegarALeccion(l)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-bold border-b border-dashed border-gray-200 transition-colors ${
                    l.idLeccion === idLeccion ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="w-5 text-center text-xs opacity-60">{idx + 1}</span>
                  <span className="flex-1">{l.desNombre}</span>
                </button>
              ))}
              {evaluaciones.length > 0 && (
                <div className="p-3 border-t border-dashed border-gray-300">
                  <p className={`text-xs font-bold uppercase mb-2 flex items-center gap-1 ${moduloCompletado ? 'text-gray-500' : 'text-gray-400'}`}>
                    <i className={moduloCompletado ? 'fa-solid fa-clipboard-check' : 'fa-solid fa-lock'}></i>
                    Evaluación
                  </p>
                  {evaluaciones.map((ev) =>
                    moduloCompletado ? (
                      <button
                        key={ev.idEvaluacion}
                        onClick={() =>
                          router.push(`/sala-evaluacion?evaluacion=${ev.idEvaluacion}&modulo=${idModulo}&curso=${idCurso}`)
                        }
                        className="w-full text-left px-3 py-2 text-xs font-bold uppercase border-2 border-black bg-white hover:bg-black hover:text-white transition-colors mb-1"
                      >
                        <i className="fa-solid fa-pen-to-square mr-2"></i>
                        {ev.desTitulo}
                      </button>
                    ) : (
                      <div key={ev.idEvaluacion} className="w-full px-3 py-2 text-xs font-bold uppercase border-2 border-dashed border-gray-200 text-gray-400 mb-1 flex items-center gap-2 cursor-not-allowed">
                        <i className="fa-solid fa-lock"></i>
                        {ev.desTitulo}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Scroll container del contenido ── */}
          <div ref={contenidoRef} className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-10 text-center text-sm font-bold uppercase text-gray-500">
                Cargando lección...
              </div>
            ) : error ? (
              <div className="p-10 text-center border border-red-600 bg-red-50 text-sm font-bold uppercase text-red-700 m-8">
                {error}
              </div>
            ) : leccion ? (
              <div className="max-w-4xl mx-auto w-full p-6 md:p-10 pb-32">
                {/* Breadcrumb */}
                <div className="text-xs font-bold uppercase text-gray-600 mb-6 tracking-wider flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() =>
                      idCurso ? router.push(`/curso/${idCurso}`) : router.push('/catalogo-cursos')
                    }
                    className="hover:text-black transition-colors"
                  >
                    Curso
                  </button>
                  <i className="fa-solid fa-angle-right"></i>
                  <span>{leccion.desModulo}</span>
                  <i className="fa-solid fa-angle-right"></i>
                  <span className="text-black">{leccion.desNombre}</span>
                  {leccion.estObligatoria && (
                    <span className="border border-gray-400 px-1 text-gray-500">Obligatoria</span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold uppercase mb-8 leading-tight text-black">
                  {leccion.desNombre}
                </h1>

                {/* ── Contenido HTML de la lección ── */}
                <section className="mb-10">
                  <div
                    className="leccion-contenido text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: leccion.desContenido }}
                  />
                </section>

                {/* ── Recursos adjuntos ── */}
                {recursos.length > 0 && (
                  <div className="border-2 border-black bg-gray-50 p-6 mb-10 relative">
                    <div className="absolute -top-3 left-4 bg-white border-2 border-black px-2 text-sm font-bold uppercase text-black">
                      Recursos Adjuntos
                    </div>

                    <div className="flex flex-col space-y-3 mt-2">
                      {recursos.map((recurso) => (
                        <div
                          key={recurso.idRecurso}
                          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-3 border-2 border-dashed border-gray-400 bg-white"
                        >
                          <div className="flex items-center">
                            <i
                              className={`${iconRecurso(recurso.codTipoRecurso)} text-2xl mr-4 text-gray-700`}
                            ></i>
                            <div>
                              <p className="font-bold text-sm uppercase text-black">
                                {recurso.desNombre}
                              </p>
                              <p className="text-xs text-gray-600 font-bold uppercase">
                                {recurso.desTipoRecurso}
                              </p>
                            </div>
                          </div>

                          <Boton variant="ghost" size="sm" onClick={() => handleDescargar(recurso)}>
                            Descargar
                          </Boton>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Evaluaciones del módulo ── */}
                {evaluaciones.length > 0 && (
                  <div className={`border-2 p-6 mb-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${moduloCompletado ? 'border-black bg-white' : 'border-gray-300 bg-gray-50'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-8 h-8 border-2 flex items-center justify-center flex-shrink-0 ${moduloCompletado ? 'bg-black border-black text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                        <i className={`text-xs ${moduloCompletado ? 'fa-solid fa-clipboard-check' : 'fa-solid fa-lock'}`}></i>
                      </div>
                      <h3 className={`text-base font-bold uppercase ${moduloCompletado ? 'text-black' : 'text-gray-400'}`}>
                        Evaluación del Módulo
                      </h3>
                    </div>

                    {!moduloCompletado && (
                      <div className="mb-4 flex items-center gap-2 border-2 border-dashed border-gray-300 p-3 bg-white">
                        <i className="fa-solid fa-circle-info text-gray-400"></i>
                        <p className="text-xs font-bold uppercase text-gray-500">
                          Completa todas las lecciones obligatorias del módulo para desbloquear la evaluación
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {evaluaciones.map((ev) => (
                        <div
                          key={ev.idEvaluacion}
                          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-2 transition-colors ${moduloCompletado ? 'border-dashed border-gray-400 hover:border-black' : 'border-dashed border-gray-200'}`}
                        >
                          <div>
                            <p className={`font-bold uppercase ${moduloCompletado ? 'text-black' : 'text-gray-400'}`}>
                              {ev.desTitulo}
                            </p>
                            {ev.desInstrucciones && (
                              <p className={`text-xs mt-1 ${moduloCompletado ? 'text-gray-600' : 'text-gray-400'}`}>
                                {ev.desInstrucciones}
                              </p>
                            )}
                            <div className="flex gap-3 mt-1 flex-wrap">
                              <span className={`text-xs font-bold uppercase ${moduloCompletado ? 'text-gray-500' : 'text-gray-400'}`}>
                                <i className="fa-solid fa-circle-check mr-1"></i>
                                Mínimo: {ev.valPuntajeMinimo} pts
                              </span>
                              {ev.valMaxIntentos && (
                                <span className={`text-xs font-bold uppercase ${moduloCompletado ? 'text-gray-500' : 'text-gray-400'}`}>
                                  <i className="fa-solid fa-rotate-right mr-1"></i>
                                  {ev.valMaxIntentos} intentos
                                </span>
                              )}
                              {ev.valTiempoLimite && (
                                <span className={`text-xs font-bold uppercase ${moduloCompletado ? 'text-gray-500' : 'text-gray-400'}`}>
                                  <i className="fa-solid fa-clock mr-1"></i>
                                  {ev.valTiempoLimite} min
                                </span>
                              )}
                            </div>
                          </div>

                          {moduloCompletado ? (
                            <Boton
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/sala-evaluacion?evaluacion=${ev.idEvaluacion}&modulo=${idModulo}&curso=${idCurso}`,
                                )
                              }
                            >
                              <i className="fa-solid fa-pen-to-square mr-2"></i>
                              Rendir
                            </Boton>
                          ) : (
                            <div className="flex-shrink-0 px-4 py-2 border-2 border-gray-200 bg-gray-100 text-gray-400 text-xs font-bold uppercase cursor-not-allowed flex items-center gap-2">
                              <i className="fa-solid fa-lock"></i>
                              Bloqueado
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Indicador de scroll ── */}
                {!haLlegadoAlFinal && !yaCompletada && (
                  <div className="flex items-center gap-2 justify-center py-4 text-xs font-bold uppercase text-gray-400 border-t-2 border-dashed border-gray-200 mt-4">
                    <i className="fa-solid fa-arrow-down animate-bounce"></i>
                    Desplázate hasta el final para completar la lección
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* ── Barra de navegación inferior fija ── */}
          <div className="border-t-4 border-black p-4 bg-white z-20 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.08)]">
            <Boton
              variant="ghost"
              size="sm"
              disabled={!leccionAnterior}
              onClick={() => leccionAnterior && navegarALeccion(leccionAnterior)}
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Anterior
            </Boton>

            <div className="flex items-center gap-3">
              {yaCompletada && (
                <span className="text-xs font-bold uppercase text-green-700 flex items-center gap-1">
                  <i className="fa-solid fa-check-circle"></i>
                  Completada
                </span>
              )}

              {botonBloqueado ? (
                <div className="relative group">
                  <button
                    disabled
                    className="px-4 py-2 text-sm font-bold uppercase border-2 border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed flex items-center gap-2"
                  >
                    <i className="fa-solid fa-lock text-xs"></i>
                    {leccionSiguiente ? 'Completar y Continuar' : 'Completar Módulo'}
                  </button>
                  <div className="absolute bottom-full mb-2 right-0 bg-black text-white text-xs font-bold px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Llega al final para desbloquear
                  </div>
                </div>
              ) : (
                <Boton
                  variant="primary"
                  size="md"
                  disabled={completando}
                  onClick={handleCompletar}
                >
                  {completando ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Guardando...
                    </>
                  ) : leccionSiguiente ? (
                    <>
                      Completar y Continuar
                      <i className="fa-solid fa-arrow-right ml-2"></i>
                    </>
                  ) : (
                    <>
                      Completar Módulo
                      <i className="fa-solid fa-flag-checkered ml-2"></i>
                    </>
                  )}
                </Boton>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default function VisorLeccionesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-sm font-bold uppercase text-gray-500">
          Cargando...
        </div>
      }
    >
      <VisorLeccionesContent />
    </Suspense>
  )
}
