'use client'

import Image from 'next/image'
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
    const [sidebarAbierta, setSidebarAbierta] = useState(true)

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
        <>
            {!sidebarAbierta && (
                <button
                    type="button"
                    onClick={() => setSidebarAbierta(true)}
                    className="fixed top-4 left-4 z-50 w-11 h-11 bg-white border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center text-black hover:bg-gray-100"
                    aria-label="Abrir menú"
                >
                    <i className="fa-solid fa-bars"></i>
                </button>
            )}

            <aside
                className={`shrink-0 bg-white flex flex-col md:min-h-screen overflow-hidden transition-all duration-300 ease-in-out ${
                    sidebarAbierta
                        ? 'w-full md:w-80 lg:w-[360px] border-2 border-black'
                        : 'w-0 border-0'
                }`}
            >
                <div className="p-4 sm:p-5 border-b-2 border-black flex items-center gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-black flex items-center justify-center bg-white shrink-0">
                        <Image
                            src="/images/logo-nsl.webp"
                            alt="Logo NSL"
                            width={64}
                            height={64}
                            className="w-full h-full object-contain p-1"
                            priority
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-extrabold uppercase text-black leading-tight break-words whitespace-normal">
                            NSL
                        </p>
                        <p className="text-xs sm:text-sm font-bold uppercase text-gray-700 leading-tight break-words whitespace-normal">
                            Sistema Académico
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setSidebarAbierta(false)}
                        className="w-9 h-9 border-2 border-black flex items-center justify-center text-black hover:bg-gray-100 shrink-0"
                        aria-label="Cerrar menú"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="p-4 sm:p-5 flex items-center gap-4 border-b-2 border-dashed border-gray-300">
                    <div className="w-12 h-12 rounded-full border-2 border-black bg-gray-200 flex items-center justify-center shrink-0 text-black">
                        <i className="fa-regular fa-user"></i>
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-extrabold uppercase text-black leading-tight break-words whitespace-normal">
                            {nombreUsuario}
                        </p>
                        <p className="text-xs sm:text-sm font-bold uppercase text-gray-700 leading-tight break-words whitespace-normal">
                            {rolLabel}
                        </p>
                    </div>
                </div>

                <nav className="flex-1 px-3 sm:px-4 py-5 sm:py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-start gap-3 text-black px-3 sm:px-4 py-2 border-2 border-transparent hover:border-dashed hover:border-gray-500 hover:bg-gray-50 uppercase font-extrabold text-xs sm:text-sm leading-snug break-words whitespace-normal"
                        >
                            <span className="break-words whitespace-normal">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div className="p-3 sm:p-4 border-t-2 border-black">
                    <button
                        onClick={cerrarSesion}
                        className="flex items-start gap-3 text-black hover:bg-gray-50 px-3 sm:px-4 py-2 uppercase font-extrabold w-full text-left text-xs sm:text-sm leading-snug break-words whitespace-normal"
                    >
                        <i className="fa-solid fa-sign-out-alt mt-0.5 shrink-0"></i>
                        <span className="break-words whitespace-normal">
                            Cerrar Sesión
                        </span>
                    </button>
                </div>
            </aside>
        </>
    )
}

export default BarraLateral
