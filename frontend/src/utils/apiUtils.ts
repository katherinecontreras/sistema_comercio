// ============================================================================
// UTILIDADES DE API
// ============================================================================

import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  showLoading?: boolean;
  showError?: boolean;
  showSuccess?: boolean;
  retries?: number;
  timeout?: number;
}

// ============================================================================
// CONFIGURACIÓN BASE DE AXIOS
// ============================================================================

const API_BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// INTERCEPTORES
// ============================================================================

// Request interceptor - Agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log de requests en desarrollo
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Manejo de respuestas y errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log de responses en desarrollo
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Log de errores en desarrollo
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ============================================================================
// UTILIDADES DE MANEJO DE ERRORES
// ============================================================================

export const parseApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
      return {
        message: (axiosError.response?.data as any)?.detail || 
                 (axiosError.response?.data as any)?.message || 
                 axiosError.message || 
                 'Error desconocido',
      status: axiosError.response?.status,
      code: axiosError.code,
      details: axiosError.response?.data
    };
  }
  
  return {
    message: error.message || 'Error desconocido',
    details: error
  };
};

export const isNetworkError = (error: any): boolean => {
  return axios.isAxiosError(error) && !error.response;
};

export const isTimeoutError = (error: any): boolean => {
  return axios.isAxiosError(error) && error.code === 'ECONNABORTED';
};

export const isValidationError = (error: any): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 422;
};

export const isAuthError = (error: any): boolean => {
  return axios.isAxiosError(error) && 
         (error.response?.status === 401 || error.response?.status === 403);
};

// ============================================================================
// UTILIDADES DE RETRY
// ============================================================================

export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // No reintentar en errores de validación o autenticación
      if (isValidationError(error) || isAuthError(error)) {
        throw error;
      }
      
      // Si es el último intento, lanzar el error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// ============================================================================
// UTILIDADES DE CACHE
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  set<T>(key: string, data: T, ttl = 300000): void { // 5 minutos por defecto
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Verificar si expiró
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Verificar si expiró
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

export const apiCache = new ApiCache();

// ============================================================================
// UTILIDADES DE REQUEST
// ============================================================================

export const createCacheKey = (url: string, params?: any): string => {
  const paramString = params ? JSON.stringify(params) : '';
  return `${url}${paramString}`;
};

export const makeRequest = async <T>(
  config: ApiRequestConfig
): Promise<ApiResponse<T>> => {
  const { retries = 0, ...axiosConfig } = config;
  
  const requestFn = () => apiClient.request<T>(axiosConfig);
  
  try {
    const response = retries > 0 
      ? await retryRequest(requestFn, retries)
      : await requestFn();
    
    return {
      data: response.data,
      success: true
    };
  } catch (error) {
    const apiError = parseApiError(error);
    throw apiError;
  }
};

export const makeGetRequest = async <T>(
  url: string,
  params?: any,
  config?: ApiRequestConfig
): Promise<ApiResponse<T>> => {
  return makeRequest<T>({
    method: 'GET',
    url,
    params,
    ...config
  });
};

export const makePostRequest = async <T>(
  url: string,
  data?: any,
  config?: ApiRequestConfig
): Promise<ApiResponse<T>> => {
  return makeRequest<T>({
    method: 'POST',
    url,
    data,
    ...config
  });
};

export const makePutRequest = async <T>(
  url: string,
  data?: any,
  config?: ApiRequestConfig
): Promise<ApiResponse<T>> => {
  return makeRequest<T>({
    method: 'PUT',
    url,
    data,
    ...config
  });
};

export const makeDeleteRequest = async <T>(
  url: string,
  config?: ApiRequestConfig
): Promise<ApiResponse<T>> => {
  return makeRequest<T>({
    method: 'DELETE',
    url,
    ...config
  });
};

// ============================================================================
// UTILIDADES DE PAGINACIÓN
// ============================================================================

export const makePaginatedRequest = async <T>(
  url: string,
  page = 1,
  limit = 10,
  params?: any,
  config?: ApiRequestConfig
): Promise<PaginatedResponse<T>> => {
  const response = await makeGetRequest<PaginatedResponse<T>>(url, {
    page,
    limit,
    ...params
  }, config);
  
  return response.data;
};

// ============================================================================
// UTILIDADES DE UPLOAD
// ============================================================================

export const uploadFile = async (
  url: string,
  file: File,
  onProgress?: (progress: number) => void,
  config?: ApiRequestConfig
): Promise<ApiResponse<any>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return makeRequest({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
    ...config
  });
};

export const downloadFile = async (
  url: string,
  filename?: string,
  config?: ApiRequestConfig
): Promise<void> => {
  const response = await apiClient.request({
    method: 'GET',
    url,
    responseType: 'blob',
    ...config
  });
  
  const blob = new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = downloadUrl;
  link.download = filename || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(downloadUrl);
};

// ============================================================================
// UTILIDADES DE BATCH REQUESTS
// ============================================================================

export const makeBatchRequests = async <T>(
  requests: ApiRequestConfig[],
  options?: {
    concurrent?: boolean;
    maxConcurrency?: number;
    stopOnError?: boolean;
  }
): Promise<Array<ApiResponse<T> | ApiError>> => {
  const { concurrent = true, maxConcurrency = 5, stopOnError = false } = options || {};
  
  if (!concurrent) {
    // Ejecutar secuencialmente
    const results: Array<ApiResponse<T> | ApiError> = [];
    
    for (const request of requests) {
      try {
        const result = await makeRequest<T>(request);
        results.push(result);
      } catch (error) {
        const apiError = parseApiError(error);
        results.push(apiError);
        
        if (stopOnError) break;
      }
    }
    
    return results;
  }
  
  // Ejecutar concurrentemente con límite
  const executeRequest = async (request: ApiRequestConfig): Promise<ApiResponse<T> | ApiError> => {
    try {
      return await makeRequest<T>(request);
    } catch (error) {
      return parseApiError(error);
    }
  };
  
  const results: Array<ApiResponse<T> | ApiError> = [];
  
  for (let i = 0; i < requests.length; i += maxConcurrency) {
    const batch = requests.slice(i, i + maxConcurrency);
    const batchResults = await Promise.all(batch.map(executeRequest));
    
    results.push(...batchResults);
    
    // Verificar si hay errores y stopOnError está habilitado
    if (stopOnError && batchResults.some(result => 'message' in result)) {
      break;
    }
  }
  
  return results;
};

// ============================================================================
// UTILIDADES DE DEBUGGING
// ============================================================================

export const debugApi = {
  logRequest: (config: AxiosRequestConfig) => {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Config:', config);
      console.groupEnd();
    }
  },
  
  logResponse: (response: AxiosResponse) => {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.group(`✅ API Response: ${response.status} ${response.config.url}`);
      console.log('Data:', response.data);
      console.log('Headers:', response.headers);
      console.groupEnd();
    }
  },
  
  logError: (error: any) => {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.group(`❌ API Error`);
      console.error('Error:', error);
      console.groupEnd();
    }
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  apiClient,
  parseApiError,
  isNetworkError,
  isTimeoutError,
  isValidationError,
  isAuthError,
  retryRequest,
  apiCache,
  createCacheKey,
  makeRequest,
  makeGetRequest,
  makePostRequest,
  makePutRequest,
  makeDeleteRequest,
  makePaginatedRequest,
  uploadFile,
  downloadFile,
  makeBatchRequests,
  debugApi
};
