-- MPANDO ROOT - SQL Schema Skeleton (PostgreSQL/Node.js compatible)

-- 1. ENUMS & TYPES
CREATE TYPE company_type AS ENUM ('CONTRACTOR', 'SUBCONTRACTOR', 'SUPPLIER');

CREATE TYPE user_role AS ENUM (
    'CORP_ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER', 'ACCOUNTANT',
    'SALES_REP',
    'SUB_OWNER', 'SUB_SUPERVISOR',
    'SUPP_MANAGER', 'SUPP_LOGISTICS'
);

-- 3. RECIPES (Reçeteler)
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_unit VARCHAR(50) DEFAULT 'm2',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.1 RECIPE MATERIALS (Reçete Malzeme Bileşenleri)
CREATE TABLE recipe_materials (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    material_id INTEGER REFERENCES materials_catalog(id),
    quantity NUMERIC(15,4) NOT NULL,
    unit VARCHAR(50),
    notes TEXT
);

-- 3.2 RECIPE LABORS (Reçete İşçilik Bileşenleri)
CREATE TABLE recipe_labors (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    labor_id INTEGER REFERENCES labors(id),
    quantity NUMERIC(15,4) NOT NULL,
    unit VARCHAR(50),
    notes TEXT
);

-- 2. LABOR CATEGORIES
CREATE TABLE labor_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- 2.1 LABORS (İşçilik Kartları)
CREATE TABLE labors (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    category_id INTEGER REFERENCES labor_categories(id),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50),
    unit_price NUMERIC(15,2),
    currency VARCHAR(10) DEFAULT 'TRY',
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4.1 RECIPE ASSIGNMENTS (Reçete Atamaları)
CREATE TABLE recipe_assignments (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id),
    layer VARCHAR(100), -- zemin, duvar, tavan vb.
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    floor_id INTEGER REFERENCES floors(id) ON DELETE CASCADE,
    block_id INTEGER REFERENCES blocks(id) ON DELETE CASCADE,
    area_override_m2 NUMERIC(15,2),
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 4.2 RECIPE QUANTITY CALCULATIONS (Reçete Metraj Hesapları)
CREATE TABLE recipe_quantity_calculations (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES recipe_assignments(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id),
    material_id INTEGER REFERENCES materials_catalog(id),
    labor_id INTEGER REFERENCES labors(id),
    net_quantity NUMERIC(15,4),
    waste_pct NUMERIC(5,2),
    gross_quantity NUMERIC(15,4),
    unit VARCHAR(50),
    box_count INTEGER,
    pallet_count INTEGER,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- 2.1 CUSTOMERS
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Added by employee
    full_name VARCHAR(255) NOT NULL,
    identity_number VARCHAR(11),
    phone VARCHAR(255),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(255),
    district VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 2.2 SALES & OPPORTUNITIES
CREATE TYPE lead_source AS ENUM ('Reklam', 'Emlakçı', 'Referans');
CREATE TYPE yes_no_type AS ENUM ('Evet', 'Hayır');
CREATE TYPE approval_status AS ENUM ('Beklemede', 'Onaylandı', 'Reddedildi');
CREATE TYPE sale_status AS ENUM ('Beklemede', 'Rezerve', 'Satıldı', 'İptal');
CREATE TYPE meeting_status AS ENUM ('Yeni', 'Görüşüldü', 'Teklif', 'Opsiyon', 'Satış');

CREATE TABLE sales_leads (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES users(id), -- Sales Representative
    salesperson_name VARCHAR(100),
    project_id INTEGER REFERENCES projects(id),
    project_name VARCHAR(150),
    customer_id INTEGER REFERENCES customers(id),
    customer_full_name VARCHAR(150),
    phone VARCHAR(30),
    email VARCHAR(150),
    source lead_source,
    interested_product TEXT,
    unit_id INTEGER REFERENCES units(id),
    budget_range VARCHAR(100),
    first_meeting_date DATE,
    current_meeting_status meeting_status DEFAULT 'Yeni',
    offered_price DECIMAL(15,2),
    discount_requested yes_no_type DEFAULT 'Hayır',
    discount_amount DECIMAL(15,2),
    approval_status approval_status DEFAULT 'Beklemede',
    sale_status sale_status DEFAULT 'Beklemede',
    sale_date DATE,
    contract_no VARCHAR(100),
    contract_file TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROJECT ARCHITECTURE (DWG Structure)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    contractor_id INTEGER REFERENCES companies(id),
    created_by INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
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
    building_type VARCHAR(100),
    foundation_area_m2 DECIMAL,
    total_facade_m2 DECIMAL,
    elevator_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE floors (
    id SERIAL PRIMARY KEY,
    block_id INTEGER REFERENCES blocks(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL,
    height_cm DECIMAL NOT NULL DEFAULT 300,
    gross_area_m2 DECIMAL,
    common_area_m2 DECIMAL,
    column_count INTEGER,
    beam_count INTEGER,
    slab_area_m2 DECIMAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    floor_id INTEGER REFERENCES floors(id) ON DELETE CASCADE,
    unit_number VARCHAR(50),
    unit_type VARCHAR(100), -- '2+1', '3+1', 'Office' etc.
    facade VARCHAR(100), -- Cephe
    structure_type VARCHAR(100), -- Yapı türü
    sales_status VARCHAR(50) DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'SOLD', 'RESERVED'
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL, -- Satıldıysa kime satıldı
    contract_no VARCHAR(100), -- Sözleşme Numarası
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
    name VARCHAR(100), -- 'Living Room', 'Kitchen'
    room_type VARCHAR(100), -- 'Banyo', 'Mutfak', 'Salon'
    area_m2 DECIMAL,
    perimeter_m DECIMAL,
    wall_area_m2 DECIMAL,
    ceiling_area_m2 DECIMAL,
    door_count INTEGER DEFAULT 0,
    window_count INTEGER DEFAULT 0,
    floor_height_m DECIMAL,
    ai_detected BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 ROOM OPENINGS (Açıklıklar: Kapı & Pencere)
CREATE TABLE room_openings (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    opening_type VARCHAR(50), -- 'door', 'window'
    width_cm DECIMAL(10,2),
    height_cm DECIMAL(10,2),
    count INTEGER DEFAULT 1,
    area_m2 DECIMAL(10,4), -- (width * height * count) / 10000
    material_id INTEGER REFERENCES materials_catalog(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. MATERIAL CATALOG & METRAJ
CREATE TABLE materials_catalog (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'İnce Yapı', 'Kaba Yapı', 'Elektrik', 'Mekanik', 'Mobilya'
    subcategory VARCHAR(100), -- 'Zemin Kaplama', 'Duvar Kaplama' vb.
    unit VARCHAR(20), -- 'm2', 'm3', 'kg', 'mt', 'Adet', 'Set'
    base_price DECIMAL(15,2), -- Baz Fiyat (TL)
    code VARCHAR(100) UNIQUE, -- Malzeme kodu
    width_cm DECIMAL(10,2),
    length_cm DECIMAL(10,2),
    thickness_mm DECIMAL(10,2),
    weight_per_unit DECIMAL(10,4), -- kg/m2 veya kg/adet
    box_content_m2 DECIMAL(10,4), -- 1 kutudaki m2
    box_piece_count INTEGER, -- 1 kutudaki parça adedi
    pallet_box_count INTEGER, -- 1 paletteki kutu adedi
    pallet_content_m2 DECIMAL(10,4), -- 1 paletteki toplam m2
    pallet_gross_kg DECIMAL(10,2), -- Palet brüt ağırlığı
    lead_time_days INTEGER, -- Tedarik süresi (gün)
    waste_rate_pct DECIMAL(5,2) DEFAULT 5, -- Fire oranı (%)
    supplier_id INTEGER REFERENCES companies(id),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room_specs (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    spec_type VARCHAR(100), -- zemin, duvar, tavan, ısı yalıtımı vb.
    material_id INTEGER REFERENCES materials_catalog(id),
    extra_data JSONB, -- Esnek ek veriler (renk kodu, marka, sertifika vb.)
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
    required_quantity NUMERIC(15,4), -- Başlangıçta girilmiş ham miktar (Geriye dönük uyumluluk için)
    status VARCHAR(50) DEFAULT 'OPEN', -- 'OPEN', 'APPROVED', 'ORDERED', 'DELIVERED'
    code VARCHAR(100) UNIQUE, -- Talep numarası (Örn: PR-2026-001)
    calculated_m2 NUMERIC(15,4), -- AI ve reçete sistemi tarafından hesaplanan ham metraj (m²)
    stock_deduction NUMERIC(15,4), -- Depodaki mevcut stoktan düşülen miktar
    net_need NUMERIC(15,4), -- Saf ihtiyaç: calculated_m2 - stock_deduction
    waste_pct NUMERIC(5,2), -- Uygulanan fire yüzdesi
    gross_need NUMERIC(15,4), -- Brüt ihtiyaç: net_need + fire payı
    manual_override NUMERIC(15,4), -- Kullanıcının manuel olarak ayarladığı miktar
    final_quantity NUMERIC(15,4), -- Sipariş edilecek kesin miktar (manual_override varsa o, yoksa gross_need)
    unit VARCHAR(50), -- Miktarın birimi
    box_count INTEGER, -- Siparişe dönüştürülmüş kutu adedi
    pallet_count INTEGER, -- Siparişe dönüştürülmüş palet adedi
    approved_by INTEGER REFERENCES users(id), -- Talebi onaylayan yetkili
    approved_at TIMESTAMP, -- Onay tarihi ve saati
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

CREATE TABLE payment_transactions (
    id SERIAL PRIMARY KEY,
    from_account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    to_account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES users(id),
    amount NUMERIC(15,2) NOT NULL,
    payment_type VARCHAR(50),
    description TEXT,
    reference_id VARCHAR(255),
    metadata JSONB,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
(mühendisler vs görmeyecek, muhasebe görecek)



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
(mühendis, muhasebe görsün eklesin silsin.)

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
);

-- 9. LOGS & ACTIVITIES
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(100), -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
    entity_type VARCHAR(100), -- 'PROJECT', 'SALE', 'INVENTORY', 'USER'
    entity_id INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. SECONDARY SALES (İkinci El Satış / Portföy Yönetimi)
CREATE TABLE secondary_sales (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    employee_id INT NOT NULL REFERENCES users(id),

    -- Mülk Bilgileri
    unit_id INT NULL REFERENCES units(id), 
    property_title VARCHAR(255) NOT NULL, 
    property_address TEXT NULL,
    
    -- Kişi Bilgileri
    seller_id INT NOT NULL REFERENCES customers(id),
    buyer_id INT NULL REFERENCES customers(id),
    
    -- Finansal Bilgiler
    listing_price DECIMAL(15, 2) NOT NULL,
    sold_price DECIMAL(15, 2) NULL,
    seller_commission DECIMAL(15, 2) DEFAULT 0,
    buyer_commission DECIMAL(15, 2) DEFAULT 0,
    
    -- Durum ve Tarihler
    status VARCHAR(50) DEFAULT 'Pasif', -- 'Aktif', 'Rezerve', 'Satıldı', 'İptal'
    sale_date DATE NULL,
    
    -- Belgeler ve Notlar
    contract_file TEXT NULL,
    notes TEXT NULL,
    
    -- Sistem Alanları
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. DWG MANAGEMENT (DWG Dosya Yönetimi)
CREATE TABLE dwg_uploads (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50), -- 'mimari', 'statik', 'tesisat'
    file_url TEXT NOT NULL,
    file_size_kb INTEGER,
    status VARCHAR(50) DEFAULT 'uploaded', -- 'uploaded', 'processing', 'completed', 'error'
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. AI ANALYSIS RESULTS (AI Analiz Sonuçları)
CREATE TABLE ai_analysis_results (
    id SERIAL PRIMARY KEY,
    dwg_upload_id INTEGER REFERENCES dwg_uploads(id) ON DELETE CASCADE,
    ai_model VARCHAR(100), -- Örn: gemini-2.0-flash
    prompt_version VARCHAR(50), -- Prompt versiyon numarası
    raw_response JSONB, -- Gemini API'den gelen ham JSON yanıtı
    parsed_rooms JSONB, -- İşlenmiş oda listesi
    parsed_structural JSONB, -- Statik veriler (kolon, kiriş vb.)
    parsed_mep JSONB, -- Tesisat verileri (boru, kablo vb.)
    confidence_score NUMERIC(5,2), -- AI analiz güven skoru (0-100)
    error_message TEXT, -- Analiz hatası mesajı
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. AI ROOM MAPPING (AI Oda Eşleştirme)
CREATE TABLE ai_room_mapping (
    id SERIAL PRIMARY KEY,
    analysis_result_id INTEGER REFERENCES ai_analysis_results(id) ON DELETE CASCADE,
    ai_room_label VARCHAR(255), -- AI'nın okuduğu oda adı
    ai_floor_area NUMERIC(15,2),
    ai_wall_area NUMERIC(15,2),
    ai_ceiling_area NUMERIC(15,2),
    ai_perimeter_m NUMERIC(15,2),
    ai_door_count INTEGER,
    ai_window_count INTEGER,
    room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL, -- Eşleştirilen rooms kaydı
    is_confirmed BOOLEAN DEFAULT FALSE,
    confirmed_by INTEGER REFERENCES users(id),
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. ANNOUNCEMENTS & LEASING (İlanlar ve Kira Sözleşmeleri)
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY, -- SERIAL use for consistency with other tables, specified as BIGINT in doc
    user_id INTEGER REFERENCES users(id), -- Sisteme girişi yapan kullanıcı
    owner_id INTEGER REFERENCES customers(id) ON DELETE CASCADE, -- Mülk sahibi
    subcontractor_id INTEGER REFERENCES companies(id), -- Varsa alt yüklenici
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL, -- Bağlı proje
    tenant_name TEXT, -- Kiracı adı
    transaction_type TEXT, -- 'Satış' veya 'Kiralama'
    status TEXT DEFAULT 'Aktif', -- 'Aktif', 'Pasif', 'Tamamlandı'
    sale_price NUMERIC(15,2),
    rent_price NUMERIC(15,2),
    deposit_amount NUMERIC(15,2),
    service_fee NUMERIC(15,2),
    is_furnished BOOLEAN DEFAULT FALSE,
    water_meter_no TEXT,
    electricity_meter_no TEXT,
    contract_start_date DATE,
    contract_end_date DATE,
    contract_pdf_url TEXT,
    dask_pdf_url TEXT,
    id_card_pdf_url TEXT,
    deposit_receipt_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
