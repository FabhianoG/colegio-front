import { LoginResponse } from './auth'

export interface TipoRecurso {
    idTipoRecurso: number
    codTipo: string
    desNombre: string
    estActivo: boolean
}

export interface CrearRecursoData {
    idLeccion: number
    idTipoRecurso: number
    desNombre: string
    urlRuta: string
}

export interface RecursoResponseData {
    idRecurso: number
    idLeccion: number
    idTipoRecurso: number
    codTipoRecurso: string
    desTipoRecurso: string
    desNombre: string
    urlRuta: string
    estActivo: boolean
    fecCreacion: string
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const RECURSOS_PATH = '/recursos'

export async function crearRecursoSolicitud(
    data: CrearRecursoData,
    token?: string,
): Promise<LoginResponse<RecursoResponseData>> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${BASE_URL}${RECURSOS_PATH}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
            `Error al crear recurso: ${response.status} ${response.statusText} - ${errorText}`,
        )
    }

    return response.json()
}

export async function subirArchivoRecursoSolicitud(
    idLeccion: number,
    desNombre: string,
    archivo: File,
    token?: string,
): Promise<LoginResponse<RecursoResponseData>> {
    const formData = new FormData()
    formData.append('archivo', archivo)

    const headers: Record<string, string> = {}
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const query = new URLSearchParams({
        idLeccion: String(idLeccion),
        desNombre,
    })

    const response = await fetch(
        `${BASE_URL}${RECURSOS_PATH}/archivo?${query.toString()}`,
        {
            method: 'POST',
            headers,
            body: formData,
        },
    )

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
            `Error al subir archivo de recurso: ${response.status} ${response.statusText} - ${errorText}`,
        )
    }

    return response.json()
}

export async function descargarArchivoRecursoSolicitud(
    idRecurso: number,
    token?: string,
): Promise<Blob> {
    const headers: Record<string, string> = {}

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(
        `${BASE_URL}${RECURSOS_PATH}/${idRecurso}/descargar`,
        {
            method: 'GET',
            headers,
        },
    )

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
            `Error al descargar archivo de recurso: ${response.status} ${response.statusText} - ${errorText}`,
        )
    }

    return response.blob()
}

export async function eliminarRecursoSolicitud(
    idRecurso: number,
    token?: string,
): Promise<LoginResponse> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${BASE_URL}${RECURSOS_PATH}/${idRecurso}`, {
        method: 'DELETE',
        headers,
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
            `Error al eliminar recurso: ${response.status} ${response.statusText} - ${errorText}`,
        )
    }

    return response.json()
}

export async function listarRecursosPorLeccionSolicitud(
    idLeccion: number,
    token?: string,
): Promise<LoginResponse<RecursoResponseData[]>> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(
        `${BASE_URL}${RECURSOS_PATH}/leccion/${idLeccion}`,
        {
            method: 'GET',
            headers,
        },
    )

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
            `Error al listar recursos de la lección: ${response.status} ${response.statusText} - ${errorText}`,
        )
    }

    return response.json()
}
