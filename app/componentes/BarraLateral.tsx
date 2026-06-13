'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface NavItem {
    href: string
    label: string
}

const NAV_POR_ROL: Record<string, NavItem[]> = {
    ROL_ALUMNO: [
        { href: '/perfil', label: 'Perfil' },
        { href: '/dashboard-alumno', label: 'Dashboard' },
        { href: '/catalogo-cursos', label: 'Mis Cursos' },
    ],
    ROL_PROFESOR: [
        { href: '/perfil', label: 'Perfil' },
        { href: '/avance-grupal', label: 'Avance Grupal' },
        { href: '/progreso-individual', label: 'Progreso Individual' },
        { href: '/generador-reportes', label: 'Generador de Reportes' },
    ],
    ROL_ADMIN: [
        { href: '/perfil', label: 'Perfil' },
        { href: '/gestion-usuarios', label: 'Gestión de Usuarios' },
        { href: '/gestion-secciones', label: 'Gestión de Secciones' },
        { href: '/asignacion-docente', label: 'Asignación Docente' },
        { href: '/generador-reportes', label: 'Generador de Reportes' },
    ],
}

function cerrarSesion() {
    document.cookie = 'token=; path=/; Max-Age=0; SameSite=Strict'
    document.cookie = 'rol=; path=/; Max-Age=0; SameSite=Strict'
    sessionStorage.clear()
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    window.location.replace('/login')
}

function getRolDeCookie(): string {
    const match = document.cookie.match(/(?:^|;\s*)rol=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : ''
}

const BarraLateral = () => {
    const [navItems, setNavItems] = useState<NavItem[]>([])
    const [nombreUsuario, setNombreUsuario] = useState('[ Nombre ]')
    const [rolLabel, setRolLabel] = useState('Usuario')

    useEffect(() => {
        const rol = getRolDeCookie()
        setNavItems(NAV_POR_ROL[rol] ?? [])

        const etiquetasRol: Record<string, string> = {
            ROL_ALUMNO: 'Alumno',
            ROL_PROFESOR: 'Docente',
            ROL_ADMIN: 'Administrador',
        }
        setRolLabel(etiquetasRol[rol] ?? 'Usuario')

        try {
            const raw = sessionStorage.getItem('usuario') ?? localStorage.getItem('usuario')
            if (raw) {
                const u = JSON.parse(raw) as { nombres?: string; apellidos?: string }
                if (u.nombres) setNombreUsuario(`${u.nombres} ${u.apellidos ?? ''}`.trim())
            }
        } catch {
            // sin cambios
        }
    }, [])

    return (
        <aside className="w-full max-w-sm bg-white border-2 border-black flex flex-col">
            <div className="p-6 border-b-2 border-black flex items-center gap-3">
                <div className="w-10 h-10 border-2 border-black flex items-center justify-center font-bold">L</div>
                <div>
                    <p className="text-sm font-bold uppercase">[ LOGO ]</p>
                    <p className="text-xs text-gray-500 uppercase">Subtítulo</p>
                </div>
            </div>

            <div className="p-6 flex items-center gap-4 border-b-2 border-dashed border-gray-300">
                <div className="w-12 h-12 rounded-full border-2 border-black bg-gray-200 flex items-center justify-center">
                    <i className="fa-regular fa-user"></i>
                </div>
                <div>
                    <p className="text-sm font-bold uppercase">{nombreUsuario}</p>
                    <p className="text-xs text-gray-600 uppercase">{rolLabel}</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 text-gray-600 hover:text-black px-4 py-2 border-2 border-transparent hover:border-dashed hover:border-gray-400 uppercase font-bold"
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t-2 border-black">
                <button
                    onClick={cerrarSesion}
                    className="flex items-center gap-3 text-gray-600 hover:text-black px-4 py-2 uppercase font-bold w-full text-left"
                >
                    <i className="fa-solid fa-sign-out-alt"></i>
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    )
}

export default BarraLateral