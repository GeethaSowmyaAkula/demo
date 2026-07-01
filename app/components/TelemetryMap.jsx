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
  Active: '#10b981',     // Green
  Moving: '#10b981',     // Green
  Idle: '#eab308',       // Yellow
  Charging: '#3b82f6',   // Blue
  Offline: '#94a3b8',    // Gray
  Maintenance: '#f59e0b', // Orange (Service Center)
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
const MapController = ({ selectedGeofenceId, geofences, focusedVehicleCoord }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedGeofenceId && geofences) {
      const fence = geofences.find(g => g.id.toString() === selectedGeofenceId.toString());
      if (fence && fence.center) {
        map.flyTo(fence.center, 13, { animate: true, duration: 1.5 });
      }
    }
  }, [selectedGeofenceId, geofences, map]);

  useEffect(() => {
    if (focusedVehicleCoord) {
      map.flyTo(focusedVehicleCoord, 14, { animate: true, duration: 1.2 });
    }
  }, [focusedVehicleCoord, map]);

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
  isDashboardMode = false, // Toggle extra panels on dashboard overlay
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
    heatmap: false,
    routeHistory: true,
    alerts: true
  });

  const [localSelectedVehicle, setLocalSelectedVehicle] = useState(null);
  const [inspectorTab, setInspectorTab] = useState('summary');
  const [liveAlerts, setLiveAlerts] = useState([
    { id: 'a1', text: '🟢 EV-102 entered Noida Depot', time: 'Just Now', lat: 28.5355, lng: 77.3910 },
    { id: 'a2', text: '🔴 EV-104 exited Noida Depot', time: '2m ago', lat: 28.5355, lng: 77.3910 }
  ]);
  const [focusedVehicleCoord, setFocusedVehicleCoord] = useState(null);

  const toggleLayer = (layerName) => {
    setLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  const center = [20.5937, 78.9629]; 
  const zoom = 5;

  const activeSelectedFence = selectedGeofenceId
    ? geofences.find(g => g.id.toString() === selectedGeofenceId.toString())
    : null;

  // Mini summary values
  const totalCount = vehicles.length;
  const movingCount = vehicles.filter(v => v.status === 'Active' || v.status === 'Moving' || (v.speed && v.speed > 0)).length;
  const chargingCount = vehicles.filter(v => v.status === 'Charging').length;
  const idleCount = vehicles.filter(v => v.status === 'Idle').length;
  const offlineCount = vehicles.filter(v => v.status === 'Offline').length;
  const insideGeofenceCount = vehicles.filter(v => v.insideFences && v.insideFences.length > 0).length;
  const criticalCount = vehicles.filter(v => v.status === 'Emergency' || v.soc < 20 || v.temp > 45).length;
  const underServiceCount = vehicles.filter(v => v.status === 'Maintenance').length;

  // Find nearest charging hub helper
  const getNearestStation = (v) => {
    if (!chargingStations || chargingStations.length === 0) return null;
    let minD = Infinity;
    let nearest = null;
    chargingStations.forEach(hub => {
      const dist = getHaversineDistance(v.lat, v.lng, hub.position[0], hub.position[1]);
      if (dist < minD) {
        minD = dist;
        nearest = hub;
      }
    });
    return { station: nearest, distance: (minD / 1000).toFixed(1) };
  };

  // Find nearest service center helper
  const getNearestService = (v) => {
    if (!serviceCenters || serviceCenters.length === 0) return null;
    let minD = Infinity;
    let nearest = null;
    serviceCenters.forEach(c => {
      const dist = getHaversineDistance(v.lat, v.lng, c.position[0], c.position[1]);
      if (dist < minD) {
        minD = dist;
        nearest = c;
      }
    });
    return { center: nearest, distance: (minD / 1000).toFixed(1) };
  };

  return (
    <div className="w-full h-full min-h-[400px] relative rounded-xl overflow-hidden border border-white/10 shadow-inner flex flex-col">
      
      {/* 18. MINI FLEET SUMMARY (Dashboard Mode only) */}
      {isDashboardMode && (
        <div className="glass-card bg-slate-900/90 border-b border-white/10 p-3 text-[10px] grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 text-white text-center font-medium z-[1000] relative">
          <div><p class="text-on-surface-variant text-[8px] uppercase">Vehicles</p><p class="text-xs font-bold text-primary">{totalCount}</p></div>
          <div><p class="text-on-surface-variant text-[8px] uppercase">Moving</p><p class="text-xs font-bold text-emerald-500">{movingCount}</p></div>
          <div><p class="text-on-surface-variant text-[8px] uppercase">Charging</p><p class="text-xs font-bold text-blue-400">{chargingCount}</p></div>
          <div><p class="text-on-surface-variant text-[8px] uppercase">Idle</p><p class="text-xs font-bold text-yellow-400">{idleCount}</p></div>
          <div><p class="text-on-surface-variant text-[8px] uppercase">Offline</p><p class="text-xs font-bold text-slate-400">{offlineCount}</p></div>
          <div><p class="text-on-surface-variant text-[8px] uppercase">In Fence</p><p class="text-xs font-bold text-secondary">{insideGeofenceCount}</p></div>
          <div><p class="text-on-surface-variant text-[8px] uppercase">Critical</p><p class="text-xs font-bold text-error">{criticalCount}</p></div>
          <div><p class="text-on-surface-variant text-[8px] uppercase">Service</p><p class="text-xs font-bold text-amber-500">{underServiceCount}</p></div>
          <div><p class="text-on-surface-variant text-[8px] uppercase">Fleet Health</p><p class="text-xs font-bold text-primary">94%</p></div>
          <div><p class="text-on-surface-variant text-[8px] uppercase">Battery SOH</p><p class="text-xs font-bold text-secondary">92%</p></div>
        </div>
      )}

      {/* Floating Layer Controls Panel */}
      <div className="absolute top-14 right-4 z-[1000] glass-card bg-slate-900/90 border border-white/10 p-3 rounded-lg text-[9px] space-y-1 max-w-[130px] text-white">
        <div className="font-bold border-b border-white/5 pb-1 mb-1 uppercase tracking-wider text-primary">Map Layers</div>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
          <input type="checkbox" checked={layers.vehicles} onChange={() => toggleLayer('vehicles')} className="rounded text-primary bg-slate-950 border-white/10 w-2.5 h-2.5" />
          Vehicles
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
          <input type="checkbox" checked={layers.geofences} onChange={() => toggleLayer('geofences')} className="rounded text-primary bg-slate-950 border-white/10 w-2.5 h-2.5" />
          Geofences
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
          <input type="checkbox" checked={layers.stations} onChange={() => toggleLayer('stations')} className="rounded text-primary bg-slate-950 border-white/10 w-2.5 h-2.5" />
          Charging Points
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
          <input type="checkbox" checked={layers.centers} onChange={() => toggleLayer('centers')} className="rounded text-primary bg-slate-950 border-white/10 w-2.5 h-2.5" />
          Service Centers
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
          <input type="checkbox" checked={layers.traffic} onChange={() => toggleLayer('traffic')} className="rounded text-primary bg-slate-950 border-white/10 w-2.5 h-2.5" />
          Traffic (mock)
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
          <input type="checkbox" checked={layers.heatmap} onChange={() => toggleLayer('heatmap')} className="rounded text-primary bg-slate-950 border-white/10 w-2.5 h-2.5" />
          Heatmap (mock)
        </label>
      </div>

      {/* 16. MAP LEGEND */}
      <div className="absolute bottom-4 right-4 z-[1000] glass-card bg-slate-900/95 border border-white/10 p-3 rounded-lg text-[9px] text-white w-48 space-y-1.5">
        <div className="font-bold border-b border-white/5 pb-1 uppercase tracking-wider text-primary">Map Legend</div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span>Moving</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#eab308]"></span>Idle</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>Charging</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#94a3b8]"></span>Offline</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>Critical</div>
          <div className="flex items-center gap-1.5"><span>🔌</span>Charger</div>
          <div className="flex items-center gap-1.5"><span>🔧</span>Service</div>
        </div>
      </div>

      {/* 15. LIVE ALERTS TICKER */}
      {isDashboardMode && layers.alerts && (
        <div className="absolute bottom-4 left-4 z-[1000] glass-card bg-slate-900/90 border border-white/10 p-3 rounded-lg text-[8px] text-white w-52 space-y-1.5 max-h-[120px] overflow-y-auto hide-scrollbar">
          <div className="font-bold border-b border-white/5 pb-1 uppercase tracking-wider text-error">Critical Alerts</div>
          {liveAlerts.map(a => (
            <div key={a.id} onClick={() => setFocusedVehicleCoord([a.lat, a.lng])} className="cursor-pointer hover:bg-white/5 p-1 rounded flex justify-between gap-1 items-start">
              <span>{a.text}</span>
              <span class="text-on-surface-variant shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* Operations Drawer Inspector inside Map Boundary */}
      {isDashboardMode && localSelectedVehicle && (
        <div className="absolute top-14 left-4 z-[1000] glass-card bg-slate-950/95 border border-white/10 w-[280px] h-[calc(100%-8rem)] rounded-xl p-4 text-white flex flex-col justify-between overflow-y-auto hide-scrollbar">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div>
                <h4 className="font-bold text-xs text-primary">{localSelectedVehicle.id}</h4>
                <p className="text-[9px] text-on-surface-variant">{localSelectedVehicle.model}</p>
              </div>
              <button onClick={() => setLocalSelectedVehicle(null)} className="text-on-surface-variant hover:text-white">✕</button>
            </div>

            {/* Inspector Tabs */}
            <div className="flex border-b border-white/5 text-[9px] font-bold">
              {['summary', 'battery', 'health', 'driver', 'ai'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setInspectorTab(tab)}
                  className={`flex-1 pb-1.5 text-center border-b-2 capitalize transition-colors ${inspectorTab === tab ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-white'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content area */}
            <div className="text-[10px] space-y-2 py-2">
              {inspectorTab === 'summary' && (
                <div className="space-y-1 text-[9px]">
                  <p><strong>Speed:</strong> {localSelectedVehicle.speed} km/h</p>
                  <p><strong>Status:</strong> <span class="font-bold" style={{ color: STATUS_COLORS[localSelectedVehicle.status] }}>{localSelectedVehicle.status}</span></p>
                  <p><strong>Driver:</strong> {localSelectedVehicle.driver}</p>
                  <p><strong>Battery:</strong> {localSelectedVehicle.soc}% SoC</p>
                  <p><strong>Health Score:</strong> {localSelectedVehicle.soh}% SOH</p>
                  <p><strong>Odometer:</strong> 42,120 km</p>
                  <p><strong>Trip Distance:</strong> 142.5 km</p>
                  <p><strong>Trip Duration:</strong> 3h 15m</p>
                </div>
              )}

              {inspectorTab === 'battery' && (
                <div className="space-y-1 text-[9px]">
                  <p><strong>SoC:</strong> {localSelectedVehicle.soc}%</p>
                  <p><strong>SoH:</strong> {localSelectedVehicle.soh}%</p>
                  <p><strong>Temperature:</strong> {localSelectedVehicle.temp || '32'}°C</p>
                  <p><strong>Range:</strong> {((localSelectedVehicle.soc || 70) * 2.8).toFixed(0)} km</p>
                  <p><strong>Charge Cycles:</strong> 242 cycles</p>
                  <p><strong>Battery Health:</strong> Excellent</p>
                  <p><strong>Charge Status:</strong> {localSelectedVehicle.status === 'Charging' ? 'Active Charging' : 'Discharging'}</p>
                  <p class="text-emerald-400"><strong>Recommendation:</strong> Next charge at Noida Hub</p>
                </div>
              )}

              {inspectorTab === 'health' && (
                <div className="space-y-1 text-[9px]">
                  <p><strong>Overall Score:</strong> 94/100</p>
                  <p class="text-emerald-400"><strong>Battery:</strong> Excellent</p>
                  <p class="text-emerald-400"><strong>Motor:</strong> Good</p>
                  <p class="text-emerald-400"><strong>Controller:</strong> Good</p>
                  <p class="text-emerald-400"><strong>Tyres:</strong> Excellent</p>
                  <p class="text-amber-400"><strong>Brakes:</strong> Warning (Wear 82%)</p>
                  <p class="text-emerald-400"><strong>Wiring:</strong> Excellent</p>
                </div>
              )}

              {inspectorTab === 'driver' && (
                <div className="space-y-1 text-[9px]">
                  <p><strong>Name:</strong> {localSelectedVehicle.driver}</p>
                  <p><strong>Safety Score:</strong> 92%</p>
                  <p><strong>Driver Rating:</strong> 4.8 / 5</p>
                  <p><strong>License Status:</strong> Active</p>
                  <p><strong>Contact:</strong> +91 98452 09281</p>
                </div>
              )}

              {inspectorTab === 'ai' && (
                <div className="space-y-1.5 text-[9px] text-emerald-400 bg-primary/5 p-2 rounded border border-primary/20">
                  <p>💡 Battery healthy. Target Noida depot.</p>
                  <p>💡 Brakes replacement recommended in 4 days.</p>
                  <p>💡 Regenerative load efficiency: 91%.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions (13) */}
          <div className="border-t border-white/10 pt-2 grid grid-cols-2 gap-1.5 text-[8px] font-bold">
            <button onclick={() => alert("Details locked. Connect backend server.")} className="py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-colors">Details</button>
            <button onclick={() => alert("Details locked. Connect backend server.")} className="py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-colors">Trip History</button>
            <button onclick={() => alert("Details locked. Connect backend server.")} className="py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-colors">Navigate</button>
            <button onclick={() => alert("Details locked. Connect backend server.")} className="py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-colors text-error border-error/25 bg-error/5">Remote Lock</button>
          </div>
        </div>
      )}

      <div className="flex-1 w-full h-full relative">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          style={{ width: '100%', height: '100%', background: '#090d16' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <MapController selectedGeofenceId={selectedGeofenceId} geofences={geofences} focusedVehicleCoord={focusedVehicleCoord} />

          {/* Low Battery Warning Pulse Route to Nearest Charging station */}
          {vehicles.filter(v => v.soc < 20).map(v => {
            const nearest = getNearestStation(v);
            if (nearest && nearest.station) {
              return (
                <Polyline 
                  key={`warn-route-${v.id}`}
                  positions={[[v.lat, v.lng], nearest.station.position]}
                  color="#ef4444"
                  weight={3}
                  opacity={0.85}
                  dashArray="5, 5"
                />
              );
            }
            return null;
          })}

          {/* Charging Stations */}
          {layers.stations && chargingStations && chargingStations.map((hub) => {
            const isLowBatNear = vehicles.some(v => v.soc < 20 && getNearestStation(v)?.station?.id === hub.id);
            return (
              <React.Fragment key={hub.id}>
                {isLowBatNear && (
                  <Circle 
                    center={hub.position}
                    radius={15000}
                    pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15, weight: 1, dashArray: '4, 4' }}
                  />
                )}
                <Marker position={hub.position} icon={chargingIcon}>
                  <Popup>
                    <div className="text-xs text-slate-800 space-y-1">
                      <h4 className="font-bold text-slate-900">{hub.name}</h4>
                      <p>Connector Types: CCS2, Type 2</p>
                      <p>Speed: 120 kW (DC Fast)</p>
                      <p>Availability: 4/8 slots free</p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

          {/* Service Centers */}
          {layers.centers && serviceCenters && serviceCenters.map((center) => (
            <Marker key={center.id} position={center.position} icon={serviceIcon}>
              <Popup>
                <div className="text-xs text-slate-800">
                  <h4 className="font-bold text-slate-900">{center.name}</h4>
                  <p>Rating: ⭐ 4.8</p>
                  <p>Technicians: {center.staff}</p>
                  <p>Workload: {center.workload}%</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Geofences rendering */}
          {layers.geofences && geofences && geofences.map((g) => {
            const isSelected = selectedGeofenceId && selectedGeofenceId.toString() === g.id.toString();
            // Colors: Green = Warehouse, Blue = Charging Hub, Orange = Service Center, Purple = Fleet Depot, Red = Restricted Zone
            const colorMapping = {
              warehouse: '#10b981',
              circle: '#6366f1',
              depot: '#8b5cf6',
              restricted: '#ef4444',
              service: '#f97316'
            };
            const fenceColor = colorMapping[g.type] || '#10b981';

            if (g.center) {
              return (
                <Circle
                  key={g.id}
                  center={g.center}
                  radius={g.radius}
                  pathOptions={{ 
                    color: isSelected ? '#3b82f6' : fenceColor, 
                    weight: isSelected ? 4 : 2,
                    fillColor: isSelected ? '#3b82f6' : fenceColor,
                    fillOpacity: isSelected ? 0.22 : 0.1 
                  }}
                />
              );
            }
            return null;
          })}

          {/* Live Vehicles tracking markers */}
          {layers.vehicles && vehicles && vehicles.map((v) => {
            const isInsideSelected = activeSelectedFence ? v.insideFences?.includes(activeSelectedFence.name) : true;
            const isDimmed = selectedGeofenceId ? !isInsideSelected : false;

            return (
              <Marker 
                key={v.id} 
                position={[v.lat, v.lng]} 
                icon={createEVIcon(v.status, isDimmed)}
                eventHandlers={{
                  click: () => {
                    setLocalSelectedVehicle(v);
                    if (onVehicleClick) onVehicleClick(v);
                  }
                }}
              >
                <Popup>
                  <div className="text-xs text-slate-800 space-y-1 min-w-[200px]">
                    <h4 className="font-bold text-slate-900 border-b pb-1 mb-1">{v.id} ({v.model || 'Tata Nexon EV'})</h4>
                    <p><strong>Driver:</strong> {v.driver || 'Rajesh Kumar'} (Ph: +91 98204 10242)</p>
                    <p><strong>Status:</strong> <span class="font-bold uppercase" style={{ color: STATUS_COLORS[v.status] }}>{v.status}</span></p>
                    <p><strong>Speed:</strong> {v.speed || '0'} km/h</p>
                    <p><strong>Battery SoC:</strong> {v.soc}% | <strong>SOH:</strong> {v.soh || '90'}%</p>
                    <p><strong>Battery Temp:</strong> {v.temp || '34'}°C</p>
                    <p><strong>Est Range:</strong> {((v.soc || 70) * 2.8).toFixed(0)} km</p>
                    <p><strong>Active Faults:</strong> <span class="text-error font-bold">{v.fault || 'None'}</span></p>
                    {v.insideFences && v.insideFences.length > 0 && (
                      <p class="text-emerald-600 font-medium">Inside: {v.insideFences.join(', ')}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Route History Tracing */}
          {layers.routeHistory && routeHistory && routeHistory.length > 1 && (
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
    </div>
  );
}
