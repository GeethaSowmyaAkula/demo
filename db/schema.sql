-- PostgreSQL Schema for INNOVIBE EV Fleet Management Platform
-- Normalized Tables, Relationships, Indexes, Triggers, Audit Logs

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS FOR ROLE-BASED AUTHENTICATION & STATES
CREATE TYPE user_role AS ENUM (
    'Super Admin', 
    'Fleet Admin', 
    'Fleet Manager', 
    'Driver', 
    'Technician', 
    'Customer', 
    'Operations Team', 
    'Finance Team', 
    'CRM Team'
);

CREATE TYPE vehicle_status AS ENUM ('Active', 'Idle', 'Charging', 'Maintenance', 'Offline', 'Alert');
CREATE TYPE battery_status AS ENUM ('Excellent', 'Good', 'Degrading', 'Critical', 'Replacement Due');
CREATE TYPE ticket_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE ticket_status AS ENUM ('Open', 'Assigned', 'Diagnosed', 'Parts Ordered', 'In Progress', 'On Hold', 'Completed', 'Closed');
CREATE TYPE command_status AS ENUM ('Pending Approval', 'OTP Verified', 'Approved', 'Executed', 'Failed', 'Rejected');

-- 2. USERS & AUTHENTICATION
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'Driver',
    phone VARCHAR(50),
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. FLEET GROUPS
CREATE TABLE fleets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TELEMATICS DEVICES
CREATE TABLE telematics_devices (
    imei VARCHAR(100) PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    firmware_version VARCHAR(50) NOT NULL,
    connectivity_status VARCHAR(50) NOT NULL DEFAULT 'Offline',
    signal_strength INT DEFAULT 0, -- Percentage
    last_ping TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. VEHICLE MASTER
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vin VARCHAR(17) UNIQUE NOT NULL,
    registration_number VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    battery_capacity_kwh DECIMAL(5,2) NOT NULL,
    max_range_km INT NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    fleet_id UUID REFERENCES fleets(id) ON DELETE SET NULL,
    telematics_imei VARCHAR(100) REFERENCES telematics_devices(imei) ON DELETE SET NULL,
    assigned_driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    insurance_expiry DATE,
    status vehicle_status NOT NULL DEFAULT 'Offline',
    current_soc INT DEFAULT 100, -- State of Charge %
    current_soh INT DEFAULT 100, -- State of Health %
    current_speed_kmh DECIMAL(5,2) DEFAULT 0.00,
    current_latitude DECIMAL(9,6),
    current_longitude DECIMAL(9,6),
    current_heading INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. BATTERIES MASTER
CREATE TABLE batteries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    capacity_ah INT NOT NULL,
    voltage_nominal INT NOT NULL,
    cycle_count INT DEFAULT 0,
    soh INT DEFAULT 100,
    soc INT DEFAULT 100,
    temperature_celsius DECIMAL(5,2) DEFAULT 25.00,
    voltage_current DECIMAL(5,2),
    current_amps DECIMAL(5,2),
    status battery_status NOT NULL DEFAULT 'Excellent',
    remaining_useful_life_days INT,
    replacement_prediction_date DATE,
    warranty_expiry DATE,
    cell_balancing_status TEXT, -- JSON mapping cell voltages
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Map Vehicle to Battery (Many-to-Many Swap History or 1-to-1 Active Battery)
CREATE TABLE vehicle_battery (
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    battery_id UUID REFERENCES batteries(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (vehicle_id, battery_id)
);

-- 7. TELEMETRY LOGS (Realtime stream storage)
CREATE TABLE telemetry_logs (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    telematics_imei VARCHAR(100),
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    speed_kmh DECIMAL(5,2) NOT NULL,
    soc INT NOT NULL,
    soh INT NOT NULL,
    voltage DECIMAL(5,2),
    current DECIMAL(5,2),
    battery_temp DECIMAL(5,2),
    motor_temp DECIMAL(5,2),
    controller_temp DECIMAL(5,2),
    odometer_km DECIMAL(10,2),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Partition this table on production for scale
CREATE INDEX idx_telemetry_vehicle_time ON telemetry_logs (vehicle_id, recorded_at DESC);

-- 8. DRIVER PROFILES & ANALYTICS
CREATE TABLE drivers (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    safety_score INT DEFAULT 100 CHECK (safety_score BETWEEN 0 AND 100),
    total_trips INT DEFAULT 0,
    driving_hours DECIMAL(10,2) DEFAULT 0.00,
    route_compliance_rate DECIMAL(5,2) DEFAULT 100.00,
    idle_time_hours DECIMAL(10,2) DEFAULT 0.00,
    energy_efficiency_kwh_km DECIMAL(5,2) DEFAULT 0.00,
    harsh_braking_count INT DEFAULT 0,
    harsh_acceleration_count INT DEFAULT 0,
    overspeeding_count INT DEFAULT 0,
    phone_usage_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE driver_daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    safety_score INT NOT NULL,
    ai_recommendations TEXT[],
    predicted_risk_level VARCHAR(50),
    safety_alerts_count INT DEFAULT 0,
    training_suggestions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TRIPS
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    origin_name VARCHAR(255) NOT NULL,
    destination_name VARCHAR(255) NOT NULL,
    planned_distance_km DECIMAL(6,2) NOT NULL,
    actual_distance_km DECIMAL(6,2),
    planned_route GEOMETRY(LineString, 4326),
    actual_route GEOMETRY(LineString, 4326),
    deviation_percentage DECIMAL(5,2) DEFAULT 0.00,
    soc_start INT NOT NULL,
    soc_end INT,
    energy_consumed_kwh DECIMAL(6,2),
    idle_duration_minutes INT DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'In Progress', -- In Progress, Completed, Cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. GEOFENCES
CREATE TABLE geofences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    zone GEOMETRY(Polygon, 4326) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE geofence_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geofence_id UUID REFERENCES geofences(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- Entry, Exit, Unauthorized
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. TECHNICIANS & SERVICE MANAGEMENT
CREATE TABLE technicians (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    skills TEXT[] NOT NULL,
    certifications TEXT[],
    experience_years INT NOT NULL,
    availability_status VARCHAR(50) NOT NULL DEFAULT 'Available', -- Available, On-Site, Busy, Leave
    current_latitude DECIMAL(9,6),
    current_longitude DECIMAL(9,6),
    workload_score INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    assigned_technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    issue_description TEXT NOT NULL,
    repair_notes TEXT,
    priority ticket_priority NOT NULL DEFAULT 'Medium',
    status ticket_status NOT NULL DEFAULT 'Open',
    warranty_claimable BOOLEAN DEFAULT FALSE,
    customer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_ticket_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES service_tickets(id) ON DELETE CASCADE,
    file_url VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. INVENTORY & PARTS
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Battery, Motor, Controller, Brake, Tyre, Electrical, etc.
    quantity_in_stock INT NOT NULL DEFAULT 0,
    min_threshold INT NOT NULL DEFAULT 10,
    warehouse_location VARCHAR(255),
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    rating DECIMAL(3,2)
);

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE RESTRICT,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- Draft, Submitted, Approved, Shipped, Delivered
    expected_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES inventory(id) ON DELETE RESTRICT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL
);

-- 13. CRM (Customers & Pipeline)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    fleet_size_leased INT DEFAULT 0,
    contract_value DECIMAL(12,2),
    contract_renewal_date DATE,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    estimated_fleet_size INT,
    pipeline_stage VARCHAR(100) NOT NULL DEFAULT 'New Lead', -- Lead, Contacted, Demo, Proposal, Closed Won, Closed Lost
    expected_revenue DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crm_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- Call, Email, Meeting, WhatsApp
    notes TEXT,
    performed_by UUID REFERENCES users(id),
    scheduled_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. ERP & FINANCE
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    subtotal DECIMAL(12,2) NOT NULL,
    gst_amount DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Paid, Pending, Overdue
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL, -- Charging, Maintenance, HR/Payroll, Insurance, Lease, etc.
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    recorded_by UUID REFERENCES users(id),
    expense_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    month VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    base_salary DECIMAL(10,2) NOT NULL,
    allowances DECIMAL(10,2) DEFAULT 0.00,
    deductions DECIMAL(10,2) DEFAULT 0.00,
    net_pay DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Unpaid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hr_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in TIMESTAMP WITH TIME ZONE,
    clock_out TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'Present', -- Present, Absent, On Leave
    PRIMARY KEY (user_id, date)
);

-- 15. REMOTE VEHICLE CONTROL & MULTI-LEVEL APPROVALS
CREATE TABLE remote_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    command VARCHAR(100) NOT NULL, -- Lock, Unlock, Ignition Off, Restart
    initiated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    supervisor_approver_id UUID REFERENCES users(id),
    otp_code VARCHAR(6),
    otp_expiry TIMESTAMP WITH TIME ZONE,
    status command_status NOT NULL DEFAULT 'Pending Approval',
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. CHARGING SESSIONS
CREATE TABLE charging_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    charger_id VARCHAR(100) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    energy_consumed_kwh DECIMAL(6,2),
    cost DECIMAL(10,2),
    charging_type VARCHAR(50) NOT NULL, -- Fast, Slow
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. SYSTEM AUDIT LOGS TABLE
CREATE TABLE system_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. NOTIFICATIONS & ALERTS
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- Battery Degradation, Engine Fail, Thermal Warning, Geofence Violation
    severity VARCHAR(50) NOT NULL, -- Info, Warning, Critical
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active', -- Active, Acknowledged, Resolved
    acknowledged_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. INDEXES FOR PERFORMANCE OPTIMIZATION
CREATE INDEX idx_vehicles_status ON vehicles (status);
CREATE INDEX idx_vehicles_fleet ON vehicles (fleet_id);
CREATE INDEX idx_batteries_status ON batteries (status);
CREATE INDEX idx_trips_vehicle ON trips (vehicle_id);
CREATE INDEX idx_trips_driver ON trips (driver_id);
CREATE INDEX idx_service_tickets_status ON service_tickets (status);
CREATE INDEX idx_service_tickets_tech ON service_tickets (assigned_technician_id);
CREATE INDEX idx_alerts_status_severity ON alerts (status, severity);
CREATE INDEX idx_remote_controls_status ON remote_controls (status);

-- 20. AUDIT LOG TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION audit_log_trigger_fn()
RETURNS TRIGGER AS $$
DECLARE
    old_val JSONB := NULL;
    new_val JSONB := NULL;
    action_type VARCHAR(50);
END;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        old_val := to_jsonb(OLD);
        action_type := 'DELETE';
    ELSIF (TG_OP = 'UPDATE') THEN
        old_val := to_jsonb(OLD);
        new_val := to_jsonb(NEW);
        action_type := 'UPDATE';
    ELSIF (TG_OP = 'INSERT') THEN
        new_val := to_jsonb(NEW);
        action_type := 'INSERT';
    END IF;

    INSERT INTO system_audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (
        COALESCE(
            current_setting('app.current_user_id', true)::uuid, 
            NULL
        ),
        action_type,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_val,
        new_val
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Audit Log Trigger to Vehicles & Remote Control
CREATE TRIGGER audit_vehicles_trigger
AFTER INSERT OR UPDATE OR DELETE ON vehicles
FOR EACH ROW EXECUTE FUNCTION audit_log_trigger_fn();

CREATE TRIGGER audit_remote_controls_trigger
AFTER INSERT OR UPDATE OR DELETE ON remote_controls
FOR EACH ROW EXECUTE FUNCTION audit_log_trigger_fn();
