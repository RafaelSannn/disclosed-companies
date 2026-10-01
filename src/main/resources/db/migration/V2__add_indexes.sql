-- ==========================================
-- MIGRAÇÃO: Adicionar índices para otimização
-- ==========================================
-- Melhora a performance de consultas frequentes:
-- - Busca de empresas por categoria
-- - Busca de publicações por tipo de autor
-- - Ordenação de publicações por data
-- - Login por email (já tem índice único)
-- - Busca de empresa por CNPJ (já tem índice único)

-- Índice para filtrar empresas por tipo e categoria
-- Usado em: GET /php/usuarios/empresas, filtro por categoria
CREATE INDEX IF NOT EXISTS idx_usuario_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_usuario_tipo_categoria ON usuarios(tipo, categoria);

-- Índice para filtrar publicações por tipo de autor
-- Usado em: GET /api/publicacoes/tipo/{tipo}
CREATE INDEX IF NOT EXISTS idx_publicacao_tipo_autor ON publicacoes(tipo_autor);

-- Índice para filtrar publicações por usuário
-- Usado em: GET /api/publicacoes/usuario/{id}
CREATE INDEX IF NOT EXISTS idx_publicacao_usuario_id ON publicacoes(usuario_id);

-- Índice para ordenar publicações por data (mais recentes primeiro)
-- Melhora performance em listagens ordenadas
CREATE INDEX IF NOT EXISTS idx_publicacao_data_criacao ON publicacoes(data_criacao DESC);

-- Índice composto para chat: buscar mensagens entre dois usuários
-- Usado em: GET /api/mensagens (remetente <-> destinatario)
CREATE INDEX IF NOT EXISTS idx_mensagem_usuarios ON mensagens(remetente_id, destinatario_id);
CREATE INDEX IF NOT EXISTS idx_mensagem_data ON mensagens(data_envio DESC);
