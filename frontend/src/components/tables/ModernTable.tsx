import React from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CheckCircle, Plus, Search } from 'lucide-react';

interface ModernTableProps {
  headers: string[];
  data: { [key: string]: any }[];
  idKey?: string;
  selectedId?: string | number | null;
  onRowClick?: (id: string | number, row: any) => void;
  onAddNew?: () => void;
  searchable?: boolean;
  className?: string;
}

const ModernTable: React.FC<ModernTableProps> = ({
  headers,
  data,
  idKey = "id",
  selectedId,
  onRowClick,
  onAddNew,
  searchable = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!searchable || !searchTerm) return data;
    
    return data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, searchable]);

  const handleRowClick = (row: any) => {
    if (onRowClick && row[idKey] !== undefined) {
      onRowClick(row[idKey], row);
    }
  };

  return (
    <div className={`bg-transparent rounded-lg border shadow-sm ${className}`}>
      {/* Header con búsqueda y botón agregar */}
      {(searchable || onAddNew) && (
        <div className="p-4 border-b ">
          <div className="flex items-center justify-between gap-4">
            {searchable && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <Table className="w-full text-sm border-collapse">
          <TableHeader >
            <TableRow className="">
              {headers.map((header, index) => (
                <TableHead key={index} className="text-left p-3 text-white">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => {
                const isSelected = selectedId === row[idKey];
                return (
                  <motion.tr
                    key={row[idKey] || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      cursor-pointer transition-colors duration-200
                      ${isSelected ? 'bg-sky-900/50' : 'hover:'}
                    `}
                    onClick={() => handleRowClick(row)}
                  >
                    {headers.map((header, headerIndex) => (
                      <TableCell key={headerIndex} className="py-3">
                        <div className="flex items-center gap-2">
                          {isSelected && headerIndex === 0 && (
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          )}
                          <span className={isSelected ? 'font-medium text-blue-500' : 'text-white'}>
                            {row[header.toLowerCase().replace(/\s+/g, '_')] || row[header] || '-'}
                          </span>
                        </div>
                      </TableCell>
                    ))}
                  </motion.tr>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={headers.length} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl text-gray-300">📋</div>
                    <p>No hay registros disponibles</p>
                    {searchTerm && (
                      <p className="text-sm">No se encontraron resultados para "{searchTerm}"</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer con información */}
      {filteredData.length > 0 && (
        <div className="px-4 py-3 border-t  text-sm text-gray-600">
          Mostrando {filteredData.length} de {data.length} registros
          {searchTerm && ` (filtrados por "${searchTerm}")`}
        </div>
      )}
    </div>
  );
};

export default ModernTable;
export { ModernTable };
