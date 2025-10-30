import React, { useMemo, useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import type { Personal } from '@/store/personal/personalStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatePresence, motion } from 'framer-motion';
import MotionWrap from '../animations/motion-wrap';

interface PersonalTableProps {
  rows: Personal[];
  loading?: boolean;
  section?: 'sueldos' | 'costos' | 'descuentos' | 'cargas_sociales' | 'otros';
  showSectionSelector?: boolean;
}

const PersonalTable: React.FC<PersonalTableProps> = ({ rows, loading = false, section, showSectionSelector = true }) => {
  const SECTION_CONFIG: Record<string, { tipo: string; columns: { label: string; key: keyof Personal }[] }> = {
    sueldos: {
      tipo: 'Sueldos',
      columns: [
        { label: 'Sueldo Bruto', key: 'sueldo_bruto' },
        { label: 'Sueldo No Rem.', key: 'sueldo_no_remunerado' },
        { label: 'Neto c/ Vianda x Día', key: 'neto_mensual_con_vianda_xdia' },
      ],
    },
    costos: {
      tipo: 'Costos',
      columns: [
        { label: 'Seguros ART + VO', key: 'seguros_art_mas_vo' },
        { label: 'Costo Mensual s/ Seg.', key: 'costo_mensual_sin_seguros' },
        { label: 'Costo Total Mensual', key: 'costo_total_mensual' },
        { label: 'Costo Total (Apertura)', key: 'costo_total_mensual_apertura' },
      ],
    },
    descuentos: {
      tipo: 'Descuentos',
      columns: [
        { label: 'Descuentos', key: 'descuentos' },
        { label: '% Descuento', key: 'porc_descuento' },
      ],
    },
    cargas_sociales: {
      tipo: 'Cargas Sociales',
      columns: [
        { label: 'Cargas Sociales', key: 'cargas_sociales' },
        { label: '% Cargas s/ Bruto', key: 'porc_cargas_sociales_sobre_sueldo_bruto' },
      ],
    },
    otros: {
      tipo: 'Otros',
      columns: [
        { label: 'Examen Médico y Cap.', key: 'examen_medico_y_capacitacion' },
        { label: 'Indumentaria y EPP', key: 'indumentaria_y_epp' },
        { label: 'Pernoctes y Viajes', key: 'pernoctes_y_viajes' },
      ],
    },
  };

  const [currentSection, setCurrentSection] = useState<'sueldos' | 'costos' | 'descuentos' | 'cargas_sociales' | 'otros'>(section || 'sueldos');

  useEffect(() => {
    if (section) setCurrentSection(section);
  }, [section]);

  const columnsToRender = useMemo(() => SECTION_CONFIG[currentSection].columns, [currentSection]);

  return (
    <div className="space-y-3">
      {showSectionSelector && (
        <div className="flex items-center gap-2">
          <Select value={currentSection} onValueChange={(v) => setCurrentSection(v as any)}>
            <SelectTrigger className="w-56 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Seleccionar sección" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 text-white border-slate-600">
              <SelectItem value="sueldos">Sueldos</SelectItem>
              <SelectItem value="costos">Costos</SelectItem>
              <SelectItem value="descuentos">Descuentos</SelectItem>
              <SelectItem value="cargas_sociales">Cargas Sociales</SelectItem>
              <SelectItem value="otros">Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="border border-slate-600 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-700 sticky top-0 z-10">
                <TableHead className="text-white">Función</TableHead>
                {columnsToRender.map((c) => (
                  <TableHead key={String(c.key)} className="text-right text-white">{c.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={1 + columnsToRender.length} className="text-center text-slate-300">Cargando...</TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={1 + columnsToRender.length} className="text-center text-slate-400">Sin datos</TableCell>
                </TableRow>
              ) : (
                <AnimatePresence mode="popLayout">
                  {rows.map((p) => (
                    <TableRow key={p.id_personal} className="hover:bg-slate-700/30">
                      <TableCell className="text-white">
                        <motion.div
                          key={`funcion-${p.id_personal}-${currentSection}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                        >
                          {p.funcion}
                        </motion.div>
                      </TableCell>
                      {columnsToRender.map((c, idx) => (
                        <TableCell key={String(c.key)} className="text-right text-slate-200">
                          <motion.div
                            key={`${p.id_personal}-${String(c.key)}-${currentSection}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18, delay: idx * 0.03 }}
                          >
                            {typeof p[c.key] === 'number'
                              ? (p[c.key] as unknown as number).toFixed(c.key.toString().startsWith('porc_') ? 4 : 2)
                              : (p[c.key] as any)}
                          </motion.div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PersonalTable;


