"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix Leaflet Draw globally
if (typeof window !== 'undefined') {
  require('leaflet-draw');
}

// Haversine Distance helper
const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // meters
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Status Colors mapping
const STATUS_COLORS = {
  Moving: '#10b981',     // Green
  Idle: '#eab308',       // Yellow
  Charging: '#3b82f6',   // Blue
  Offline: '#94a3b8',    // Gray
  Emergency: '#ef4444'   // Red
};

// Custom icons generator
const createEVIcon = (status, isDimmed) => {
  const color = STATUS_COLORS[status] || '#10b981';
  const opacity = isDimmed ? 0.25 : 1.0;

  return L.divIcon({
    className: 'custom-ev-icon-wrapper',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 transition-all duration-300" style="opacity: ${opacity}">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-35" style="background-color: ${color}"></span>
        <div class="relative w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg text-white font-black text-[10px]" style="background-color: ${color}">
          ⚡
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const chargingIcon = L.divIcon({
  className: 'custom-hub-icon',
  html: `
    <div class="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-md text-xs font-bold" title="Charging Station">
      🔌
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const serviceIcon = L.divIcon({
  className: 'custom-service-icon',
  html: `
    <div class="w-7 h-7 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white shadow-md text-xs font-bold" title="Service Center">
      🔧
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Component to handle Leaflet Draw integration
const DrawControl = ({ onGeofenceCreated, onGeofenceEdited, onGeofenceDeleted }) => {
  const map = useMap();
  const drawControlRef = useRef(null);
  const drawnItemsRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
        remove: true
      },
      draw: {
        polyline: false,
        marker: false,
        circlemarker: false,
        circle: {
          shapeOptions: {
            color: '#10b981',
            fillOpacity: 0.15
          }
        },
        polygon: {
          shapeOptions: {
            color: '#6366f1',
            fillOpacity: 0.15
          }
        },
        rectangle: {
          shapeOptions: {
            color: '#eab308',
            fillOpacity: 0.15
          }
        }
      }
    });

    map.addControl(drawControl);
    drawControlRef.current = drawControl;

    map.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      const type = e.layerType;
      const geojson = layer.toGeoJSON();
      
      let details = { type, id: L.stamp(layer) };
      if (type === 'circle') {
        details.radius = layer.getRadius();
        details.center = [layer.getLatLng().lat, layer.getLatLng().lng];
      } else {
        details.coordinates = geojson.geometry.coordinates;
      }

      if (onGeofenceCreated) {
        onGeofenceCreated(details);
      }
    });

    map.on(L.Draw.Event.EDITED, (e) => {
      const layers = e.layers;
      layers.eachLayer((layer) => {
        const type = layer instanceof L.Circle ? 'circle' : (layer instanceof L.Rectangle ? 'rectangle' : 'polygon');
        const geojson = layer.toGeoJSON();
        let details = { type, id: L.stamp(layer) };
        if (type === 'circle') {
          details.radius = layer.getRadius();
          details.center = [layer.getLatLng().lat, layer.getLatLng().lng];
        } else {
          details.coordinates = geojson.geometry.coordinates;
        }

        if (onGeofenceEdited) {
          onGeofenceEdited(details);
        }
      });
    });

    map.on(L.Draw.Event.DELETED, (e) => {
      const layers = e.layers;
      layers.eachLayer((layer) => {
        if (onGeofenceDeleted) {
          onGeofenceDeleted(L.stamp(layer));
        }
      });
    });

    return () => {
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [map]);

  return null;
};

// Map Controller for zooming and center flying
const MapController = ({ selectedGeofenceId, geofences }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedGeofenceId && geofences) {
      const fence = geofences.find(g => g.id.toString() === selectedGeofenceId.toString());
      if (fence && fence.center) {
        map.flyTo(fence.center, 13, { animate: true, duration: 1.5 });
      }
    }
  }, [selectedGeofenceId, geofences, map]);
  return null;
};

// Main Component
export default function TelemetryMap({
  vehicles = [],
  chargingStations = [],
  serviceCenters = [],
  geofences = [],
  selectedGeofenceId = null,
  selectedVehicleId = null,
  routeHistory = [], 
  enableDrawing = false,
  onGeofenceCreated,
  onGeofenceEdited,
  onGeofenceDeleted,
  onVehicleClick
}) {
  
  // Layer Controls filters
  const [layers, setLayers] = useState({
    vehicles: true,
    geofences: true,
    stations: true,
    centers: true,
    traffic: false,
    heatmap: false
  });

  const toggleLayer = (layerName) => {
    setLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  const center = [20.5937, 78.9629]; 
  const zoom = 5;

  // Determine if a vehicle is inside the selected fence
  const isInsideSelectedFence = (v, fence) => {
    if (!fence) return true;
    if (fence.type === 'circle' && fence.center) {
      const dist = getHaversineDistance(v.lat, v.lng, fence.center[0], fence.center[1]);
      return dist <= fence.radius;
    }
    return false;
  };

  const activeSelectedFence = selectedGeofenceId
    ? geofences.find(g => g.id.toString() === selectedGeofenceId.toString())
    : null;

  return (
    <div className="w-full h-full min-h-[380px] relative rounded-xl overflow-hidden border border-white/10 shadow-inner">
      
      {/* Floating Layer Controls Panel */}
      <div className="absolute top-4 right-4 z-[1000] glass-card bg-slate-900/90 border border-white/10 p-3 rounded-lg text-[10px] space-y-1.5 max-w-[140px] text-white">
        <div className="font-bold border-b border-white/5 pb-1 mb-1 uppercase tracking-wider text-primary">Map Layers</div>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
          <input type="checkbox" checked={layers.vehicles} onChange={() => toggleLayer('vehicles')} className="rounded text-primary bg-slate-950 border-white/10 w-3 h-3" />
          Live Vehicles
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
          <input type="checkbox" checked={layers.geofences} onChange={() => toggleLayer('geofences')} className="rounded text-primary bg-slate-950 border-white/10 w-3 h-3" />
          Geofences
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
          <input type="checkbox" checked={layers.stations} onChange={() => toggleLayer('stations')} className="rounded text-primary bg-slate-950 border-white/10 w-3 h-3" />
          Charging Stations
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
          <input type="checkbox" checked={layers.centers} onChange={() => toggleLayer('centers')} className="rounded text-primary bg-slate-950 border-white/10 w-3 h-3" />
          Service Centers
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
          <input type="checkbox" checked={layers.traffic} onChange={() => toggleLayer('traffic')} className="rounded text-primary bg-slate-950 border-white/10 w-3 h-3" />
          Traffic (mock)
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
          <input type="checkbox" checked={layers.heatmap} onChange={() => toggleLayer('heatmap')} className="rounded text-primary bg-slate-950 border-white/10 w-3 h-3" />
          Heatmap (mock)
        </label>
      </div>

      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%', background: '#090d16' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController selectedGeofenceId={selectedGeofenceId} geofences={geofences} />

        {/* Traffic layer overlay placeholder */}
        {layers.traffic && (
          <div className="absolute inset-0 bg-red-500/10 pointer-events-none z-[500] border-2 border-dashed border-red-500/30 flex items-center justify-center">
            <span class="bg-slate-900 px-2 py-1 rounded text-white text-[9px]">Live Traffic Data Stream Placeholder</span>
          </div>
        )}

        {/* Heatmap overlay placeholder */}
        {layers.heatmap && vehicles && vehicles.map((v) => (
          <Circle
            key={`heat-${v.id}`}
            center={[v.lat, v.lng]}
            radius={90000}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.12, stroke: false }}
          />
        ))}

        {/* Charging Stations */}
        {layers.stations && chargingStations && chargingStations.map((hub) => (
          <Marker key={hub.id} position={hub.position} icon={chargingIcon}>
            <Popup>
              <div className="text-xs text-slate-800">
                <h4 className="font-bold text-slate-900">{hub.name}</h4>
                <p>Capacity: {hub.capacity} slots</p>
                <p>Status: Online</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Service Centers */}
        {layers.centers && serviceCenters && serviceCenters.map((center) => (
          <Marker key={center.id} position={center.position} icon={serviceIcon}>
            <Popup>
              <div className="text-xs text-slate-800">
                <h4 className="font-bold text-slate-900">{center.name}</h4>
                <p>Technicians: {center.staff}</p>
                <p>Workload: {center.workload}%</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Geofences rendering */}
        {layers.geofences && geofences && geofences.map((g) => {
          const isSelected = selectedGeofenceId && selectedGeofenceId.toString() === g.id.toString();
          if (g.type === 'circle' && g.center) {
            return (
              <Circle
                key={g.id}
                center={g.center}
                radius={g.radius}
                pathOptions={{ 
                  color: isSelected ? '#3b82f6' : '#10b981', 
                  weight: isSelected ? 4 : 2,
                  fillColor: isSelected ? '#3b82f6' : '#10b981',
                  fillOpacity: isSelected ? 0.22 : 0.1 
                }}
              />
            );
          }
          return null;
        })}

        {/* Live Vehicles tracking markers */}
        {layers.vehicles && vehicles && vehicles.map((v) => {
          const isInsideSelected = activeSelectedFence ? isInsideSelectedFence(v, activeSelectedFence) : true;
          const isDimmed = selectedGeofenceId ? !isInsideSelected : false;

          return (
            <Marker 
              key={v.id} 
              position={[v.lat, v.lng]} 
              icon={createEVIcon(v.status, isDimmed)}
              eventHandlers={{
                click: () => {
                  if (onVehicleClick) onVehicleClick(v);
                }
              }}
            >
              <Popup>
                <div className="text-xs text-slate-800 space-y-1 min-w-[150px]">
                  <h4 className="font-bold text-slate-900 border-b pb-1 mb-1">{v.id} ({v.model})</h4>
                  <p><strong>Driver:</strong> {v.driver}</p>
                  <p><strong>Status:</strong> <span class="font-bold uppercase" style={{ color: STATUS_COLORS[v.status] }}>{v.status}</span></p>
                  <p><strong>Speed:</strong> {v.speed} km/h</p>
                  <p><strong>Battery:</strong> {v.soc}% SoC</p>
                  {v.insideFences && v.insideFences.length > 0 && (
                    <p class="text-emerald-600 font-medium">Inside: {v.insideFences.join(', ')}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route History Tracing */}
        {routeHistory && routeHistory.length > 1 && (
          <Polyline 
            positions={routeHistory} 
            color="#6366f1" 
            weight={4} 
            opacity={0.8}
            dashArray="10, 10"
          />
        )}

        {/* Drawing Controls */}
        {enableDrawing && (
          <DrawControl 
            onGeofenceCreated={onGeofenceCreated}
            onGeofenceEdited={onGeofenceEdited}
            onGeofenceDeleted={onGeofenceDeleted}
          />
        )}
      </MapContainer>
    </div>
  );
}
