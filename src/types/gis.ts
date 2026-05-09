export interface Layer {
  id: string;
  layerName: string;
  layerCode: string;
  layerType: 'point' | 'line' | 'polygon' | 'raster' | 'wms' | 'wfs';
  dataSource?: string;
  srs?: string;
  isVisible: boolean;
  opacity: number;
  sortOrder: number;
  createTime?: string;
}

export interface Feature {
  id: string;
  layerId: string;
  geometry: GeoJSON.Geometry;
  properties: Record<string, any>;
  createTime?: string;
  updateTime?: string;
}

export interface FeatureQuery {
  layerId?: string;
  geometry?: GeoJSON.Geometry;
  bounds?: [number, number, number, number];
  attributes?: Record<string, any>;
  page?: number;
  pageSize?: number;
}

export interface BufferAnalysis {
  geometry: GeoJSON.Geometry;
  distance: number;
  unit: 'm' | 'km';
  targetLayers: string[];
}

export interface MeasureResult {
  type: 'distance' | 'area';
  value: number;
  unit: string;
}

export interface MapPosition {
  center: [number, number];
  zoom: number;
  rotation?: number;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  status: number;
  createTime?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface PageResult<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StatsData {
  type: string;
  count: number;
  percentage?: number;
}

export interface HeatmapData {
  coordinates: [number, number, number][];
  bounds: [number, number, number, number];
}

export type DrawType = 'point' | 'line' | 'polygon' | 'circle' | 'rectangle' | 'none';

export interface DrawInteraction {
  type: DrawType;
  active: boolean;
  coordinates?: number[];
}
