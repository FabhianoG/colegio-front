import { buildHeaders, LoginResponse } from '@/lib/api/login/auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const PROFESOR_SECCION_PATH = '/secciones/profesor-seccion'

export interface ProfesorSeccionData {
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

export interface ProfesorSeccionQuery {
  idProfesor?: number
  idSeccion?: number
  idCurso?: number
  idAnio?: number
}

export async function listarProfesoresSeccionSolicitud(
  query: ProfesorSeccionQuery = {},
  token?: string,
): Promise<LoginResponse<ProfesorSeccionData[]>> {
  const headers: Record<string, string> = buildHeaders(token)
  const params = new URLSearchParams()

  if (query.idProfesor !== undefined) params.append('idProfesor', String(query.idProfesor))
  if (query.idSeccion !== undefined) params.append('idSeccion', String(query.idSeccion))
  if (query.idCurso !== undefined) params.append('idCurso', String(query.idCurso))
  if (query.idAnio !== undefined) params.append('idAnio', String(query.idAnio))

  const url = `${BASE_URL}${PROFESOR_SECCION_PATH}${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar profesor-seccion: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}
