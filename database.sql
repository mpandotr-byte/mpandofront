-- MPANDO ROOT - SQL Schema Skeleton (PostgreSQL/Node.js compatible)

-- 1. ENUMS & TYPES
CREATE TYPE company_type AS ENUM ('CONTRACTOR', 'SUBCONTRACTOR', 'SUPPLIER');

CREATE TYPE user_role AS ENUM (
    'CORP_ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER', 'ACCOUNTANT',
    'SUB_OWNER', 'SUB_SUPERVISOR',
    'SUPP_MANAGER', 'SUPP_LOGISTICS'
);

-- 2. USER & COMPANY MANAGEMENT
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type company_type NOT NULL,
    tax_number VARCHAR(100),
    address TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROJECT ARCHITECTURE (DWG Structure)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    contractor_id INTEGER REFERENCES companies(id),
    created_by INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    location_lat DECIMAL,
    location_lng DECIMAL,
    address TEXT,
    dwg_file_url TEXT,
    status VARCHAR(50) DEFAULT 'PLANNING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    floor_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE floors (
    id SERIAL PRIMARY KEY,
    block_id INTEGER REFERENCES blocks(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL,
    height_cm DECIMAL NOT NULL DEFAULT 300,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    floor_id INTEGER REFERENCES floors(id) ON DELETE CASCADE,
    unit_number VARCHAR(50),
    unit_type VARCHAR(100), -- '2+1', '3+1', 'Office' etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
    name VARCHAR(100), -- 'Living Room', 'Kitchen'
    area_m2 DECIMAL,
    perimeter_m DECIMAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. MATERIAL CATALOG & METRAJ
CREATE TABLE materials_catalog (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'FLOOR', 'WALL', 'CEILING', 'PRODUCT'
    unit VARCHAR(20), -- 'm2', 'm3', 'pcs', 'mt'
    base_price DECIMAL(15,2)
);

CREATE TABLE room_specs (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    spec_type VARCHAR(50), -- 'FLOOR', 'WALL', 'CEILING'
    material_id INTEGER REFERENCES materials_catalog(id),
    extra_data JSONB, -- For custom specs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE metraj_results (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    block_id INTEGER,
    unit_id INTEGER,
    room_id INTEGER,
    material_id INTEGER REFERENCES materials_catalog(id),
    total_quantity DECIMAL(18,4),
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. INVENTORY & PROCUREMENT
CREATE TABLE stocks (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    material_id INTEGER REFERENCES materials_catalog(id),
    quantity DECIMAL(18,4) NOT NULL DEFAULT 0,
    warehouse_name VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_requests (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    material_id INTEGER REFERENCES materials_catalog(id),
    requested_by INTEGER REFERENCES users(id),
    required_quantity DECIMAL(18,4),
    status VARCHAR(50) DEFAULT 'OPEN', -- 'OPEN', 'OFFERING', 'COMPLETED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE material_offers (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES purchase_requests(id),
    supplier_id INTEGER REFERENCES companies(id),
    submitted_by INTEGER REFERENCES users(id),
    price_per_unit DECIMAL(15,2),
    total_price DECIMAL(15,2),
    delivery_days INTEGER,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REJECTED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. SUBCONTRACTOR & TENDERS
CREATE TABLE job_tenders (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    created_by INTEGER REFERENCES users(id),
    job_type VARCHAR(255), -- 'ALCI_SIVA', 'BOYA', 'ELEKTRIK'
    description TEXT,
    deadline TIMESTAMP,
    status VARCHAR(50) DEFAULT 'OPEN'
);

CREATE TABLE subcontractor_bids (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES job_tenders(id),
    subcontractor_id INTEGER REFERENCES companies(id),
    submitted_by INTEGER REFERENCES users(id),
    price DECIMAL(15,2),
    duration_days INTEGER,
    terms TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ACCOUNTING & TRANSACTIONS
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name VARCHAR(255), -- 'Main Wallet', 'Petty Cash'
    balance DECIMAL(18,2) DEFAULT 0
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    from_account_id INTEGER REFERENCES accounts(id),
    to_account_id INTEGER REFERENCES accounts(id),
    created_by INTEGER REFERENCES users(id),
    amount DECIMAL(18,2) NOT NULL,
    payment_type VARCHAR(50), -- 'CASH', 'CHECK', 'BARTER', 'WIRE'
    description TEXT,
    reference_id VARCHAR(255), -- Invoice id or WhatsApp Receipt ID
    metadata JSONB, -- For receipt OCR data (WhatsApp reading)
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. PERSONNEL & PUANTAJ
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    subcontractor_id INTEGER REFERENCES companies(id), -- If working for a sub
    full_name VARCHAR(255),
    role VARCHAR(100),
    daily_rate DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    project_id INTEGER REFERENCES projects(id),
    date DATE NOT NULL,
    status VARCHAR(20), -- 'PRESENT', 'ABSENT', 'LATE', 'PERMIT'
    reported_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. AI & PLANNING
CREATE TABLE ai_project_schedules (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    task_name VARCHAR(255),
    planned_start DATE,
    planned_end DATE,
    risk_level INTEGER, -- 1-10
    risk_notes TEXT,
    last_optimized TIMESTAMP DEFAULT CURRENT_TIMESTAMP