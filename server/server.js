/**
 * INNOVIBE EV Fleet Management Platform Backend Server
 * Production-grade Express Server with REST APIs, Real-time WebSockets, JWT Auth,
 * Role-Based Access Control (RBAC), and Integration simulation for MQTT, Socket.IO, and Kafka.
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const JWT_SECRET = process.env.JWT_SECRET || 'innovibe_secret_key_change_in_production';
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// DUMMY DATABASE (Representing production data structures)
// -------------------------------------------------------------
const USERS = [
    { id: '1', email: 'admin@innovibe.in', password: 'password123', name: 'Arjun Sharma', role: 'Super Admin' },
    { id: '2', email: 'manager@innovibe.in', password: 'password123', name: 'Priya Patel', role: 'Fleet Manager' },
    { id: '3', email: 'driver@innovibe.in', password: 'password123', name: 'Rajesh Kumar', role: 'Driver' },
    { id: '4', email: 'tech@innovibe.in', password: 'password123', name: 'Sunit Malhotra', role: 'Technician' }
];

const VEHICLES = [
    { id: 'v1', vin: 'IN982X38472910AA', reg: 'MH12EV4521', model: 'Tata Nexon EV', driver: 'Rajesh Kumar', status: 'Active', soc: 72, soh: 92, temp: 34, speed: 45, lat: 19.076, lng: 72.877 },
    { id: 'v2', vin: 'IN982X38472910BB', reg: 'DL01EV7823', model: 'Ola S1 Pro', driver: 'Priya Sharma', status: 'Charging', soc: 88, soh: 94, temp: 38, speed: 0, lat: 28.613, lng: 77.209 },
    { id: 'v3', vin: 'IN982X38472910CC', reg: 'KA05EV2341', model: 'Ather 450X', driver: 'Sunit Patil', status: 'Idle', soc: 56, soh: 88, temp: 31, speed: 0, lat: 12.971, lng: 77.594 },
    { id: 'v4', vin: 'IN982X38472910DD', reg: 'TN07EV4521', model: 'Tata Tigor EV', driver: 'Anita Rao', status: 'Alert', soc: 31, soh: 78, temp: 46, speed: 52, lat: 13.082, lng: 80.27 }
];

const TRIPS = [
    { id: 't1', vehicleId: 'v1', driverId: '3', start: '2026-06-30T10:00:00Z', end: null, origin: 'Mumbai Hub', destination: 'Pune Hub', distancePlanned: 150, distanceActual: 48, status: 'In Progress' }
];

const SERVICE_TICKETS = [
    { id: 'tk1', ticketNumber: 'T-2847', vehicleId: 'v4', issue: 'High battery cell temperature fluctuation', priority: 'High', status: 'Assigned', technicianId: '4' }
];

const INVENTORY = [
    { id: 'p1', code: 'BAT-LFP-72', name: '72V Lithium Ferro Phosphate Battery Pack', category: 'Battery', quantity: 14, minThreshold: 5, unitPrice: 125000 },
    { id: 'p2', code: 'MOT-PMSM-15', name: '15kW Permanent Magnet Synchronous Motor', category: 'Motor', quantity: 3, minThreshold: 4, unitPrice: 85000 }
];

const EXPENSES = [
    { id: 'e1', category: 'Charging', amount: 42100, date: '2026-06-30' },
    { id: 'e2', category: 'Maintenance', amount: 15400, date: '2026-06-30' }
];

const AUDIT_LOGS = [];

// -------------------------------------------------------------
// MIDDLEWARES
// -------------------------------------------------------------
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access Denied: Insufficient Permissions' });
        }
        next();
    };
};

const logAudit = (userId, action, details) => {
    const entry = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        action,
        details,
        timestamp: new Date().toISOString()
    };
    AUDIT_LOGS.push(entry);
    console.log(`[AUDIT] ${entry.timestamp} | User: ${userId} | ${action} - ${JSON.stringify(details)}`);
};

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// Authentication
app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body;
    const user = USERS.find(u => u.email === email && u.role === role);
    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials or role mismatch' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    logAudit(user.id, 'User Login', { role: user.role });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

// Vehicles REST APIs
app.get('/api/vehicles', authenticateJWT, (req, res) => {
    res.json(VEHICLES);
});

app.get('/api/vehicles/:id', authenticateJWT, (req, res) => {
    const vehicle = VEHICLES.find(v => v.id === req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
});

app.post('/api/vehicles', authenticateJWT, authorizeRoles('Super Admin', 'Fleet Admin'), (req, res) => {
    const newVehicle = { id: `v${VEHICLES.length + 1}`, ...req.body };
    VEHICLES.push(newVehicle);
    logAudit(req.user.id, 'Create Vehicle', { vehicleId: newVehicle.id, reg: newVehicle.reg });
    res.status(201).json(newVehicle);
});

// Battery Health REST APIs
app.get('/api/battery/health', authenticateJWT, (req, res) => {
    const batteryMetrics = VEHICLES.map(v => ({
        vehicleId: v.id,
        reg: v.reg,
        soc: v.soc,
        soh: v.soh,
        temp: v.temp,
        voltage: 342.4 + (Math.random() * 5),
        current: v.status === 'Charging' ? -24.5 : 12.8,
        status: v.soh > 90 ? 'Excellent' : v.soh > 80 ? 'Good' : 'Degrading'
    }));
    res.json(batteryMetrics);
});

// Trips REST APIs
app.get('/api/trips', authenticateJWT, (req, res) => {
    res.json(TRIPS);
});

app.post('/api/trips', authenticateJWT, (req, res) => {
    const newTrip = { id: `t${TRIPS.length + 1}`, ...req.body, status: 'In Progress' };
    TRIPS.push(newTrip);
    logAudit(req.user.id, 'Create Trip', { tripId: newTrip.id });
    res.status(201).json(newTrip);
});

// Service Tickets REST APIs
app.get('/api/service/tickets', authenticateJWT, (req, res) => {
    res.json(SERVICE_TICKETS);
});

app.post('/api/service/tickets', authenticateJWT, (req, res) => {
    const newTicket = { id: `tk${SERVICE_TICKETS.length + 1}`, ticketNumber: `T-${2000 + SERVICE_TICKETS.length}`, ...req.body };
    SERVICE_TICKETS.push(newTicket);
    logAudit(req.user.id, 'Create Service Ticket', { ticketNumber: newTicket.ticketNumber });
    res.status(201).json(newTicket);
});

// Inventory REST APIs
app.get('/api/inventory', authenticateJWT, (req, res) => {
    res.json(INVENTORY);
});

// Remote Controls API with Multi-level Approvals & OTP Trigger simulation
app.post('/api/remote-control/command', authenticateJWT, authorizeRoles('Super Admin', 'Operations Team'), (req, res) => {
    const { vehicleId, command, reason, supervisorId } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const controlSession = {
        id: Math.random().toString(36).substr(2, 9),
        vehicleId,
        command,
        reason,
        supervisorId,
        otpCode: otp,
        status: 'Pending Approval',
        timestamp: new Date().toISOString()
    };
    
    // Simulate WhatsApp or SMS transmission
    console.log(`[REALTIME SIMULATION] OTP sent for command "${command}" on vehicle ${vehicleId}. Code: ${otp}`);
    
    logAudit(req.user.id, 'Initiate Remote Command', { vehicleId, command });
    res.json({ sessionId: controlSession.id, message: 'OTP and Supervisor Approval Requested', otpSimulated: otp });
});

// AI Copilot Integration
app.post('/api/ai/copilot', authenticateJWT, (req, res) => {
    const { prompt } = req.body;
    let reply = "";
    
    if (prompt.toLowerCase().includes('service')) {
        reply = "Analysis indicates 2 vehicles need service. MH14EV9901 is reporting battery cell temperature anomalies. Schedule maintenance recommended.";
    } else if (prompt.toLowerCase().includes('risky')) {
        reply = "Driver Rajesh Kumar safety score dropped to 72% due to 3 harsh acceleration alerts and 2 overspeeding logs today.";
    } else {
        reply = "Nova AI analysis: Fleet health is stable at 94%. Daily route optimization generated potential savings of ₹8,400.";
    }
    
    res.json({ reply });
});

// Real-time Updates Loop for WebSockets (Telemetry Simulation)
setInterval(() => {
    VEHICLES.forEach(v => {
        if (v.status === 'Active') {
            v.soc = Math.max(10, v.soc - 1);
            v.speed = Math.floor(30 + Math.random() * 40);
            v.lat += (Math.random() - 0.5) * 0.01;
            v.lng += (Math.random() - 0.5) * 0.01;
        } else if (v.status === 'Charging') {
            v.soc = Math.min(100, v.soc + 2);
            v.speed = 0;
        }
    });
    
    io.emit('telemetry', VEHICLES);
}, 5000);

// Server Listen
server.listen(PORT, () => {
    console.log(`INNOVIBE EV Fleet Backend is running on port ${PORT}`);
});
