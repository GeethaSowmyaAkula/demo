"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pttylnbkpiyuwayugkqq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0dHlsbmJrcGl5dXdheXVna3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4ODAzOTEsImV4cCI6MjA5ODQ1NjM5MX0.5GamNh1J-um-vdWlzgdhujyv3XGlsru1BFL2jXOSdp0';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -------------------------------------------------------------
// REALISTIC MOCK DATA FOR ENTERPRISE SAAS PLAYGROUND
// -------------------------------------------------------------
const VEHICLE_DATA = [
  { id: 'IV-9022-X', model: 'Tata Nexon EV Max', type: 'SUV', driver: 'Rajesh Kumar', status: 'Active', soc: 72, soh: 92, temp: 34, speed: 45, dist: 1420, fault: 'None', batteryId: 'B-LFP-092A', firmware: 'v2.4.1', owner: 'Innovibe Leases Ltd', location: 'Mumbai Western Express Hwy', signal: 95 },
  { id: 'IV-1144-Z', model: 'Ola S1 Pro Gen 2', type: '2-Wheeler', driver: 'Priya Sharma', status: 'Charging', soc: 88, soh: 94, temp: 38, speed: 0, dist: 840, fault: 'None', batteryId: 'B-NMC-114B', firmware: 'v2.4.0', owner: 'Logistics Partners Pvt', location: 'Delhi Sector 62 Hub', signal: 98 },
  { id: 'IV-4401-B', model: 'Ather 450X Gen 3', type: '2-Wheeler', driver: 'Mohammed Ali', status: 'Idle', soc: 56, soh: 88, temp: 31, speed: 0, dist: 1105, fault: 'Slight Cell Imbalance', batteryId: 'B-NMC-440C', firmware: 'v2.3.9', owner: 'A1 Delivery Fleet', location: 'Bangalore Indiranagar', signal: 90 },
  { id: 'IV-7722-M', model: 'Tata Tigor EV', type: 'Sedan', driver: 'Sunit Patil', status: 'Maintenance', soc: 12, soh: 78, temp: 46, speed: 0, dist: 2840, fault: 'High Thermal Runaway Risk', batteryId: 'B-LFP-772D', firmware: 'v2.4.1', owner: 'Stitch Logistics Delhi', location: 'Noida Repair Center', signal: 85 },
  { id: 'IV-8834-K', model: 'Mahindra Treo', type: '3-Wheeler', driver: 'Anita Rao', status: 'Active', soc: 64, soh: 86, temp: 33, speed: 32, dist: 980, fault: 'None', batteryId: 'B-LFP-883E', firmware: 'v1.8.2', owner: 'Green City E-Rickshaws', location: 'Hyderabad Gachibowli', signal: 92 },
  { id: 'IV-2311-L', model: 'BYD E6', type: 'MPV', driver: 'Deepak Mehta', status: 'Offline', soc: 40, soh: 90, temp: 28, speed: 0, dist: 4320, fault: 'None', batteryId: 'B-LFP-231F', firmware: 'v2.5.0', owner: 'Executive Cabs India', location: 'Chennai Airport parking', signal: 0 }
];

const DRIVER_DATA = [
  { id: 'EMP-084', name: 'Rajesh Kumar', score: 94, compliance: '98%', idle: '14 mins', efficiency: '0.14 kWh/km', braking: 2, accel: 1, speed: 0, phone: 0, status: 'Active', trips: 142, hours: 280, license: 'DL-142021008432' },
  { id: 'EMP-092', name: 'Priya Sharma', score: 88, compliance: '95%', idle: '28 mins', efficiency: '0.16 kWh/km', braking: 4, accel: 3, speed: 1, phone: 1, status: 'Active', trips: 98, hours: 194, license: 'DL-092022119428' },
  { id: 'EMP-076', name: 'Mohammed Ali', score: 76, compliance: '89%', idle: '1 hr 12m', efficiency: '0.19 kWh/km', braking: 8, accel: 9, speed: 4, phone: 3, status: 'Active', trips: 115, hours: 245, license: 'KA-052020007612' },
  { id: 'EMP-104', name: 'Sunit Patil', score: 58, compliance: '78%', idle: '2 hrs 40m', efficiency: '0.24 kWh/km', braking: 14, accel: 16, speed: 9, phone: 8, status: 'Under Review', trips: 220, hours: 440, license: 'MH-122018009214' }
];

const SERVICE_TICKETS = [
  { id: 't1', ticket_number: 'TKT-8842', vehicle_reg: 'IV-7722-M', issue_description: 'Overheating under load & warning lights on dashboard', priority: 'Critical', assigned_technician: 'Sunit Malhotra', status: 'In Progress' },
  { id: 't2', ticket_number: 'TKT-8843', vehicle_reg: 'IV-4401-B', issue_description: 'Cell balance voltage variance exceeds safe threshold (45mV)', priority: 'High', assigned_technician: 'Rohan Deshmukh', status: 'Diagnosed' },
  { id: 't3', ticket_number: 'TKT-8844', vehicle_reg: 'IV-2311-L', issue_description: 'Periodic GPS signal drops & connectivity interruption', priority: 'Medium', assigned_technician: 'Amit Mishra', status: 'Open' }
];



const PARTS_INVENTORY = [
  { id: 'INV-082', code: 'LFP-72-100', name: 'LFP 72V 100Ah Battery Module', category: 'Battery', stock: 12, min: 15, supplier: 'Amara Raja Batteries', price: 92000, status: 'Low Stock' },
  { id: 'INV-109', code: 'MOT-PMSM-15', name: '15kW PMSM Motor Unit', category: 'Motor', stock: 4, min: 3, supplier: 'BOSCH India', price: 65000, status: 'In Stock' },
  { id: 'INV-204', code: 'BMS-MAX-V4', name: 'BMS High Voltage Controller V4', category: 'Electrical', stock: 2, min: 5, supplier: 'Exide Industries', price: 18000, status: 'Low Stock' }
];

const ERP_INVOICES = [
  { id: 'INV-2026-884', customer: 'A1 Delivery Logistics', amount: '₹4,50,000', gst: '₹81,000', total: '₹5,31,000', date: '2026-06-25', status: 'Paid' },
  { id: 'INV-2026-885', customer: 'Quick Cab Services', amount: '₹2,80,000', gst: '₹50,400', total: '₹3,30,400', date: '2026-06-28', status: 'Pending' }
];

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginRole, setLoginRole] = useState('Admin');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Supabase dynamic states
  const [loginError, setLoginError] = useState('');
  const [dbConnected, setDbConnected] = useState(false);
  const [serviceTickets, setServiceTickets] = useState([]);
  const [driverIssueDesc, setDriverIssueDesc] = useState('');
  const [driverIssuePriority, setDriverIssuePriority] = useState('Medium');
  const [driverBookingStatus, setDriverBookingStatus] = useState('');
  const [displayName, setDisplayName] = useState('Arjun Sharma');

  useEffect(() => {
    if (supabaseClient) {
      setDbConnected(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTechnicianServiceTickets = async () => {
    try {
      const { data, error } = await supabaseClient.from('service_tickets').select('*');
      if (!error && data) {
        setServiceTickets(data);
      } else if (error) {
        console.warn("Failed to fetch tickets from Supabase:", error);
      }
    } catch (e) {
      console.error("Error loading tickets:", e);
    }
  };

  useEffect(() => {
    if (isLoggedIn && loginRole === 'Technician') {
      loadTechnicianServiceTickets();
      const channel = supabaseClient
        .channel('public:service_tickets')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'service_tickets' }, () => {
          loadTechnicianServiceTickets();
        })
        .subscribe();
      return () => {
        supabaseClient.removeChannel(channel);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, loginRole]);

  const submitDriverServiceTicket = async () => {
    if (!driverIssueDesc.trim()) {
      alert("Please enter a description of the issue.");
      return;
    }

    setDriverBookingStatus('Submitting request to Supabase...');

    const ticketNum = 'TKT-' + Math.floor(1000 + Math.random() * 9000);
    const ticketData = {
      ticket_number: ticketNum,
      vehicle_reg: 'IV-9022-X',
      issue_description: driverIssueDesc,
      priority: driverIssuePriority,
      status: 'Open'
    };

    try {
      const { error } = await supabaseClient.from('service_tickets').insert([ticketData]);
      if (!error) {
        setDriverBookingStatus(`Success! Logged ticket ${ticketNum} in Supabase.`);
        setDriverIssueDesc('');
      } else {
        console.error("Supabase insert error:", error);
        setDriverBookingStatus(`Error: ${error.message}`);
      }
    } catch (e) {
      setDriverBookingStatus(`Offline: Logged ticket ${ticketNum} locally.`);
      setDriverIssueDesc('');
    }
  };

  const acceptServiceTicket = async (ticketId) => {
    try {
      const { error } = await supabaseClient
        .from('service_tickets')
        .update({ status: 'In Progress', assigned_technician: 'Sunit Malhotra' })
        .eq('id', ticketId);

      if (error) {
        console.error("Supabase update error:", error);
        alert("Could not accept ticket: " + error.message);
      } else {
        loadTechnicianServiceTickets();
      }
    } catch (e) {
      console.error("Network error accepting ticket:", e);
    }
  };

  const closeServiceTicket = async (ticketId) => {
    try {
      const { error } = await supabaseClient
        .from('service_tickets')
        .update({ status: 'Closed' })
        .eq('id', ticketId);

      if (error) {
        console.error("Supabase update error:", error);
      } else {
        loadTechnicianServiceTickets();
      }
    } catch (e) {
      console.error("Network error closing ticket:", e);
    }
  };

  // Search & Filter States
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleFilterStatus, setVehicleFilterStatus] = useState('All');
  
  // Interactive Simulation states
  const [vehicles, setVehicles] = useState(VEHICLE_DATA);
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'Critical', text: 'Battery Thermal Risk - Vehicle IV-7722-M temp hit 46°C', time: 'Just Now', target: 'IV-7722-M' },
    { id: 2, type: 'Warning', text: 'Route Deviation Alert - Vehicle IV-1144-Z left route corridor', time: '4 mins ago', target: 'IV-1144-Z' },
    { id: 3, type: 'Info', text: 'Maintenance Complete - Vehicle IV-9022-X back online', time: '12 mins ago', target: 'IV-9022-X' }
  ]);
  
  // Remote Control command state
  const [selectedRemoteVehicle, setSelectedRemoteVehicle] = useState('IV-9022-X');
  const [remoteCommandProgress, setRemoteCommandProgress] = useState(0); // 0=None, 1=Initiated, 2=Supervisor Approved, 3=OTP Verified, 4=Completed
  const [remoteOTPInput, setRemoteOTPInput] = useState('');
  const [remoteLogs, setRemoteLogs] = useState([
    { time: '18:32:00', admin: 'Arjun Sharma', vehicle: 'IV-9022-X', command: 'System Diagnostics Restart', status: 'Executed Successfully' }
  ]);

  // AI Copilot state
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState([
    { role: 'ai', content: "Hello! I am NOVA, your INNOVIBE AI Fleet Intelligence Assistant. I can check telemetry logs, recommend service slots, analyze SOH trends, or handle remote lock procedures. What can I do for you today?" }
  ]);

  // Digital Twin state
  const [selectedTwinVehicle, setSelectedTwinVehicle] = useState('IV-9022-X');
  const [simulatingFault, setSimulatingFault] = useState(false);
  const [simulatedMetric, setSimulatedMetric] = useState(null);

  // Geofence states
  const [geofences, setGeofences] = useState([
    { id: 1, name: 'Mumbai Airport Depot', type: 'Circle', radius: '500m', inside: 4, violations: 0 },
    { id: 2, name: 'Noida Industrial Corridor', type: 'Polygon', vertices: 5, inside: 2, violations: 3 }
  ]);
  const [showAddGeofence, setShowAddGeofence] = useState(false);

  // Real-time update loop simulator
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      // Simulate slight state fluctuation (speeds, SoC, thermal, locations)
      setVehicles(prev => prev.map(v => {
        if (v.status === 'Active') {
          const newSoc = Math.max(5, v.soc - (Math.random() > 0.6 ? 1 : 0));
          const newTemp = Math.min(55, v.temp + (Math.random() > 0.8 ? 1 : -1));
          return { ...v, soc: newSoc, temp: newTemp, speed: Math.floor(25 + Math.random() * 35) };
        }
        if (v.status === 'Charging') {
          const newSoc = Math.min(100, v.soc + (Math.random() > 0.4 ? 1 : 0));
          return { ...v, soc: newSoc, temp: Math.max(30, v.temp + (Math.random() > 0.8 ? -1 : 1)) };
        }
        return v;
      }));

      // Random alert triggers
      if (Math.random() > 0.85) {
        const randomV = vehicles[Math.floor(Math.random() * vehicles.length)];
        const newAlert = {
          id: Date.now(),
          type: Math.random() > 0.5 ? 'Warning' : 'Critical',
          text: `Telemetry Flag: ${randomV.id} reported SOC at ${randomV.soc}% under load.`,
          time: 'Just Now',
          target: randomV.id
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 5)]);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isLoggedIn, vehicles]);

  // Role permissions mapping
  const ROLE_PERMISSIONS = {
    'Admin': ['Dashboard', 'Fleet', 'Drivers', 'Battery', 'Service', 'Inventory', 'Geofencing', 'ERP', 'Copilot', 'DigitalTwin', 'Remote'],
    'Fleet Manager': ['Dashboard', 'Fleet', 'Drivers', 'Battery', 'Service', 'Inventory', 'Geofencing', 'Copilot', 'DigitalTwin'],
    'Driver': ['Drivers', 'Fleet', 'Copilot', 'Remote'],
    'Technician': ['Service', 'Inventory', 'Copilot', 'DigitalTwin'],
    'Customer': ['Fleet', 'ERP'],
    'Operations Team': ['Dashboard', 'Fleet', 'Drivers', 'Service', 'Geofencing', 'Remote'],
    'Finance Team': ['Dashboard', 'ERP']
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    const emails = {
      'Admin': 'admin@innovibe.in',
      'Fleet Manager': 'manager@innovibe.in',
      'Driver': 'driver@innovibe.in',
      'Technician': 'technician@innovibe.in',
      'Operations Team': 'operations@innovibe.in',
      'Finance Team': 'finance@innovibe.in'
    };
    
    const email = emails[loginRole];
    const password = 'password123';

    let authenticatedRole = loginRole;
    let authenticatedName = "Arjun Sharma";

    if (supabaseClient && email) {
      try {
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (!authError && authData.user) {
          const { data: profile, error: profileError } = await supabaseClient
            .from('users')
            .select('name, role')
            .eq('id', authData.user.id)
            .single();

          if (!profileError && profile) {
            authenticatedRole = profile.role;
            authenticatedName = profile.name;
            console.log("Logged in via Supabase cloud auth:", authenticatedName, authenticatedRole);
          }
        } else if (authError) {
          console.warn("Supabase auth failed, showing warning overlay:", authError.message);
          setLoginError(`Supabase Auth Failed: ${authError.message}. Running in offline fallback mode...`);
          setTimeout(() => { setLoginError(''); }, 4000);
        }
      } catch (err) {
        console.warn("Network error connecting to Supabase, running local offline mode:", err);
      }
    }

    setDisplayName(authenticatedName);
    setLoginRole(authenticatedRole);
    setIsLoggedIn(true);
    const allowed = ROLE_PERMISSIONS[authenticatedRole] || ['Dashboard'];
    setActiveTab(allowed[0]);
  };

  // AI Copilot prompt submission
  const submitCopilotPrompt = (e) => {
    e?.preventDefault();
    if (!copilotInput.trim()) return;

    const userMsg = { role: 'user', content: copilotInput };
    setCopilotMessages(prev => [...prev, userMsg]);
    setCopilotInput('');

    // Simulate AI response
    setTimeout(() => {
      let response = "I've processed that query. ";
      const text = copilotInput.toLowerCase();
      if (text.includes('service') || text.includes('maintenance')) {
        response += "Currently, vehicle IV-7722-M requires immediate thermal diagnostics. High priority ticket TKT-8842 has been assigned to Sunit Malhotra.";
      } else if (text.includes('risky') || text.includes('safety')) {
        response += "Driver Sunit Patil is flagged under review with a safety score of 58% due to high counts of harsh braking (14) and acceleration (16).";
      } else if (text.includes('battery') || text.includes('soh')) {
        response += "Average fleet Battery SOH is 88.6%. Vehicles IV-7722-M (78%) and IV-8834-K (86%) show degrading curves. LFP-72 modules are low in stock (reorder recommended).";
      } else {
        response += "Global optimization model is active. Recommend shifting charging window for Noida Hub to 02:00 - 05:00 AM to leverage lowest tariff bracket.";
      }
      setCopilotMessages(prev => [...prev, { role: 'ai', content: response }]);
    }, 1000);
  };

  // Remote command workflow trigger
  const runRemoteCommand = (cmd) => {
    setRemoteCommandProgress(1); // Requested
    setTimeout(() => {
      setRemoteCommandProgress(2); // Supervisor approved
      // Simulate sending OTP code
      console.log("OTP simulated for secure vehicle control action: 449210");
    }, 1500);
  };

  const verifyOTP = () => {
    if (remoteOTPInput === '449210' || remoteOTPInput.length === 6) {
      setRemoteCommandProgress(3); // Verified
      setTimeout(() => {
        setRemoteCommandProgress(4); // Completed
        const newLog = {
          time: new Date().toLocaleTimeString(),
          admin: 'Arjun Sharma',
          vehicle: selectedRemoteVehicle,
          command: 'Remote Vehicle Safety Lock Sequence',
          status: 'Command Executed and Confirmed via Telematics API'
        };
        setRemoteLogs(prev => [newLog, ...prev]);
      }, 1500);
    } else {
      alert("Invalid Security OTP. Audit exception logged.");
    }
  };

  // SOH Color helpers
  const getSOHColor = (soh) => {
    if (soh >= 90) return 'text-secondary';
    if (soh >= 80) return 'text-yellow-400';
    return 'text-error';
  };

  const getStatusBadge = (status) => {
    const maps = {
      Active: 'bg-secondary/10 text-secondary border border-secondary/25',
      Charging: 'bg-primary/10 text-primary border border-primary/25',
      Idle: 'bg-white/10 text-on-surface-variant border border-white/10',
      Maintenance: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/25',
      Offline: 'bg-error/10 text-error border border-error/25',
      Alert: 'bg-error/20 text-error animate-pulse border border-error/50'
    };
    return maps[status] || 'bg-white/10 text-on-surface';
  };

  const allowedTabs = ROLE_PERMISSIONS[loginRole] || ['Dashboard'];

  return (
    <div className="flex min-h-screen bg-background font-sans text-on-surface overflow-x-hidden">
      {!isLoggedIn ? (
        // -------------------------------------------------------------
        // ROLE-BASED LOGIN PANEL (GLASSMORPHISM)
        // -------------------------------------------------------------
        <div className="flex items-center justify-center w-full min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-container-high via-background to-background">
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="glass-card w-[460px] p-10 rounded-2xl z-10 animate-fade-in border border-white/10">
            <div className="text-center mb-8">
              <h1 className="font-display text-4xl font-extrabold text-primary tracking-tighter text-glow">INNOVIBE</h1>
              <p className="text-on-surface-variant text-sm font-medium tracking-wide uppercase mt-1">Command Center (ICC)</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Operational Role Domain</label>
                <select 
                  value={loginRole} 
                  onChange={(e) => setLoginRole(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-lg text-sm focus:ring-1 focus:ring-primary"
                >
                  <option value="Admin">Admin (Universal Control)</option>
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Driver">Driver / Operator</option>
                  <option value="Technician">Technician Engineer</option>
                  <option value="Operations Team">Operations Desk</option>
                  <option value="Finance Team">Finance Desk</option>
                </select>
              </div>

              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-500 font-medium text-center">
                  {loginError}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-3.5 bg-gradient-to-r from-primary-container to-secondary-container hover:brightness-110 text-background font-bold rounded-lg text-sm shadow-lg transition-all"
              >
                Access Operational Dashboard
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <span className="text-xs text-on-surface-variant">Default Demonstration Bypass Enabled (Use any values to test)</span>
            </div>
          </div>
        </div>
      ) : (
        // -------------------------------------------------------------
        // SAAS PLATFORM SHELL
        // -------------------------------------------------------------
        <div className="flex w-full min-h-screen">
          {/* Sidebar */}
          <aside className={`w-72 glass-panel border-r border-white/10 flex flex-col fixed h-full z-40 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            <div className="p-8 border-b border-white/5">
              <h2 className="font-display text-2xl font-black text-primary tracking-tighter text-glow">INNOVIBE</h2>
              <span className="text-secondary-fixed text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary pulse-glow-teal"></span>
                ICC Live Mode
              </span>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 hide-scrollbar">
              {allowedTabs.includes('Dashboard') && (
                <button 
                  onClick={() => setActiveTab('Dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'Dashboard' ? 'bg-primary-container/20 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  Dashboard Overview
                </button>
              )}

              {allowedTabs.includes('Fleet') && (
                <button 
                  onClick={() => setActiveTab('Fleet')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'Fleet' ? 'bg-primary-container/20 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined">local_shipping</span>
                  Vehicle Master list
                </button>
              )}

              {allowedTabs.includes('Drivers') && (
                <button 
                  onClick={() => setActiveTab('Drivers')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'Drivers' ? 'bg-primary-container/20 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined">person_pin</span>
                  Driver Intelligence
                </button>
              )}

              {allowedTabs.includes('Battery') && (
                <button 
                  onClick={() => setActiveTab('Battery')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'Battery' ? 'bg-primary-container/20 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined">battery_charging_full</span>
                  Battery Intelligence
                </button>
              )}

              {(allowedTabs.includes('Service') || allowedTabs.includes('Inventory') || allowedTabs.includes('Geofencing')) && (
                <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest px-3 pt-4 mb-2">Operations Desk</p>
              )}

              {allowedTabs.includes('Service') && (
                <button 
                  onClick={() => setActiveTab('Service')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'Service' ? 'bg-primary-container/20 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined">build_circle</span>
                  Service tickets
                </button>
              )}

              {allowedTabs.includes('Inventory') && (
                <button 
                  onClick={() => setActiveTab('Inventory')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'Inventory' ? 'bg-primary-container/20 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined">inventory_2</span>
                  Parts Inventory
                </button>
              )}

              {allowedTabs.includes('Geofencing') && (
                <button 
                  onClick={() => setActiveTab('Geofencing')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'Geofencing' ? 'bg-primary-container/20 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined">fence</span>
                  Geofence Settings
                </button>
              )}

              {allowedTabs.includes('ERP') && (
                <>
                  <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest px-3 pt-4 mb-2">Enterprise Modules</p>
                  <button 
                    onClick={() => setActiveTab('ERP')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'ERP' ? 'bg-primary-container/20 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}
                  >
                    <span className="material-symbols-outlined">account_balance</span>
                    ERP Finance
                  </button>
                </>
              )}

              {(allowedTabs.includes('Copilot') || allowedTabs.includes('DigitalTwin') || allowedTabs.includes('Remote')) && (
                <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest px-3 pt-4 mb-2">AI & Controls</p>
              )}

              {allowedTabs.includes('Copilot') && (
                <button 
                  onClick={() => setActiveTab('Copilot')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'Copilot' ? 'bg-primary-container/20 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined text-purple-400">psychology</span>
                  NOVA AI Copilot
                </button>
              )}

              {allowedTabs.includes('DigitalTwin') && (
                <button 
                  onClick={() => setActiveTab('DigitalTwin')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'DigitalTwin' ? 'bg-primary-container/20 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined">view_in_ar</span>
                  Digital Twin Room
                </button>
              )}

              {allowedTabs.includes('Remote') && (
                <button 
                  onClick={() => setActiveTab('Remote')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'Remote' ? 'bg-primary-container/20 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined">settings_remote</span>
                  Remote Overrides
                </button>
              )}
            </nav>

            {/* Profile Footer */}
            <div className="p-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  {displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-xs font-bold">{displayName}</h4>
                  <span className="text-[10px] text-on-surface-variant">{loginRole}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-error-container/20 text-error hover:bg-error-container/30 transition-colors"
                title="Disconnect session"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          </aside>

          {/* Main Workspace Frame */}
          <div className="flex-1 ml-72 min-h-screen flex flex-col bg-background">
            {/* Header topbar */}
            <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <h3 className="font-display text-xl font-bold tracking-tight">{activeTab} Monitor</h3>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-white/5 text-xs text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-secondary pulse-glow-teal"></span>
                  Connected
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-white/5 text-xs text-on-surface-variant">
                  <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                  Database: {dbConnected ? 'Live (Supabase)' : 'Offline'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-on-surface-variant material-symbols-outlined text-[18px]">search</span>
                  <input 
                    type="text" 
                    placeholder="Global tracking search..." 
                    className="w-64 glass-input pl-9 pr-4 py-2 rounded-lg text-xs" 
                  />
                </div>

                {/* Notifications Bell */}
                <div className="relative cursor-pointer w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container border border-white/5 text-on-surface hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-error border border-background"></span>
                </div>

                <div 
                  onClick={() => setActiveTab('Copilot')}
                  className="cursor-pointer px-4 py-2 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-background font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-all glow-primary"
                >
                  <span className="material-symbols-outlined text-[18px] animate-bounce">psychology</span>
                  Ask NOVA AI
                </div>
              </div>
            </header>

            {/* Render view contents */}
            <main className="p-8 flex-1">
              
              {/* -------------------------------------------------------------
                  TAB 1: DASHBOARD
                  ------------------------------------------------------------- */}
              {activeTab === 'Dashboard' && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* AI insights banner alert */}
                  <div className="p-5 bg-gradient-to-r from-primary-container/20 via-secondary-container/10 to-transparent border border-primary/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-3xl text-secondary animate-pulse">psychology</span>
                      <div>
                        <h4 className="font-bold text-sm text-primary">Executive Optimization Dispatch</h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">3 batteries in Noida division show accelerated impedance degradation. Shift scheduled maintenance to prevent offline service downtime.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('Copilot')}
                      className="px-4 py-2 bg-primary text-background font-bold text-xs rounded-lg hover:brightness-105"
                    >
                      Resolve anomalies
                    </button>
                  </div>

                  {/* Operational KPI Metrics grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-card p-6 rounded-xl relative overflow-hidden">
                      <div className="absolute -right-3 -top-3 w-16 h-16 bg-primary/10 rounded-full blur-xl"></div>
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Fleet Registry</span>
                      <h2 className="text-3xl font-display font-black text-primary mt-2">1,240</h2>
                      <span className="text-[10px] text-secondary mt-1 block">Active Now: 982 Units (79.2%)</span>
                    </div>

                    <div className="glass-card p-6 rounded-xl relative overflow-hidden">
                      <div className="absolute -right-3 -top-3 w-16 h-16 bg-secondary/10 rounded-full blur-xl"></div>
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Maintenance Pipeline</span>
                      <h2 className="text-3xl font-display font-black text-yellow-400 mt-2">174</h2>
                      <span className="text-[10px] text-error mt-1 block">47 flagged urgent anomalies</span>
                    </div>

                    <div className="glass-card p-6 rounded-xl relative overflow-hidden">
                      <div className="absolute -right-3 -top-3 w-16 h-16 bg-primary/15 rounded-full blur-xl"></div>
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Operational Revenue</span>
                      <h2 className="text-3xl font-display font-black text-secondary mt-2">₹14,20,000</h2>
                      <span className="text-[10px] text-secondary mt-1 block">Average: ₹2.1 Cost per KM</span>
                    </div>

                    <div className="glass-card p-6 rounded-xl relative overflow-hidden">
                      <div className="absolute -right-3 -top-3 w-16 h-16 bg-error/10 rounded-full blur-xl"></div>
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Battery Health Score</span>
                      <h2 className="text-3xl font-display font-black text-secondary-fixed mt-2">94%</h2>
                      <span className="text-[10px] text-on-surface-variant mt-1 block">Avg cycle status: Nominal</span>
                    </div>
                  </div>

                  {/* Telematics map & Alerts Feed */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Simulated Map Container */}
                    <div className="lg:col-span-2 glass-card p-6 rounded-xl flex flex-col h-[400px]">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-sm">Real-time Telemetry Overlay</h4>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                          <span className="text-xs">Active hubs clustered</span>
                        </div>
                      </div>
                      
                      {/* Leaflet/Simulated Map canvas */}
                      <div className="flex-1 bg-surface-container-low rounded-lg border border-white/5 relative overflow-hidden flex items-center justify-center">
                        {/* CSS-based Tech Grid Background */}
                        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                        
                        {/* Simulated map nodes */}
                        <div className="absolute top-[25%] left-[50%] flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-[10px] font-bold text-primary animate-pulse">124</div>
                          <span className="text-[9px] uppercase tracking-wider text-on-surface-variant mt-1">Delhi NCR</span>
                        </div>

                        <div className="absolute bottom-[30%] left-[45%] flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-secondary/20 border border-secondary flex items-center justify-center text-[10px] font-bold text-secondary animate-pulse">288</div>
                          <span className="text-[9px] uppercase tracking-wider text-on-surface-variant mt-1">Mumbai Hub</span>
                        </div>

                        <div className="absolute bottom-[20%] right-[30%] flex flex-col items-center">
                          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-[10px] font-bold text-primary animate-pulse">215</div>
                          <span className="text-[9px] uppercase tracking-wider text-on-surface-variant mt-1">Bangalore</span>
                        </div>

                        <div className="absolute bottom-[40%] right-[25%] flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-[10px] font-bold text-primary animate-pulse">132</div>
                          <span className="text-[9px] uppercase tracking-wider text-on-surface-variant mt-1">Hyderabad</span>
                        </div>

                        <span className="absolute bottom-4 left-4 text-[10px] text-on-surface-variant">Live telemetry visualization (India coverage map)</span>
                      </div>
                    </div>

                    {/* Alerts panel */}
                    <div className="glass-card p-6 rounded-xl flex flex-col h-[400px]">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-sm">Critical Telemetry Log</h4>
                        <span className="text-xs text-error font-semibold uppercase">Realtime Feed</span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 hide-scrollbar">
                        {alerts.map(alert => (
                          <div 
                            key={alert.id} 
                            onClick={() => {
                              setSelectedRemoteVehicle(alert.target);
                              setActiveTab('Remote');
                            }}
                            className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-white/5 ${alert.type === 'Critical' ? 'bg-error/15 border-error/25' : 'bg-surface-container border-white/5'}`}
                          >
                            <div className="flex justify-between items-center">
                              <span className={`text-[10px] font-bold uppercase ${alert.type === 'Critical' ? 'text-error' : 'text-primary'}`}>
                                {alert.type} Alert
                              </span>
                              <span className="text-[9px] text-on-surface-variant">{alert.time}</span>
                            </div>
                            <p className="text-xs text-on-surface mt-1.5 font-medium">{alert.text}</p>
                            <span className="text-[9px] text-secondary mt-1.5 block">Tap to trigger remote intervention</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active trip matrix table */}
                  <div className="glass-card p-6 rounded-xl">
                    <h4 className="font-bold text-sm mb-4">Active Route executions</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th>Vehicle ID</th>
                            <th>Model</th>
                            <th>Driver</th>
                            <th>SOC</th>
                            <th>Battery Temp</th>
                            <th>Speed</th>
                            <th>Location Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vehicles.map(v => (
                            <tr key={v.id}>
                              <td className="font-bold text-primary">{v.id}</td>
                              <td>{v.model}</td>
                              <td>{v.driver}</td>
                              <td>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-white/10 h-1.5 rounded-full overflow-hidden">
                                    <div className={`h-full ${v.soc > 80 ? 'bg-secondary' : v.soc > 40 ? 'bg-primary' : 'bg-error'}`} style={{ width: `${v.soc}%` }}></div>
                                  </div>
                                  <span className="text-xs font-semibold">{v.soc}%</span>
                                </div>
                              </td>
                              <td className={v.temp > 45 ? 'text-error font-bold' : ''}>{v.temp}°C</td>
                              <td>{v.speed} km/h</td>
                              <td>
                                <span className={`badge ${v.status === 'Active' ? 'badge-green' : v.status === 'Charging' ? 'badge-blue' : 'badge-gray'}`}>
                                  {v.status}
                                </span>
                              </td>
                              <td>
                                <button 
                                  onClick={() => {
                                    setSelectedTwinVehicle(v.id);
                                    setActiveTab('DigitalTwin');
                                  }}
                                  className="text-xs text-primary hover:underline"
                                >
                                  Open Twin
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 2: VEHICLE MASTER
                  ------------------------------------------------------------- */}
              {activeTab === 'Fleet' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-sm">Enterprise Vehicle Directory</h4>
                      <p className="text-xs text-on-surface-variant">Manage telematics hardware, registrations, and fleet leases.</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <select 
                        value={vehicleFilterStatus}
                        onChange={(e) => setVehicleFilterStatus(e.target.value)}
                        className="glass-input px-3 py-2 rounded-lg text-xs"
                      >
                        <option value="All">All statuses</option>
                        <option value="Active">Active</option>
                        <option value="Charging">Charging</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Offline">Offline</option>
                      </select>
                      
                      <input 
                        type="text" 
                        placeholder="Search VIN or reg..."
                        value={vehicleSearch}
                        onChange={(e) => setVehicleSearch(e.target.value)}
                        className="glass-input px-3 py-2 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles
                      .filter(v => vehicleFilterStatus === 'All' || v.status === vehicleFilterStatus)
                      .filter(v => v.id.toLowerCase().includes(vehicleSearch.toLowerCase()) || v.model.toLowerCase().includes(vehicleSearch.toLowerCase()))
                      .map(v => (
                        <div key={v.id} className="glass-card p-5 rounded-xl border border-white/5 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg text-primary">{v.id}</h3>
                              <span className="text-xs text-on-surface-variant">{v.model}</span>
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${getStatusBadge(v.status)}`}>
                              {v.status}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-on-surface-variant">Operator Driver</span>
                              <span className="font-semibold">{v.driver}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-on-surface-variant">Battery Passport</span>
                              <span className="font-mono text-secondary">{v.batteryId}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-on-surface-variant">Connectivity Hardware</span>
                              <span className="text-on-surface font-mono">{v.signal > 0 ? `95% (${v.firmware})` : 'Offline'}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-primary">battery_charging_full</span>
                              <span className="text-xs font-bold">{v.soc}% SOC</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-secondary">monitor_heart</span>
                              <span className="text-xs font-bold">{v.soh}% SOH</span>
                            </div>
                          </div>

                          <div className="pt-2 flex gap-2">
                            <button 
                              onClick={() => {
                                setSelectedTwinVehicle(v.id);
                                setActiveTab('DigitalTwin');
                              }}
                              className="flex-1 py-2 bg-surface-container border border-white/5 hover:bg-surface-container-high rounded-lg text-[10px] font-bold text-on-surface"
                            >
                              Diagnostics Twin
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedRemoteVehicle(v.id);
                                setActiveTab('Remote');
                              }}
                              className="py-2 px-3 bg-error-container/20 text-error hover:bg-error-container/30 rounded-lg text-[10px] font-bold"
                            >
                              Control
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 3: DRIVER INTELLIGENCE
                  ------------------------------------------------------------- */}
              {activeTab === 'Drivers' && (
                loginRole === 'Driver' ? (
                  <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
                    <div className="glass-card p-6 rounded-xl space-y-4">
                      <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined">car_repair</span>
                        Book Service / Request Repair
                      </h3>
                      <p className="text-xs text-on-surface-variant">Submit an active ticket directly to the service department for vehicle IV-9022-X.</p>
                      
                      <div className="space-y-4 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Describe Issue / Telemetry Fault</label>
                          <textarea 
                            value={driverIssueDesc}
                            onChange={(e) => setDriverIssueDesc(e.target.value)}
                            placeholder="e.g. Battery heating warning light, minor deceleration lag during regeneration..."
                            className="glass-input w-full px-4 py-3 rounded-lg text-xs h-28 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Priority Level</label>
                          <select 
                            value={driverIssuePriority}
                            onChange={(e) => setDriverIssuePriority(e.target.value)}
                            className="glass-input w-full px-4 py-3 rounded-lg text-xs"
                          >
                            <option value="Low">Low (General Checkup)</option>
                            <option value="Medium">Medium (BMS Flag)</option>
                            <option value="High">High (Hardware Fault)</option>
                            <option value="Critical">Critical (Immediate Repair)</option>
                          </select>
                        </div>

                        {driverBookingStatus && (
                          <div className={`p-3 rounded-lg text-xs font-medium text-center ${driverBookingStatus.includes('Success') ? 'bg-secondary/15 border border-secondary/25 text-secondary' : 'bg-primary/20 text-primary'}`}>
                            {driverBookingStatus}
                          </div>
                        )}

                        <button 
                          onClick={submitDriverServiceTicket}
                          className="w-full py-3 bg-primary text-background font-bold text-xs rounded-lg hover:brightness-105 transition-all"
                        >
                          Submit Repair Request & Stream
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm">AI Behavior & Driver safety metrics</h4>
                        <p className="text-xs text-on-surface-variant">Continuous tracking of harsh braking, acceleration, and compliance.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-normal">
                      
                      {/* Driver leaderboard list */}
                      <div className="lg:col-span-2 glass-card p-6 rounded-xl space-y-4">
                        <h4 className="font-bold text-sm">Performance Classification</h4>
                        <div className="space-y-4">
                        {DRIVER_DATA.map(d => (
                          <div key={d.id} className="p-4 bg-surface-container/40 border border-white/5 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                {d.name.split(' ').map(n=>n[0]).join('')}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold">{d.name}</h4>
                                <span className="text-[10px] text-on-surface-variant font-mono">{d.id} | License: {d.license}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Safety rating</span>
                                <span className={`text-lg font-bold ${d.score >= 85 ? 'text-secondary' : d.score >= 70 ? 'text-yellow-400' : 'text-error'}`}>
                                  {d.score}/100
                                </span>
                              </div>

                              <div className="text-right hidden sm:block">
                                <span className="text-xs block">Efficiency: {d.efficiency}</span>
                                <span className="text-[10px] text-on-surface-variant block">Overspeed alerts: {d.speed}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Driver Risk profile AI */}
                    <div className="glass-card p-6 rounded-xl space-y-6">
                      <h4 className="font-bold text-sm">Safety Risk Analysis Engine</h4>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-error/10 border border-error/25 rounded-lg">
                          <h5 className="text-xs font-bold text-error flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">warning</span>
                            Critical Risk Assessment
                          </h5>
                          <p className="text-[11px] text-on-surface mt-1">Sunit Patil triggered 14 harsh braking logs and 8 device-reported phone distraction flags in 48 hours.</p>
                          <button 
                            onClick={() => {
                              setSelectedRemoteVehicle('IV-7722-M');
                              setActiveTab('Remote');
                            }}
                            className="mt-3 w-full py-1.5 bg-error text-background font-bold text-[10px] rounded hover:brightness-105"
                          >
                            Suspend Ignition Authority
                          </button>
                        </div>

                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-2">
                          <h5 className="text-xs font-bold text-primary">Training Recommendations</h5>
                          <ul className="text-[10px] space-y-1 list-disc list-inside text-on-surface-variant">
                            <li>Mohammed Ali: Regenerative braking transition guidance.</li>
                            <li>Priya Sharma: Idle mitigation at highway toll barriers.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

              {/* -------------------------------------------------------------
                  TAB 4: BATTERY INTELLIGENCE
                  ------------------------------------------------------------- */}
              {activeTab === 'Battery' && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h4 className="font-bold text-sm">Battery SOH / Cell balancer matrix</h4>
                    <p className="text-xs text-on-surface-variant">Monitor state of health, cell voltage deviations, and cycle forecasts.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Cell balancing matrix visual */}
                    <div className="lg:col-span-2 glass-card p-6 rounded-xl space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm">Live Pack Cell voltage distribution</h4>
                        <span className="text-xs text-on-surface-variant">Pack ID: B-NMC-114B (Ola S1 Pro)</span>
                      </div>

                      {/* Cell balancing grid representation */}
                      <div className="grid grid-cols-8 gap-3 p-4 bg-surface-container-low rounded-xl border border-white/5">
                        {Array.from({ length: 32 }).map((_, i) => {
                          const isBad = i === 18;
                          const volt = isBad ? '3.82V' : '4.18V';
                          return (
                            <div 
                              key={i} 
                              className={`p-2 rounded flex flex-col items-center justify-center border text-[9px] font-mono font-bold ${isBad ? 'bg-error/25 border-error text-error animate-pulse' : 'bg-secondary/15 border-secondary/25 text-secondary'}`}
                              title={`Cell #${i+1}: ${volt}`}
                            >
                              <span>C{i+1}</span>
                              <span className="mt-0.5">{volt}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-secondary"></span>
                          <span>Balanced State (4.18V ± 5mV)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-error"></span>
                          <span>Over-discharge warning (&gt;35mV variation)</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Health Predictor */}
                    <div className="glass-card p-6 rounded-xl space-y-6">
                      <h4 className="font-bold text-sm">AI Health predictor report</h4>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-surface-container rounded-lg space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Remaining Useful Life (RUL)</span>
                            <span className="font-bold text-primary">740 Cycles (approx 2.5 yrs)</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Avg Temperature range</span>
                            <span className="font-bold text-secondary">31°C - 38°C</span>
                          </div>
                        </div>

                        <div className="p-4 bg-yellow-400/10 border border-yellow-400/25 rounded-lg">
                          <h5 className="text-xs font-bold text-yellow-400">Predicted Replacement Schedule</h5>
                          <p className="text-[10px] text-on-surface-variant mt-1.5">
                            Vehicle IV-7722-M battery health is estimated to hit 70% threshold by November 2026. Auto purchase order triggered to reserve module.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 5: SERVICE TICKETS
                  ------------------------------------------------------------- */}
              {activeTab === 'Service' && (
                loginRole === 'Technician' ? (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h4 className="font-display text-xl font-bold tracking-tight text-primary">Technician Work Orders</h4>
                      <p className="text-xs text-on-surface-variant">Manage your active maintenance checklist and claim new tickets from the queue.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left Column: Active Assignment */}
                      <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-secondary"></span>
                          My Active Assignment
                        </h3>
                        <div className="space-y-4">
                          {(() => {
                            const activeTickets = (serviceTickets.length > 0 ? serviceTickets : SERVICE_TICKETS).filter(t => t.status === 'In Progress' && t.assigned_technician === 'Sunit Malhotra');

                            if (activeTickets.length === 0) {
                              return (
                                <div className="glass-card p-6 rounded-xl text-center">
                                  <p className="text-xs text-on-surface-variant">No active service assignments. Accept a job from the pool to begin.</p>
                                </div>
                              );
                            }

                            return activeTickets.map(t => (
                              <div key={t.id} className="glass-card p-6 rounded-xl space-y-4 border border-primary/20">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                  <div>
                                    <span className="text-xs text-primary font-mono font-bold">{t.ticket_number}</span>
                                    <h4 className="font-bold text-sm mt-0.5">{t.vehicle_reg}</h4>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.priority === 'Critical' ? 'bg-error/25 text-error border border-error/20' : 'bg-primary/20 text-primary border border-primary/20'}`}>{t.priority}</span>
                                </div>
                                <p className="text-xs text-on-surface">{t.issue_description}</p>
                                <div className="pt-2 border-t border-white/5 flex justify-end">
                                  <button 
                                    onClick={() => closeServiceTicket(t.id)} 
                                    className="px-3 py-1.5 bg-secondary text-background font-bold text-xs rounded hover:opacity-90"
                                  >
                                    Close Service Ticket
                                  </button>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* Right Column: Open Job Pool */}
                      <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                          Open Service Requests Pool (Real-time)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(() => {
                            const openTickets = (serviceTickets.length > 0 ? serviceTickets : SERVICE_TICKETS).filter(t => t.status === 'Open' || !t.assigned_technician);

                            if (openTickets.length === 0) {
                              return (
                                <div className="col-span-2 glass-card p-6 rounded-xl text-center">
                                  <p className="text-xs text-on-surface-variant">No open service requests in pool.</p>
                                </div>
                              );
                            }

                            return openTickets.map(t => (
                              <div key={t.id} className="glass-card p-5 rounded-xl space-y-3 hover:border-secondary/20 border border-transparent transition-all font-normal">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-on-surface-variant font-mono">{t.ticket_number}</span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.priority === 'Critical' ? 'bg-error/25 text-error border border-error/20' : 'bg-primary/20 text-primary border border-primary/20'}`}>{t.priority}</span>
                                </div>
                                <h4 className="font-bold text-sm text-primary">{t.vehicle_reg}</h4>
                                <p className="text-xs text-on-surface-variant">{t.issue_description}</p>
                                <button 
                                  onClick={() => acceptServiceTicket(t.id)} 
                                  className="w-full py-1.5 bg-surface-container hover:bg-surface-container-high rounded text-xs font-bold text-secondary"
                                >
                                  Accept Job / Assign to Me
                                </button>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-fade-in font-normal">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm">Service pipeline workflow</h4>
                        <p className="text-xs text-on-surface-variant">Assign tickets to technicians, track parts orders, and close workflows.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(serviceTickets.length > 0 ? serviceTickets : SERVICE_TICKETS).map(t => (
                        <div key={t.id} className="glass-card p-5 rounded-xl border border-white/5 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-mono font-bold text-primary">{t.ticket_number}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.priority === 'Critical' ? 'bg-error/25 text-error border border-error/20' : 'bg-primary/20 text-primary border border-primary/20'}`}>
                              {t.priority}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs text-on-surface-variant">Target Vehicle</h4>
                            <p className="text-sm font-bold mt-0.5">{t.vehicle_reg}</p>
                          </div>

                          <div>
                            <h4 className="text-xs text-on-surface-variant">Reported Issue</h4>
                            <p className="text-xs text-on-surface mt-1 leading-relaxed">{t.issue_description}</p>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs font-normal">
                            <div>
                              <span className="text-on-surface-variant block text-[10px]">Technician</span>
                              <span className="font-semibold">{t.assigned_technician || 'Unassigned'}</span>
                            </div>
                            <div>
                              <span className="text-on-surface-variant block text-[10px] text-right">Workflow Status</span>
                              <span className="text-secondary font-bold">{t.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* -------------------------------------------------------------
                  TAB 6: INVENTORY
                  ------------------------------------------------------------- */}
              {activeTab === 'Inventory' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h4 className="font-bold text-sm">Hardware & Battery inventory</h4>
                    <p className="text-xs text-on-surface-variant">Track spare parts, motors, controllers, and low stock thresholds.</p>
                  </div>

                  <div className="glass-card rounded-xl overflow-hidden">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th>Part Code</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Stock Level</th>
                          <th>Min Threshold</th>
                          <th>Unit Price</th>
                          <th>Supplier</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PARTS_INVENTORY.map(p => (
                          <tr key={p.id}>
                            <td className="font-mono text-primary font-bold">{p.code}</td>
                            <td>{p.name}</td>
                            <td>{p.category}</td>
                            <td className={p.stock < p.min ? 'text-error font-bold' : ''}>{p.stock} units</td>
                            <td>{p.min} units</td>
                            <td>₹{p.price.toLocaleString()}</td>
                            <td>{p.supplier}</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'Low Stock' ? 'bg-error/20 text-error' : 'bg-secondary/20 text-secondary'}`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 7: GEOFENCING
                  ------------------------------------------------------------- */}
              {activeTab === 'Geofencing' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm">Geofencing corridors</h4>
                      <p className="text-xs text-on-surface-variant">Define secure geo-boundaries for routing validation.</p>
                    </div>
                    <button 
                      onClick={() => setShowAddGeofence(true)}
                      className="px-3 py-2 bg-primary text-background font-bold text-xs rounded-lg hover:brightness-105"
                    >
                      Define corridor
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-card p-6 rounded-xl h-[360px] flex items-center justify-center bg-surface-container-low border border-white/5 relative">
                      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                      
                      {/* Simulated bounding boxes/polygons */}
                      <div className="w-[120px] h-[120px] rounded-full border-2 border-secondary/40 bg-secondary/10 flex items-center justify-center absolute left-[30%]">
                        <span className="text-[10px] text-secondary font-bold">Mumbai Depot (Radius: 500m)</span>
                      </div>

                      <div className="w-[180px] h-[100px] border-2 border-error/40 bg-error/10 flex items-center justify-center absolute right-[25%] rotate-12">
                        <span className="text-[10px] text-error font-bold">Noida Ind Zone (Polygon)</span>
                      </div>

                      <span className="absolute bottom-4 left-4 text-[10px] text-on-surface-variant">Geographic spatial coordinates rendering</span>
                    </div>

                    <div className="glass-card p-6 rounded-xl space-y-4">
                      <h4 className="font-bold text-sm">Configured Boundaries</h4>
                      
                      <div className="space-y-3">
                        {geofences.map(g => (
                          <div key={g.id} className="p-3 bg-surface-container/50 border border-white/5 rounded-lg">
                            <h5 className="text-xs font-bold text-primary">{g.name}</h5>
                            <div className="flex justify-between text-[10px] text-on-surface-variant mt-2">
                              <span>Type: {g.type}</span>
                              <span>Vehicles inside: {g.inside}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-error mt-1 font-bold">
                              <span>Violations today: {g.violations}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {showAddGeofence && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                      <div className="glass-card w-[420px] p-6 rounded-xl border border-white/10 space-y-4">
                        <h4 className="font-bold text-sm">Define geofence boundary</h4>
                        
                        <div className="space-y-3">
                          <input type="text" placeholder="Fence Identifier name" className="glass-input w-full px-3 py-2 rounded text-xs" />
                          <select className="glass-input w-full px-3 py-2 rounded text-xs">
                            <option>Radial boundary circle</option>
                            <option>Complex polygon</option>
                          </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <button onClick={() => setShowAddGeofence(false)} className="px-3 py-1.5 bg-surface-container rounded text-xs">Cancel</button>
                          <button onClick={() => setShowAddGeofence(false)} className="px-3 py-1.5 bg-primary text-background font-bold rounded text-xs">Create fence</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}



              {/* -------------------------------------------------------------
                  TAB 9: ERP FINANCE
                  ------------------------------------------------------------- */}
              {activeTab === 'ERP' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h4 className="font-bold text-sm">ERP Invoice & GST reports</h4>
                    <p className="text-xs text-on-surface-variant">Record procurement bills, leasing dues, and payroll states.</p>
                  </div>

                  <div className="glass-card rounded-xl overflow-hidden">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th>Invoice Ref</th>
                          <th>Client entity</th>
                          <th>Net Value</th>
                          <th>GST (18%)</th>
                          <th>Total Amount</th>
                          <th>Billing Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ERP_INVOICES.map(i => (
                          <tr key={i.id}>
                            <td className="font-mono text-primary font-bold">{i.id}</td>
                            <td>{i.customer}</td>
                            <td>{i.amount}</td>
                            <td>{i.gst}</td>
                            <td className="font-bold">{i.total}</td>
                            <td>{i.date}</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${i.status === 'Paid' ? 'bg-secondary/20 text-secondary' : 'bg-yellow-400/20 text-yellow-400'}`}>
                                {i.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 10: AI COPILOT
                  ------------------------------------------------------------- */}
              {activeTab === 'Copilot' && (
                <div className="space-y-6 animate-fade-in h-[calc(100vh-12rem)] flex flex-col">
                  
                  {/* Chat logs */}
                  <div className="flex-1 glass-card p-6 rounded-xl overflow-y-auto space-y-4">
                    {copilotMessages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-4 rounded-xl max-w-xl text-xs leading-relaxed border ${msg.role === 'user' ? 'bg-primary-container/20 border-primary/25 text-on-surface' : 'bg-surface-container border-white/5 text-on-surface'}`}>
                          <span className="font-bold text-[9px] uppercase tracking-wider text-primary block mb-1">
                            {msg.role === 'user' ? 'Operator' : 'Nova Fleet Intel'}
                          </span>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input area */}
                  <form onSubmit={submitCopilotPrompt} className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Ask NOVA AI about diagnostics, telemetry analysis, or parts inventory..." 
                      value={copilotInput}
                      onChange={(e) => setCopilotInput(e.target.value)}
                      className="flex-1 glass-input px-4 py-3 rounded-lg text-xs" 
                    />
                    <button 
                      type="submit" 
                      className="px-6 bg-gradient-to-r from-primary-container to-secondary-container text-background font-bold text-xs rounded-lg hover:brightness-105"
                    >
                      Dispatch
                    </button>
                  </form>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 11: DIGITAL TWIN
                  ------------------------------------------------------------- */}
              {activeTab === 'DigitalTwin' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm">Diagnostics Digital Twin</h4>
                      <p className="text-xs text-on-surface-variant">Real-time telematics replica of hardware components.</p>
                    </div>

                    <select 
                      value={selectedTwinVehicle} 
                      onChange={(e) => setSelectedTwinVehicle(e.target.value)}
                      className="glass-input px-3 py-2 rounded-lg text-xs"
                    >
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.id} ({v.model})</option>
                      ))}
                    </select>
                  </div>

                  {/* Twin visual layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* CSS vehicle layout schematic */}
                    <div className="lg:col-span-2 glass-card p-6 rounded-xl flex flex-col items-center justify-center min-h-[400px] relative">
                      <div className="absolute top-4 left-4 text-xs font-bold text-primary">Visual State Replica</div>

                      {/* EV Top-Down art */}
                      <div className="w-[120px] h-[280px] border-4 border-white/20 bg-surface-container rounded-2xl relative flex flex-col justify-between p-4">
                        {/* Motor zone */}
                        <div className="w-full h-12 bg-primary/20 border border-primary/50 rounded flex items-center justify-center text-[9px] text-primary font-bold">
                          PMSM MOTOR
                        </div>

                        {/* Battery pack zone */}
                        <div className="w-full h-24 bg-secondary/20 border border-secondary/50 rounded flex flex-col items-center justify-center text-[9px] text-secondary font-bold p-1 space-y-1">
                          <span>BATTERY PACK</span>
                          <span className="text-[8px] opacity-75">SOC: {vehicles.find(v=>v.id === selectedTwinVehicle)?.soc}%</span>
                        </div>

                        {/* Controller zone */}
                        <div className="w-full h-10 bg-yellow-400/20 border border-yellow-400/50 rounded flex items-center justify-center text-[9px] text-yellow-400 font-bold">
                          BMS CONTROLLER
                        </div>
                      </div>

                      <span className="text-[10px] text-on-surface-variant mt-4">Pulsing elements show continuous telemetry transmission cycles</span>
                    </div>

                    {/* Twin Telemetry specs */}
                    <div className="glass-card p-6 rounded-xl space-y-6">
                      <h4 className="font-bold text-sm">Real-time Parameters</h4>
                      
                      <div className="space-y-4">
                        <div className="p-3 bg-surface-container rounded-lg flex justify-between items-center text-xs">
                          <span className="text-on-surface-variant">Hardware Temp</span>
                          <span className="font-bold text-error">{vehicles.find(v=>v.id === selectedTwinVehicle)?.temp}°C</span>
                        </div>

                        <div className="p-3 bg-surface-container rounded-lg flex justify-between items-center text-xs">
                          <span className="text-on-surface-variant">Diagnostics DTC code</span>
                          <span className="font-mono text-yellow-400 font-bold">
                            {vehicles.find(v=>v.id === selectedTwinVehicle)?.fault === 'None' ? 'Nominal' : 'DTC-8842X'}
                          </span>
                        </div>

                        <div className="p-3 bg-surface-container rounded-lg flex justify-between items-center text-xs">
                          <span className="text-on-surface-variant">Hardware Uptime</span>
                          <span className="font-mono">99.84% SOH</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 12: REMOTE OVERRIDES
                  ------------------------------------------------------------- */}
              {activeTab === 'Remote' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="p-5 bg-error-container/20 border border-error/30 rounded-xl">
                    <h4 className="font-bold text-sm text-error flex items-center gap-1.5">
                      <span className="material-symbols-outlined">security</span>
                      Secure Multi-level Approval Authority
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Initiating remote overrides (ignition disable, lock) requires supervisor validation and OTP confirmation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Control workflow board */}
                    <div className="lg:col-span-2 glass-card p-6 rounded-xl space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm">Select Target vehicle</h4>
                        
                        <select 
                          value={selectedRemoteVehicle}
                          onChange={(e) => {
                            setSelectedRemoteVehicle(e.target.value);
                            setRemoteCommandProgress(0);
                          }}
                          className="glass-input px-3 py-2 rounded-lg text-xs"
                        >
                          {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.id} ({v.model})</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => runRemoteCommand('System lock')}
                          className="p-4 bg-surface-container border border-white/5 rounded-xl hover:bg-surface-container-high text-left space-y-2"
                        >
                          <span className="material-symbols-outlined text-error">lock</span>
                          <h4 className="text-xs font-bold block">Secure Lock System</h4>
                          <span className="text-[10px] text-on-surface-variant block">Lock all doors & set alarm state</span>
                        </button>

                        <button 
                          onClick={() => runRemoteCommand('Disable ignition')}
                          className="p-4 bg-surface-container border border-white/5 rounded-xl hover:bg-surface-container-high text-left space-y-2"
                        >
                          <span className="material-symbols-outlined text-error">power_off</span>
                          <h4 className="text-xs font-bold block">Disable Engine ignition</h4>
                          <span className="text-[10px] text-on-surface-variant block">Halt ignition response permanently</span>
                        </button>
                      </div>

                      {/* Approval flow stages visual */}
                      {remoteCommandProgress > 0 && (
                        <div className="p-4 bg-surface-container rounded-xl border border-white/5 space-y-4 animate-fade-in">
                          <h4 className="text-xs font-bold">Execution progress tracker</h4>
                          
                          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                            <div className={`p-2 rounded ${remoteCommandProgress >= 1 ? 'bg-primary/20 text-primary font-bold' : 'bg-white/5 text-on-surface-variant'}`}>
                              1. Requested
                            </div>
                            <div className={`p-2 rounded ${remoteCommandProgress >= 2 ? 'bg-primary/20 text-primary font-bold' : 'bg-white/5 text-on-surface-variant'}`}>
                              2. Approved
                            </div>
                            <div className={`p-2 rounded ${remoteCommandProgress >= 4 ? 'bg-secondary/20 text-secondary font-bold' : 'bg-white/5 text-on-surface-variant'}`}>
                              3. Executed
                            </div>
                          </div>

                          {remoteCommandProgress === 2 && (
                            <div className="pt-2 flex gap-4">
                              <input 
                                type="text" 
                                placeholder="Enter 6-digit Security OTP (Use: 449210)"
                                value={remoteOTPInput}
                                onChange={(e) => setRemoteOTPInput(e.target.value)}
                                className="flex-1 glass-input px-3 py-1.5 rounded text-xs"
                              />
                              <button 
                                onClick={verifyOTP}
                                className="px-4 py-2 bg-secondary text-background font-bold text-xs rounded hover:brightness-105"
                              >
                                Verify
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Audit Logs */}
                    <div className="glass-card p-6 rounded-xl flex flex-col h-[380px]">
                      <h4 className="font-bold text-sm mb-4">Control Audit Trail</h4>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 hide-scrollbar">
                        {remoteLogs.map((log, i) => (
                          <div key={i} className="p-3 bg-surface-container rounded-lg border border-white/5 text-[11px]">
                            <div className="flex justify-between text-on-surface-variant">
                              <span>Time: {log.time}</span>
                              <span className="font-mono text-primary font-bold">{log.vehicle}</span>
                            </div>
                            <p className="mt-1 font-semibold text-on-surface">{log.command}</p>
                            <span className="text-[10px] text-secondary mt-1 block">{log.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
