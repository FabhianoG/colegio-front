"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Boton from '../componentes/Boton'
import Etiquetas from '../componentes/Etiquetas'
import TarjetaEstadistica from '../componentes/TarjetaEstadistica'
import BarraLateral from '../componentes/BarraLateral'
import {
  obtenerMiProgresoSolicitud,
  ProgresoCursoResponseData,
  EstadoModulo,
} from '../../lib/api/login/progreso'

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? ''
}

const ESTADO_VARIANTE: Record<EstadoModulo, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
  COMPLETADO: { variant: 'success', label: 'Completado' },
  EN_CURSO:   { variant: 'warning', label: 'En progreso' },
  PENDIENTE:  { variant: 'neutral', label: 'Sin iniciar' },
}

export default function DashboardAlumnoPage() {
  const router = useRouter()
  const [progresoCursos, setProgresoCursos] = useState<ProgresoCursoResponseData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = getToken()
    obtenerMiProgresoSolicitud(token)
      .then((res) => setProgresoCursos(res.datos ?? []))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Error al cargar el progreso.'),
      )
      .finally(() => setLoading(false))
  }, [])

  // Estadísticas globales agregadas de todos los cursos
  const totalLecciones = progresoCursos.reduce((s, c) => s + (c.totalLeccionesObligatorias ?? 0), 0)
  const totalCompletadas = progresoCursos.reduce((s, c) => s + (c.leccionesCompletadas ?? 0), 0)
  const porcentajeGlobal = totalLecciones > 0 ? Math.round((totalCompletadas / totalLecciones) * 100) : 0

  // Si hay un único curso activo, usarlo como "curso principal"; si hay varios, mostrar resumen
  const cursoActivo = progresoCursos.find((c) => c.porcentaje > 0 && c.porcentaje < 100)
    ?? progresoCursos[0]
    ?? null

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
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black pb-4 gap-4">
            <div>
              <h1 className="text-3xl font-bold uppercase text-black">Mi Progreso</h1>
              <p className="text-gray-700 mt-2 text-sm font-bold uppercase tracking-widest">
                Visualización de avance general, módulos y calificaciones
              </p>
            </div>

            {!loading && (
              <div className="hidden sm:block">
                <Etiquetas variant="neutral">Progreso actual: {porcentajeGlobal}%</Etiquetas>
              </div>
            )}
          </div>

          {loading ? (
            <div className="border-2 border-black bg-white p-12 text-center text-sm font-bold uppercase text-gray-500">
              Cargando progreso...
            </div>
          ) : error ? (
            <div className="mb-6 rounded border border-red-600 bg-red-50 p-4 text-sm font-bold uppercase text-red-700">
              {error}
            </div>
          ) : (
            <>
              {/* Estadísticas globales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <TarjetaEstadistica
                  title="Avance Total"
                  value={`${porcentajeGlobal}%`}
                  icon="fa-solid fa-chart-line"
                />
                <TarjetaEstadistica
                  title="Lecciones Completadas"
                  value={`${totalCompletadas} / ${totalLecciones}`}
                  icon="fa-solid fa-book-open"
                />
                <TarjetaEstadistica
                  title="Cursos Activos"
                  value={String(progresoCursos.length)}
                  icon="fa-solid fa-graduation-cap"
                />
              </div>

              {/* Barra de progreso global */}
              {cursoActivo && (
                <div className="mb-10 bg-white border-2 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <h2 className="text-xl font-bold uppercase bg-black text-white inline-block px-3 py-1">
                      {progresoCursos.length === 1 ? cursoActivo.nombreCurso : 'Resumen de Progreso'}
                    </h2>
                    {porcentajeGlobal < 100 ? (
                      <p className="text-xs font-bold uppercase text-gray-700">
                        Aún no alcanzas el 100% para habilitar la descarga de constancia.
                      </p>
                    ) : (
                      <p className="text-xs font-bold uppercase text-green-700">
                        ¡Felicidades! Has completado todos tus cursos.
                      </p>
                    )}
                  </div>

                  <div className="w-full border-2 border-black bg-gray-100 h-6">
                    <div
                      className="bg-black h-full transition-all duration-700"
                      style={{ width: `${porcentajeGlobal}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between mt-2 text-xs font-bold uppercase text-gray-700">
                    <span>Inicio</span>
                    <span>{porcentajeGlobal}% completado</span>
                    <span>Meta: 100%</span>
                  </div>
                </div>
              )}

              {/* Cursos y módulos */}
              {progresoCursos.length === 0 ? (
                <div className="border-2 border-dashed border-gray-400 bg-white p-10 text-center">
                  <p className="text-sm font-bold uppercase text-gray-600 mb-4">
                    No tienes cursos asignados aún.
                  </p>
                  <Boton
                    variant="primary"
                    size="sm"
                    onClick={() => router.push('/catalogo-cursos')}
                  >
                    Ver catálogo
                  </Boton>
                </div>
              ) : (
                progresoCursos.map((curso) => {
                  const pct = Math.round(curso.porcentaje ?? 0)

                  return (
                    <div key={curso.idCurso} className="mb-10">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
                        <h2 className="text-xl font-bold uppercase bg-black text-white inline-block px-3 py-1">
                          {curso.nombreCurso}
                        </h2>
                        <Boton
                          variant="wire"
                          size="sm"
                          onClick={() => router.push(`/curso/${curso.idCurso}`)}
                          icon={<i className="fa-solid fa-arrow-right text-xs"></i>}
                          iconPosition="right"
                        >
                          Ir al curso
                        </Boton>
                      </div>

                      {/* Barra del curso */}
                      <div className="bg-white border-2 border-black p-4 mb-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                        <div className="flex justify-between text-xs font-bold uppercase text-gray-700 mb-2">
                          <span>{curso.leccionesCompletadas} / {curso.totalLeccionesObligatorias} lecciones</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full border-2 border-black bg-gray-100 h-4">
                          <div
                            className="bg-black h-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Módulos del curso */}
                      {curso.modulos && curso.modulos.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {curso.modulos.map((modulo) => {
                            const estadoInfo = ESTADO_VARIANTE[modulo.estado ?? 'PENDIENTE'] ?? ESTADO_VARIANTE.PENDIENTE
                            const pctModulo = modulo.total > 0
                              ? Math.round((modulo.completadas / modulo.total) * 100)
                              : 0

                            const estaEnCurso = modulo.estado === 'EN_CURSO'
                            const estaCompletado = modulo.estado === 'COMPLETADO'
                            const estaBloqueado = modulo.estado === 'PENDIENTE'

                            return (
                              <div
                                key={modulo.idModulo}
                                className={`border-2 p-5 relative flex flex-col gap-3 ${
                                  estaEnCurso
                                    ? 'bg-gray-200 border-black border-4 transform scale-[1.02] shadow-[8px_8px_0_0_rgba(0,0,0,1)]'
                                    : estaCompletado
                                    ? 'bg-white border-black'
                                    : 'bg-gray-50 border-dashed border-gray-400 opacity-70'
                                }`}
                              >
                                {estaEnCurso && (
                                  <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-2 py-1 uppercase">
                                    En curso
                                  </div>
                                )}

                                <div className="mt-2">
                                  <Etiquetas variant={estadoInfo.variant}>{estadoInfo.label}</Etiquetas>
                                  <h3 className={`font-bold text-base uppercase mt-2 ${estaBloqueado ? 'text-gray-500' : 'text-black'}`}>
                                    {modulo.nombre}
                                  </h3>
                                </div>

                                {!estaBloqueado && modulo.total > 0 && (
                                  <>
                                    <div className="w-full border-2 border-black bg-white h-3">
                                      <div
                                        className="bg-black h-full"
                                        style={{ width: `${pctModulo}%` }}
                                      ></div>
                                    </div>
                                    <p className="text-[10px] font-bold uppercase text-gray-700">
                                      {modulo.completadas}/{modulo.total} lecciones — {pctModulo}%
                                    </p>
                                  </>
                                )}

                                {estaBloqueado ? (
                                  <div className="w-full py-2 border-2 border-gray-300 text-gray-500 text-center text-xs font-bold uppercase bg-white">
                                    Sin iniciar
                                  </div>
                                ) : (
                                  <Boton
                                    variant={estaCompletado ? 'ghost' : 'primary'}
                                    size="sm"
                                    fullWidth
                                    onClick={() => router.push(`/curso/${curso.idCurso}`)}
                                  >
                                    {estaCompletado ? 'Repasar' : 'Continuar'}
                                  </Boton>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })
              )}

              <div className="mt-8 bg-white border-2 border-dashed border-gray-400 p-5 text-center">
                <p className="text-xs font-bold uppercase text-gray-700 leading-relaxed">
                  Si completas todos los módulos y alcanzas el 100% de progreso, el sistema podrá
                  habilitar la descarga de tu constancia o diploma.
                </p>
              </div>
            </>
          )}

          <footer className="mt-12 pt-6 border-t-2 border-black text-center text-sm font-bold uppercase text-gray-600 mb-8">
            [ FOOTER DEL SISTEMA ]
          </footer>
        </div>
      </main>
    </>
  )
}
