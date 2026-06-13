import { LoginResponse, buildHeaders, fetchJson } from './auth'

export interface ActualizarRolUsuarioData {
  codRol: string
}

export interface UsuarioRolResponseData {
  idUsuario: number
  nombres: string
  apellidos: string
  correo: string
  rol: string
  activo: boolean
  pwdTemporal: boolean
  fecCreacion: string
  fecUltimoAcceso: string
}

export interface ActualizarEstadoUsuarioData {
  activo: boolean
}

export interface CargaMasivaAlumnoCredencial {
  correo: string
  nombres: string
  apellidos: string
  contrasenaTemporal: string
}

export interface CargaMasivaAlumnoError {
  fila: number
  correo: string
  motivo: string
}

export interface CargaMasivaResponseData {
  totalProcesados: number
  exitosos: number
  fallidos: number
  credenciales: CargaMasivaAlumnoCredencial[]
  errores: CargaMasivaAlumnoError[]
}

export interface CrearUsuarioData {
  nombres: string
  apellidos: string
  correo: string
}

export interface UsuarioCreadoResponseData {
  usuario: UsuarioRolResponseData
  contrasenaTemporal: string
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

export interface PaginatedUsuariosResponseData {
  totalPages: number
  totalElements: number
  size: number
  content: UsuarioRolResponseData[]
  number: number
  sort: SortDescriptor[]
  numberOfElements: number
  first: boolean
  last: boolean
  pageable: PageableInfo
  empty: boolean
}

export interface UsuariosPageQuery {
  page?: number
  size?: number
  sort?: string[]
  busqueda?: string
  rol?: string
  estActivo?: boolean
  sinSeccion?: boolean
}

export interface EditarUsuarioData {
  desNombres: string,
  desApellidos: string,
  desCorreo: string
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const UPDATE_USER_ROLE_PATH = '/usuarios'
const BULK_UPLOAD_USERS_PATH = '/usuarios/carga-masiva'

export async function actualizarRolUsuarioSolicitud(
  idUsuario: number,
  data: ActualizarRolUsuarioData,
  token?: string,
): Promise<LoginResponse<UsuarioRolResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${BASE_URL}${UPDATE_USER_ROLE_PATH}/${idUsuario}/rol`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al actualizar rol de usuario: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function actualizarEstadoUsuarioSolicitud(
  idUsuario: number,
  data: ActualizarEstadoUsuarioData,
  token?: string,
): Promise<LoginResponse<UsuarioRolResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${BASE_URL}${UPDATE_USER_ROLE_PATH}/${idUsuario}/estado`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al actualizar estado de usuario: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function actualizarDatosUsuarioSolicitud(
  idUsuario: number,
  data: EditarUsuarioData,
  token?: string,
): Promise<LoginResponse<UsuarioRolResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${BASE_URL}${UPDATE_USER_ROLE_PATH}/${idUsuario}/datos`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al actualizar datos de usuario: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function cargarAlumnosMasivamenteSolicitud(
  archivo: File,
  token?: string,
): Promise<LoginResponse<CargaMasivaResponseData>> {
  const formData = new FormData()
  formData.append('archivo', archivo)

  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${BULK_UPLOAD_USERS_PATH}`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error en carga masiva de alumnos: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function crearUsuarioSolicitud(
  data: CrearUsuarioData,
  token?: string,
): Promise<LoginResponse<UsuarioCreadoResponseData>> {
  return fetchJson<LoginResponse<UsuarioCreadoResponseData>>(
    `${BASE_URL}${UPDATE_USER_ROLE_PATH}`,
    {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify(data),
    },
  )
}

export async function listarUsuariosSolicitud(
  query: UsuariosPageQuery = {},
  token?: string,
): Promise<LoginResponse<PaginatedUsuariosResponseData>> {
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

  // Agregar los parámetros de filtro a la URL
  if (query.busqueda) params.append('busqueda', query.busqueda)
  if (query.rol) params.append('rol', query.rol)
  if (query.estActivo !== undefined) params.append('estActivo', String(query.estActivo))
  if (query.sinSeccion !== undefined) params.append('sinSeccion', String(query.sinSeccion))

  const url = `${BASE_URL}${UPDATE_USER_ROLE_PATH}${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al listar usuarios: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function obtenerUsuarioPorIdSolicitud(
  idUsuario: number,
  token?: string,
): Promise<LoginResponse<UsuarioRolResponseData>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${BASE_URL}${UPDATE_USER_ROLE_PATH}/${idUsuario}`,
    {
      method: 'GET',
      headers,
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al obtener usuario: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export async function obtenerUsuarioMeSolicitud(
  token?: string,
): Promise<LoginResponse<UsuarioRolResponseData>> {
  const response = await fetch(
    `${BASE_URL}${UPDATE_USER_ROLE_PATH}/me`,
    {
      method: 'GET',
      headers: buildHeaders(token),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al obtener usuario actual: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

export interface CambiarContrasenaUsuarioData {
  pwdNueva: string
}

export async function cambiarContrasenaUsuarioSolicitud(
  idUsuario: number,
  data: CambiarContrasenaUsuarioData,
  token?: string,
): Promise<LoginResponse> {
  return fetchJson<LoginResponse>(`${BASE_URL}${UPDATE_USER_ROLE_PATH}/${idUsuario}/contrasena`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(data),
  })
}
