import { LoginResponse } from './auth'

export interface SeccionDetalleResponseData {
  idSeccion: number
  idCurso: number
  desCurso: string
  idAnioEscolar: number
  valAnio: number
  desNombre: string
  estActivo: boolean
  fecCreacion: string
  idProfesor: number
  desProfesor: string
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const SECCIONES_PATH = '/secciones'

export async function obtenerSeccionPorIdSolicitud(
  idSeccion: number,
  token?: string,
): Promise<LoginResponse<SeccionDetalleResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${SECCIONES_PATH}/${idSeccion}`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al obtener sección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export interface ActualizarSeccionData {
  idCurso: number
  idAnioEscolar: number
  desNombre: string
}

export interface CrearSeccionData {
  idCurso: number
  idAnioEscolar: number
  desNombre: string
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

export interface PaginatedSeccionesResponseData {
  totalPages: number
  totalElements: number
  size: number
  content: SeccionDetalleResponseData[]
  number: number
  sort: SortDescriptor[]
  numberOfElements: number
  first: boolean
  last: boolean
  pageable: PageableInfo
  empty: boolean
}

export interface SeccionesPageQuery {
  page?: number
  size?: number
  sort?: string[]
  busqueda?: string
  curso?: string
  activo?: boolean
}

export async function listarSeccionesSolicitud(
  query: SeccionesPageQuery = {},
  token?: string,
): Promise<LoginResponse<PaginatedSeccionesResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const params = new URLSearchParams()
  if (query.page !== undefined) params.append('page', String(query.page))
  if (query.size !== undefined) params.append('size', String(query.size))
  if (query.busqueda) params.append('busqueda', query.busqueda)
  if (query.curso) params.append('curso', query.curso)
  if (query.activo !== undefined) params.append('activo', String(query.activo))
  query.sort?.forEach((sortValue) => params.append('sort', sortValue))

  const url = `${BASE_URL}${SECCIONES_PATH}${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar secciones: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function listarSeccionesPorCursoSolicitud(
  idCurso: number,
  query: SeccionesPageQuery = {},
  token?: string,
): Promise<LoginResponse<PaginatedSeccionesResponseData>> {
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

  const url = `${BASE_URL}${SECCIONES_PATH}/curso/${idCurso}${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar secciones por curso: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function listarSeccionesPorAnioSolicitud(
  idAnio: number,
  query: SeccionesPageQuery = {},
  token?: string,
): Promise<LoginResponse<PaginatedSeccionesResponseData>> {
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

  const url = `${BASE_URL}${SECCIONES_PATH}/anio/${idAnio}${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar secciones por año escolar: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export interface ProfesorSeccionQuery {
  idProfesor?: number
  idSeccion?: number
  idCurso?: number
  idAnio?: number
}

export interface ProfesorSeccionResponseData {
  idProfesorSeccion: number
  idProfesor: number
  nombresProfesor: string
  apellidosProfesor: string
  correoProfesor: string
  idSeccion: number
  nombreSeccion: string
  idCurso: number
  nombreCurso: string
  idAnioEscolar: number
  valAnio: number
  fecAsignacion: string
}

export async function listarSeccionesSinProfesorSolicitud(
  token?: string,
): Promise<LoginResponse<SeccionDetalleResponseData[]>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const url = `${BASE_URL}${SECCIONES_PATH}/secciones/sin-profesor`

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar secciones sin profesor: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function listarSeccionesProfesorSeccionSolicitud(
  query: ProfesorSeccionQuery = {},
  token?: string,
): Promise<LoginResponse<ProfesorSeccionResponseData[]>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const params = new URLSearchParams()
  if (query.idProfesor !== undefined) params.append('idProfesor', String(query.idProfesor))
  if (query.idSeccion !== undefined) params.append('idSeccion', String(query.idSeccion))
  if (query.idCurso !== undefined) params.append('idCurso', String(query.idCurso))
  if (query.idAnio !== undefined) params.append('idAnio', String(query.idAnio))

  const url = `${BASE_URL}${SECCIONES_PATH}/profesor-seccion${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar profesor-sección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function crearSeccionSolicitud(
  data: CrearSeccionData,
  token?: string,
): Promise<LoginResponse<SeccionDetalleResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${SECCIONES_PATH}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al crear sección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function actualizarSeccionSolicitud(
  idSeccion: number,
  data: ActualizarSeccionData,
  token?: string,
): Promise<LoginResponse<SeccionDetalleResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${SECCIONES_PATH}/${idSeccion}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al actualizar sección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export interface AsignarProfesorSeccionData {
  idProfesor: number
}

export async function asignarProfesorSeccionSolicitud(
  idSeccion: number,
  data: AsignarProfesorSeccionData,
  token?: string,
): Promise<LoginResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${SECCIONES_PATH}/${idSeccion}/profesor`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al asignar profesor a sección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export interface AsignarProfesorSeccionesData {
  idsSeccion: number[]
}

export async function asignarProfesorSeccionesSolicitud(
  idProfesor: number,
  data: AsignarProfesorSeccionesData,
  token?: string,
): Promise<LoginResponse<SeccionDetalleResponseData[]>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${BASE_URL}${SECCIONES_PATH}/profesor/${idProfesor}/secciones`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al asignar profesor a secciones: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export interface AlumnoSeccionResponseData {
  idAlumnoSeccion: number
  idUsuario: number
  desNombres: string
  desApellidos: string
  desCorreo: string
  idSeccion: number
  desSeccion: string
  estActivo: boolean
  fecInscripcion: string
}

export async function listarAlumnosSeccionSolicitud(
  idSeccion: number,
  token?: string,
): Promise<LoginResponse<AlumnoSeccionResponseData[]>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${SECCIONES_PATH}/${idSeccion}/alumnos`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar alumnos de la sección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function listarAlumnosSeccionProfesorSolicitud(
  idSeccion: number,
  idProfesor: number,
  token?: string,
): Promise<LoginResponse<AlumnoSeccionResponseData[]>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${BASE_URL}${SECCIONES_PATH}/${idSeccion}/profesor/${idProfesor}/alumnos`,
    {
      method: 'GET',
      headers,
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar alumnos de la sección por profesor: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function darBajaAlumnoSeccionSolicitud(
  idSeccion: number,
  idUsuario: number,
  token?: string,
): Promise<LoginResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${BASE_URL}${SECCIONES_PATH}/${idSeccion}/alumnos/${idUsuario}`,
    {
      method: 'DELETE',
      headers,
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al dar de baja alumno de la sección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function removerProfesorSeccionSolicitud(
  idSeccion: number,
  token?: string,
): Promise<LoginResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${SECCIONES_PATH}/${idSeccion}/profesor`, {
    method: 'DELETE',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al remover profesor de sección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}
