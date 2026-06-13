export interface LoginCredentials {
  correo: string
  contrasena: string
}

export interface ApiResponse<T = unknown> {
  exito?: boolean
  mensaje?: string
  datos?: T
  [key: string]: unknown
}

export interface LoginResponseData {
  token: string
  tipo: string
  idUsuario: number
  nombres: string
  apellidos: string
  correo: string
  rol: string
  pwdTemporal: boolean
}

export type LoginResponse<T = unknown> = ApiResponse<T> & {
  token?: string
  tipo?: string
  idUsuario?: number
  nombres?: string
  apellidos?: string
  correo?: string
  rol?: string
  pwdTemporal?: boolean
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const LOGIN_PATH = '/auth/login'
const LOGOUT_PATH = '/auth/logout'
const REGISTER_PATH = '/auth/registrar'
const RECOVER_CREDENTIALS_PATH = '/auth/recuperar-credenciales'
const CHANGE_PASSWORD_PATH = '/auth/cambiar-contraseña'

export function buildHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error en la solicitud: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json() as Promise<T>
}

export interface ChangePasswordData {
  contrasenaActual: string
  nuevaContrasena: string
  confirmarContrasena: string
}

export interface RegistrarUsuarioData {
  nombres: string
  apellidos: string
  correo: string
  codRol: string
  contrasenaTemporal?: string
}

export interface RegistrarResponseData {
  idUsuario: number
  nombres: string
  apellidos: string
  correo: string
  rol: string
  contrasenaTemporal: string
}

export interface RecuperarCredencialesResponseData {
  correo: string
  contrasenaTemporal: string
}

export async function loginSolicitud(
  credentials: LoginCredentials,
): Promise<LoginResponse<LoginResponseData>> {
  return fetchJson<LoginResponse<LoginResponseData>>(`${BASE_URL}${LOGIN_PATH}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(credentials),
  })
}

export async function logoutSolicitud(
  token?: string,
): Promise<LoginResponse> {
  return fetchJson<LoginResponse>(`${BASE_URL}${LOGOUT_PATH}`, {
    method: 'POST',
    headers: buildHeaders(token),
  })
}

export async function recuperarCredencialesSolicitud(
  idUsuario: number,
  token?: string,
): Promise<LoginResponse> {
  return fetchJson<LoginResponse>(`${BASE_URL}${RECOVER_CREDENTIALS_PATH}/${idUsuario}`, {
    method: 'PUT',
    headers: buildHeaders(token),
  })
}

export async function registrarSolicitud(
  data: RegistrarUsuarioData,
  token?: string,
): Promise<LoginResponse<RegistrarResponseData>> {
  return fetchJson<LoginResponse<RegistrarResponseData>>(`${BASE_URL}${REGISTER_PATH}`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(data),
  })
}

export async function cambiarContrasenaSolicitud(
  data: ChangePasswordData,
  token?: string,
): Promise<LoginResponse> {
  return fetchJson<LoginResponse>(`${BASE_URL}${CHANGE_PASSWORD_PATH}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(data),
  })
}
