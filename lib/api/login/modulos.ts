import { LoginResponse } from './auth'

export interface TipoRecurso {
  idTipoRecurso: number
  codTipo: string
  desNombre: string
  estActivo: boolean
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const RESOURCE_TYPES_PATH = '/tipos-recurso'
const MODULOS_PATH = '/modulos'

export interface CrearModuloData {
  idCurso: number
  desNombre: string
  desDescripcion: string
  valOrden: number
}

export interface ModuloResponseData {
  idModulo: number
  idCurso: number
  desCurso: string
  desNombre: string
  desDescripcion: string
  valOrden: number
  estActivo: boolean
  fecCreacion: string
}

export async function listarTiposRecursoSolicitud(
  token?: string,
): Promise<LoginResponse<TipoRecurso[]>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${RESOURCE_TYPES_PATH}`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar tipos de recurso: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function crearModuloSolicitud(
  data: CrearModuloData,
  token?: string,
): Promise<LoginResponse<ModuloResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${MODULOS_PATH}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al crear módulo: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function eliminarModuloSolicitud(
  idModulo: number,
  token?: string,
): Promise<LoginResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}/modulos/${idModulo}`, {
    method: 'DELETE',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al eliminar módulo: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function listarModulosPorCursoSolicitud(
  idCurso: number,
  token?: string,
): Promise<LoginResponse<ModuloResponseData[]>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${MODULOS_PATH}/curso/${idCurso}`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar módulos por curso: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}
