"use client"

import React, { Suspense, useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import BarraLateral from '../componentes/BarraLateral'
import Etiquetas from '../componentes/Etiquetas'
import Boton from '../componentes/Boton'
import {
  iniciarIntentoSolicitud,
  guardarRespuestaSolicitud,
  finalizarIntentoSolicitud,
  obtenerHistorialSolicitud,
  obtenerRevisionSolicitud,
  listarEvaluacionesPorModuloSolicitud,
  IntentoEnCursoResponseData,
  IntentoFinalizadoResponseData,
  IntentoHistorialItemResponseData,
  IntentoRevisionResponseData,
  PreguntaParaRendirResponseData,
  EvaluacionResponseData,
} from '../../lib/api/login/evaluaciones'

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? ''
}

function formatFecha(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

// ─── Componente de pregunta ───────────────────────────────────────────────────

interface PreguntaCardProps {
  pregunta: PreguntaParaRendirResponseData
  numero: number
  idOpcionSeleccionada: number | null
  guardando: boolean
  onSeleccionar: (idPregunta: number, idOpcion: number) => void
}

function PreguntaCard({ pregunta, numero, idOpcionSeleccionada, guardando, onSeleccionar }: PreguntaCardProps) {
  const esVF = pregunta.codTipo === 'VERDADERO_FALSO'
  const esOM = pregunta.codTipo === 'OPCION_MULTIPLE'
  const tipoLabel = esVF ? 'Verdadero / Falso' : esOM ? 'Opción Múltiple' : pregunta.codTipo
  const respondida = idOpcionSeleccionada !== null

  return (
    <div className={`bg-white border-2 p-6 relative shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all ${respondida ? 'border-black' : 'border-gray-400'}`}>
      {/* Número */}
      <div className={`absolute -left-4 -top-4 w-10 h-10 flex items-center justify-center font-bold text-lg border-2 border-black ${respondida ? 'bg-black text-white' : 'bg-white text-black'}`}>
        {respondida ? <i className="fa-solid fa-check text-sm"></i> : numero}
      </div>

      {/* Tipo y puntaje */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest border-b-2 border-gray-200 pb-1">
          {tipoLabel}
        </span>
        <span className="text-xs font-bold uppercase text-gray-500 border border-gray-300 px-2 py-0.5">
          {pregunta.valPuntaje} pts
        </span>
      </div>

      {/* Enunciado */}
      <p className="font-bold text-base mb-6 leading-relaxed text-black">
        {pregunta.desEnunciado}
      </p>

      {/* Opciones */}
      <div className={`grid gap-3 ${esVF ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {pregunta.opciones
          .sort((a, b) => a.valOrden - b.valOrden)
          .map((opcion) => {
            const seleccionada = idOpcionSeleccionada === opcion.idOpcion
            return (
              <button
                key={opcion.idOpcion}
                disabled={guardando}
                onClick={() => onSeleccionar(pregunta.idPregunta, opcion.idOpcion)}
                className={`flex items-center gap-3 px-4 py-3 border-2 text-left text-sm font-bold uppercase transition-all
                  ${seleccionada
                    ? 'border-black bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]'
                    : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-black hover:bg-gray-100'
                  }
                  ${guardando ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[10px] ${seleccionada ? 'border-white bg-white text-black' : 'border-gray-400'}`}>
                  {seleccionada && <i className="fa-solid fa-check"></i>}
                </span>
                {opcion.desOpcion}
              </button>
            )
          })}
      </div>
    </div>
  )
}

// ─── Componente de revisión ───────────────────────────────────────────────────

function RevisionModal({
  revision,
  onCerrar,
}: {
  revision: IntentoRevisionResponseData
  onCerrar: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white border-4 border-black w-full max-w-3xl my-8 shadow-[16px_16px_0_0_rgba(0,0,0,0.4)]">
        {/* Cabecera */}
        <div className="border-b-4 border-black p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold uppercase text-black">{revision.tituloEvaluacion}</h2>
            <p className="text-xs font-bold uppercase text-gray-500 mt-1">Revisión de respuestas</p>
          </div>
          <button onClick={onCerrar} className="text-gray-500 hover:text-black text-xl ml-4 flex-shrink-0">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Resultado */}
        <div className="p-6 border-b-2 border-dashed border-gray-300 flex flex-wrap gap-6 items-center">
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-gray-500 mb-1">Calificación</p>
            <p className="text-4xl font-bold text-black">{revision.valCalificacion}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-gray-500 mb-1">Mínimo</p>
            <p className="text-4xl font-bold text-gray-400">{revision.valPuntajeMinimo}</p>
          </div>
          <div>
            {revision.estAprobado
              ? <Etiquetas variant="success">Aprobado</Etiquetas>
              : <Etiquetas variant="danger">Desaprobado</Etiquetas>}
            <p className="text-xs font-bold uppercase text-gray-500 mt-2">
              Intento #{revision.numIntento}
            </p>
          </div>
        </div>

        {/* Preguntas revisadas */}
        <div className="p-6 space-y-6">
          {revision.preguntas.map((p, idx) => {
            const correcta = p.miRespuestaCorrecta === true
            const incorrecta = p.miRespuestaCorrecta === false
            const sinResponder = p.miOpcionElegidaId === null && !p.miRespuestaTexto

            return (
              <div key={p.idPregunta} className={`border-2 p-5 ${correcta ? 'border-green-500 bg-green-50' : incorrecta ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="font-bold text-sm text-black leading-snug">
                    <span className="mr-2 text-gray-500">{idx + 1}.</span>
                    {p.desEnunciado}
                  </p>
                  <span className={`flex-shrink-0 text-xs font-bold uppercase px-2 py-1 border-2 ${correcta ? 'border-green-600 text-green-700' : incorrecta ? 'border-red-500 text-red-600' : 'border-gray-300 text-gray-500'}`}>
                    {sinResponder ? 'Sin responder' : correcta ? 'Correcto' : 'Incorrecto'}
                  </span>
                </div>

                <div className="space-y-2">
                  {p.opciones.sort((a, b) => a.valOrden - b.valOrden).map((op) => {
                    const esMia = op.idOpcion === p.miOpcionElegidaId
                    const esCorrecta = op.esCorrecta

                    let estilo = 'border-gray-200 bg-white text-gray-600'
                    if (esCorrecta) estilo = 'border-green-500 bg-green-100 text-green-800 font-bold'
                    if (esMia && !esCorrecta) estilo = 'border-red-400 bg-red-100 text-red-700 font-bold'

                    return (
                      <div key={op.idOpcion} className={`flex items-center gap-2 px-3 py-2 border-2 text-sm ${estilo}`}>
                        {esCorrecta && <i className="fa-solid fa-check text-green-600 flex-shrink-0"></i>}
                        {esMia && !esCorrecta && <i className="fa-solid fa-xmark text-red-500 flex-shrink-0"></i>}
                        {!esCorrecta && !esMia && <span className="w-4 flex-shrink-0"></span>}
                        {op.desOpcion}
                        {esMia && <span className="ml-auto text-xs uppercase font-bold opacity-70">Tu respuesta</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-6 border-t-4 border-black flex justify-end">
          <Boton variant="primary" size="md" onClick={onCerrar}>
            Cerrar revisión
          </Boton>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

function SalaEvaluacionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const idEvaluacion = Number(searchParams?.get('evaluacion'))
  const idModulo = Number(searchParams?.get('modulo'))
  const idCurso = Number(searchParams?.get('curso'))

  // Estado de la evaluación
  const [evaluacion, setEvaluacion] = useState<EvaluacionResponseData | null>(null)
  const [intento, setIntento] = useState<IntentoEnCursoResponseData | null>(null)
  const [historial, setHistorial] = useState<IntentoHistorialItemResponseData[]>([])
  const [resultado, setResultado] = useState<IntentoFinalizadoResponseData | null>(null)
  const [revision, setRevision] = useState<IntentoRevisionResponseData | null>(null)

  // UI state
  const [fase, setFase] = useState<'lobby' | 'examen' | 'resultado'>('lobby')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [finalizando, setFinalizando] = useState(false)
  const [confirmarEnvio, setConfirmarEnvio] = useState(false)
  const [mostrarRevision, setMostrarRevision] = useState(false)
  const [cargandoRevision, setCargandoRevision] = useState(false)

  // Respuestas locales: idPregunta → idOpcion
  const [respuestas, setRespuestas] = useState<Record<number, number>>({})

  // Timer
  const [segundosRestantes, setSegundosRestantes] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Cargar datos iniciales ──
  useEffect(() => {
    if (!idEvaluacion) return
    cargarInicial()
  }, [idEvaluacion])

  const cargarInicial = useCallback(async () => {
    setLoading(true)
    setError('')
    const token = getToken()
    try {
      // Cargar info de la evaluación y el historial en paralelo
      const [resEval, resHistorial] = await Promise.all([
        listarEvaluacionesPorModuloSolicitud(idModulo, token).catch(() => null),
        obtenerHistorialSolicitud(idEvaluacion, token).catch(() => ({ datos: [] })),
      ])

      const evals = resEval?.datos ?? []
      const ev = evals.find((e) => e.idEvaluacion === idEvaluacion) ?? null
      setEvaluacion(ev)
      setHistorial(resHistorial?.datos ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar la evaluación.')
    } finally {
      setLoading(false)
    }
  }, [idEvaluacion, idModulo])

  // ── Timer ──
  useEffect(() => {
    if (fase !== 'examen' || segundosRestantes === null) return
    if (segundosRestantes <= 0) {
      handleFinalizar()
      return
    }
    timerRef.current = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [fase, segundosRestantes === null ? null : Math.floor(segundosRestantes / 60)])

  function formatTimer(seg: number): string {
    const m = Math.floor(seg / 60).toString().padStart(2, '0')
    const s = (seg % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // ── Iniciar / reanudar intento ──
  async function handleIniciar() {
    setLoading(true)
    setError('')
    const token = getToken()
    try {
      const res = await iniciarIntentoSolicitud(idEvaluacion, token)
      const data = res.datos!
      setIntento(data)

      // Pre-cargar respuestas ya guardadas
      const previas: Record<number, number> = {}
      for (const r of data.misRespuestas) {
        if (r.idOpcionElegida !== null) previas[r.idPregunta] = r.idOpcionElegida
      }
      setRespuestas(previas)

      if (data.minutosRestantes !== null) {
        setSegundosRestantes(data.minutosRestantes * 60)
      }

      setFase('examen')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar la evaluación.')
    } finally {
      setLoading(false)
    }
  }

  // ── Guardar respuesta ──
  async function handleSeleccionar(idPregunta: number, idOpcion: number) {
    if (!intento || guardando) return
    // Actualizar local inmediatamente (UX optimista)
    setRespuestas((prev) => ({ ...prev, [idPregunta]: idOpcion }))
    setGuardando(true)
    const token = getToken()
    try {
      await guardarRespuestaSolicitud(
        intento.idIntento,
        idPregunta,
        { idOpcionElegida: idOpcion, desRespuestaTexto: null },
        token,
      )
    } catch {
      // silencioso — la UI ya refleja la selección; se reintentará
    } finally {
      setGuardando(false)
    }
  }

  // ── Finalizar ──
  async function handleFinalizar() {
    if (!intento || finalizando) return
    if (timerRef.current) clearInterval(timerRef.current)
    setFinalizando(true)
    setConfirmarEnvio(false)
    const token = getToken()
    try {
      const res = await finalizarIntentoSolicitud(intento.idIntento, token)
      setResultado(res.datos ?? null)
      setFase('resultado')
      // Refrescar historial
      obtenerHistorialSolicitud(idEvaluacion, token)
        .then((r) => setHistorial(r.datos ?? []))
        .catch(() => {})
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al finalizar la evaluación.')
    } finally {
      setFinalizando(false)
    }
  }

  // ── Ver revisión ──
  async function handleVerRevision(idIntento: number) {
    setCargandoRevision(true)
    const token = getToken()
    try {
      const res = await obtenerRevisionSolicitud(idIntento, token)
      setRevision(res.datos ?? null)
      setMostrarRevision(true)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo cargar la revisión.')
    } finally {
      setCargandoRevision(false)
    }
  }

  const totalPreguntas = intento?.preguntas.length ?? 0
  const respondidas = Object.keys(respuestas).length
  const pctRespuestas = totalPreguntas > 0 ? Math.round((respondidas / totalPreguntas) * 100) : 0
  const timerRojo = segundosRestantes !== null && segundosRestantes < 120

  if (!idEvaluacion) {
    return (
      <>
        <BarraLateral />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <p className="text-sm font-bold uppercase text-gray-600">
            Accede a esta página desde una lección del{' '}
            <button onClick={() => router.push('/catalogo-cursos')} className="underline hover:text-black">
              catálogo
            </button>.
          </p>
        </main>
      </>
    )
  }

  // ═══════════════════ FASE LOBBY ═══════════════════
  if (fase === 'lobby') {
    return (
      <>
        <BarraLateral />
        <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-50 text-gray-900">
          <div className="p-8 max-w-3xl mx-auto w-full pb-20">
            <button
              onClick={() => idModulo
                ? router.push(`/visor-lecciones?modulo=${idModulo}&curso=${idCurso}`)
                : router.push(`/curso/${idCurso}`)
              }
              className="flex items-center gap-2 text-sm font-bold uppercase text-gray-600 hover:text-black mb-6 transition-colors"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Volver a la lección
            </button>

            {loading ? (
              <div className="border-2 border-black bg-white p-12 text-center text-sm font-bold uppercase text-gray-500">
                Cargando evaluación...
              </div>
            ) : error ? (
              <div className="border border-red-600 bg-red-50 p-4 text-sm font-bold uppercase text-red-700 mb-4">{error}</div>
            ) : (
              <>
                {/* Encabezado */}
                <div className="mb-8 border-b-2 border-black pb-6">
                  <p className="text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">
                    <i className="fa-solid fa-clipboard-check mr-2"></i>
                    Evaluación
                  </p>
                  <h1 className="text-3xl font-bold uppercase text-black mb-2">
                    {evaluacion?.desTitulo ?? `Evaluación #${idEvaluacion}`}
                  </h1>
                  {evaluacion?.desInstrucciones && (
                    <p className="text-gray-600 mt-2 leading-relaxed">{evaluacion.desInstrucciones}</p>
                  )}
                </div>

                {/* Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <p className="text-xs font-bold uppercase text-gray-500 mb-1">Puntaje mínimo</p>
                    <p className="text-2xl font-bold text-black">{evaluacion?.valPuntajeMinimo ?? '—'}</p>
                  </div>
                  <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <p className="text-xs font-bold uppercase text-gray-500 mb-1">Tiempo límite</p>
                    <p className="text-2xl font-bold text-black">
                      {evaluacion?.valTiempoLimite ? `${evaluacion.valTiempoLimite} min` : 'Sin límite'}
                    </p>
                  </div>
                  <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <p className="text-xs font-bold uppercase text-gray-500 mb-1">Intentos</p>
                    <p className="text-2xl font-bold text-black">
                      {historial.length}{evaluacion?.valMaxIntentos ? ` / ${evaluacion.valMaxIntentos}` : ''}
                    </p>
                  </div>
                </div>

                {/* Historial */}
                {historial.length > 0 && (
                  <div className="mb-8 bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <div className="border-b-2 border-black p-4">
                      <h2 className="font-bold uppercase text-sm text-black">
                        <i className="fa-solid fa-clock-rotate-left mr-2"></i>
                        Historial de intentos
                      </h2>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-black bg-gray-50">
                          <th className="text-left px-4 py-2 text-xs font-bold uppercase">Intento</th>
                          <th className="text-left px-4 py-2 text-xs font-bold uppercase">Fecha</th>
                          <th className="text-center px-4 py-2 text-xs font-bold uppercase">Nota</th>
                          <th className="text-center px-4 py-2 text-xs font-bold uppercase">Estado</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {historial.map((h) => (
                          <tr key={h.idIntento} className="border-b border-dashed border-gray-200">
                            <td className="px-4 py-3 font-bold">#{h.numIntento}</td>
                            <td className="px-4 py-3 text-gray-600">{formatFecha(h.fecInicio)}</td>
                            <td className="px-4 py-3 text-center font-bold">
                              {h.estCompletado ? h.valCalificacion : '—'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {!h.estCompletado
                                ? <Etiquetas variant="warning">En curso</Etiquetas>
                                : h.estAprobado
                                  ? <Etiquetas variant="success">Aprobado</Etiquetas>
                                  : <Etiquetas variant="danger">Desaprobado</Etiquetas>}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {h.estCompletado && (
                                <button
                                  onClick={() => handleVerRevision(h.idIntento)}
                                  disabled={cargandoRevision}
                                  className="text-xs font-bold uppercase underline hover:text-black text-gray-500 disabled:opacity-50"
                                >
                                  {cargandoRevision ? 'Cargando...' : 'Ver revisión'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Botón iniciar */}
                {evaluacion?.estActiva && (
                  evaluacion.valMaxIntentos && historial.filter(h => h.estCompletado).length >= evaluacion.valMaxIntentos
                    ? (
                      <div className="border-2 border-dashed border-gray-400 p-6 text-center text-sm font-bold uppercase text-gray-500">
                        <i className="fa-solid fa-ban mr-2"></i>
                        Has agotado el número máximo de intentos.
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <Boton variant="primary" size="lg" onClick={handleIniciar}>
                          <i className="fa-solid fa-play mr-2"></i>
                          {historial.some(h => !h.estCompletado) ? 'Reanudar evaluación' : 'Comenzar evaluación'}
                        </Boton>
                        {historial.some(h => !h.estCompletado) && (
                          <p className="text-xs font-bold uppercase text-amber-700">
                            <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                            Tienes un intento en curso
                          </p>
                        )}
                      </div>
                    )
                )}
              </>
            )}
          </div>

          {mostrarRevision && revision && (
            <RevisionModal revision={revision} onCerrar={() => setMostrarRevision(false)} />
          )}
        </main>
      </>
    )
  }

  // ═══════════════════ FASE EXAMEN ═══════════════════
  if (fase === 'examen' && intento) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex flex-col">
        {/* Header sticky */}
        <header className="bg-white border-b-4 border-black p-4 sticky top-0 z-30 flex justify-between items-center shadow-[0_4px_0_0_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-4 min-w-0">
            <span className="text-lg font-bold uppercase tracking-widest text-black hidden sm:block">[ LOGO ]</span>
            <div className="h-6 w-0.5 bg-black hidden md:block"></div>
            <h1 className="font-bold uppercase truncate max-w-xs text-black text-sm">
              {intento.tituloEvaluacion}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Contador de respuestas */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 border-2 border-black px-3 py-1.5">
              <span className="text-xs font-bold uppercase text-gray-600">{respondidas}/{totalPreguntas}</span>
              <div className="w-16 bg-gray-300 h-2 border border-gray-400">
                <div className="bg-black h-full transition-all" style={{ width: `${pctRespuestas}%` }}></div>
              </div>
            </div>

            {/* Timer */}
            {segundosRestantes !== null && (
              <div className={`flex items-center border-2 px-4 py-2 ${timerRojo ? 'border-red-600 bg-red-50 animate-pulse' : 'border-black bg-gray-100'}`}>
                <i className={`fa-regular fa-clock text-lg mr-2 ${timerRojo ? 'text-red-600' : 'text-black'}`}></i>
                <span className={`text-2xl font-bold tracking-widest ${timerRojo ? 'text-red-600' : 'text-black'}`}>
                  {formatTimer(segundosRestantes)}
                </span>
              </div>
            )}

            <Boton
              variant="primary"
              size="sm"
              onClick={() => setConfirmarEnvio(true)}
              disabled={finalizando}
            >
              Enviar
            </Boton>
          </div>
        </header>

        {/* Preguntas */}
        <main className="flex-1 w-full overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 md:p-8 pt-8 pb-24 space-y-8">
            {/* Instrucciones */}
            {intento.desInstrucciones && (
              <div className="bg-white border-2 border-dashed border-black p-5 relative">
                <div className="absolute -top-3 left-4 bg-white border-2 border-black px-2 text-xs font-bold uppercase text-gray-700">
                  Instrucciones
                </div>
                <p className="text-sm font-bold text-gray-700 mt-1">{intento.desInstrucciones}</p>
              </div>
            )}

            {intento.preguntas
              .sort((a, b) => a.valOrden - b.valOrden)
              .map((pregunta, idx) => (
                <PreguntaCard
                  key={pregunta.idPregunta}
                  pregunta={pregunta}
                  numero={idx + 1}
                  idOpcionSeleccionada={respuestas[pregunta.idPregunta] ?? null}
                  guardando={guardando}
                  onSeleccionar={handleSeleccionar}
                />
              ))}

            {/* Footer de envío */}
            <div className="border-t-4 border-black pt-8 text-center space-y-4">
              <p className="text-sm font-bold uppercase text-gray-600">
                {respondidas < totalPreguntas
                  ? `Tienes ${totalPreguntas - respondidas} pregunta(s) sin responder.`
                  : '¡Todas las preguntas respondidas!'}
              </p>
              <Boton
                variant="primary"
                size="lg"
                onClick={() => setConfirmarEnvio(true)}
                disabled={finalizando}
              >
                <i className="fa-solid fa-paper-plane mr-2"></i>
                Finalizar y Enviar
              </Boton>
            </div>
          </div>
        </main>

        {/* Modal confirmar envío */}
        {confirmarEnvio && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black p-8 max-w-sm w-full shadow-[12px_12px_0_0_rgba(0,0,0,0.3)]">
              <h2 className="text-xl font-bold uppercase text-black mb-2">¿Enviar evaluación?</h2>
              <p className="text-sm font-bold text-gray-600 mb-2">
                {respondidas < totalPreguntas
                  ? `Tienes ${totalPreguntas - respondidas} pregunta(s) sin responder. Esta acción no puede deshacerse.`
                  : 'Esta acción no puede deshacerse.'}
              </p>
              <div className="flex gap-3 mt-6">
                <Boton variant="ghost" size="md" fullWidth onClick={() => setConfirmarEnvio(false)}>
                  Cancelar
                </Boton>
                <Boton variant="primary" size="md" fullWidth onClick={handleFinalizar} disabled={finalizando}>
                  {finalizando ? 'Enviando...' : 'Confirmar'}
                </Boton>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 border-2 border-red-600 bg-red-50 px-4 py-2 text-sm font-bold uppercase text-red-700 z-50">
            {error}
          </div>
        )}
      </div>
    )
  }

  // ═══════════════════ FASE RESULTADO ═══════════════════
  if (fase === 'resultado' && resultado) {
    const aprobado = resultado.estAprobado
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black w-full max-w-lg shadow-[16px_16px_0_0_rgba(0,0,0,0.15)]">
          {/* Banda superior */}
          <div className={`${aprobado ? 'bg-black' : 'bg-gray-800'} text-white p-6 text-center`}>
            <i className={`text-5xl mb-3 block ${aprobado ? 'fa-solid fa-trophy' : 'fa-solid fa-rotate-right'}`}></i>
            <h2 className="text-2xl font-bold uppercase">{aprobado ? '¡Aprobado!' : 'Intento Completado'}</h2>
          </div>

          {/* Resultado */}
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-xs font-bold uppercase text-gray-500 mb-1">Tu nota</p>
                <p className="text-5xl font-bold text-black">{resultado.valCalificacion}</p>
              </div>
              <div className="text-gray-300 text-3xl font-light">/</div>
              <div className="text-center">
                <p className="text-xs font-bold uppercase text-gray-500 mb-1">Mínimo</p>
                <p className="text-5xl font-bold text-gray-400">{resultado.valPuntajeMinimo}</p>
              </div>
            </div>

            <div className="flex justify-center">
              {aprobado
                ? <Etiquetas variant="success">Aprobado</Etiquetas>
                : <Etiquetas variant="danger">Desaprobado</Etiquetas>}
            </div>

            {!aprobado && evaluacion?.valMaxIntentos && (
              <p className="text-center text-xs font-bold uppercase text-gray-500">
                Intentos usados: {resultado.numIntento}
                {evaluacion.valMaxIntentos ? ` de ${evaluacion.valMaxIntentos}` : ''}
              </p>
            )}

            {/* Barra visual */}
            <div>
              <div className="w-full border-2 border-black bg-gray-100 h-4">
                <div
                  className={`h-full transition-all ${aprobado ? 'bg-black' : 'bg-gray-500'}`}
                  style={{ width: `${Math.min((resultado.valCalificacion / (resultado.valPuntajeMinimo * 1.5 || 20)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-3 pt-2">
              <Boton
                variant="ghost"
                size="md"
                fullWidth
                onClick={() => handleVerRevision(resultado.idIntento)}
                disabled={cargandoRevision}
              >
                <i className="fa-solid fa-eye mr-2"></i>
                {cargandoRevision ? 'Cargando...' : 'Ver revisión de respuestas'}
              </Boton>

              {!aprobado && (!evaluacion?.valMaxIntentos || resultado.numIntento < evaluacion.valMaxIntentos) && (
                <Boton variant="primary" size="md" fullWidth onClick={() => { setResultado(null); setIntento(null); setRespuestas({}); setFase('lobby'); cargarInicial() }}>
                  <i className="fa-solid fa-rotate-right mr-2"></i>
                  Reintentar
                </Boton>
              )}

              <Boton
                variant={aprobado ? 'primary' : 'ghost'}
                size="md"
                fullWidth
                onClick={() => idCurso ? router.push(`/curso/${idCurso}`) : router.push('/catalogo-cursos')}
              >
                <i className="fa-solid fa-arrow-left mr-2"></i>
                Volver al curso
              </Boton>
            </div>
          </div>
        </div>

        {mostrarRevision && revision && (
          <RevisionModal revision={revision} onCerrar={() => setMostrarRevision(false)} />
        )}
      </div>
    )
  }

  return null
}

export default function SalaEvaluacionPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center text-sm font-bold uppercase text-gray-500">
        Cargando...
      </div>
    }>
      <SalaEvaluacionContent />
    </Suspense>
  )
}
