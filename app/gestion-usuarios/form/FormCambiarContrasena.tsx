'use client'

import React, { useState } from 'react'
import Boton from '@/app/componentes/Boton'
import CampoTexto from '@/app/componentes/CampoTexto'
import { cambiarContrasenaUsuarioSolicitud } from '@/lib/api/login/usuarios'

export interface FormCambiarContrasenaProps {
    idUsuario: number
    nombreUsuario: string
    onClose: () => void
    onSuccess: () => void
}

function getToken(): string {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? ''
}

function validarContrasena(contrasena: string): string[] {
    const errores: string[] = []
    if (contrasena.length < 8) {
        errores.push('La contraseña debe tener al menos 8 caracteres.')
    }
    if (!/[A-Z]/.test(contrasena)) {
        errores.push('Incluye al menos una letra mayúscula.')
    }
    if (!/[a-z]/.test(contrasena)) {
        errores.push('Incluye al menos una letra minúscula.')
    }
    if (!/[0-9]/.test(contrasena)) {
        errores.push('Incluye al menos un número.')
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(contrasena)) {
        errores.push('Incluye al menos un carácter especial.')
    }
    return errores
}

const FormCambiarContrasena: React.FC<FormCambiarContrasenaProps> = ({ idUsuario, nombreUsuario, onClose, onSuccess }) => {
    const [pwdNueva, setPwdNueva] = useState('')
    const [confirmarPwd, setConfirmarPwd] = useState('')
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError('')

        const errores = validarContrasena(pwdNueva)
        if (confirmarPwd !== pwdNueva) {
            errores.push('Las contraseñas no coinciden.')
        }

        if (errores.length > 0) {
            setError(errores.join(' '))
            return
        }

        setCargando(true)

        try {
            await cambiarContrasenaUsuarioSolicitud(idUsuario, { pwdNueva }, getToken())
            onSuccess()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al cambiar la contraseña.')
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 p-4 backdrop-blur-sm">
            <div className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[16px_16px_0_0_rgba(255,255,255,1)] relative">
                <button
                    type="button"
                    className="absolute top-4 right-4 text-2xl hover:text-gray-500"
                    onClick={onClose}
                >
                    ×
                </button>

                <h2 className="text-2xl font-bold uppercase border-b-2 border-black pb-2 mb-6">
                    Cambiar contraseña
                </h2>

                <p className="text-xs uppercase tracking-widest text-gray-600 mb-4">
                    Usuario: <span className="font-bold text-black">{nombreUsuario}</span>
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border-2 border-red-600 text-red-700 text-xs font-bold uppercase">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <CampoTexto
                        field={{
                            type: 'password',
                            name: 'pwdNueva',
                            label: 'Contraseña nueva',
                            placeholder: 'Escribe una contraseña fuerte',
                        }}
                        value={pwdNueva}
                        onChange={(_, v) => setPwdNueva(v)}
                    />

                    <CampoTexto
                        field={{
                            type: 'password',
                            name: 'confirmarPwd',
                            label: 'Repetir contraseña',
                            placeholder: 'Repite la contraseña nueva',
                        }}
                        value={confirmarPwd}
                        onChange={(_, v) => setConfirmarPwd(v)}
                    />

                    <div className="text-xs text-gray-600 space-y-2">
                        <p className="font-bold uppercase tracking-widest">Requisitos mínimos</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Al menos 8 caracteres</li>
                            <li>Una letra mayúscula</li>
                            <li>Una letra minúscula</li>
                            <li>Un número</li>
                            <li>Un carácter especial</li>
                        </ul>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <Boton variant="ghost" size="md" fullWidth onClick={onClose} type="button">
                            Cancelar
                        </Boton>

                        <Boton variant="primary" size="md" fullWidth type="submit" disabled={cargando}>
                            {cargando ? 'Guardando...' : 'Actualizar contraseña'}
                        </Boton>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default FormCambiarContrasena
