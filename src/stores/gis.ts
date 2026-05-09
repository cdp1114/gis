import { defineStore } from 'pinia';
import type { Layer, MapPosition, Feature, DrawType } from '@/types/gis';

interface GisState {
  layers: Layer[];
  activeLayerId: string | null;
  mapPosition: MapPosition;
  selectedFeatures: Feature[];
  activeDrawType: DrawType;
  measureMode: 'none' | 'distance' | 'area';
  isLoading: boolean;
  zoom: number;
  center: [number, number];
  projection: string;
}

export const useGisStore = defineStore('gis', {
  state: (): GisState => ({
    layers: [],
    activeLayerId: null,
    mapPosition: {
      center: [116.3974, 39.9088],
      zoom: 10,
      rotation: 0
    },
    selectedFeatures: [],
    activeDrawType: 'none',
    measureMode: 'none',
    isLoading: false,
    zoom: 10,
    center: [116.3974, 39.9088],
    projection: 'EPSG:4326'
  }),

  getters: {
    visibleLayers: (state) => state.layers.filter(l => l.isVisible),
    getLayerById: (state) => (id: string) => state.layers.find(l => l.id === id),
    hasMeasure: (state) => state.measureMode !== 'none'
  },

  actions: {
    setMapPosition(position: MapPosition) {
      this.mapPosition = position;
      this.center = position.center;
      this.zoom = position.zoom;
    },

    setCenter(center: [number, number]) {
      this.center = center;
      this.mapPosition.center = center;
    },

    setZoom(zoom: number) {
      this.zoom = zoom;
      this.mapPosition.zoom = zoom;
    },

    addLayer(layer: Layer) {
      this.layers.push(layer);
    },

    removeLayer(id: string) {
      const index = this.layers.findIndex(l => l.id === id);
      if (index > -1) {
        this.layers.splice(index, 1);
      }
    },

    updateLayer(id: string, updates: Partial<Layer>) {
      const layer = this.layers.find(l => l.id === id);
      if (layer) {
        Object.assign(layer, updates);
      }
    },

    toggleLayerVisibility(id: string) {
      const layer = this.layers.find(l => l.id === id);
      if (layer) {
        layer.isVisible = !layer.isVisible;
      }
    },

    setActiveLayer(id: string | null) {
      this.activeLayerId = id;
    },

    setDrawType(type: DrawType) {
      this.activeDrawType = type;
    },

    setMeasureMode(mode: 'none' | 'distance' | 'area') {
      this.measureMode = mode;
    },

    setSelectedFeatures(features: Feature[]) {
      this.selectedFeatures = features;
    },

    addSelectedFeature(feature: Feature) {
      this.selectedFeatures.push(feature);
    },

    clearSelectedFeatures() {
      this.selectedFeatures = [];
    },

    setLoading(loading: boolean) {
      this.isLoading = loading;
    },

    reorderLayers(fromIndex: number, toIndex: number) {
      const layers = [...this.layers];
      const [removed] = layers.splice(fromIndex, 1);
      layers.splice(toIndex, 0, removed);
      this.layers = layers;
    }
  }
});
