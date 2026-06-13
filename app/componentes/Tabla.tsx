import React from 'react'

export interface TablaColumn {
  key: string
  label: string
  className?: string
}

export interface TablaRow {
  id?: string | number
  [key: string]: React.ReactNode
}

export interface TablaProps {
  columns: TablaColumn[]
  rows: TablaRow[]
  renderAction?: (row: TablaRow, rowIndex: number) => React.ReactNode
  emptyText?: string
  className?: string
}

const Tabla: React.FC<TablaProps> = ({
  columns,
  rows,
  renderAction,
  emptyText = 'No hay datos disponibles',
  className = '',
}) => {
  return (
    <section className={`max-w-6xl mx-auto space-y-8 ${className}`.trim()}>
      <div className="bg-white border-2 border-black overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-200 text-background border-b-2 border-black uppercase text-xs tracking-widest">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 border-r-2 border-black ${column.className ?? ''}`.trim()}
                >
                  {column.label}
                </th>
              ))}
              {renderAction ? (
                <th className="px-6 py-4">Acción</th>
              ) : null}
            </tr>
          </thead>
          <tbody className="text-sm font-bold uppercase">
            {rows.length === 0 ? (
              <tr className="border-b-2 border-gray-300">
                <td className="px-6 py-4 text-background" colSpan={columns.length + (renderAction ? 1 : 0)}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={row.id !== undefined ? row.id : rowIndex}
                  className="border-b-2 border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={`${rowIndex}-${column.key}`}
                      className={`text-background px-6 py-4 border-r-2 border-gray-300 ${column.className ?? ''}`.trim()}
                    >
                      {row[column.key] ?? ''}
                    </td>
                  ))}
                  {renderAction ? (
                    <td className="text-background px-6 py-4">{renderAction(row, rowIndex)}</td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Tabla
