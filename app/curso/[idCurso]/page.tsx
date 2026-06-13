'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import BarraLateral from '../../componentes/BarraLateral'
import Etiquetas from '../../componentes/Etiquetas'
import {
  obtenerCursoPorIdSolicitud,
  CursoDetalleResponseData,
} from '../../../lib/api/login/cursos'
import {
  listarModulosPorCursoSolicitud,
  ModuloResponseData,
} from '../../../lib/api/login/modulos'
import {
  listarLeccionesPorModuloSolicitud,
  LeccionDetalleResponseData,
} from '../../../lib/api/login/lecciones'
import {
  obtenerMiProgresoSolicitud,
  ProgresoCursoResponseData,
  ModuloProgresoResponseData,
  EstadoModulo,
} from '../../../lib/api/login/progreso'
import {
  listarEvaluacionesPorModuloSolicitud,
  EvaluacionResponseData,
} from '../../../lib/api/login/evaluaciones'

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? ''
}

interface ModuloConLecciones extends ModuloResponseData {
  lecciones: LeccionDetalleResponseData[]
  progreso?: ModuloProgresoResponseData
  evaluacion?: EvaluacionResponseData
  expandido: boolean
}

const ESTADO_VARIANTE: Record<
  EstadoModulo,
  { variant: 'success' | 'warning' | 'neutral'; label: string }
> = {
  COMPLETADO: {
    variant: 'success',
    label: 'Completado',
  },
  EN_CURSO: {
    variant: 'warning',
    label: 'En progreso',
  },
  PENDIENTE: {
    variant: 'neutral',
    label: 'Sin iniciar',
  },
}

export default function CursoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const idCurso = Number(params?.idCurso)

  const [curso, setCurso] = useState<CursoDetalleResponseData | null>(null)
  const [modulos, setModulos] = useState<ModuloConLecciones[]>([])
  const [progresoCurso, setProgresoCurso] =
    useState<ProgresoCursoResponseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!idCurso) return

    cargarDatos()
  }, [idCurso])

  async function cargarDatos() {
    setLoading(true)
    setError('')

    const token = getToken()

    try {
      const [resCurso, resModulos, resProgreso] = await Promise.all([
        obtenerCursoPorIdSolicitud(idCurso, token),
        listarModulosPorCursoSolicitud(idCurso, token),
        obtenerMiProgresoSolicitud(token),
      ])

      const cursoData = resCurso.datos ?? null
      const modulosData = (resModulos.datos ?? []).sort(
        (a, b) => a.valOrden - b.valOrden,
      )
      const progresoLista: ProgresoCursoResponseData[] =
        resProgreso.datos ?? []
      const progresoDelCurso =
        progresoLista.find((p) => p.idCurso === idCurso) ?? null

      setCurso(cursoData)
      setProgresoCurso(progresoDelCurso)

      const modulosConTodo = await Promise.all(
        modulosData.map(async (modulo): Promise<ModuloConLecciones> => {
          const progresoModulo = progresoDelCurso?.modulos.find(
            (m) => m.idModulo === modulo.idModulo,
          )

          const [resLecciones, resEvals] = await Promise.allSettled([
            listarLeccionesPorModuloSolicitud(modulo.idModulo, token),
            listarEvaluacionesPorModuloSolicitud(modulo.idModulo, token),
          ])

          const lecciones =
            resLecciones.status === 'fulfilled'
              ? (resLecciones.value.datos ?? []).sort(
                  (a, b) => a.valOrden - b.valOrden,
                )
              : []

          if (resEvals.status === 'rejected') {
            console.warn(
              `[EVAL] Módulo ${modulo.idModulo} (${modulo.desNombre}):`,
              resEvals.reason,
            )
          }

          const evaluacion =
            resEvals.status === 'fulfilled'
              ? (resEvals.value.datos ?? []).find((e) => e.estActiva)
              : undefined

          return {
            ...modulo,
            lecciones,
            progreso: progresoModulo,
            evaluacion,
            expandido: false,
          }
        }),
      )

      setModulos(modulosConTodo)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'No se pudo cargar el curso.',
      )
    } finally {
      setLoading(false)
    }
  }

  function toggleModulo(idModulo: number) {
    setModulos((prev) =>
      prev.map((modulo) =>
        modulo.idModulo === idModulo
          ? { ...modulo, expandido: !modulo.expandido }
          : modulo,
      ),
    )
  }

  function irALeccion(
    leccion: LeccionDetalleResponseData,
    modulo: ModuloConLecciones,
  ) {
    router.push(
      `/visor-lecciones?leccion=${leccion.idLeccion}&modulo=${modulo.idModulo}&curso=${idCurso}`,
    )
  }

  function irAEvaluacion(
    evaluacion: EvaluacionResponseData,
    modulo: ModuloConLecciones,
  ) {
    router.push(
      `/sala-evaluacion?evaluacion=${evaluacion.idEvaluacion}&modulo=${modulo.idModulo}&curso=${idCurso}`,
    )
  }

  const porcentaje = progresoCurso?.porcentaje ?? 0
  const leccionesCompletadas = progresoCurso?.leccionesCompletadas ?? 0
  const totalLecciones = progresoCurso?.totalLeccionesObligatorias ?? 0

  return (
    <>
      <BarraLateral />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-50 text-gray-900">
        <header className="md:hidden bg-white border-b-2 border-black p-4 flex justify-between items-center">
          <span className="font-bold uppercase">[ LOGO ]</span>
          <button className="text-black">
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full pb-20">
          <button
            onClick={() => router.push('/catalogo-cursos')}
            className="flex items-center gap-2 text-sm font-bold uppercase text-gray-600 hover:text-black mb-6 transition-colors"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver al catálogo
          </button>

          {loading ? (
            <div className="border-2 border-black bg-white p-12 text-center text-sm font-bold uppercase text-gray-500">
              Cargando curso...
            </div>
          ) : error ? (
            <div className="border border-red-600 bg-red-50 p-4 text-sm font-bold uppercase text-red-700">
              {error}
            </div>
          ) : (
            <>
              <div className="mb-8 border-b-2 border-black pb-6">
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <Etiquetas variant="outline">{curso?.desNivel ?? ''}</Etiquetas>
                  {curso?.estPublicado ? (
                    <Etiquetas variant="neutral">Publicado</Etiquetas>
                  ) : null}
                </div>

                <h1 className="text-3xl font-bold uppercase text-black mb-2">
                  {curso?.desNombre}
                </h1>

                <p className="text-gray-700 leading-relaxed">
                  {curso?.desDescripcion}
                </p>
              </div>

              <div className="mb-8 bg-white border-2 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <h2 className="text-lg font-bold uppercase bg-black text-white inline-block px-3 py-1">
                    Tu Progreso
                  </h2>

                  <span className="text-sm font-bold uppercase text-gray-700">
                    {leccionesCompletadas} / {totalLecciones} lecciones
                    completadas
                  </span>
                </div>

                <div className="w-full border-2 border-black bg-gray-100 h-6 mb-2">
                  <div
                    className="bg-black h-full transition-all duration-500"
                    style={{ width: `${Math.min(porcentaje, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs font-bold uppercase text-gray-700">
                  <span>Inicio</span>
                  <span>{Math.round(porcentaje)}% completado</span>
                  <span>Meta: 100%</span>
                </div>
              </div>

              <h2 className="text-xl font-bold uppercase mb-4 bg-black text-white inline-block px-3 py-1">
                Módulos del Curso
              </h2>

              {modulos.length === 0 ? (
                <div className="border-2 border-dashed border-gray-400 bg-white p-8 text-center text-sm font-bold uppercase text-gray-500">
                  Este curso aún no tiene módulos publicados.
                </div>
              ) : (
                <div className="space-y-4">
                  {modulos.map((modulo, idx) => {
                    const estadoInfo =
                      (modulo.progreso
                        ? ESTADO_VARIANTE[modulo.progreso.estado]
                        : undefined) ?? ESTADO_VARIANTE.PENDIENTE

                    const completadas = modulo.progreso?.completadas ?? 0
                    const total = modulo.progreso?.total ?? 0
                    const pctModulo =
                      total > 0 ? Math.round((completadas / total) * 100) : 0

                    const todasLeccionesListas =
                      total === 0 || (total > 0 && completadas >= total)

                    const moduloListo =
                      modulo.progreso?.estado === 'COMPLETADO'

                    const moduloAnterior = idx > 0 ? modulos[idx - 1] : null
                    const bloqueado =
                      idx > 0 &&
                      moduloAnterior?.progreso?.estado !== 'COMPLETADO'

                    return (
                      <div
                        key={modulo.idModulo}
                        className={`border-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-colors ${
                          bloqueado
                            ? 'bg-gray-50 border-gray-300'
                            : 'bg-white border-black'
                        }`}
                      >
                        <button
                          onClick={() =>
                            !bloqueado && toggleModulo(modulo.idModulo)
                          }
                          className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
                            bloqueado
                              ? 'cursor-not-allowed'
                              : 'hover:bg-gray-50 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span
                              className={`w-8 h-8 border-2 flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                                bloqueado
                                  ? 'border-gray-300 bg-gray-100 text-gray-400'
                                  : moduloListo
                                    ? 'bg-black text-white border-black'
                                    : 'border-black text-black'
                              }`}
                            >
                              {bloqueado ? (
                                <i className="fa-solid fa-lock text-xs"></i>
                              ) : moduloListo ? (
                                <i className="fa-solid fa-check text-xs"></i>
                              ) : (
                                idx + 1
                              )}
                            </span>

                            <div>
                              <p
                                className={`font-bold uppercase ${
                                  bloqueado ? 'text-gray-400' : 'text-black'
                                }`}
                              >
                                {modulo.desNombre}
                              </p>

                              <p
                                className={`text-xs mt-0.5 ${
                                  bloqueado ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                {bloqueado
                                  ? 'Completa el módulo anterior para desbloquear'
                                  : modulo.desDescripcion}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                            {bloqueado ? (
                              <span className="hidden md:block text-xs font-bold uppercase text-gray-400 border border-gray-300 px-2 py-1">
                                Bloqueado
                              </span>
                            ) : (
                              <div className="hidden md:flex items-center gap-3">
                                <Etiquetas variant={estadoInfo.variant}>
                                  {estadoInfo.label}
                                </Etiquetas>

                                {total > 0 ? (
                                  <span className="text-xs font-bold uppercase text-gray-600">
                                    {completadas}/{total}
                                  </span>
                                ) : null}
                              </div>
                            )}

                            {!bloqueado ? (
                              <i
                                className={`fa-solid fa-chevron-${
                                  modulo.expandido ? 'up' : 'down'
                                } text-gray-600`}
                              ></i>
                            ) : null}
                          </div>
                        </button>

                        {!bloqueado && total > 0 ? (
                          <div className="px-5 pb-1">
                            <div className="w-full border border-gray-300 bg-gray-100 h-1.5">
                              <div
                                className="bg-black h-full transition-all duration-500"
                                style={{ width: `${pctModulo}%` }}
                              />
                            </div>
                          </div>
                        ) : null}

                        {!bloqueado && modulo.expandido ? (
                          <div className="border-t-2 border-dashed border-gray-300">
                            {modulo.lecciones.length === 0 &&
                            !modulo.evaluacion ? (
                              <p className="p-5 text-xs font-bold uppercase text-gray-500">
                                Sin lecciones publicadas.
                              </p>
                            ) : (
                              <ul className="divide-y divide-dashed divide-gray-300">
                                {modulo.lecciones.map((leccion) => (
                                  <li key={leccion.idLeccion}>
                                    <button
                                      onClick={() =>
                                        irALeccion(leccion, modulo)
                                      }
                                      className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <i className="fa-regular fa-file-lines text-gray-500 group-hover:text-black transition-colors"></i>

                                        <span className="text-sm font-bold text-gray-800 group-hover:text-black transition-colors">
                                          {leccion.desNombre}
                                        </span>

                                        {leccion.estObligatoria ? (
                                          <span className="text-xs border border-gray-400 px-1 text-gray-500 uppercase font-bold">
                                            Obligatoria
                                          </span>
                                        ) : null}
                                      </div>

                                      <i className="fa-solid fa-arrow-right text-xs text-gray-400 group-hover:text-black transition-colors"></i>
                                    </button>
                                  </li>
                                ))}

                                {modulo.evaluacion ? (
                                  <li
                                    className={`border-t-2 ${
                                      todasLeccionesListas
                                        ? 'border-black bg-black/[0.03]'
                                        : 'border-dashed border-gray-300 bg-gray-50'
                                    }`}
                                  >
                                    {todasLeccionesListas ? (
                                      <button
                                        onClick={() =>
                                          irAEvaluacion(
                                            modulo.evaluacion!,
                                            modulo,
                                          )
                                        }
                                        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-black/[0.06] transition-colors group"
                                      >
                                        <div className="flex items-center gap-3">
                                          <i className="fa-solid fa-clipboard-check text-black"></i>

                                          <span className="text-sm font-bold uppercase text-black">
                                            {modulo.evaluacion.desTitulo}
                                          </span>

                                          <span className="text-xs border-2 border-black px-1 text-black uppercase font-bold">
                                            Test Final
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs font-bold uppercase text-gray-600">
                                          {modulo.evaluacion
                                            .valPuntajeMinimo != null ? (
                                            <span className="hidden sm:block">
                                              Mín:{' '}
                                              {
                                                modulo.evaluacion
                                                  .valPuntajeMinimo
                                              }{' '}
                                              pts
                                            </span>
                                          ) : null}

                                          <i className="fa-solid fa-arrow-right text-black"></i>
                                        </div>
                                      </button>
                                    ) : (
                                      <div className="flex items-center justify-between px-5 py-3 cursor-not-allowed">
                                        <div className="flex items-center gap-3">
                                          <i className="fa-solid fa-lock text-gray-400"></i>

                                          <span className="text-sm font-bold uppercase text-gray-400">
                                            {modulo.evaluacion.desTitulo}
                                          </span>

                                          <span className="text-xs border border-gray-300 px-1 text-gray-400 uppercase font-bold">
                                            Test Final
                                          </span>
                                        </div>

                                        <span className="text-xs font-bold uppercase text-gray-400 hidden sm:block">
                                          Completa las lecciones
                                        </span>
                                      </div>
                                    )}
                                  </li>
                                ) : null}
                              </ul>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
