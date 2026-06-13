import React from 'react'
import Boton from '../componentes/Boton'
import Etiquetas from '../componentes/Etiquetas'

const page = () => {
    return (
        <div className="w-full min-h-screen bg-gray-50 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div id="recuperacion" className="max-w-4xl mx-auto mt-12">
                    <div className="bg-white border-4 border-black p-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center text-2xl mx-auto mb-4 bg-gray-100">
                                🔑
                            </div>

                            <h2 className="text-2xl font-bold uppercase mb-2 text-black">
                                Recuperar Acceso
                            </h2>

                            <p className="text-xs font-bold text-gray-700 uppercase leading-relaxed max-w-2xl mx-auto">
                                Ingresa tu correo registrado. El sistema enviará un enlace temporal para
                                restablecer tu contraseña y recuperar el acceso a la plataforma.
                            </p>
                        </div>

                        <form className="space-y-6 max-w-3xl mx-auto">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-black">
                                    Correo Electrónico Registrado
                                </label>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-600">
                                        <i className="fa-regular fa-envelope"></i>
                                    </div>

                                    <input
                                        type="email"
                                        placeholder="ejemplo@colegio.edu.pe"
                                        className="w-full border-2 border-black pl-10 pr-3 py-3 font-bold text-sm outline-none focus:border-dashed focus:bg-gray-50 transition-colors text-black placeholder:text-gray-500"
                                    />
                                </div>
                            </div>

                            <Boton variant="primary" size="lg" fullWidth>
                                Enviar Instrucciones
                            </Boton>
                        </form>

                        <div className="mt-6 border-t-2 border-gray-200 pt-4 text-center">
                            <a
                                href="#"
                                className="text-xs font-bold uppercase text-gray-700 hover:text-black transition-colors inline-flex items-center"
                            >
                                <span className="mr-2">←</span> Volver a Iniciar Sesión
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page