import { buildHeaders, LoginResponse } from './auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// ─── Tipos de respuesta ───────────────────────────────────────────────────────

export interface EvaluacionResponseData {
  idEvaluacion: number
  idModulo: number
  nombreModulo: string
  desTitulo: string
  desInstrucciones: string | null
  valPuntajeMinimo: number
  valTiempoLimite: number | null
  valMaxIntentos: number | null
  estActiva: boolean
  fecCreacion: string
}

export interface OpcionParaRendirResponseData {
  idOpcion: number
  desOpcion: string
  valOrden: number
}

export interface PreguntaParaRendirResponseData {
  idPregunta: number
  codTipo: string        // 'OPCION_MULTIPLE' | 'VERDADERO_FALSO' | ...
  desEnunciado: string
  valOrden: number
  valPuntaje: number
  opciones: OpcionParaRendirResponseData[]
}

export interface RespuestaActualResponseData {
  idPregunta: number
  idOpcionElegida: number | null
  desRespuestaTexto: string | null
}

export interface IntentoEnCursoResponseData {
  idIntento: number
  idEvaluacion: number
  tituloEvaluacion: string
  desInstrucciones: string | null
  valPuntajeMinimo: number
  numIntento: number
  minutosRestantes: number | null
  fecInicio: string
  preguntas: PreguntaParaRendirResponseData[]
  misRespuestas: RespuestaActualResponseData[]
}

export interface IntentoFinalizadoResponseData {
  idIntento: number
  idEvaluacion: number
  tituloEvaluacion: string
  valCalificacion: number
  valPuntajeMinimo: number
  estAprobado: boolean
  numIntento: number
  fecInicio: string
  fecFin: string
}

export interface IntentoHistorialItemResponseData {
  idIntento: number
  numIntento: number
  valCalificacion: number
  estAprobado: boolean
  estCompletado: boolean
  fecInicio: string
  fecFin: string | null
}

export interface OpcionRespuestaResponseData {
  idOpcion: number
  desOpcion: string
  valOrden: number
  esCorrecta: boolean
}

export interface PreguntaRevisionResponseData {
  idPregunta: number
  codTipo: string
  desEnunciado: string
  valPuntaje: number
  miOpcionElegidaId: number | null
  miRespuestaTexto: string | null
  miRespuestaCorrecta: boolean | null
  opciones: OpcionRespuestaResponseData[]
}

export interface IntentoRevisionResponseData {
  idIntento: number
  idEvaluacion: number
  tituloEvaluacion: string
  valCalificacion: number
  valPuntajeMinimo: number
  estAprobado: boolean
  numIntento: number
  fecInicio: string
  fecFin: string
  preguntas: PreguntaRevisionResponseData[]
}

export interface RespuestaAlumnoRequestData {
  idOpcionElegida: number | null
  desRespuestaTexto: string | null
}

// ─── Funciones de API ─────────────────────────────────────────────────────────

export async function listarEvaluacionesPorModuloSolicitud(
  idModulo: number,
  token?: string,
): Promise<LoginResponse<EvaluacionResponseData[]>> {
  const response = await fetch(`${BASE_URL}/evaluaciones/modulo/${idModulo}`, {
    method: 'GET',
    headers: buildHeaders(token),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error al listar evaluaciones: ${response.status} - ${errorText}`)
  }
  return response.json()
}

export async function iniciarIntentoSolicitud(
  idEvaluacion: number,
  token?: string,
): Promise<LoginResponse<IntentoEnCursoResponseData>> {
  const response = await fetch(`${BASE_URL}/intentos/evaluacion/${idEvaluacion}/iniciar`, {
    method: 'POST',
    headers: buildHeaders(token),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error al iniciar intento: ${response.status} - ${errorText}`)
  }
  return response.json()
}

export async function obtenerIntentoEnCursoSolicitud(
  idIntento: number,
  token?: string,
): Promise<LoginResponse<IntentoEnCursoResponseData>> {
  const response = await fetch(`${BASE_URL}/intentos/${idIntento}`, {
    method: 'GET',
    headers: buildHeaders(token),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error al obtener intento: ${response.status} - ${errorText}`)
  }
  return response.json()
}

export async function guardarRespuestaSolicitud(
  idIntento: number,
  idPregunta: number,
  data: RespuestaAlumnoRequestData,
  token?: string,
): Promise<LoginResponse<void>> {
  const response = await fetch(`${BASE_URL}/intentos/${idIntento}/pregunta/${idPregunta}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error al guardar respuesta: ${response.status} - ${errorText}`)
  }
  return response.json()
}

export async function finalizarIntentoSolicitud(
  idIntento: number,
  token?: string,
): Promise<LoginResponse<IntentoFinalizadoResponseData>> {
  const response = await fetch(`${BASE_URL}/intentos/${idIntento}/finalizar`, {
    method: 'POST',
    headers: buildHeaders(token),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error al finalizar intento: ${response.status} - ${errorText}`)
  }
  return response.json()
}

export async function obtenerRevisionSolicitud(
  idIntento: number,
  token?: string,
): Promise<LoginResponse<IntentoRevisionResponseData>> {
  const response = await fetch(`${BASE_URL}/intentos/${idIntento}/revision`, {
    method: 'GET',
    headers: buildHeaders(token),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error al obtener revisión: ${response.status} - ${errorText}`)
  }
  return response.json()
}

export async function obtenerHistorialSolicitud(
  idEvaluacion: number,
  token?: string,
): Promise<LoginResponse<IntentoHistorialItemResponseData[]>> {
  const response = await fetch(`${BASE_URL}/intentos/evaluacion/${idEvaluacion}/historial`, {
    method: 'GET',
    headers: buildHeaders(token),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error al obtener historial: ${response.status} - ${errorText}`)
  }
  return response.json()
}
