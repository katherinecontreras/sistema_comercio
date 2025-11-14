import React, { useState, useRef } from 'react';
import { Upload, X, AlertTriangle, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { uploadExcelTipoMaterial } from '@/actions/materiales';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToastHelpers } from '@/components/notifications/ToastProvider';

interface UploadExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipoMaterialId: number;
  tipoMaterialTitulo: string;
  onSuccess: () => void;
}

const UploadExcelModal: React.FC<UploadExcelModalProps> = ({
  isOpen,
  onClose,
  tipoMaterialId,
  tipoMaterialTitulo,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    materiales_creados: number;
    valor_dolar_actualizado: boolean;
    nuevo_valor_dolar: number | null;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError, showSuccess } = useToastHelpers();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar extensión
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'xlsx' && extension !== 'xls') {
        showError('Archivo inválido', 'Por favor selecciona un archivo Excel (.xlsx o .xls)');
        return;
      }
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const result = await uploadExcelTipoMaterial(tipoMaterialId, selectedFile);
      
      setUploadResult(result);
      
      let successMessage = `Se cargaron ${result.materiales_creados} materiales correctamente.`;
      if (result.valor_dolar_actualizado && result.nuevo_valor_dolar) {
        successMessage += ` El valor del dólar se actualizó a $${result.nuevo_valor_dolar.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`;
      }
      
      showSuccess('Carga exitosa', successMessage);
      
      // Esperar 2 segundos para que el usuario vea el resultado
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error al cargar Excel:', error);
      const errorMsg = error?.response?.data?.detail || error?.message || 'Error al procesar el archivo';
      showError('Error al cargar Excel', errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setUploadResult(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="relative w-full max-w-2xl border-slate-700/80 bg-slate-900/90 shadow-2xl backdrop-blur-lg">
              <button
                onClick={handleClose}
                disabled={uploading}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/80 text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Cerrar"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>

              <CardHeader className="border-b border-slate-800/60 pb-6">
                <CardTitle className="flex items-center gap-3 pr-10 text-2xl font-semibold text-white">
                  <Upload className="h-6 w-6 text-emerald-500" />
                  Cargar Excel de Materiales
                </CardTitle>
                <p className="mt-2 text-sm text-slate-400">
                  Tipo de material: <span className="font-semibold text-white">{tipoMaterialTitulo}</span>
                </p>
              </CardHeader>

              <CardContent className="space-y-6 p-6">
                {/* Advertencia */}
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                  <div className="text-sm text-amber-200">
                    <p className="font-semibold">Atención: Esta acción eliminará todos los materiales existentes</p>
                    <p className="mt-1 text-amber-300/80">
                      Todos los materiales actuales de esta tabla serán reemplazados por los datos del Excel. Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>

                {/* Selector de archivo */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-300">
                    Seleccionar archivo Excel
                  </label>
                  
                  {!selectedFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 p-8 transition-colors hover:border-emerald-500/50 hover:bg-slate-900/60"
                    >
                      <FileSpreadsheet className="h-12 w-12 text-slate-500 transition-colors group-hover:text-emerald-500" />
                      <p className="mt-3 text-sm font-medium text-slate-300">
                        Haz clic para seleccionar un archivo
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Formatos soportados: .xlsx, .xls
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="h-8 w-8 text-emerald-500" />
                        <div>
                          <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                          <p className="text-xs text-slate-400">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        disabled={uploading}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Resultado de la carga */}
                {uploadResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4"
                  >
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                    <div className="text-sm text-emerald-200">
                      <p className="font-semibold">Carga completada exitosamente</p>
                      <ul className="mt-2 space-y-1 text-emerald-300/80">
                        <li>• {uploadResult.materiales_creados} materiales cargados</li>
                        {uploadResult.valor_dolar_actualizado && uploadResult.nuevo_valor_dolar && (
                          <li>
                            • Valor del dólar actualizado: $
                            {uploadResult.nuevo_valor_dolar.toLocaleString('es-AR', {
                              minimumFractionDigits: 2,
                            })}
                          </li>
                        )}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* Botones de acción */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={uploading}
                    className="border-slate-600/60 bg-slate-800/60 text-slate-200 hover:bg-slate-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Cargar Excel
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UploadExcelModal;