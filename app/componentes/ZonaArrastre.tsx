'use client'

import React, { useRef } from 'react'

interface ZonaArrastreProps {
    onFileSelected: (file: File) => void
}

const ZonaArrastre: React.FC<ZonaArrastreProps> = ({ onFileSelected }) => {
    const inputRef = useRef<HTMLInputElement | null>(null)

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return
        const file = files[0]
        const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
        const allowedExtensions = ['xlsx', 'csv']
        const extension = file.name.split('.').pop()?.toLowerCase() ?? ''

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
            return
        }

        onFileSelected(file)
    }

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        handleFiles(event.dataTransfer.files)
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
    }

    const handleClick = () => {
        inputRef.current?.click()
    }

    return (
        <div
            className="dropzone border-4 border-dashed border-gray-400 bg-gray-50 hover:bg-gray-100 hover:border-black transition-all cursor-pointer flex flex-col items-center justify-center p-12 text-center group"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleClick}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
            />
            <i className="fa-solid fa-file-csv text-6xl text-gray-400 group-hover:text-black mb-4"></i>
            <p className="font-bold uppercase text-lg mb-1">Arrastre su archivo aquí</p>
            <p className="text-xs font-bold text-gray-500 uppercase">O haga clic para examinar su equipo</p>
            <div className="mt-6 flex gap-2">
                <span className="bg-gray-200 border border-gray-400 text-gray-600 px-2 py-1 text-[10px] font-bold uppercase">.XLSX</span>
                <span className="bg-gray-200 border border-gray-400 text-gray-600 px-2 py-1 text-[10px] font-bold uppercase">.CSV</span>
            </div>
        </div>
    )
}

export default ZonaArrastre
