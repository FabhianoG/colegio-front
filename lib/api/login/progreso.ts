import { buildHeaders, LoginResponse } from './auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const PROGRESO_PATH = '/progreso'

// Valores reales que envía el backend (EstadoModulo.java)
export type EstadoModulo = 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADO'

export interface ModuloProgresoResponseData {
  idModulo: number
  nombre: string
  estado: EstadoModulo
  completadas: number
  total: number
}

export interface ProgresoCursoResponseData {
  idCurso: number
  nombreCurso: string
  totalLeccionesObligatorias: number
  leccionesCompletadas: number
  porcentaje: number
  ultimaActividad: string | null
  modulos: ModuloProgresoResponseData[]
  calificaciones: unknown[]
}

export interface ProgresoLeccionResponseData {
  idProgreso: number
  idLeccion: number
  nombreLeccion: string
  estCompletada: boolean
  fecCompletado: string | null
}

export interface AlumnoProgresoData {
  idAlumno: number
  nombres: string
  apellidos: string
  leccionesCompletadas: number
  totalLeccionesObligatorias: number
  porcentaje: number
  ultimaActividad: string
}

export interface PageableInfo {
  offset: number
  sort: SortDescriptor[]
  pageNumber: number
  pageSize: number
  paged: boolean
  unpaged: boolean
}

export interface SortDescriptor {
  direction: string
  nullHandling: string
  ascending: boolean
  property: string
  ignoreCase: boolean
}

export interface PaginatedAlumnosData {
  totalPages: number
  totalElements: number
  size: number
  content: AlumnoProgresoData[]
  number: number
  sort: SortDescriptor[]
  numberOfElements: number
  first: boolean
  last: boolean
  pageable: PageableInfo
  empty: boolean
}

export interface ProgresoSeccionResponseData {
  idSeccion: number
  nombreSeccion: string
  idCurso: number
  nombreCurso: string
  totalLeccionesObligatorias: number
  alumnos: PaginatedAlumnosData
}

export interface LeccionDetalleProgreso {
  idLeccion: number
  nombre: string
  obligatoria: boolean
  completada: boolean
  fecCompletado?: string
}

export interface ModuloDetalleProgreso {
  idModulo: number
  nombre: string
  lecciones: LeccionDetalleProgreso[]
}

export interface ProgresoAlumnoCursoResponseData {
  alumno: {
    idAlumno: number
    nombres: string
    apellidos: string
    correo: string
  }
  idCurso: number
  nombreCurso: string
  totalLeccionesObligatorias: number
  leccionesCompletadas: number
  porcentajeAvance: number
  ultimaActividad: string
  modulos: ModuloDetalleProgreso[]
  evaluaciones: unknown[]
}

export interface ProgresoNoAvanzanQuery {
  dias?: number
  minAvance?: number
}

export interface ProgresoSeccionQuery {
  page?: number
  size?: number
  sort?: string[]
}

export async function obtenerMiProgresoSolicitud(
  token?: string,
): Promise<LoginResponse<ProgresoCursoResponseData[]>> {
  const response = await fetch(`${BASE_URL}${PROGRESO_PATH}/mi-progreso`, {
    method: 'GET',
    headers: buildHeaders(token),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al obtener mi progreso: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function completarLeccionSolicitud(
  idLeccion: number,
  token?: string,
): Promise<LoginResponse<ProgresoLeccionResponseData>> {
  const response = await fetch(
    `${BASE_URL}${PROGRESO_PATH}/leccion/${idLeccion}/completar`,
    {
      method: 'POST',
      headers: buildHeaders(token),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al completar lección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function obtenerProgresoNoAvanzanSolicitud(
  idSeccion: number,
  query: ProgresoNoAvanzanQuery = {},
  token?: string,
): Promise<LoginResponse<AlumnoProgresoData[]>> {
  const headers: Record<string, string> = buildHeaders(token)
  const params = new URLSearchParams()

  if (query.dias !== undefined) params.append('dias', String(query.dias))
  if (query.minAvance !== undefined) params.append('minAvance', String(query.minAvance))

  const url = `${BASE_URL}${PROGRESO_PATH}/no-avanzan/${idSeccion}${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al obtener alumnos que no avanzan: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function obtenerProgresoSeccionSolicitud(
  idSeccion: number,
  query: ProgresoSeccionQuery = {},
  token?: string,
): Promise<LoginResponse<ProgresoSeccionResponseData>> {
  const headers: Record<string, string> = buildHeaders(token)
  const params = new URLSearchParams()

  if (query.page !== undefined) params.append('page', String(query.page))
  if (query.size !== undefined) params.append('size', String(query.size))
  query.sort?.forEach((sortValue) => params.append('sort', sortValue))

  const url = `${BASE_URL}${PROGRESO_PATH}/seccion/${idSeccion}${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al obtener progreso de sección: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function obtenerProgresoAlumnoCursoSolicitud(
  idAlumno: number,
  idCurso: number,
  token?: string,
): Promise<LoginResponse<ProgresoAlumnoCursoResponseData>> {
  const response = await fetch(
    `${BASE_URL}${PROGRESO_PATH}/alumno/${idAlumno}/curso/${idCurso}`,
    {
      method: 'GET',
      headers: buildHeaders(token),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al obtener progreso de alumno en curso: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}
