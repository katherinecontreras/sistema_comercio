import React, { useMemo, useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import type { Equipo } from '@/store/equipo/equipoStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatePresence, motion } from 'framer-motion';
import { sectionConfigEquipos } from '@/components/tables/Columns';

interface EquiposTableProps {
  rows: Equipo[];
  loading?: boolean;
  section?: 'propiedad' | 'operacion' | 'resumen';
  showSectionSelector?: boolean;
}

const EquiposTable: React.FC<EquiposTableProps> = ({ rows, loading = false, section, showSectionSelector = true }) => {
  const [currentSection, setCurrentSection] = useState<'propiedad' | 'operacion' | 'resumen'>(section || 'propiedad');

  useEffect(() => {
    if (section) setCurrentSection(section);
  }, [section]);

  const columnsToRender = useMemo(() => sectionConfigEquipos[currentSection].columns, [currentSection]);

  return (
    <div className="space-y-3">
      {showSectionSelector && (
        <div className="flex items-center gap-2">
          <Select value={currentSection} onValueChange={(v) => setCurrentSection(v as any)}>
            <SelectTrigger className="w-56 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Seleccionar sección" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 text-white border-slate-600">
              <SelectItem value="propiedad">Costos de Propiedad</SelectItem>
              <SelectItem value="operacion">Costos de Operación</SelectItem>
              <SelectItem value="resumen">Resumen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="border border-slate-600 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-700 sticky top-0 z-10">
                <TableHead className="text-white">Detalle</TableHead>
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
                  {rows.map((e) => (
                    <TableRow key={e.id_equipo} className="hover:bg-slate-700/30">
                      <TableCell className="text-white">
                        <motion.div
                          key={`detalle-${e.id_equipo}-${currentSection}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                        >
                          {e.detalle}
                        </motion.div>
                      </TableCell>
                      {columnsToRender.map((c, idx) => (
                        <TableCell key={String(c.key)} className="text-right text-slate-200">
                          <motion.div
                            key={`${e.id_equipo}-${String(c.key)}-${currentSection}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18, delay: idx * 0.03 }}
                          >
                            {typeof e[c.key] === 'number'
                              ? (e[c.key] as unknown as number).toFixed(2)
                              : (e[c.key] as any)}
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

export default EquiposTable;


