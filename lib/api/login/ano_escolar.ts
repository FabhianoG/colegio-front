import { buildHeaders, LoginResponse } from '@/lib/api/login/auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const ANIO_ESCOLAR_PATH = '/secciones/anios-escolares'

export interface ResumenAnioEscolarResponseData {
  idAnioEscolar: number
  valAnio: number
  desDescripcion: string
  fecInicio: string
  fecFin: string
  estActivo: boolean
  totalSecciones: number
  totalCursos: number
  totalAlumnosInscritos: number
  totalProfesoresAsignados: number
}

export async function obtenerResumenAnioEscolarSolicitud(
  idAnio: number,
  token?: string,
): Promise<LoginResponse<ResumenAnioEscolarResponseData>> {
  const response = await fetch(
    `${BASE_URL}${ANIO_ESCOLAR_PATH}/${idAnio}/resumen`,
    {
      method: 'GET',
      headers: buildHeaders(token),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al obtener resumen de año escolar: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}
