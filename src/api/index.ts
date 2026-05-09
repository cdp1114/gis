import axios from 'axios';
import type {
  Layer,
  Feature,
  FeatureQuery,
  BufferAnalysis,
  MeasureResult,
  LoginRequest,
  LoginResponse,
  ApiResponse,
  PageResult,
  StatsData,
  HeatmapData,
  User
} from '@/types/gis';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: LoginRequest) =>
    request.post<ApiResponse<LoginResponse>>('/auth/login', data),
  logout: () => request.post('/auth/logout'),
  getCurrentUser: () => request.get<ApiResponse<User>>('/auth/current')
};

export const layerApi = {
  list: () => request.get<ApiResponse<Layer[]>>('/gis/layer/list'),
  getById: (id: string) => request.get<ApiResponse<Layer>>(`/gis/layer/${id}`),
  create: (data: Partial<Layer>) => request.post<ApiResponse<Layer>>('/gis/layer', data),
  update: (id: string, data: Partial<Layer>) =>
    request.put<ApiResponse<Layer>>(`/gis/layer/${id}`, data),
  delete: (id: string) => request.delete(`/gis/layer/${id}`)
};

export const featureApi = {
  query: (data: FeatureQuery) =>
    request.post<ApiResponse<PageResult<Feature>>>('/gis/feature/query', data),
  getById: (id: string) => request.get<ApiResponse<Feature>>(`/gis/feature/${id}`),
  create: (data: Partial<Feature>) => request.post<ApiResponse<Feature>>('/gis/feature', data),
  update: (id: string, data: Partial<Feature>) =>
    request.put<ApiResponse<Feature>>(`/gis/feature/${id}`, data),
  delete: (id: string) => request.delete(`/gis/feature/${id}`)
};

export const analysisApi = {
  buffer: (data: BufferAnalysis) =>
    request.post<ApiResponse<Feature[]>>('/gis/analysis/buffer', data),
  overlay: (data: any) => request.post<ApiResponse<Feature[]>>('/gis/analysis/overlay', data),
  measure: (data: any) => request.post<ApiResponse<MeasureResult>>('/gis/analysis/measure', data)
};

export const dataApi = {
  import: (formData: FormData) =>
    request.post<ApiResponse<{ success: number; failed: number }>>('/gis/data/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  export: (data: { layerId: string; format: string }) =>
    request.post('/gis/data/export', data, { responseType: 'blob' }),
  validate: (data: any) => request.post<ApiResponse<any>>('/gis/data/validate', data)
};

export const statsApi = {
  count: (params: { type?: string; region?: string }) =>
    request.get<ApiResponse<StatsData[]>>('/gis/stats/count', { params }),
  heatmap: (params: { layerId: string }) =>
    request.get<ApiResponse<HeatmapData>>('/gis/stats/heatmap', { params })
};

export const systemApi = {
  user: {
    list: (params: { page?: number; size?: number }) =>
      request.get<ApiResponse<PageResult<User>>>('/system/user/list', { params }),
    create: (data: Partial<User>) => request.post<ApiResponse<User>>('/system/user', data),
    update: (id: string, data: Partial<User>) =>
      request.put<ApiResponse<User>>(`/system/user/${id}`, data),
    delete: (id: string) => request.delete(`/system/user/${id}`)
  },
  role: {
    list: () => request.get('/system/role/list')
  }
};

export default request;
