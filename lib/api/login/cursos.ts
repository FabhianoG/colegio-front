import { LoginResponse } from './auth'

export interface CursoDetalleResponseData {
  idCurso: number
  idNivel: number
  desNivel: string
  desNombre: string
  desDescripcion: string
  estPublicado: boolean
  estActivo: boolean
  fecCreacion: string
  fecPublicacion: string
}

export interface ActualizarCursoData {
  idNivel: number
  desNombre: string
  desDescripcion: string
}

export interface CrearCursoData {
  idNivel: number
  desNombre: string
  desDescripcion: string
}

export interface SortDescriptor {
  direction: string
  nullHandling: string
  ascending: boolean
  property: string
  ignoreCase: boolean
}

export interface PageableInfo {
  offset: number
  sort: SortDescriptor[]
  pageNumber: number
  pageSize: number
  unpaged: boolean
  paged: boolean
}

export interface PaginatedCursosResponseData {
  totalPages: number
  totalElements: number
  size: number
  content: CursoDetalleResponseData[]
  number: number
  sort: SortDescriptor[]
  numberOfElements: number
  first: boolean
  last: boolean
  pageable: PageableInfo
  empty: boolean
}

export interface CursosPageQuery {
  page?: number
  size?: number
  sort?: string[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const CURSOS_PATH = '/cursos'

export async function obtenerCursoPorIdSolicitud(
  idCurso: number,
  token?: string,
): Promise<LoginResponse<CursoDetalleResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${CURSOS_PATH}/${idCurso}`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al obtener curso: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function listarCursosSolicitud(
  query: CursosPageQuery = {},
  token?: string,
): Promise<LoginResponse<PaginatedCursosResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const params = new URLSearchParams()
  if (query.page !== undefined) params.append('page', String(query.page))
  if (query.size !== undefined) params.append('size', String(query.size))
  query.sort?.forEach((sortValue) => params.append('sort', sortValue))

  const url = `${BASE_URL}${CURSOS_PATH}${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar cursos: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function listarCursosPublicadosSolicitud(
  query: CursosPageQuery = {},
  token?: string,
): Promise<LoginResponse<PaginatedCursosResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const params = new URLSearchParams()
  if (query.page !== undefined) params.append('page', String(query.page))
  if (query.size !== undefined) params.append('size', String(query.size))
  query.sort?.forEach((sortValue) => params.append('sort', sortValue))

  const url = `${BASE_URL}${CURSOS_PATH}/publicados${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar cursos publicados: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function listarMisCursosSolicitud(
  query: CursosPageQuery = {},
  token?: string,
): Promise<LoginResponse<PaginatedCursosResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const params = new URLSearchParams()
  if (query.page !== undefined) params.append('page', String(query.page))
  if (query.size !== undefined) params.append('size', String(query.size))
  query.sort?.forEach((sortValue) => params.append('sort', sortValue))

  const url = `${BASE_URL}${CURSOS_PATH}/mis-cursos${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar mis cursos: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function listarCursosAlumnoSolicitud(
  idAlumno: number,
  query: CursosPageQuery = {},
  token?: string,
): Promise<LoginResponse<PaginatedCursosResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const params = new URLSearchParams()
  if (query.page !== undefined) params.append('page', String(query.page))
  if (query.size !== undefined) params.append('size', String(query.size))
  query.sort?.forEach((sortValue) => params.append('sort', sortValue))

  const url = `${BASE_URL}${CURSOS_PATH}/alumno/${idAlumno}${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar cursos del alumno: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function crearCursoSolicitud(
  data: CrearCursoData,
  token?: string,
): Promise<LoginResponse<CursoDetalleResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${CURSOS_PATH}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al crear curso: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function actualizarCursoSolicitud(
  idCurso: number,
  data: ActualizarCursoData,
  token?: string,
): Promise<LoginResponse<CursoDetalleResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${CURSOS_PATH}/${idCurso}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al actualizar curso: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function publicarCursoSolicitud(
  idCurso: number,
  token?: string,
): Promise<LoginResponse<CursoDetalleResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${CURSOS_PATH}/${idCurso}/publicar`, {
    method: 'PUT',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al publicar curso: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function despublicarCursoSolicitud(
  idCurso: number,
  token?: string,
): Promise<LoginResponse<CursoDetalleResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${CURSOS_PATH}/${idCurso}/despublicar`, {
    method: 'PUT',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al despublicar curso: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}
