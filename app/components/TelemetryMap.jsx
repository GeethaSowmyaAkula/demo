"use client";

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix Leaflet Draw globally
if (typeof window !== 'undefined') {
  require('leaflet-draw');
}

// Custom icons generator
const createEVIcon = (status) => {
  const colors = {
    Active: '#10b981', // green
    Charging: '#6366f1', // purple/indigo
    Idle: '#94a3b8', // slate/gray
    Maintenance: '#eab308', // yellow
    Offline: '#ef4444', // red
    Alert: '#f97316' // orange
  };
  const color = colors[status] || '#10b981';

  return L.divIcon({
    className: 'custom-ev-icon',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
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

    // FeatureGroup to store drawn shapes
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Initialize draw control
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

    // Listeners
    map.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      
      const type = e.layerType; // 'circle', 'polygon', 'rectangle'
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

// Main Component
export default function TelemetryMap({
  vehicles = [],
  chargingStations = [],
  serviceCenters = [],
  geofences = [],
  showHeatmap = false,
  enableDrawing = false,
  selectedVehicleId = null,
  routeHistory = [], // array of [lat, lng]
  onGeofenceCreated,
  onGeofenceEdited,
  onGeofenceDeleted
}) {
  
  // Coordinates default centered at India / Central region
  const center = [20.5937, 78.9629]; 
  const zoom = 5;

  return (
    <div className="w-full h-full min-h-[350px] relative rounded-xl overflow-hidden border border-white/10 shadow-inner animate-fade-in">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%', background: '#0f172a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Modern glassmorphic dark tiles
        />

        {/* Custom Charging Stations Overlay */}
        {chargingStations && chargingStations.map((hub) => (
          <Marker key={hub.id} position={hub.position} icon={chargingIcon}>
            <Popup>
              <div className="text-xs text-slate-800">
                <h4 className="font-bold text-slate-900">{hub.name}</h4>
                <p>Capacity: {hub.capacity} slots</p>
                <p>Status: Active</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Custom Service Centers Overlay */}
        {serviceCenters && serviceCenters.map((center) => (
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

        {/* Live EV Vehicles Markers */}
        {vehicles && vehicles.map((v) => {
          // If coords are missing, mock them slightly relative to hub
          const position = v.lat && v.lng ? [v.lat, v.lng] : [28.6139 + (Math.random() - 0.5) * 4, 77.2090 + (Math.random() - 0.5) * 4];
          return (
            <Marker key={v.id} position={position} icon={createEVIcon(v.status)}>
              <Popup>
                <div className="text-xs text-slate-800 space-y-1">
                  <h4 className="font-bold text-slate-900">{v.id} ({v.model})</h4>
                  <p><strong>Status:</strong> {v.status}</p>
                  <p><strong>SoC:</strong> {v.soc}% | <strong>SoH:</strong> {v.soh}%</p>
                  <p><strong>Speed:</strong> {v.speed} km/h</p>
                  <p><strong>Driver:</strong> {v.driver}</p>
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

        {/* Geofence Circles/Polygons Rendering */}
        {geofences && geofences.map((g) => {
          if (g.type === 'circle') {
            return (
              <Circle
                key={g.id}
                center={g.center}
                radius={g.radius}
                pathOptions={{ color: '#10b981', fillOpacity: 0.1 }}
              />
            );
          }
          return null;
        })}

        {/* Heatmap overlay (simulated with large glowing circles) */}
        {showHeatmap && vehicles && vehicles.map((v) => {
          const position = v.lat && v.lng ? [v.lat, v.lng] : [28.6139, 77.2090];
          return (
            <Circle
              key={`heatmap-${v.id}`}
              center={position}
              radius={80000} // 80km glow
              pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.12, stroke: false }}
            />
          );
        })}

        {/* Geofencing Drawing Controls */}
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
