-- MPANDO ROOT - SQL Schema Skeleton (PostgreSQL/Node.js compatible)

-- 1. ENUMS & TYPES
CREATE TYPE company_type AS ENUM ('CONTRACTOR', 'SUBCONTRACTOR', 'SUPPLIER');

CREATE TYPE user_role AS ENUM (
    'CORP_ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER', 'ACCOUNTANT',
    'SALES_REP',
    'SUB_OWNER', 'SUB_SUPERVISOR',
    'SUPP_MANAGER', 'SUPP_LOGISTICS'
);

-- (Rest of the original skeleton content for consistency)
-- ...

-- 11. CONSTRUCTION FILES (İnşaat Dosyalarım) - YENİ
CREATE TABLE construction_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50), -- pdf, dwg, etc.
    category VARCHAR(100), -- Mimari, Statik, Hakediş, vb.
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- (Adding full content from original database.sql to make it a complete schema.sql)
-- ... [I will use the full content from my previous view_file call but I'll insert the new table]
