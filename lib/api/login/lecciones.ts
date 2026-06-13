import { LoginResponse } from './auth'

export interface LeccionDetalleResponseData {
  idLeccion: number
  idModulo: number
  desModulo: string
  desNombre: string
  desContenido: string
  valOrden: number
  estObligatoria: boolean
  estPublicada: boolean
  estActiva: boolean
  fecCreacion: string
  fecPublicacion: string
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const LECCIONES_PATH = '/lecciones'

export async function obtenerLeccionPorIdSolicitud(
  idLeccion: number,
  token?: string,
): Promise<LoginResponse<LeccionDetalleResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${LECCIONES_PATH}/${idLeccion}`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al obtener lección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export interface ActualizarLeccionData {
  idModulo: number
  desNombre: string
  desContenido: string
  valOrden: number
  estObligatoria: boolean
}

export interface CrearLeccionData {
  idModulo: number
  desNombre: string
  desContenido: string
  valOrden: number
  estObligatoria: boolean
}

export async function crearLeccionSolicitud(
  data: CrearLeccionData,
  token?: string,
): Promise<LoginResponse<LeccionDetalleResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${LECCIONES_PATH}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al crear lección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function actualizarLeccionSolicitud(
  idLeccion: number,
  data: ActualizarLeccionData,
  token?: string,
): Promise<LoginResponse<LeccionDetalleResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${LECCIONES_PATH}/${idLeccion}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al actualizar lección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function eliminarLeccionSolicitud(
  idLeccion: number,
  token?: string,
): Promise<LoginResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${LECCIONES_PATH}/${idLeccion}`, {
    method: 'DELETE',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al eliminar lección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function listarLeccionesPorModuloSolicitud(
  idModulo: number,
  token?: string,
): Promise<LoginResponse<LeccionDetalleResponseData[]>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${LECCIONES_PATH}/modulo/${idModulo}`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar lecciones por módulo: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function publicarLeccionSolicitud(
  idLeccion: number,
  token?: string,
): Promise<LoginResponse<LeccionDetalleResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${LECCIONES_PATH}/${idLeccion}/publicar`, {
    method: 'PUT',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al publicar lección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function despublicarLeccionSolicitud(
  idLeccion: number,
  token?: string,
): Promise<LoginResponse<LeccionDetalleResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${LECCIONES_PATH}/${idLeccion}/despublicar`, {
    method: 'PUT',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al despublicar lección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}
