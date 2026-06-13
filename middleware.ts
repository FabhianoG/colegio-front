import { NextRequest, NextResponse } from 'next/server'

// Rutas públicas: no requieren autenticación
const RUTAS_PUBLICAS = ['/login', '/recuperar-contrasena']

// Rutas a las que cada rol tiene acceso (además de las públicas y /perfil)
const RUTAS_POR_ROL: Record<string, string[]> = {
  ROL_ADMIN: [
    '/gestion-usuarios',
    '/registro-usuarios',
    '/carga-masiva',
    '/gestion-secciones',
    '/asignacion-docente',
    '/generador-reportes',
    '/perfil',
  ],
  ROL_PROFESOR: [
    '/avance-grupal',
    '/progreso-individual',
    '/generador-reportes',
    '/perfil',
  ],
  ROL_ALUMNO: [
    '/dashboard-alumno',
    '/catalogo-cursos',
    '/visor-lecciones',
    '/sala-evaluacion',
    '/perfil',
  ],
}

// Vista de inicio según rol (para redirigir cuando el acceso está denegado)
const INICIO_POR_ROL: Record<string, string> = {
  ROL_ADMIN: '/gestion-secciones',
  ROL_PROFESOR: '/avance-grupal',
  ROL_ALUMNO: '/dashboard-alumno',
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir rutas públicas sin verificación
  if (RUTAS_PUBLICAS.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value
  const rol = request.cookies.get('rol')?.value

  // Sin autenticación → redirigir al login
  if (!token || !rol) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar si el rol tiene permiso sobre esta ruta
  const rutasPermitidas = RUTAS_POR_ROL[rol] ?? []
  const tieneAcceso = rutasPermitidas.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`),
  )

  if (!tieneAcceso) {
    const destino = INICIO_POR_ROL[rol] ?? '/login'
    return NextResponse.redirect(new URL(destino, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard-alumno/:path*',
    '/catalogo-cursos/:path*',
    '/visor-lecciones/:path*',
    '/sala-evaluacion/:path*',
    '/gestion-usuarios/:path*',
    '/registro-usuarios/:path*',
    '/carga-masiva/:path*',
    '/gestion-secciones/:path*',
    '/asignacion-docente/:path*',
    '/generador-reportes/:path*',
    '/avance-grupal/:path*',
    '/progreso-individual/:path*',
    '/perfil/:path*',
  ],
}
