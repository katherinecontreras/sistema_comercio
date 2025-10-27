import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Edit, Trash2, FileText } from 'lucide-react';
import { useObraStore } from '@/store/obra';
import AddIncrementModal from '@/components/modals/AddIncrementModal';
import ConfirmModal from '@/components/modals/ConfirmModal';

interface Props {
  onBack: () => void;
}

const IncrementosView: React.FC<Props> = ({ onBack }) => {
  const { incrementos, addIncremento, updateIncremento, removeIncremento } = useObraStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIncrement, setEditingIncrement] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [incrementToDelete, setIncrementToDelete] = useState<number | null>(null);

  const handleAddIncrement = (incrementData: any) => {
    addIncremento(incrementData);
    setShowAddModal(false);
  };

  const handleEditIncrement = (increment: any) => {
    setEditingIncrement(increment);
    setShowAddModal(true);
  };

  const handleUpdateIncrement = (incrementData: any) => {
    updateIncremento(editingIncrement.id_incremento, incrementData);
    setEditingIncrement(null);
    setShowAddModal(false);
  };

  const handleDeleteIncrement = (id: number) => {
    setIncrementToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    if (incrementToDelete) {
      removeIncremento(incrementToDelete);
      setIncrementToDelete(null);
    }
    setShowConfirmModal(false);
  };

  const cancelDelete = () => {
    setIncrementToDelete(null);
    setShowConfirmModal(false);
  };

  const getItemName = (increment: any) => {
    if (increment.id_partida) {
      // Es una partida
      const partida = useObraStore.getState().partidas.find(p => p.id_partida === increment.id_partida);
      return partida?.nombre_partida || `Partida ${increment.id_partida}`;
    } else if (increment.id_subpartida) {
      // Es una subpartida
      const partidas = useObraStore.getState().partidas;
      for (const partida of partidas) {
        if (partida.subpartidas) {
          const subpartida = partida.subpartidas.find(sp => sp.id_subpartida === increment.id_subpartida);
          if (subpartida) {
            return `${partida.nombre_partida} - ${subpartida.descripcion_tarea}`;
          }
        }
      }
      return `SubPartida ${increment.id_subpartida}`;
    }
    return 'Desconocido';
  };

  const getItemType = (increment: any) => {
    return increment.id_partida ? 'Partida' : 'SubPartida';
  };

  const totalIncrementos = incrementos.reduce((sum, inc) => sum + (inc.monto_calculado || 0), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Resumen
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Incrementos</h1>
            <p className="text-slate-400">Gestiona los incrementos de la obra</p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Incremento
        </Button>
      </div>

      {/* Resumen de incrementos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-slate-400 text-sm">Total Incrementos</p>
                <p className="text-white text-xl font-semibold">{incrementos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-slate-400 text-sm">Costo Total</p>
                <p className="text-white text-xl font-semibold">
                  ${totalIncrementos.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-slate-400 text-sm">Promedio por Incremento</p>
                <p className="text-white text-xl font-semibold">
                  ${incrementos.length > 0 ? (totalIncrementos / incrementos.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de incrementos */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Lista de Incrementos</CardTitle>
        </CardHeader>
        <CardContent>
          {incrementos.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No hay incrementos</h3>
              <p className="text-slate-400 mb-4">
                Agrega tu primer incremento para comenzar
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Incremento
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Concepto</TableHead>
                    <TableHead className="text-slate-300">Item</TableHead>
                    <TableHead className="text-slate-300">Tipo</TableHead>
                    <TableHead className="text-slate-300">Valor</TableHead>
                    <TableHead className="text-slate-300">Monto Calculado</TableHead>
                    <TableHead className="text-slate-300">Descripción</TableHead>
                    <TableHead className="text-slate-300">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incrementos.map((increment) => (
                    <TableRow key={increment.id_incremento} className="border-slate-700">
                      <TableCell className="text-white font-medium">
                        {increment.concepto}
                      </TableCell>
                      <TableCell className="text-white">
                        {getItemName(increment)}
                      </TableCell>
                      <TableCell className="text-white">
                        <span className={`px-2 py-1 rounded text-xs ${
                          getItemType(increment) === 'Partida' 
                            ? 'bg-blue-900 text-blue-300' 
                            : 'bg-purple-900 text-purple-300'
                        }`}>
                          {getItemType(increment)}
                        </span>
                      </TableCell>
                      <TableCell className="text-white">
                        {increment.tipo_incremento === 'porcentaje' 
                          ? `${increment.porcentaje}%`
                          : `$${increment.valor?.toFixed(2) || '0.00'}`
                        }
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        ${increment.monto_calculado?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {increment.descripcion || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditIncrement(increment)}
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteIncrement(increment.id_incremento)}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para agregar/editar incremento */}
      <AddIncrementModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingIncrement(null);
        }}
        onSave={editingIncrement ? handleUpdateIncrement : handleAddIncrement}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        open={showConfirmModal}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar el incremento "${incrementos.find(inc => inc.id_incremento === incrementToDelete)?.concepto || 'este incremento'}"?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default IncrementosView;
