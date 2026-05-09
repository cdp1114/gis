import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import { ScaleLine, OverviewMap, MousePosition, defaults as defaultControls } from 'ol/control';
import { Draw, Modify, Select } from 'ol/interaction';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import Feature from 'ol/Feature';
import { Geometry, Point, LineString, Polygon } from 'ol/geom';
import * as turf from '@turf/turf';
import type { Feature as GeoJSONFeature, FeatureCollection } from 'geojson';

export interface MapOptions {
  target: string;
  center: [number, number];
  zoom: number;
  projection?: string;
}

export class GisMap {
  private map: Map;
  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer<Feature>;
  private drawInteraction: Draw | null = null;
  private modifyInteraction: Modify | null = null;
  private selectInteraction: Select | null = null;

  constructor(options: MapOptions) {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer<Feature>({
      source: this.vectorSource,
      style: new Style({
        fill: new Fill({ color: 'rgba(26, 86, 219, 0.2)' }),
        stroke: new Stroke({ color: '#1a56db', width: 2 }),
        image: new CircleStyle({ radius: 6, fill: new Fill({ color: '#1a56db' }) })
      })
    });

    const baseLayer = new TileLayer({
      source: new XYZ({
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        crossOrigin: 'anonymous'
      })
    });

    this.map = new Map({
      target: options.target,
      layers: [baseLayer, this.vectorLayer],
      view: new View({
        center: fromLonLat(options.center, options.projection || 'EPSG:4326'),
        zoom: options.zoom,
        projection: options.projection || 'EPSG:4326'
      }),
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: false,
        overviewMap: false,
        fullScreen: false,
        keyboard: false
      }).extend([
        new ScaleLine({ units: 'metric' })
      ])
    });
  }

  getMap(): Map {
    return this.map;
  }

  setCenter(center: [number, number]) {
    this.map.getView().setCenter(fromLonLat(center));
  }

  setZoom(zoom: number) {
    this.map.getView().setZoom(zoom);
  }

  getCenter(): [number, number] {
    return toLonLat(this.map.getView().getCenter() as [number, number]) as [number, number];
  }

  getZoom(): number {
    return this.map.getView().getZoom() || 0;
  }

  addFeature(geometry: Geometry, properties?: Record<string, any>): Feature {
    const feature = new Feature({ geometry, ...properties });
    this.vectorSource.addFeature(feature);
    return feature;
  }

  removeFeature(feature: Feature) {
    this.vectorSource.removeFeature(feature);
  }

  clearFeatures() {
    this.vectorSource.clear();
  }

  getFeatures(): Feature[] {
    return this.vectorSource.getFeatures();
  }

  enableDraw(type: 'Point' | 'LineString' | 'Polygon' | 'Circle', callback?: (feature: Feature) => void) {
    this.disableInteractions();
    this.drawInteraction = new Draw({
      source: this.vectorSource,
      type
    });

    if (callback) {
      this.drawInteraction.on('drawend', (event) => {
        callback(event.feature);
      });
    }

    this.map.addInteraction(this.drawInteraction);
  }

  enableModify(callback?: (features: Feature[]) => void) {
    this.modifyInteraction = new Modify({ source: this.vectorSource });
    if (callback) {
      this.modifyInteraction.on('modifyend', () => {
        callback(this.vectorSource.getFeatures());
      });
    }
    this.map.addInteraction(this.modifyInteraction);
  }

  enableSelect(callback?: (features: Feature[]) => void) {
    this.selectInteraction = new Select();
    if (callback) {
      this.selectInteraction.on('select', (event) => {
        callback(event.selected);
      });
    }
    this.map.addInteraction(this.selectInteraction);
  }

  disableInteractions() {
    if (this.drawInteraction) {
      this.map.removeInteraction(this.drawInteraction);
      this.drawInteraction = null;
    }
    if (this.modifyInteraction) {
      this.map.removeInteraction(this.modifyInteraction);
      this.modifyInteraction = null;
    }
    if (this.selectInteraction) {
      this.map.removeInteraction(this.selectInteraction);
      this.selectInteraction = null;
    }
  }

  measureDistance(coordinates: [number, number][]): number {
    if (coordinates.length < 2) return 0;
    const line = turf.lineString(coordinates);
    return turf.length(line, { unit: 'meters' });
  }

  measureArea(coordinates: [number, number][]): number {
    if (coordinates.length < 3) return 0;
    const polygon = turf.polygon([[...coordinates, coordinates[0]]]);
    return turf.area(polygon);
  }

  createBuffer(center: [number, number], radius: number, unit: 'meters' | 'kilometers' = 'meters'): Feature {
    const point = turf.point(center);
    const buffered = turf.buffer(point, radius, { units: unit });
    const geometry = new Polygon(buffered!.geometry.coordinates as [number, number][][]);
    return new Feature({ geometry });
  }

  getFeaturesInExtent(extent: [number, number, number, number]): Feature[] {
    return this.vectorSource.getFeaturesInExtent(extent);
  }

  highlightFeature(feature: Feature) {
    feature.setStyle(
      new Style({
        fill: new Fill({ color: 'rgba(16, 185, 129, 0.3)' }),
        stroke: new Stroke({ color: '#10b981', width: 3 }),
        image: new CircleStyle({ radius: 8, fill: new Fill({ color: '#10b981' }) })
      })
    );
  }

  exportToGeoJSON(): FeatureCollection {
    const features = this.vectorSource.getFeatures();
    return {
      type: 'FeatureCollection',
      features: features.map((f) => {
        return {
          type: 'Feature',
          id: f.getId(),
          geometry: f.getGeometry()!.transform('EPSG:4326', 'EPSG:4326') as any,
          properties: f.getProperties()
        };
      })
    };
  }

  importGeoJSON(geojson: FeatureCollection) {
    this.vectorSource.clear();
    geojson.features.forEach((feature) => {
      const geom = new Geometry();
      const props = { ...feature.properties, id: feature.id };
      this.addFeature(geom as any, props);
    });
  }

  dispose() {
    this.map.setTarget(undefined);
  }
}

export default GisMap;
