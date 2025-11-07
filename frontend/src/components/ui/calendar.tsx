import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface DiaMes {
  id_dia: number;
  fecha: number;
  dia: string;
  hs_normales: number;
  hs_50porc: number;
  hs_100porc: number;
  total_horas: number;
}

interface MonthCalendarProps {
  diasMes: DiaMes[];
  onUpdateDia?: (id_dia: number, data: Partial<DiaMes>) => Promise<void>;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({ diasMes, onUpdateDia }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DiaMes | null>(null);
  const [formData, setFormData] = useState({
    hs_normales: 0,
    hs_50porc: 0,
    hs_100porc: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  // Calcular total automáticamente (entero)
  const totalHoras = Math.round(formData.hs_normales + formData.hs_50porc + formData.hs_100porc);

  // Organizar días en semanas (31 días, comenzando en lunes)
  const getWeeks = () => {
    const weeks: number[][] = [];
    let currentWeek: number[] = [];
    
    for (let day = 1; day <= 31; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Agregar última semana si no está completa
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(0); // 0 representa celda vacía
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const getDayData = (dayNumber: number): DiaMes | undefined => {
    // Buscar por fecha (1-31) que corresponde al día del mes
    return diasMes.find(d => d.fecha === dayNumber);
  };

  const hasEvent = (dayNumber: number): boolean => {
    const dayData = getDayData(dayNumber);
    if (!dayData) return false;
    return dayData.hs_normales > 0 || dayData.hs_50porc > 0 || 
           dayData.hs_100porc > 0 || dayData.total_horas > 0;
  };

  const handleDayClick = (dayNumber: number) => {
    const dayData = getDayData(dayNumber);
    if (!dayData) return;
    
    setSelectedDay(dayData);
    setFormData({
      hs_normales: dayData.hs_normales,
      hs_50porc: dayData.hs_50porc,
      hs_100porc: dayData.hs_100porc
    });
    setIsFlipped(true);
  };

  const handleCancel = () => {
    setIsFlipped(false);
    setSelectedDay(null);
  };

  const handleSave = async () => {
    if (!selectedDay || !onUpdateDia) return;
    
    setIsLoading(true);
    try {
      // Asegurar que todos los valores sean enteros
      const dataToSend = {
        hs_normales: Math.round(formData.hs_normales),
        hs_50porc: Math.round(formData.hs_50porc),
        hs_100porc: Math.round(formData.hs_100porc),
        total_horas: Math.round(totalHoras)
      };
      
      await onUpdateDia(selectedDay.id_dia, dataToSend);
      setIsFlipped(false);
      setSelectedDay(null);
    } catch (error) {
      console.error('Error al actualizar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    // Convertir a entero (redondeando)
    const numValue = Math.round(parseFloat(value) || 0);
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const weeks = getWeeks();

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-full h-[500px]" style={{ perspective: '1000px' }}>
        <div 
          className={`relative w-full h-full transition-transform duration-700 ease-in-out`}
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* FRONT - Calendario */}
          <div 
            className="absolute w-full h-full rounded-2xl shadow-2xl border"
            style={{ 
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, rgb(15 23 42) 0%, rgb(30 41 59) 100%)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div 
                className="px-8 py-6 border-b"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <h1 className="text-xl font-semibold text-white tracking-tight">
                  Mes de Ejemplo
                </h1>
              </div>

              {/* Week Days */}
              <div className="px-8 py-4">
                <div className="grid grid-cols-7 gap-2 text-slate-400 font-semibold text-xs">
                  {weekDays.map((day, idx) => (
                    <div key={idx} className="text-center">
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Days Grid - Ocupa todo el espacio disponible */}
              <div className="px-8 flex-1 flex items-center">
                <div className="w-full flex flex-col justify-evenly h-full py-2">
                  {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="grid grid-cols-7 gap-2">
                      {week.map((day, dayIdx) => (
                        <div 
                          key={dayIdx}
                          className={`
                            relative text-center py-3 px-2 text-base font-light text-white rounded-lg
                            transition-all duration-300 ease-in-out
                            ${day > 0 ? 'cursor-pointer hover:bg-sky-600/20 hover:font-semibold hover:scale-105 hover:shadow-lg hover:shadow-sky-500/20' : ''}
                            ${day > 0 && hasEvent(day) ? 'bg-sky-600/30' : ''}
                          `}
                          onClick={() => day > 0 && handleDayClick(day)}
                        >
                          {day > 0 && (
                            <>
                              <span>{day.toString().padStart(2, '0')}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BACK - Formulario con Tabla */}
          <div 
            className="absolute w-full h-full rounded-2xl shadow-2xl border"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, rgb(15 23 42) 0%, rgb(30 41 59) 100%)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex flex-col h-full">
              {/* Header con fecha seleccionada */}
              <div 
                className="px-8 py-6 border-b"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <h1 className="text-xl font-semibold text-white tracking-tight">
                  {selectedDay && `Día ${selectedDay.fecha} - ${selectedDay.dia}`}
                </h1>
              </div>

              {/* Tabla de valores */}
              <div className="flex-1 flex items-center justify-center px-8 py-6">
                <div className="w-full max-w-md">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b transition-colors hover:bg-white/5" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <td className="py-3 px-4 text-slate-300 font-medium text-sm">
                          Horas Normales
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={formData.hs_normales}
                            onChange={(e) => handleInputChange('hs_normales', e.target.value)}
                            className="w-full h-9 bg-white/5 border border-white/20 rounded-lg text-white text-sm px-3 text-right focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/50 transition-all"
                          />
                        </td>
                      </tr>
                      
                      <tr className="border-b transition-colors hover:bg-white/5" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <td className="py-3 px-4 text-slate-300 font-medium text-sm">
                          Horas 50%
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={formData.hs_50porc}
                            onChange={(e) => handleInputChange('hs_50porc', e.target.value)}
                            className="w-full h-9 bg-white/5 border border-white/20 rounded-lg text-white text-sm px-3 text-right focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/50 transition-all"
                          />
                        </td>
                      </tr>
                      
                      <tr className="border-b transition-colors hover:bg-white/5" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <td className="py-3 px-4 text-slate-300 font-medium text-sm">
                          Horas 100%
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={formData.hs_100porc}
                            onChange={(e) => handleInputChange('hs_100porc', e.target.value)}
                            className="w-full h-9 bg-white/5 border border-white/20 rounded-lg text-white text-sm px-3 text-right focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/50 transition-all"
                          />
                        </td>
                      </tr>
                      
                      <tr className="bg-sky-600/10">
                        <td className="py-3 px-4 text-white font-semibold text-sm">
                          Total Horas
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-full h-9 bg-sky-600/20 border border-sky-500/30 rounded-lg text-white font-semibold text-sm px-3 flex items-center justify-end">
                            {totalHoras}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Botones */}
              <div 
                className="grid grid-cols-2 border-t"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <button
                  onClick={handleCancel}
                  className="py-5 text-white font-semibold uppercase tracking-wider text-sm border-r transition-all hover:bg-white/5 active:bg-white/10 flex items-center justify-center gap-2"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  disabled={isLoading}
                >
                  Cancelar
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSave}
                  className="py-5 text-white font-semibold uppercase tracking-wider text-sm transition-all hover:bg-sky-600/20 active:bg-sky-600/30 flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Guardando...' : 'Agregar'}
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthCalendar;
