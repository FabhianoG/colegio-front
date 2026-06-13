import React, { useState } from 'react'
import Boton from "@/app/componentes/Boton"
import CampoTexto from "@/app/componentes/CampoTexto"
// Asegúrate de importar la ruta correcta de tu API
import { crearUsuarioSolicitud } from '@/lib/api/login/usuarios'

export interface FormUsuarioProps {
    onClose: () => void
    onSuccess: () => void
}

// Función auxiliar para obtener el token desde el cliente
function getToken(): string {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? ''
}

const FormUsuario = ({ onClose, onSuccess }: FormUsuarioProps) => {
    // 1. Estados alineados con la interfaz CrearUsuarioData
    const [nombres, setNombres] = useState('')
    const [apellidos, setApellidos] = useState('')
    const [correo, setCorreo] = useState('')

    // Estados para la UI
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState('')

    // 2. Manejador del submit que llama a la API
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setCargando(true)

        try {
            // Llamamos al endpoint pasándole los datos del form
            await crearUsuarioSolicitud(
                { nombres, apellidos, correo },
                getToken()
            )

            // Si la creación es exitosa, cerramos y recargamos la tabla
            onSuccess()
        } catch (err: unknown) {
            console.error("Error al crear el usuario:", err)
            setError(err instanceof Error ? err.message : 'Error al crear el usuario. Verifica los datos.')
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className="fixed inset-0 flex bg-black bg-opacity-80 z-50 items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[16px_16px_0_0_rgba(255,255,255,1)] relative">
                <button
                    type="button"
                    className="absolute top-4 right-4 text-2xl hover:text-gray-500"
                    onClick={onClose}
                >
                    ×
                </button>

                <h2 className="text-2xl font-bold uppercase border-b-2 border-black pb-2 mb-6">
                    Nuevo Usuario
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border-2 border-red-600 text-red-700 text-xs font-bold uppercase">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Campo: Nombres */}
                    <CampoTexto
                        field={{
                            type: 'text',
                            name: 'nombres',
                            label: 'Nombres',
                            placeholder: 'EJ. JUAN ANDRÉS',
                        }}
                        value={nombres}
                        onChange={(_, v) => setNombres(v)}
                    />

                    {/* Campo: Apellidos */}
                    <CampoTexto
                        field={{
                            type: 'text',
                            name: 'apellidos',
                            label: 'Apellidos',
                            placeholder: 'EJ. PÉREZ GÓMEZ',
                        }}
                        value={apellidos}
                        onChange={(_, v) => setApellidos(v)}
                    />

                    {/* Campo: Correo */}
                    <CampoTexto
                        field={{
                            type: 'email',
                            name: 'correo',
                            label: 'Correo Electrónico',
                            placeholder: 'EJ. ALUMNO@COLEGIO.EDU.PE',
                        }}
                        value={correo}
                        onChange={(_, v) => setCorreo(v)}
                    />

                    <div className="pt-4 flex gap-4">
                        <Boton variant="ghost" size="md" fullWidth onClick={onClose} type="button">
                            Cancelar
                        </Boton>

                        <Boton variant="primary" size="md" fullWidth type="submit" disabled={cargando}>
                            {cargando ? 'Guardando...' : 'Crear Usuario'}
                        </Boton>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default FormUsuario