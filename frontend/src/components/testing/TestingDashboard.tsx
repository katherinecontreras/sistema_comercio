import React, { useState, useEffect } from 'react';
import { useObra } from '@/hooks/useObra';
import { useToastHelpers } from '@/components/notifications/ToastProvider';
import { ModernCard, StatsGrid, ModernButton } from '@/components/ui/ModernComponents';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Play, RotateCcw } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  duration?: number;
}

const TestingDashboard: React.FC = () => {
  const { 
    obra, 
    partidas, 
    incrementos, 
    resumen,
    loading,
    error,
    handleCreateObra,
    handleCreatePartida,
    handleCreateIncremento,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage
  } = useObra();
  
  const { showSuccess, showError, showInfo } = useToastHelpers();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    const results: TestResult[] = [];

    // Test 1: Store initialization
    try {
      const startTime = Date.now();
      loadFromLocalStorage();
      const duration = Date.now() - startTime;
      
      results.push({
        name: 'Store Initialization',
        status: 'pass',
        message: 'Store initialized successfully',
        duration
      });
    } catch (error) {
      results.push({
        name: 'Store Initialization',
        status: 'fail',
        message: `Failed to initialize store: ${error}`
      });
    }

    // Test 2: Obra creation
    try {
      const startTime = Date.now();
      const testObra = {
        id_cliente: 1,
        nombre_proyecto: 'Test Obra',
        descripcion_proyecto: 'Obra de prueba',
        fecha_creacion: new Date().toISOString().split('T')[0],
        moneda: 'USD',
        estado: 'borrador'
      };
      
      await handleCreateObra(testObra);
      const duration = Date.now() - startTime;
      
      results.push({
        name: 'Obra Creation',
        status: 'pass',
        message: 'Obra created successfully',
        duration
      });
    } catch (error) {
      results.push({
        name: 'Obra Creation',
        status: 'fail',
        message: `Failed to create obra: ${error}`
      });
    }

    // Test 3: Partida creation
    try {
      const startTime = Date.now();
      const testPartida = {
        nombre_partida: 'Test Partida',
        descripcion: 'Partida de prueba',
        duracion: 10,
        tiene_subpartidas: false
      };
      
      await handleCreatePartida(testPartida);
      const duration = Date.now() - startTime;
      
      results.push({
        name: 'Partida Creation',
        status: 'pass',
        message: 'Partida created successfully',
        duration
      });
    } catch (error) {
      results.push({
        name: 'Partida Creation',
        status: 'fail',
        message: `Failed to create partida: ${error}`
      });
    }

    // Test 4: Increment creation
    try {
      const startTime = Date.now();
      const testIncremento = {
        concepto: 'Test Incremento',
        descripcion: 'Incremento de prueba',
        tipo_incremento: 'monto_fijo',
        valor: 1000,
        monto_calculado: 1000
      };
      
      await handleCreateIncremento(testIncremento);
      const duration = Date.now() - startTime;
      
      results.push({
        name: 'Increment Creation',
        status: 'pass',
        message: 'Increment created successfully',
        duration
      });
    } catch (error) {
      results.push({
        name: 'Increment Creation',
        status: 'fail',
        message: `Failed to create increment: ${error}`
      });
    }

    // Test 5: Local storage
    try {
      const startTime = Date.now();
      saveToLocalStorage();
      const duration = Date.now() - startTime;
      
      results.push({
        name: 'Local Storage Save',
        status: 'pass',
        message: 'Data saved to localStorage successfully',
        duration
      });
    } catch (error) {
      results.push({
        name: 'Local Storage Save',
        status: 'fail',
        message: `Failed to save to localStorage: ${error}`
      });
    }

    // Test 6: Summary calculation
    try {
      const startTime = Date.now();
      const hasValidSummary = resumen && 
        typeof resumen.cantidad_partidas === 'number' &&
        typeof resumen.costo_total_oferta_con_incremento === 'number';
      const duration = Date.now() - startTime;
      
      results.push({
        name: 'Summary Calculation',
        status: hasValidSummary ? 'pass' : 'warning',
        message: hasValidSummary ? 'Summary calculated correctly' : 'Summary calculation incomplete',
        duration
      });
    } catch (error) {
      results.push({
        name: 'Summary Calculation',
        status: 'fail',
        message: `Failed to calculate summary: ${error}`
      });
    }

    // Test 7: Data consistency
    try {
      const partidasCount = partidas.length;
      const resumenCount = resumen.cantidad_partidas;
      const isConsistent = partidasCount === resumenCount;
      
      results.push({
        name: 'Data Consistency',
        status: isConsistent ? 'pass' : 'warning',
        message: isConsistent 
          ? `Data is consistent (${partidasCount} partidas)` 
          : `Data inconsistency: ${partidasCount} partidas vs ${resumenCount} in summary`
      });
    } catch (error) {
      results.push({
        name: 'Data Consistency',
        status: 'fail',
        message: `Failed to check data consistency: ${error}`
      });
    }

    setTestResults(results);
    setIsRunningTests(false);

    // Show summary
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warning').length;

    if (failed === 0) {
      showSuccess('Tests Completed', `${passed} passed, ${warnings} warnings`);
    } else {
      showError('Tests Completed', `${passed} passed, ${failed} failed, ${warnings} warnings`);
    }
  };

  const resetTests = () => {
    setTestResults([]);
    clearLocalStorage();
    showInfo('Tests Reset', 'All test data has been cleared');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'border-l-green-500 bg-green-50';
      case 'fail':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
    }
  };

  const passedTests = testResults.filter(r => r.status === 'pass').length;
  const failedTests = testResults.filter(r => r.status === 'fail').length;
  const warningTests = testResults.filter(r => r.status === 'warning').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Testing Dashboard</h1>
            <p className="text-purple-100">Verificación de funcionalidades del sistema</p>
          </div>
          <div className="flex gap-3">
            <ModernButton
              variant="secondary"
              onClick={resetTests}
              disabled={isRunningTests}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Tests
            </ModernButton>
            <ModernButton
              onClick={runTests}
              loading={isRunningTests}
              disabled={isRunningTests}
            >
              <Play className="h-4 w-4 mr-2" />
              Run Tests
            </ModernButton>
          </div>
        </div>
      </div>

      {/* Test Summary */}
      {testResults.length > 0 && (
        <StatsGrid>
          <ModernCard
            title="Tests Passed"
            value={passedTests}
            icon={<CheckCircle className="h-5 w-5" />}
            trend="up"
            trendValue={`${Math.round((passedTests / testResults.length) * 100)}%`}
          />
          <ModernCard
            title="Tests Failed"
            value={failedTests}
            icon={<XCircle className="h-5 w-5" />}
            trend={failedTests > 0 ? 'down' : 'neutral'}
            trendValue={`${Math.round((failedTests / testResults.length) * 100)}%`}
          />
          <ModernCard
            title="Warnings"
            value={warningTests}
            icon={<AlertTriangle className="h-5 w-5" />}
            trend="neutral"
            trendValue={`${Math.round((warningTests / testResults.length) * 100)}%`}
          />
          <ModernCard
            title="Total Tests"
            value={testResults.length}
            icon={<Play className="h-5 w-5" />}
            trend="neutral"
            trendValue="100%"
          />
        </StatsGrid>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <motion.div
                key={result.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border-l-4 ${getStatusColor(result.status)} rounded-lg p-4`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{result.name}</h4>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  {result.duration && (
                    <div className="text-sm text-gray-500">
                      {result.duration}ms
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Loading State:</span>
              <span className={`text-sm font-medium ${loading ? 'text-yellow-600' : 'text-green-600'}`}>
                {loading ? 'Loading...' : 'Ready'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Error State:</span>
              <span className={`text-sm font-medium ${error ? 'text-red-600' : 'text-green-600'}`}>
                {error ? 'Error' : 'No Errors'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Obra Status:</span>
              <span className={`text-sm font-medium ${obra ? 'text-green-600' : 'text-gray-600'}`}>
                {obra ? 'Active' : 'None'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Partidas:</span>
              <span className="text-sm font-medium">{partidas.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Incrementos:</span>
              <span className="text-sm font-medium">{incrementos.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Summary:</span>
              <span className={`text-sm font-medium ${resumen ? 'text-green-600' : 'text-gray-600'}`}>
                {resumen ? 'Calculated' : 'Not Available'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TestingDashboard;
