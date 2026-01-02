-- ============================================================
-- LOTOLINK BANCA CONFIGURATION SYSTEM
-- Migration 002 - Complete Banca Configuration
-- PostgreSQL 14+
-- 
-- Sistema completo de configuración independiente por banca:
-- - Propietarios con múltiples sucursales
-- - Loterías y sorteos configurables
-- - Precios y multiplicadores personalizados
-- - Control de riesgo (bloqueos, límites)
-- - Reportes de ventas y premios
-- ============================================================

-- ============================================================
-- 1. BANCA OWNERS (Propietarios de bancas)
-- ============================================================
CREATE TABLE IF NOT EXISTS banca_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    cedula VARCHAR(20),
    rnc VARCHAR(20),
    business_name VARCHAR(255),
    
    -- Bank account information
    bank_name VARCHAR(100),
    bank_account_type VARCHAR(20), -- 'checking', 'savings'
    bank_account_number VARCHAR(50),
    
    -- Payment processing
    stripe_account_id VARCHAR(100),
    
    -- Business settings
    default_commission_percentage DECIMAL(5, 4) DEFAULT 0.0500, -- 5%
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'suspended', 'inactive'
    
    -- Metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_banca_owners_email ON banca_owners(email);
CREATE INDEX idx_banca_owners_status ON banca_owners(status);
CREATE INDEX idx_banca_owners_cedula ON banca_owners(cedula);
CREATE INDEX idx_banca_owners_rnc ON banca_owners(rnc);

-- ============================================================
-- 2. LOTTERIES (Catálogo maestro de loterías)
-- ============================================================
CREATE TABLE IF NOT EXISTS lotteries (
    id VARCHAR(50) PRIMARY KEY, -- 'leidsa', 'loteka', 'nacional', etc.
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50),
    country VARCHAR(2) NOT NULL DEFAULT 'DO', -- ISO country code
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    
    -- Number range configuration
    number_range_min INTEGER DEFAULT 0,
    number_range_max INTEGER DEFAULT 99,
    
    -- Status and ordering
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lotteries_status ON lotteries(status);
CREATE INDEX idx_lotteries_country ON lotteries(country);
CREATE INDEX idx_lotteries_display_order ON lotteries(display_order);

-- ============================================================
-- 3. LOTTERY DRAWS (Sorteos por lotería)
-- ============================================================
CREATE TABLE IF NOT EXISTS lottery_draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lottery_id VARCHAR(50) NOT NULL REFERENCES lotteries(id),
    
    name VARCHAR(100) NOT NULL, -- 'Primera', 'Mediodía', 'Nocturna', etc.
    code VARCHAR(50) NOT NULL, -- 'primera', 'mediodia', 'nocturna'
    draw_time TIME NOT NULL, -- 12:30, 15:00, 21:00, etc.
    
    -- Days of week (1=Monday, 7=Sunday)
    days_of_week INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}', -- All days by default
    
    -- Close before draw
    close_before_minutes INTEGER DEFAULT 15, -- Close 15 minutes before draw
    
    -- Status and ordering
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(lottery_id, code)
);

CREATE INDEX idx_lottery_draws_lottery_id ON lottery_draws(lottery_id);
CREATE INDEX idx_lottery_draws_status ON lottery_draws(status);
CREATE INDEX idx_lottery_draws_draw_time ON lottery_draws(draw_time);

-- ============================================================
-- 4. BET TYPES (Tipos de apuesta - Catálogo maestro)
-- ============================================================
CREATE TABLE IF NOT EXISTS bet_types (
    id VARCHAR(50) PRIMARY KEY, -- 'quiniela', 'pale', 'tripleta', etc.
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Configuration
    numbers_required INTEGER NOT NULL, -- 2, 3, 4, etc.
    numbers_ordered BOOLEAN DEFAULT FALSE, -- True for ordered combinations
    
    -- Default prize multiplier (can be overridden per banca)
    default_prize_multiplier DECIMAL(10, 2) NOT NULL,
    
    -- Status and ordering
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bet_types_status ON bet_types(status);
CREATE INDEX idx_bet_types_display_order ON bet_types(display_order);

-- ============================================================
-- 5. BANCA LOTTERIES (Loterías habilitadas por banca)
-- ============================================================
CREATE TABLE IF NOT EXISTS banca_lotteries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    banca_id UUID NOT NULL REFERENCES bancas(id),
    lottery_id VARCHAR(50) NOT NULL REFERENCES lotteries(id),
    
    is_enabled BOOLEAN DEFAULT TRUE,
    
    -- Override commission for this lottery
    commission_override DECIMAL(5, 4),
    
    -- Risk limits for this lottery
    daily_limit DECIMAL(15, 2), -- Max sales per day
    per_bet_max DECIMAL(10, 2), -- Max amount per bet
    per_number_limit DECIMAL(10, 2), -- Max exposure per number
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(banca_id, lottery_id)
);

CREATE INDEX idx_banca_lotteries_banca_id ON banca_lotteries(banca_id);
CREATE INDEX idx_banca_lotteries_lottery_id ON banca_lotteries(lottery_id);
CREATE INDEX idx_banca_lotteries_enabled ON banca_lotteries(is_enabled);

-- ============================================================
-- 6. BANCA DRAWS (Sorteos habilitados por banca)
-- ============================================================
CREATE TABLE IF NOT EXISTS banca_draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    banca_id UUID NOT NULL REFERENCES bancas(id),
    lottery_draw_id UUID NOT NULL REFERENCES lottery_draws(id),
    
    is_enabled BOOLEAN DEFAULT TRUE,
    
    -- Override close time for this specific draw
    custom_close_before_minutes INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(banca_id, lottery_draw_id)
);

CREATE INDEX idx_banca_draws_banca_id ON banca_draws(banca_id);
CREATE INDEX idx_banca_draws_draw_id ON banca_draws(lottery_draw_id);
CREATE INDEX idx_banca_draws_enabled ON banca_draws(is_enabled);

-- ============================================================
-- 7. BANCA BET CONFIGURATIONS ⭐ (Precios y premios por banca)
-- ============================================================
CREATE TABLE IF NOT EXISTS banca_bet_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    banca_id UUID NOT NULL REFERENCES bancas(id),
    lottery_id VARCHAR(50) NOT NULL REFERENCES lotteries(id),
    bet_type_id VARCHAR(50) NOT NULL REFERENCES bet_types(id),
    
    -- Bet amount configuration
    min_bet_amount DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
    max_bet_amount DECIMAL(10, 2) NOT NULL DEFAULT 10000.00,
    bet_increment DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
    
    -- Prize configuration
    prize_multiplier DECIMAL(10, 2) NOT NULL, -- How much they win per peso
    max_prize_amount DECIMAL(15, 2), -- Max prize for this bet type
    
    -- Commission
    commission_percentage DECIMAL(5, 4),
    
    -- Status
    is_enabled BOOLEAN DEFAULT TRUE,
    
    -- Validity period (for promotions)
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(banca_id, lottery_id, bet_type_id, valid_from)
);

CREATE INDEX idx_banca_bet_config_banca ON banca_bet_configurations(banca_id);
CREATE INDEX idx_banca_bet_config_lottery ON banca_bet_configurations(lottery_id);
CREATE INDEX idx_banca_bet_config_bet_type ON banca_bet_configurations(bet_type_id);
CREATE INDEX idx_banca_bet_config_enabled ON banca_bet_configurations(is_enabled);
CREATE INDEX idx_banca_bet_config_validity ON banca_bet_configurations(valid_from, valid_until);

-- ============================================================
-- 8. BANCA BLOCKED NUMBERS (Control de riesgo - números bloqueados)
-- ============================================================
CREATE TABLE IF NOT EXISTS banca_blocked_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    banca_id UUID NOT NULL REFERENCES bancas(id),
    
    -- Scope of blocking
    lottery_id VARCHAR(50) REFERENCES lotteries(id), -- NULL = all lotteries
    lottery_draw_id UUID REFERENCES lottery_draws(id), -- NULL = all draws
    bet_type_id VARCHAR(50) REFERENCES bet_types(id), -- NULL = all bet types
    
    -- The blocked number/combination
    blocked_number VARCHAR(20) NOT NULL,
    
    -- Reason and duration
    reason TEXT,
    blocked_until TIMESTAMP WITH TIME ZONE, -- NULL = indefinite
    
    -- Audit
    created_by UUID, -- Admin user who blocked it
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blocked_numbers_banca ON banca_blocked_numbers(banca_id);
CREATE INDEX idx_blocked_numbers_lottery ON banca_blocked_numbers(lottery_id);
CREATE INDEX idx_blocked_numbers_draw ON banca_blocked_numbers(lottery_draw_id);
CREATE INDEX idx_blocked_numbers_number ON banca_blocked_numbers(blocked_number);
CREATE INDEX idx_blocked_numbers_until ON banca_blocked_numbers(blocked_until);

-- ============================================================
-- 9. BANCA NUMBER LIMITS (Límites de venta por número)
-- ============================================================
CREATE TABLE IF NOT EXISTS banca_number_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    banca_id UUID NOT NULL REFERENCES bancas(id),
    lottery_id VARCHAR(50) NOT NULL REFERENCES lotteries(id),
    lottery_draw_id UUID REFERENCES lottery_draws(id), -- NULL = applies to all draws
    bet_type_id VARCHAR(50) NOT NULL REFERENCES bet_types(id),
    
    -- The number combination
    number_combination VARCHAR(20) NOT NULL,
    
    -- Limits
    max_amount DECIMAL(15, 2) NOT NULL, -- Maximum total amount for this number
    current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- Current amount sold
    
    -- Date scope
    draw_date DATE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(banca_id, lottery_draw_id, bet_type_id, number_combination, draw_date)
);

CREATE INDEX idx_number_limits_banca ON banca_number_limits(banca_id);
CREATE INDEX idx_number_limits_lottery ON banca_number_limits(lottery_id);
CREATE INDEX idx_number_limits_draw ON banca_number_limits(lottery_draw_id);
CREATE INDEX idx_number_limits_date ON banca_number_limits(draw_date);
CREATE INDEX idx_number_limits_number ON banca_number_limits(number_combination);

-- ============================================================
-- 10. BANCA DAILY SALES (Resumen de ventas diarias)
-- ============================================================
CREATE TABLE IF NOT EXISTS banca_daily_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    banca_id UUID NOT NULL REFERENCES bancas(id),
    date DATE NOT NULL,
    
    -- Aggregated metrics
    total_bets INTEGER NOT NULL DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_prizes_paid DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_commission DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    net_result DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- total_amount - total_prizes_paid - total_commission
    
    -- Breakdowns (JSONB for flexibility)
    breakdown_by_bet_type JSONB DEFAULT '{}', -- { "quiniela": { "count": 10, "amount": 500 }, ... }
    breakdown_by_lottery JSONB DEFAULT '{}',  -- { "leidsa": { "count": 20, "amount": 1000 }, ... }
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(banca_id, date)
);

CREATE INDEX idx_daily_sales_banca ON banca_daily_sales(banca_id);
CREATE INDEX idx_daily_sales_date ON banca_daily_sales(date);

-- ============================================================
-- 11. PRIZES (Premios ganados)
-- ============================================================
CREATE TABLE IF NOT EXISTS prizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    play_id UUID NOT NULL REFERENCES plays(id),
    banca_id UUID NOT NULL REFERENCES bancas(id),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Lottery details
    lottery_id VARCHAR(50) NOT NULL,
    lottery_draw_id UUID REFERENCES lottery_draws(id),
    draw_date DATE NOT NULL,
    bet_type_id VARCHAR(50) NOT NULL,
    
    -- Winning details
    winning_numbers TEXT[] NOT NULL,
    matched_numbers TEXT[] NOT NULL,
    
    -- Prize calculation
    bet_amount DECIMAL(10, 2) NOT NULL,
    prize_multiplier DECIMAL(10, 2) NOT NULL,
    prize_amount DECIMAL(15, 2) NOT NULL,
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'disputed', 'rejected'
    
    -- Payment tracking
    paid_at TIMESTAMP WITH TIME ZONE,
    paid_by UUID, -- Admin user who paid
    
    -- Verification
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID, -- Admin user who verified
    verification_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prizes_play_id ON prizes(play_id);
CREATE INDEX idx_prizes_banca_id ON prizes(banca_id);
CREATE INDEX idx_prizes_user_id ON prizes(user_id);
CREATE INDEX idx_prizes_lottery ON prizes(lottery_id);
CREATE INDEX idx_prizes_draw_date ON prizes(draw_date);
CREATE INDEX idx_prizes_status ON prizes(status);
CREATE INDEX idx_prizes_created_at ON prizes(created_at);

-- ============================================================
-- 12. MODIFY EXISTING TABLES
-- ============================================================

-- Add owner_id and branch information to bancas table
ALTER TABLE bancas ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES banca_owners(id);
ALTER TABLE bancas ADD COLUMN IF NOT EXISTS branch_code VARCHAR(20);
ALTER TABLE bancas ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE bancas ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE bancas ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE bancas ADD COLUMN IF NOT EXISTS region VARCHAR(100);
ALTER TABLE bancas ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'DO';
ALTER TABLE bancas ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Santo_Domingo';
ALTER TABLE bancas ADD COLUMN IF NOT EXISTS operating_hours JSONB;
ALTER TABLE bancas ADD COLUMN IF NOT EXISTS is_main_branch BOOLEAN DEFAULT FALSE;
ALTER TABLE bancas ADD COLUMN IF NOT EXISTS accepts_cash BOOLEAN DEFAULT TRUE;
ALTER TABLE bancas ADD COLUMN IF NOT EXISTS accepts_card BOOLEAN DEFAULT TRUE;
ALTER TABLE bancas ADD COLUMN IF NOT EXISTS accepts_transfer BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_bancas_owner_id ON bancas(owner_id);
CREATE INDEX IF NOT EXISTS idx_bancas_city ON bancas(city);
CREATE INDEX IF NOT EXISTS idx_bancas_country ON bancas(country);

-- Add lottery draw and prize information to plays table
ALTER TABLE plays ADD COLUMN IF NOT EXISTS lottery_draw_id UUID REFERENCES lottery_draws(id);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS bet_type_id VARCHAR(50);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS draw_date DATE;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS prize_multiplier DECIMAL(10, 2);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS potential_prize DECIMAL(15, 2);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS actual_prize DECIMAL(15, 2);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_plays_lottery_draw ON plays(lottery_draw_id);
CREATE INDEX IF NOT EXISTS idx_plays_bet_type ON plays(bet_type_id);
CREATE INDEX IF NOT EXISTS idx_plays_draw_date ON plays(draw_date);
CREATE INDEX IF NOT EXISTS idx_plays_is_winner ON plays(is_winner);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

CREATE TRIGGER update_banca_owners_updated_at
    BEFORE UPDATE ON banca_owners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lotteries_updated_at
    BEFORE UPDATE ON lotteries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lottery_draws_updated_at
    BEFORE UPDATE ON lottery_draws
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bet_types_updated_at
    BEFORE UPDATE ON bet_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banca_lotteries_updated_at
    BEFORE UPDATE ON banca_lotteries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banca_draws_updated_at
    BEFORE UPDATE ON banca_draws
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banca_bet_configurations_updated_at
    BEFORE UPDATE ON banca_bet_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banca_number_limits_updated_at
    BEFORE UPDATE ON banca_number_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banca_daily_sales_updated_at
    BEFORE UPDATE ON banca_daily_sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prizes_updated_at
    BEFORE UPDATE ON prizes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INITIAL DATA - LOTTERIES (Dominican Republic)
-- ============================================================

INSERT INTO lotteries (id, name, short_name, country, number_range_min, number_range_max, status, display_order) VALUES
('leidsa', 'Lotería Electrónica Internacional Dominicana (Leidsa)', 'Leidsa', 'DO', 0, 99, 'active', 1),
('loteka', 'Lotería Electrónica Nacional (Loteka)', 'Loteka', 'DO', 0, 99, 'active', 2),
('nacional', 'Lotería Nacional', 'Nacional', 'DO', 0, 99, 'active', 3),
('real', 'Lotería Real', 'Real', 'DO', 0, 99, 'active', 4),
('lotedom', 'LoteDom', 'LoteDom', 'DO', 0, 99, 'active', 5),
('anguila', 'Lotería Anguila', 'Anguila', 'DO', 0, 99, 'active', 6),
('king', 'King Lottery', 'King', 'DO', 0, 99, 'active', 7),
('new_york', 'Lotería de Nueva York', 'NY', 'US', 0, 99, 'active', 8),
('florida', 'Lotería de Florida', 'Florida', 'US', 0, 99, 'active', 9)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- INITIAL DATA - BET TYPES
-- ============================================================

INSERT INTO bet_types (id, name, description, numbers_required, numbers_ordered, default_prize_multiplier, status, display_order) VALUES
('quiniela', 'Quiniela', 'Dos números en cualquier orden', 2, false, 70.00, 'active', 1),
('pale', 'Palé', 'Dos números en orden exacto', 2, true, 800.00, 'active', 2),
('tripleta', 'Tripleta', 'Tres números en cualquier orden', 3, false, 5000.00, 'active', 3),
('super_pale', 'Super Palé', 'Dos números especiales con premio aumentado', 2, true, 1000.00, 'active', 4),
('pega3', 'Pega 3', 'Tres números en orden exacto', 3, true, 6000.00, 'active', 5),
('toca3', 'Toca 3', 'Tres números con dos en orden', 3, false, 4500.00, 'active', 6),
('pick4', 'Pick 4', 'Cuatro números en orden exacto', 4, true, 40000.00, 'active', 7)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- INITIAL DATA - LOTTERY DRAWS (Common Dominican schedules)
-- ============================================================

-- Leidsa draws
INSERT INTO lottery_draws (lottery_id, name, code, draw_time, days_of_week, close_before_minutes, status, display_order) VALUES
('leidsa', 'Primera', 'primera', '12:30:00', '{1,2,3,4,5,6,7}', 15, 'active', 1),
('leidsa', 'Mediodía', 'mediodia', '15:00:00', '{1,2,3,4,5,6,7}', 15, 'active', 2),
('leidsa', 'Tarde', 'tarde', '18:00:00', '{1,2,3,4,5,6,7}', 15, 'active', 3),
('leidsa', 'Nocturna', 'nocturna', '21:00:00', '{1,2,3,4,5,6,7}', 15, 'active', 4)
ON CONFLICT (lottery_id, code) DO NOTHING;

-- Loteka draws
INSERT INTO lottery_draws (lottery_id, name, code, draw_time, days_of_week, close_before_minutes, status, display_order) VALUES
('loteka', 'Primera', 'primera', '12:55:00', '{1,2,3,4,5,6,7}', 15, 'active', 1),
('loteka', 'Mediodía', 'mediodia', '15:55:00', '{1,2,3,4,5,6,7}', 15, 'active', 2),
('loteka', 'Tarde', 'tarde', '18:55:00', '{1,2,3,4,5,6,7}', 15, 'active', 3),
('loteka', 'Nocturna', 'nocturna', '21:55:00', '{1,2,3,4,5,6,7}', 15, 'active', 4)
ON CONFLICT (lottery_id, code) DO NOTHING;

-- Nacional draws
INSERT INTO lottery_draws (lottery_id, name, code, draw_time, days_of_week, close_before_minutes, status, display_order) VALUES
('nacional', 'Primera', 'primera', '12:45:00', '{1,2,3,4,5,6}', 15, 'active', 1),
('nacional', 'Tarde', 'tarde', '18:45:00', '{1,2,3,4,5,6}', 15, 'active', 2),
('nacional', 'Nocturna', 'nocturna', '21:45:00', '{1,2,3,4,5,6,7}', 15, 'active', 3)
ON CONFLICT (lottery_id, code) DO NOTHING;

-- Real draws
INSERT INTO lottery_draws (lottery_id, name, code, draw_time, days_of_week, close_before_minutes, status, display_order) VALUES
('real', 'Mediodía', 'mediodia', '14:30:00', '{1,2,3,4,5,6,7}', 15, 'active', 1),
('real', 'Tarde', 'tarde', '18:30:00', '{1,2,3,4,5,6,7}', 15, 'active', 2),
('real', 'Nocturna', 'nocturna', '21:30:00', '{1,2,3,4,5,6,7}', 15, 'active', 3)
ON CONFLICT (lottery_id, code) DO NOTHING;

-- LoteDom draws
INSERT INTO lottery_draws (lottery_id, name, code, draw_time, days_of_week, close_before_minutes, status, display_order) VALUES
('lotedom', 'Mediodía', 'mediodia', '13:00:00', '{1,2,3,4,5,6,7}', 15, 'active', 1),
('lotedom', 'Nocturna', 'nocturna', '20:00:00', '{1,2,3,4,5,6,7}', 15, 'active', 2)
ON CONFLICT (lottery_id, code) DO NOTHING;

-- Anguila draws
INSERT INTO lottery_draws (lottery_id, name, code, draw_time, days_of_week, close_before_minutes, status, display_order) VALUES
('anguila', 'Primera', 'primera', '12:00:00', '{1,2,3,4,5,6,7}', 15, 'active', 1),
('anguila', 'Tarde', 'tarde', '18:00:00', '{1,2,3,4,5,6,7}', 15, 'active', 2)
ON CONFLICT (lottery_id, code) DO NOTHING;

-- King draws
INSERT INTO lottery_draws (lottery_id, name, code, draw_time, days_of_week, close_before_minutes, status, display_order) VALUES
('king', 'Mediodía', 'mediodia', '14:00:00', '{1,2,3,4,5,6,7}', 15, 'active', 1),
('king', 'Nocturna', 'nocturna', '20:30:00', '{1,2,3,4,5,6,7}', 15, 'active', 2)
ON CONFLICT (lottery_id, code) DO NOTHING;

-- New York draws
INSERT INTO lottery_draws (lottery_id, name, code, draw_time, days_of_week, close_before_minutes, status, display_order) VALUES
('new_york', 'Mediodía', 'mediodia', '14:30:00', '{1,2,3,4,5,6,7}', 15, 'active', 1),
('new_york', 'Tarde', 'tarde', '19:30:00', '{1,2,3,4,5,6,7}', 15, 'active', 2),
('new_york', 'Nocturna', 'nocturna', '22:30:00', '{1,2,3,4,5,6,7}', 15, 'active', 3)
ON CONFLICT (lottery_id, code) DO NOTHING;

-- Florida draws
INSERT INTO lottery_draws (lottery_id, name, code, draw_time, days_of_week, close_before_minutes, status, display_order) VALUES
('florida', 'Mediodía', 'mediodia', '13:45:00', '{1,2,3,4,5,6,7}', 15, 'active', 1),
('florida', 'Tarde', 'tarde', '18:15:00', '{1,2,3,4,5,6,7}', 15, 'active', 2),
('florida', 'Nocturna', 'nocturna', '23:00:00', '{1,2,3,4,5,6,7}', 15, 'active', 3)
ON CONFLICT (lottery_id, code) DO NOTHING;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE banca_owners IS 'Propietarios de bancas que pueden tener múltiples sucursales';
COMMENT ON TABLE lotteries IS 'Catálogo maestro de todas las loterías disponibles en el sistema';
COMMENT ON TABLE lottery_draws IS 'Sorteos específicos de cada lotería con horarios';
COMMENT ON TABLE bet_types IS 'Tipos de apuestas disponibles (quiniela, pale, tripleta, etc.)';
COMMENT ON TABLE banca_lotteries IS 'Loterías habilitadas para cada banca';
COMMENT ON TABLE banca_draws IS 'Sorteos específicos habilitados para cada banca';
COMMENT ON TABLE banca_bet_configurations IS 'Configuración de precios y premios por banca, lotería y tipo de apuesta';
COMMENT ON TABLE banca_blocked_numbers IS 'Números bloqueados por control de riesgo';
COMMENT ON TABLE banca_number_limits IS 'Límites de venta por número para control de exposición';
COMMENT ON TABLE banca_daily_sales IS 'Resumen diario de ventas por banca';
COMMENT ON TABLE prizes IS 'Registro de premios ganados por los usuarios';
