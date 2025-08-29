-- Migration para adicionar campo Auth0Id na tabela AspNetUsers
-- Execute este script no seu banco PostgreSQL

-- Adicionar coluna Auth0Id
ALTER TABLE "AspNetUsers" 
ADD COLUMN "Auth0Id" VARCHAR(255);

-- Criar índice para melhor performance
CREATE INDEX "IX_AspNetUsers_Auth0Id" ON "AspNetUsers" ("Auth0Id");

-- Comentário na coluna
COMMENT ON COLUMN "AspNetUsers"."Auth0Id" IS 'ID único do usuário no Auth0 para sincronização';

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'AspNetUsers' AND column_name = 'Auth0Id';

-- Mostrar estrutura atualizada da tabela
\d "AspNetUsers"
