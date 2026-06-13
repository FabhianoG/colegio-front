import { LoginResponse, buildHeaders, fetchJson } from './auth'

export interface NivelDetalleResponseData {
  idNivel: number
  codNivel: string
  desNombre: string
  valOrden: number
  estActivo: boolean
}

export interface ActualizarNivelData {
  codNivel: string
  desNombre: string
  valOrden: number
}

export interface CrearNivelData {
  codNivel: string
  desNombre: string
  valOrden: number
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const NIVELES_PATH = '/niveles'

export async function obtenerNivelPorIdSolicitud(
  idNivel: number,
  token?: string,
): Promise<LoginResponse<NivelDetalleResponseData>> {
  return fetchJson<LoginResponse<NivelDetalleResponseData>>(
    `${BASE_URL}${NIVELES_PATH}/${idNivel}`,
    {
      method: 'GET',
      headers: buildHeaders(token),
    },
  )
}

export async function listarNivelesActivosSolicitud(
  token?: string,
): Promise<LoginResponse<NivelDetalleResponseData[]>> {
  return fetchJson<LoginResponse<NivelDetalleResponseData[]>>(
    `${BASE_URL}${NIVELES_PATH}`,
    {
      method: 'GET',
      headers: buildHeaders(token),
    },
  )
}

export async function crearNivelSolicitud(
  data: CrearNivelData,
  token?: string,
): Promise<LoginResponse<NivelDetalleResponseData>> {
  return fetchJson<LoginResponse<NivelDetalleResponseData>>(
    `${BASE_URL}${NIVELES_PATH}`,
    {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify(data),
    },
  )
}

export async function actualizarNivelSolicitud(
  idNivel: number,
  data: ActualizarNivelData,
  token?: string,
): Promise<LoginResponse<NivelDetalleResponseData>> {
  return fetchJson<LoginResponse<NivelDetalleResponseData>>(
    `${BASE_URL}${NIVELES_PATH}/${idNivel}`,
    {
      method: 'PUT',
      headers: buildHeaders(token),
      body: JSON.stringify(data),
    },
  )
}
