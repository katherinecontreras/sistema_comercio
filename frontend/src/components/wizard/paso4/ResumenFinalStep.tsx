import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, DollarSign, Package, Building, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/app';

interface ResumenFinalStepProps {
  onBack: () => void;
  onFinish: () => void;
}

export const ResumenFinalStep: React.FC<ResumenFinalStepProps> = ({ 
  onBack, 
  onFinish 
}) => {
  const { wizard } = useAppStore();

  // Calcular estadísticas
  const totalObras = wizard.obras.length;
  const totalItems = wizard.items.length;
  
  // Verificar items completados vs pendientes
  const itemsWithCostos = wizard.items.filter(item => 
    wizard.costos.some(costo => costo.id_item_obra === item.id)
  );
  const itemsCompletados = itemsWithCostos.length;
  const itemsPendientes = totalItems - itemsCompletados;

  // Calcular costos por obra
  const costosPorObra = wizard.obras.map(obra => {
    const obraItems = wizard.items.filter(item => item.id_obra === obra.id);
    const totalCostoObra = obraItems.reduce((sum, item) => {
      return sum + wizard.costos
        .filter(c => c.id_item_obra === item.id)
        .reduce((s, c) => s + c.total_linea, 0);
    }, 0);
    const totalRecursosObra = obraItems.reduce((sum, item) => {
      return sum + wizard.costos.filter(c => c.id_item_obra === item.id).length;
    }, 0);

    return {
      obra,
      totalCosto: totalCostoObra,
      totalRecursos: totalRecursosObra,
      items: obraItems.length
    };
  });

  const costoTotalGeneral = costosPorObra.reduce((sum, obra) => sum + obra.totalCosto, 0);
  const recursosTotalGeneral = costosPorObra.reduce((sum, obra) => sum + obra.totalRecursos, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Resumen de Recursos por Planilla</h3>
          <p className="text-muted-foreground">Revisa todos los recursos asignados antes de finalizar</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Configuración completada</span>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{totalObras}</div>
                <div className="text-sm text-slate-400">Obras</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{itemsCompletados}/{totalItems}</div>
                <div className="text-sm text-slate-400">Items Completados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-amber-400" />
              <div>
                <div className="text-2xl font-bold text-white">{recursosTotalGeneral}</div>
                <div className="text-sm text-slate-400">Recursos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">${costoTotalGeneral.toFixed(2)}</div>
                <div className="text-sm text-slate-400">Costo Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta si hay items pendientes */}
      {itemsPendientes > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800">
                {itemsPendientes} item{itemsPendientes !== 1 ? 's' : ''} pendiente{itemsPendientes !== 1 ? 's' : ''}
              </h3>
              <p className="text-amber-700">
                Aún tienes {itemsPendientes} item{itemsPendientes !== 1 ? 's' : ''} sin recursos asignados. 
                Completa todos los items antes de continuar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resumen por Obra */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen por Obra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {costosPorObra.map(({ obra, totalCosto, totalRecursos, items }) => (
              <div 
                key={obra.id}
                className="bg-slate-700/50 border border-slate-600 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{obra.nombre}</h4>
                    <div className="text-sm text-slate-400 mt-1">
                      {items} item{items !== 1 ? 's' : ''} • {totalRecursos} recurso{totalRecursos !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      ${totalCosto.toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-400">
                      {totalRecursos > 0 ? 'Con recursos' : 'Sin recursos'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between">
        <Button 
          onClick={onBack}
          variant="outline"
          className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
        >
          Volver
        </Button>
        
        <Button 
          onClick={onFinish}
          disabled={itemsPendientes > 0}
          className={`${
            itemsPendientes > 0 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {itemsPendientes > 0 ? 'Completar Items Pendientes' : 'Finalizar Configuración'}
        </Button>
      </div>
    </div>
  );
};