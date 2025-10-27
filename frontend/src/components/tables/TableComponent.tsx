"use client";

import React from "react";

interface TableComponentProps {
  headers: string[];
  data: { [key: string]: any }[];
  idKey?: string; // nombre de la key del ID (ej: "id_cliente")
  selectedId?: string | number | null;
  onRowClick?: (id: string | number, row: any) => void;
}

export const TableComponent: React.FC<TableComponentProps> = ({
  headers,
  data,
  idKey = "id",
  selectedId,
  onRowClick,
}) => {
  return (
    <table className="w-full text-sm border-collapse">
      <thead className="bg-slate-700">
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="text-left p-3 text-white">
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.length > 0 ? (
          data.map((row, rowIndex) => {
            const id = row[idKey];
            const active = selectedId === id;

            return (
              <tr
                key={id ?? rowIndex}
                className={`cursor-pointer transition-colors ${
                  active ? "bg-sky-900/50" : "hover:bg-slate-700"
                }`}
                onClick={() => onRowClick?.(id, row)}
              >
                {headers.map((header, cellIndex) => (
                  <td key={cellIndex} className="p-3 text-white">
                    {row[header]}
                  </td>
                ))}
              </tr>
            );
          })
        ) : (
          <tr>
            <td
              className="p-3 text-slate-400 text-center"
              colSpan={headers.length}
            >
              Sin registros cargados.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default TableComponent;