'use client'

import React, { useState } from 'react'
import Boton from '../componentes/Boton'
import Tabla, { TablaColumn, TablaRow } from '../componentes/Tabla'
import ZonaArrastre from '../componentes/ZonaArrastre'
import BarraLateral from '../componentes/BarraLateral'
import {
  cargarAlumnosMasivamenteSolicitud,
  CargaMasivaResponseData,
} from '../../lib/api/login/usuarios'
import Link from 'next/link'

const columnasErrores: TablaColumn[] = [
  { key: 'fila', label: 'Fila', className: 'text-center w-16' },
  { key: 'dato', label: 'Dato Afectado' },
  { key: 'motivo', label: 'Motivo del Rechazo' },
]

const filasErrores: TablaRow[] = [
  {
    id: 1,
    fila: <span className="text-gray-900 font-bold">45</span>,
    dato: <span className="text-gray-900 font-bold">jlopez@colegio.edu.pe</span>,
    motivo: <span className="text-gray-700 font-bold">Correo electrónico duplicado.</span>,
  },
  {
    id: 2,
    fila: <span className="text-gray-900 font-bold">112</span>,
    dato: <span className="text-gray-900 font-bold">[ Celda Vacía ]</span>,
    motivo: <span className="text-gray-700 font-bold">Falta el campo obligatorio: Nombres.</span>,
  },
]

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? ''
}

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [report, setReport] = useState<CargaMasivaResponseData | null>(null)
  const [processError, setProcessError] = useState('')
  const [processing, setProcessing] = useState(false)

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleFileSelected = (file: File) => {
    setSelectedFile(file)
    setReport(null)
    setProcessError('')
  }

  const handleProcessFile = async () => {
    if (!selectedFile) {
      setProcessError('Seleccione un archivo XLSX o CSV antes de procesar.')
      return
    }

    setProcessing(true)
    setProcessError('')

    try {
      const result = await cargarAlumnosMasivamenteSolicitud(
        selectedFile,
        getToken(),
      )

      if (result.exito) {
        setReport(result.datos ?? null)
      } else {
        setProcessError(result.mensaje || 'No se pudo procesar el archivo.')
        setReport(null)
      }
    } catch (error) {
      setProcessError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al procesar el archivo.',
      )
      setReport(null)
    } finally {
      setProcessing(false)
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
          <div className="text-xs font-bold uppercase text-gray-700 mb-6 tracking-widest">
            <Link href="/gestion-usuarios" className="hover:text-black hover:underline cursor-pointer">
              Gestión de Usuarios
            </Link>
            <i className="fa-solid fa-angle-right mx-2 text-black"></i>
            <span className="text-black border-b-2 border-black">Carga Masiva</span>
          </div>

          <div className="mb-8 border-b-4 border-black pb-4">
            <h1 className="text-3xl font-bold uppercase text-gray-900">
              Carga Masiva de Alumnos
            </h1>
            <p className="text-gray-700 font-bold uppercase mt-2 text-sm tracking-widest">
              Importación de registros mediante Excel o CSV
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10">
            <div className="flex flex-col gap-6">
              <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-gray-900">
                <h2 className="text-lg font-bold uppercase mb-2 text-gray-900">
                  Paso 1: Descargar Plantilla
                </h2>
                <p className="text-xs font-bold text-gray-700 uppercase mb-4 leading-relaxed">
                  Asegúrese de utilizar el formato oficial. Las columnas obligatorias son:
                  nombres, apellidos, correo y rol.
                </p>

                <Boton
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.97]"
                >
                  Descargar Plantilla
                </Boton>
              </div>

              <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-gray-900">
                <h2 className="text-lg font-bold uppercase mb-4 text-gray-900">
                  Paso 2: Subir Archivo
                </h2>

                <div className="mb-4">
                  <ZonaArrastre onFileSelected={handleFileSelected} />
                </div>

                {selectedFile && (
                  <div className="bg-gray-200 border-2 border-black p-3 flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center mr-3 font-bold text-xs">
                        {selectedFile?.name.split('.').pop()?.toUpperCase() ?? 'FILE'}
                      </div>
                      <div>
                        <p className="font-bold text-sm uppercase truncate max-w-xs">
                          {selectedFile?.name ?? 'Sin archivo seleccionado'}
                        </p>
                        <p className="text-xs text-gray-600 font-bold uppercase">
                          {selectedFile ? formatFileSize(selectedFile.size) : '0 KB'}
                        </p>
                      </div>
                    </div>

                    <button
                      className="text-gray-500 hover:text-black text-xs font-bold uppercase"
                      type="button"
                      onClick={() => setSelectedFile(null)}
                    >
                      Quitar
                    </button>
                  </div>
                )}

                <Boton
                  variant="primary"
                  size="md"
                  fullWidth
                  type="button"
                  onClick={handleProcessFile}
                  disabled={!selectedFile || processing}
                >
                  {processing ? 'Procesando...' : 'Procesar Archivo'}
                </Boton>
                {processError ? (
                  <div className="mt-4 rounded border border-red-500 bg-red-50 p-3 text-sm font-bold uppercase text-red-700">
                    {processError}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="bg-gray-100 border-4 border-black p-6 relative text-gray-900">
              <div className="absolute -top-4 -right-4 bg-black text-white px-4 py-1 text-xs font-bold uppercase border-2 border-black z-10">
                Log de Procesamiento
              </div>

              <h2 className="text-xl font-bold uppercase mb-2 border-b-2 border-black pb-2 text-gray-900">
                Reporte de Carga
              </h2>
              <p className="text-xs font-bold text-gray-500 uppercase mb-6">
                Archivo: {selectedFile?.name ?? 'Ninguno'}
                {report ? ` | Procesado a las ${new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}` : ''}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border-2 border-black p-3 text-center text-gray-900">
                  <p className="text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Filas Leídas
                  </p>
                  <p className="text-2xl font-bold">{report?.totalProcesados ?? 0}</p>
                </div>

                <div className="bg-white border-2 border-black border-b-4 p-3 text-center text-gray-900">
                  <p className="text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Registrados
                  </p>
                  <p className="text-2xl font-bold">{report?.exitosos ?? 0}</p>
                </div>

                <div className="bg-black text-white border-2 border-black p-3 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Errores</p>
                  <p className="text-2xl font-bold">{report?.fallidos ?? 0}</p>
                </div>
              </div>

              <div className="bg-white border-2 border-dashed border-gray-400 p-4 mb-6 text-center">
                <p className="font-bold uppercase text-sm mb-2">
                  {report
                    ? `${report.exitosos} usuarios creados con éxito.`
                    : 'Aún no se ha procesado un archivo.'}
                </p>
                <p className="text-xs text-gray-500 font-bold uppercase mb-4">
                  {report
                    ? 'Las credenciales temporales han sido generadas.'
                    : 'Suba un archivo XLSX o CSV y presione Procesar Archivo.'}
                </p>

                <Boton
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.97]"
                  disabled={!report?.credenciales?.length}
                >
                  Descargar Credenciales
                </Boton>
              </div>

              <h3 className="font-bold uppercase text-sm mb-3 bg-black text-white inline-block px-2 py-1">
                Detalle de Errores ({report?.fallidos ?? 2})
              </h3>

              <div className="bg-white border-2 border-black overflow-hidden text-gray-900">
                <Tabla
                  columns={columnasErrores}
                  rows={
                    report
                      ? report.errores.map((errorItem, index) => ({
                        id: index + 1,
                        fila: `${errorItem.fila}`,
                        dato: errorItem.correo,
                        motivo: <span className="text-gray-600">{errorItem.motivo}</span>,
                      }))
                      : filasErrores
                  }
                  className="max-w-none mx-0 space-y-0"
                />
              </div>

              <p className="text-[10px] font-bold text-gray-700 uppercase mt-4 text-center">
                Corrija los errores en su archivo local y vuelva a subir únicamente las filas
                rechazadas.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
