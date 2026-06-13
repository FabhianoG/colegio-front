"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Boton from '../componentes/Boton'
import CampoTexto from '../componentes/CampoTexto'
import CampoSelect from '../componentes/CampoSelect'
import Etiquetas from '../componentes/Etiquetas'
import BarraLateral from '../componentes/BarraLateral'
import { CursoDetalleResponseData, listarMisCursosSolicitud } from '../../lib/api/login/cursos'

const PAGE_SIZE = 6

const Page = () => {
  const router = useRouter()
  const [cursos, setCursos] = useState<CursoDetalleResponseData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const [orden, setOrden] = useState('Recientes')
  const [paginaActual, setPaginaActual] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalElementos, setTotalElementos] = useState(0)

  const getToken = (): string => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? ''
  }

  const getSortParam = () => {
    if (orden === 'Alfabético') return ['desNombre,asc']
    return ['fecCreacion,desc']
  }

  const cargarCursos = async (pageNumber = 0) => {
    setLoading(true)
    setError('')

    try {
      const response = await listarMisCursosSolicitud(
        { page: pageNumber, size: PAGE_SIZE, sort: getSortParam() },
        getToken(),
      )
      const datos = response.datos
      if (datos && Array.isArray(datos.content)) {
        setCursos(datos.content)
        setTotalElementos(datos.totalElements)
        setTotalPaginas(datos.totalPages)
        setPaginaActual(datos.number)
      } else {
        setCursos([])
        setTotalElementos(0)
        setTotalPaginas(1)
        setPaginaActual(0)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar los cursos.')
      setCursos([])
      setTotalElementos(0)
      setTotalPaginas(1)
      setPaginaActual(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarCursos(0)
  }, [])

  useEffect(() => {
    cargarCursos(0)
  }, [orden])

  const categoriasDisponibles = Array.from(new Set(cursos.map((curso) => curso.desNivel)))
  const cursosFiltrados = cursos.filter((curso) => {
    const term = busqueda.trim().toLowerCase()
    const matchesTexto =
      term === '' ||
      curso.desNombre.toLowerCase().includes(term) ||
      curso.desDescripcion.toLowerCase().includes(term)

    const matchesCategoria = categoria === '' || curso.desNivel === categoria
    return matchesTexto && matchesCategoria
  })

  const cursosOrdenados = [...cursosFiltrados].sort((a, b) => {
    if (orden === 'Alfabético') {
      return a.desNombre.localeCompare(b.desNombre)
    }

    if (orden === 'Progreso') {
      return 0
    }

    return 0
  })

  const inicio = totalElementos === 0 ? 0 : paginaActual * PAGE_SIZE + 1
  const fin = Math.min((paginaActual + 1) * PAGE_SIZE, totalElementos)

  const paginasVisibles = Array.from({ length: Math.max(1, totalPaginas) }, (_, i) => i)

  const handlePageClick = (pageNumber: number) => {
    if (pageNumber !== paginaActual) {
      cargarCursos(pageNumber)
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

        <div className="p-8 max-w-7xl mx-auto w-full pb-20">
          <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end border-b-2 border-black pb-4">
            <div>
              <h1 className="text-3xl font-bold uppercase text-gray-900">Catálogo de Cursos</h1>
              <p className="text-gray-700 mt-2 text-sm font-bold uppercase tracking-widest">
                Cursos habilitados para tu nivel académico
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8 text-gray-900">
            <div className="flex-1">
              <CampoTexto
                field={{
                  type: 'search',
                  name: 'buscarCurso',
                  label: 'Buscar curso',
                  placeholder: 'BUSCAR CURSO POR NOMBRE O TEMA...',
                  icon: 'fa-solid fa-search',
                }}
                value={busqueda}
                onChange={(_, v) => setBusqueda(v)}
              />
            </div>

            <div className="md:w-72">
              <CampoSelect
                field={{
                  type: 'select',
                  name: 'categoria',
                  label: 'Categoría',
                  options: ['', ...categoriasDisponibles],
                }}
                value={categoria}
                onChange={(_, v) => setCategoria(v)}
              />
            </div>

            <div className="md:w-72">
              <CampoSelect
                field={{
                  type: 'select',
                  name: 'orden',
                  label: 'Ordenar por',
                  options: ['Recientes', 'Alfabético'],
                }}
                value={orden}
                onChange={(_, v) => setOrden(v)}
              />
            </div>
          </div>

          {error ? (
            <div className="mb-6 rounded border border-red-600 bg-red-50 p-4 text-sm font-bold uppercase text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
            {loading ? (
              <div className="col-span-full rounded border-2 border-black bg-white p-12 text-center text-sm font-bold uppercase text-gray-500">
                Cargando cursos...
              </div>
            ) : cursosOrdenados.length === 0 ? (
              <div className="col-span-full rounded border-2 border-black bg-white p-12 text-center text-sm font-bold uppercase text-gray-500">
                No se encontraron cursos.
              </div>
            ) : (
              cursosOrdenados.map((curso) => (
                <div key={curso.idCurso} className="bg-white border-2 border-black flex flex-col text-gray-900 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all duration-200 group">
                  <div className="h-40 border-b-2 border-black bg-gray-200 flex items-center justify-center overflow-hidden relative">
                    <i className="fa-solid fa-laptop-code text-4xl text-gray-700 group-hover:scale-110 transition-transform"></i>
                    <div className="absolute top-4 right-4">
                      <Etiquetas variant={curso.estPublicado ? 'neutral' : 'warning'}>
                        {curso.estPublicado ? 'Publicado' : 'Borrador'}
                      </Etiquetas>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col text-gray-900">
                    <div className="flex justify-between items-center mb-3 gap-2">
                      <Etiquetas variant="outline">{curso.desNivel}</Etiquetas>
                      <span className="text-xs font-bold text-gray-700 uppercase">{curso.idNivel} Nivel</span>
                    </div>

                    <h3 className="font-bold text-xl uppercase mb-2 text-gray-900">
                      {curso.desNombre}
                    </h3>

                    <p className="text-sm text-gray-700 mb-6 flex-1 leading-relaxed">
                      {curso.desDescripcion}
                    </p>

                    <div className="border-t-2 border-dashed border-gray-400 pt-4 flex flex-col gap-3">
                      <div className="flex items-center space-x-2 text-xs font-bold uppercase text-gray-700">
                        <i className="fa-solid fa-chalkboard-user"></i>
                        <span>Estado: {curso.estActivo ? 'Activo' : 'Inactivo'}</span>
                      </div>

                      <Boton
                        variant="primary"
                        size="sm"
                        fullWidth
                        className="cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.97]"
                        onClick={() => router.push(`/curso/${curso.idCurso}`)}
                      >
                        Ingresar al Curso
                      </Boton>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
            <button
              type="button"
              onClick={() => handlePageClick(paginaActual - 1)}
              disabled={paginaActual === 0}
              className="border-2 border-black px-3 py-2 font-bold uppercase text-sm hover:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {paginasVisibles.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePageClick(p)}
                className={`border-2 px-3 py-2 font-bold text-sm ${p === paginaActual ? 'bg-black text-white border-black cursor-default' : 'border-black hover:bg-gray-200'}`}
              >
                {p + 1}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handlePageClick(paginaActual + 1)}
              disabled={paginaActual >= totalPaginas - 1}
              className="border-2 border-black px-3 py-2 font-bold uppercase text-sm hover:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

export default Page