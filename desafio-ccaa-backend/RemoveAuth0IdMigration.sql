-- Migration para remover campo Auth0Id da tabela AspNetUsers
-- Execute este script no seu banco PostgreSQL

-- Remover índice se existir
DROP INDEX IF EXISTS "IX_AspNetUsers_Auth0Id";

-- Remover coluna Auth0Id
ALTER TABLE "AspNetUsers" 
DROP COLUMN IF EXISTS "Auth0Id";

-- Verificar se a coluna foi removida
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'AspNetUsers' AND column_name = 'Auth0Id';

-- Mostrar estrutura atualizada da tabela
\d "AspNetUsers"
