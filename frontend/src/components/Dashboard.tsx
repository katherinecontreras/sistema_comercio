import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, Calculator, Settings } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-white mb-8">
            Panel Principal
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/seleccionar-cliente"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calculator className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Generar Cotización
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Crear nueva cotización
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/catalogos"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Catálogos
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Recursos, clientes, proveedores
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/usuarios"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Usuarios
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Gestionar usuarios y roles
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/configuracion"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Settings className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Configuración
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Parámetros globales
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


