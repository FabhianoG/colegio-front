const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const REPORTES_PATH = '/reportes'

function buildDownloadHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: '*/*',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

async function fetchBlob(url: string, token?: string): Promise<Blob> {
  const response = await fetch(url, {
    method: 'GET',
    headers: buildDownloadHeaders(token),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Error al descargar reporte: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.blob()
}

export async function obtenerReporteGrupalPdf(
  idSeccion: number,
  token?: string,
): Promise<Blob> {
  return fetchBlob(
    `${BASE_URL}${REPORTES_PATH}/seccion/${idSeccion}/grupal/pdf`,
    token,
  )
}

export async function obtenerReporteGrupalExcel(
  idSeccion: number,
  token?: string,
): Promise<Blob> {
  return fetchBlob(
    `${BASE_URL}${REPORTES_PATH}/seccion/${idSeccion}/grupal/excel`,
    token,
  )
}

export async function obtenerReporteIndividualPdf(
  idAlumno: number,
  idCurso: number,
  token?: string,
): Promise<Blob> {
  return fetchBlob(
    `${BASE_URL}${REPORTES_PATH}/alumno/${idAlumno}/curso/${idCurso}/individual/pdf`,
    token,
  )
}

export async function obtenerReporteIndividualExcel(
  idAlumno: number,
  idCurso: number,
  token?: string,
): Promise<Blob> {
  return fetchBlob(
    `${BASE_URL}${REPORTES_PATH}/alumno/${idAlumno}/curso/${idCurso}/individual/excel`,
    token,
  )
}
