-- ============================================================
-- SUCURSALES TABLE (Branches per Banca)
-- ============================================================
CREATE TABLE IF NOT EXISTS sucursales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    banca_id UUID NOT NULL REFERENCES bancas(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,                    -- "ORTIZ", "CANDELIER"
    code VARCHAR(50) NOT NULL,                     -- Código interno sucursal
    address VARCHAR(255),
    city VARCHAR(100),
    province VARCHAR(100),
    phone VARCHAR(50),
    operator_prefix VARCHAR(20),                   -- Prefijo para IDs de operadores
    is_active BOOLEAN DEFAULT true,
    ticket_config JSONB DEFAULT '{}',              -- Configuración de ticket personalizada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(banca_id, code)
);

CREATE INDEX idx_sucursales_banca_id ON sucursales(banca_id);
CREATE INDEX idx_sucursales_code ON sucursales(code);
CREATE INDEX idx_sucursales_active ON sucursales(is_active);
CREATE INDEX idx_sucursales_city ON sucursales(city);

COMMENT ON TABLE sucursales IS 'Sucursales/puntos de venta independientes por banca';

-- ============================================================
-- EXTEND PLAYS TABLE FOR INDEPENDENT RECEIPT DATA
-- ============================================================
ALTER TABLE plays ADD COLUMN IF NOT EXISTS sucursal_id UUID REFERENCES sucursales(id);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS sorteo_number VARCHAR(50);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS sorteo_time TIME;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS sorteo_name VARCHAR(100);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS valid_until DATE;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS operator_user_id VARCHAR(50);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS modality VARCHAR(20);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS receipt_printed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_plays_sucursal_id ON plays(sucursal_id);
CREATE INDEX idx_plays_sorteo_number ON plays(sorteo_number);
CREATE INDEX idx_plays_barcode ON plays(barcode);
CREATE INDEX idx_plays_operator ON plays(operator_user_id);
CREATE INDEX idx_plays_valid_until ON plays(valid_until);

COMMENT ON COLUMN plays.sucursal_id IS 'Sucursal donde se emitió el ticket';
COMMENT ON COLUMN plays.sorteo_number IS 'Número de sorteo (ej: #18331)';
COMMENT ON COLUMN plays.sorteo_time IS 'Hora del sorteo (ej: 13:00)';
COMMENT ON COLUMN plays.barcode IS 'Código de barras para escaneo';
COMMENT ON COLUMN plays.valid_until IS 'Fecha límite para cobrar premio';
COMMENT ON COLUMN plays.operator_user_id IS 'ID del operador/vendedor en la sucursal';
COMMENT ON COLUMN plays.modality IS 'Modalidad de juego: QN, PL, MCH, etc.';
