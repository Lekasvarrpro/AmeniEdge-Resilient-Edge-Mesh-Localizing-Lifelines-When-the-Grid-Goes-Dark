import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { api } from '../../lib/api/client';

export interface MapMarkerItem {
  id: string;
  type: 'INCIDENT' | 'SHELTER' | 'HAZARD' | 'TEAM' | 'STATION';
  title: string;
  category?: string;
  priority?: string;
  status?: string;
  lat: number;
  lng: number;
  details?: string;
}

export const OfflineMapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [items, setItems] = useState<MapMarkerItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MapMarkerItem | null>(null);
  const [showLayerSheet, setShowLayerSheet] = useState(false);

  const [layers, setLayers] = useState({
    incidents: true,
    shelters: true,
    hazards: true,
    teams: true,
    stations: true,
  });

  // Initial map setup
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center: Chennai Station North (13.0827, 80.2707)
    const map = L.map(mapContainerRef.current, {
      center: [13.0827, 80.2707],
      zoom: 14,
      zoomControl: false,
    });

    // Add locally cached tile layer from Station API
    L.tileLayer('/api/v1/maps/tiles/{z}/{x}/{y}', {
      minZoom: 11,
      maxZoom: 16,
      attribution: '&copy; OpenStreetMap contributors | AmeniEdge Offline Tile Cache',
    }).addTo(map);

    // Zoom controls in top right (leaving bottom thumb zone free)
    L.control.zoom({ position: 'topright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    fetchMapData();

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const fetchMapData = async () => {
    const collected: MapMarkerItem[] = [];

    // 1. Incidents
    try {
      const incidents = await api.get<any[]>('/incidents');
      if (Array.isArray(incidents)) {
        incidents.forEach((inc) => {
          if (inc.latitude && inc.longitude) {
            collected.push({
              id: inc.id,
              type: 'INCIDENT',
              title: `${inc.category} (${inc.affectedPeople || inc.affected_people} affected)`,
              category: inc.category,
              priority: inc.priority,
              status: inc.status,
              lat: inc.latitude,
              lng: inc.longitude,
              details: inc.details || inc.locationLandmark || inc.location_landmark,
            });
          }
        });
      }
    } catch {}

    // 2. Teams
    try {
      const teams = await api.get<any[]>('/teams');
      if (Array.isArray(teams)) {
        teams.forEach((tm) => {
          if (tm.currentLatitude && tm.currentLongitude) {
            collected.push({
              id: tm.id,
              type: 'TEAM',
              title: tm.name,
              status: tm.status,
              lat: tm.currentLatitude,
              lng: tm.currentLongitude,
              details: `Capabilities: ${tm.capabilities || 'General'}. Active missions: ${tm.activeIncidentCount || 0}`,
            });
          }
        });
      }
    } catch {}

    // 3. Shelters Layer
    try {
      const sheltersGeoJson = await api.get<any>('/maps/layers/shelters');
      if (sheltersGeoJson?.features) {
        sheltersGeoJson.features.forEach((feat: any) => {
          collected.push({
            id: feat.properties.id,
            type: 'SHELTER',
            title: feat.properties.name,
            lat: feat.geometry.coordinates[1],
            lng: feat.geometry.coordinates[0],
            details: `Capacity: ${feat.properties.capacity} | Occ: ${feat.properties.current_occupancy || 0}. Water: ${feat.properties.has_drinking_water ? 'Yes' : 'No'}`,
          });
        });
      }
    } catch {}

    // 4. Hazards Layer
    try {
      const hazardsGeoJson = await api.get<any>('/maps/layers/hazards');
      if (hazardsGeoJson?.features) {
        hazardsGeoJson.features.forEach((feat: any) => {
          const coords = feat.geometry.type === 'Point'
            ? [feat.geometry.coordinates[1], feat.geometry.coordinates[0]]
            : [feat.geometry.coordinates[0][0][1], feat.geometry.coordinates[0][0][0]];
          collected.push({
            id: feat.properties.id,
            type: 'HAZARD',
            title: feat.properties.title,
            priority: feat.properties.severity || 'CRITICAL',
            lat: coords[0],
            lng: coords[1],
            details: feat.properties.description || 'Active flood or electrical danger',
          });
        });
      }
    } catch {}

    // 5. Default Stations
    collected.push({
      id: 'STA-CHN-N-001',
      type: 'STATION',
      title: 'Station North Command (Royapuram)',
      lat: 13.0827,
      lng: 80.2707,
      status: 'ONLINE',
      details: 'Active Autonomous Wi-Fi Mesh Node. Radius: 6000m.',
    });

    setItems(collected);
  };

  // Re-render markers when items or layer toggles change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    items.forEach((item) => {
      if (item.type === 'INCIDENT' && !layers.incidents) return;
      if (item.type === 'SHELTER' && !layers.shelters) return;
      if (item.type === 'HAZARD' && !layers.hazards) return;
      if (item.type === 'TEAM' && !layers.teams) return;
      if (item.type === 'STATION' && !layers.stations) return;

      let pinColor = 'var(--color-info)';
      let pinIcon = '📍';

      if (item.type === 'INCIDENT') {
        pinColor = item.priority === 'P1_CRITICAL' ? 'var(--color-danger)' : 'var(--color-warning)';
        pinIcon = '🚨';
      } else if (item.type === 'SHELTER') {
        pinColor = 'var(--color-success)';
        pinIcon = '🏕️';
      } else if (item.type === 'HAZARD') {
        pinColor = 'var(--color-danger)';
        pinIcon = '⚠️';
      } else if (item.type === 'TEAM') {
        pinColor = 'var(--color-info)';
        pinIcon = '🚑';
      } else if (item.type === 'STATION') {
        pinColor = '#101828';
        pinIcon = '📡';
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div style="
            background-color: ${pinColor};
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
            cursor: pointer;
          ">
            ${pinIcon}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });
      marker.on('click', () => {
        setSelectedItem(item);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [items, layers]);

  const locateUser = () => {
    if ('geolocation' in navigator && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapInstanceRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 15);
        },
        () => alert('GPS location unavailable in disconnected zone')
      );
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Action Button: Layers & Locate Me */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '16px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <button
          onClick={locateUser}
          aria-label="Locate me via device GPS"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🎯
        </button>

        <button
          onClick={() => setShowLayerSheet(true)}
          aria-label="Filter map layers"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🥞
        </button>
      </div>

      {/* Marker Details Bottom Sheet */}
      <BottomSheet
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || 'Map Point'}
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                Type: {selectedItem.type}
              </span>
              {selectedItem.priority && <PriorityBadge priority={selectedItem.priority} />}
              {selectedItem.status && <StatusBadge status={selectedItem.status} />}
            </div>

            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
              {selectedItem.details}
            </p>

            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Coordinates: {selectedItem.lat.toFixed(5)}, {selectedItem.lng.toFixed(5)}
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Layer Toggles Bottom Sheet */}
      <BottomSheet
        isOpen={showLayerSheet}
        onClose={() => setShowLayerSheet(false)}
        title="Map Layer Toggles"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { key: 'incidents', label: '🚨 Emergency Incidents' },
            { key: 'shelters', label: '🏕️ Relief Shelters & Camps' },
            { key: 'hazards', label: '⚠️ Active Inundation & Hazards' },
            { key: 'teams', label: '🚑 Deployed Rescue Teams' },
            { key: 'stations', label: '📡 Wi-Fi Mesh Stations' },
          ].map((lyr) => (
            <label
              key={lyr.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>{lyr.label}</span>
              <input
                type="checkbox"
                checked={layers[lyr.key as keyof typeof layers]}
                onChange={(e) =>
                  setLayers({ ...layers, [lyr.key]: e.target.checked })
                }
                style={{ width: '24px', height: '24px', cursor: 'pointer' }}
              />
            </label>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};
