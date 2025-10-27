import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Check } from 'lucide-react';

interface ResourceTableProps {
  resources: any[];
  selectedResources: number[];
  onToggleSelection: (id: number) => void;
  onUpdateResource: (id: number, field: string, value: any) => void;
  accionsActivated: boolean;
  onEditResource: (resource: any) => void ;
  onDeleteResource: (id: number) => void ;
  loading?: boolean;
}

const ResourceTable: React.FC<ResourceTableProps> = ({
  resources,
  selectedResources,
  onToggleSelection,
  onUpdateResource,
  accionsActivated,
  onEditResource,
  onDeleteResource,
  loading = false
}) => {
  const isSelected = (id: number) => selectedResources.includes(id);

  const handleQuantityChange = (id: number, value: string) => {
    const quantity = parseFloat(value) || 0;
    onUpdateResource(id, 'cantidad', quantity);
  };

  const handlePriceChange = (id: number, value: string) => {
    const price = parseFloat(value) || 0;
    onUpdateResource(id, 'precio_unitario', price);
  };

  const handleUsageChange = (id: number, value: string) => {
    const usage = parseFloat(value) || 0;
    onUpdateResource(id, 'porcentaje_de_uso', usage);
  };

  const handleTimeChange = (id: number, value: string) => {
    const time = parseFloat(value) || 0;
    onUpdateResource(id, 'tiempo_de_uso', time);
  };

  const calculateTotal = (resource: any) => {
    const quantity = resource.cantidad || 0;
    const price = resource.precio_unitario || 0;
    const usage = resource.porcentaje_de_uso || 100;
    return (quantity * price * usage) / 100;
  };
  if (loading) {
    
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-white">Cargando recursos...</p>
        </div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center p-8 text-white">
        <p>No hay recursos disponibles</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="text-right">Precio Unit.</TableHead>
            <TableHead className="text-right">% Uso</TableHead>
            <TableHead className="text-right">Tiempo Uso</TableHead>
            <TableHead className="text-right">Total</TableHead>
            {accionsActivated && <TableHead className="w-20">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          
          {resources.map((resource) => (
            <TableRow
              key={resource.id_recurso}
              className={`cursor-pointer transition-colors ${
                isSelected(resource.id_recurso)
                  ? 'bg-green-400/10 hover:bg-green-500/10'
                  : 'hover:bg-slate-600'
              }`}
              onClick={() => onToggleSelection(resource.id_recurso)}
            >
              <TableCell>
                {isSelected(resource.id_recurso) && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </TableCell>
              <TableCell className="font-medium">
                {resource.descripcion}
              </TableCell>
              <TableCell>
                {resource.unidad?.simbolo || resource.unidad?.nombre || '-'}
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  value={resource.cantidad || ''}
                  onChange={(e) => handleQuantityChange(resource.id_recurso, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-20 text-right"
                  min="0"
                  step="0.01"
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  value={resource.costo_unitario_predeterminado || ''}
                  onChange={(e) => handlePriceChange(resource.id_recurso, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-24 text-right"
                  min="0"
                  step="0.01"
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  value={resource.porcentaje_de_uso || 100}
                  onChange={(e) => handleUsageChange(resource.id_recurso, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-16 text-right"
                  min="0"
                  max="100"
                  step="1"
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  value={resource.tiempo_de_uso || ''}
                  onChange={(e) => handleTimeChange(resource.id_recurso, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-20 text-right"
                  min="0"
                  step="0.01"
                />
              </TableCell>
              <TableCell className="text-right font-medium">
                ${calculateTotal(resource).toFixed(2)}
              </TableCell>
              {accionsActivated &&
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditResource(resource);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteResource(resource.id_recurso);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
              }
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  className = ''
}) => {
  return (
    <div className={`bg-white p-4 rounded-lg border ${className}`}>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default ResourceTable;
export { SummaryCard };