-- ==================== TABELAS DO SISTEMA DE LEITURAS OCR ====================
-- Execute este SQL no Supabase SQL Editor

-- ==================== TIPOS DE MÁQUINA ====================
CREATE TABLE IF NOT EXISTS tipos_maquina (
    codigo INTEGER PRIMARY KEY,
    descricao TEXT NOT NULL,
    campo_entrada TEXT NOT NULL DEFAULT 'ENTRADA',
    campo_saida TEXT NOT NULL DEFAULT 'SAIDA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== MÁQUINAS ====================
CREATE TABLE IF NOT EXISTS maquinas (
    codigo INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    tipo_id INTEGER NOT NULL REFERENCES tipos_maquina(codigo),
    entrada DOUBLE PRECISION NOT NULL DEFAULT 0,
    saida DOUBLE PRECISION NOT NULL DEFAULT 0,
    moeda TEXT NOT NULL DEFAULT 'R$',
    ativo BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== LOCAIS ====================
CREATE TABLE IF NOT EXISTS locais (
    codigo INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    adicional TEXT,
    percentual DOUBLE PRECISION NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== USUÁRIOS ====================
CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    nivel TEXT NOT NULL DEFAULT 'OPERADOR',
    nome_completo TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== LEITURAS ====================
CREATE TABLE IF NOT EXISTS leituras (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id TEXT NOT NULL REFERENCES usuarios(id),
    maquina_id INTEGER NOT NULL REFERENCES maquinas(codigo),
    local_id INTEGER REFERENCES locais(codigo),
    entrada DOUBLE PRECISION NOT NULL DEFAULT 0,
    saida DOUBLE PRECISION NOT NULL DEFAULT 0,
    imagem TEXT,
    tempo_processamento DOUBLE PRECISION,
    observacao TEXT,
    data_leitura TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== CONFIGURAÇÕES ====================
CREATE TABLE IF NOT EXISTS configuracoes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    chave TEXT NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ÍNDICES ====================
CREATE INDEX IF NOT EXISTS idx_leituras_usuario ON leituras(usuario_id);
CREATE INDEX IF NOT EXISTS idx_leituras_maquina ON leituras(maquina_id);
CREATE INDEX IF NOT EXISTS idx_leituras_local ON leituras(local_id);
CREATE INDEX IF NOT EXISTS idx_leituras_data ON leituras(data_leitura);
CREATE INDEX IF NOT EXISTS idx_maquinas_tipo ON maquinas(tipo_id);

-- ==================== DADOS INICIAIS ====================

-- Tipo de máquina padrão
INSERT INTO tipos_maquina (codigo, descricao, campo_entrada, campo_saida) 
VALUES (1, 'CAÇA NÍQUEL', 'ENTRADA', 'SAIDA') 
ON CONFLICT (codigo) DO NOTHING;

-- Local padrão
INSERT INTO locais (codigo, nome, adicional, percentual) 
VALUES (1, 'LOCAL PRINCIPAL', 'MATRIZ', 0) 
ON CONFLICT (codigo) DO NOTHING;

-- Usuário admin (senha: admin123)
INSERT INTO usuarios (id, nome, senha, nivel, nome_completo, ativo) 
VALUES (
    'admin-00000000-0000-0000-0000-000000000001',
    'admin',
    '$2b$10$WXJTJHL/zpXr5.XFH7f9POgs1345yXuX/CLNp8KRNqL4wbMDsZRSm',
    'ADMINISTRADOR',
    'Administrador',
    true
) ON CONFLICT (nome) DO NOTHING;

-- ==================== FIM ====================
SELECT 'Tabelas criadas com sucesso!' AS resultado;
