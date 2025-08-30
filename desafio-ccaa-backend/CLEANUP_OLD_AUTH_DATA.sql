-- =====================================================
-- SCRIPT DE LIMPEZA - DADOS ANTIGOS DO SISTEMA DE LOGIN
-- =====================================================
-- 
-- Este script remove todos os dados antigos relacionados ao sistema
-- de login anterior (Auth0) e limpa as tabelas para um novo início
-- 
-- ⚠️  ATENÇÃO: Este script DELETA TODOS os dados existentes!
-- ⚠️  Execute apenas em ambiente de desenvolvimento ou quando
-- ⚠️  tiver certeza de que não precisa dos dados antigos!
--
-- =====================================================

-- 1. VERIFICAR DADOS EXISTENTES ANTES DA LIMPEZA
-- =====================================================
SELECT '=== VERIFICAÇÃO INICIAL ===' as info;

-- Verificar usuários existentes
SELECT 
    'Usuários existentes' as tabela,
    COUNT(*) as total
FROM "AspNetUsers";

-- Verificar livros existentes
SELECT 
    'Livros existentes' as tabela,
    COUNT(*) as total
FROM "Books";

-- Verificar claims existentes
SELECT 
    'Claims existentes' as tabela,
    COUNT(*) as total
FROM "AspNetUserClaims";

-- Verificar logins externos (se existirem)
SELECT 
    'Logins externos' as tabela,
    COUNT(*) as total
FROM "AspNetUserLogins";

-- Verificar tokens existentes
SELECT 
    'Tokens existentes' as tabela,
    COUNT(*) as total
FROM "AspNetUserTokens";

-- Verificar roles existentes
SELECT 
    'Roles existentes' as tabela,
    COUNT(*) as total
FROM "AspNetRoles";

-- Verificar user roles
SELECT 
    'User roles' as tabela,
    COUNT(*) as total
FROM "AspNetUserRoles";

-- =====================================================
-- 2. LIMPEZA COMPLETA DAS TABELAS
-- =====================================================

-- Desabilitar verificação de chaves estrangeiras temporariamente
SET session_replication_role = replica;

-- Limpar tabelas na ordem correta (filhas primeiro, depois pais)

-- 2.1. Limpar tabelas de relacionamento primeiro
DELETE FROM "AspNetUserRoles";
DELETE FROM "AspNetUserClaims";
DELETE FROM "AspNetUserLogins";
DELETE FROM "AspNetUserTokens";

-- 2.2. Limpar livros (dependem de usuários)
DELETE FROM "Books";

-- 2.3. Limpar usuários
DELETE FROM "AspNetUsers";

-- 2.4. Limpar roles (se existirem)
DELETE FROM "AspNetRoles";

-- 2.5. Resetar sequências/auto-increment (se aplicável)
-- Para PostgreSQL, resetar as sequências das tabelas Identity
DO $$
DECLARE
    seq_name text;
BEGIN
    -- Resetar sequência de AspNetUsers
    SELECT pg_get_serial_sequence('"AspNetUsers"', 'Id') INTO seq_name;
    IF seq_name IS NOT NULL THEN
        EXECUTE 'ALTER SEQUENCE ' || seq_name || ' RESTART WITH 1';
    END IF;
    
    -- Resetar sequência de Books
    SELECT pg_get_serial_sequence('"Books"', 'Id') INTO seq_name;
    IF seq_name IS NOT NULL THEN
        EXECUTE 'ALTER SEQUENCE ' || seq_name || ' RESTART WITH 1';
    END IF;
    
    -- Resetar sequência de AspNetRoles
    SELECT pg_get_serial_sequence('"AspNetRoles"', 'Id') INTO seq_name;
    IF seq_name IS NOT NULL THEN
        EXECUTE 'ALTER SEQUENCE ' || seq_name || ' RESTART WITH 1';
    END IF;
END $$;

-- Reabilitar verificação de chaves estrangeiras
SET session_replication_role = DEFAULT;

-- =====================================================
-- 3. VERIFICAÇÃO FINAL APÓS LIMPEZA
-- =====================================================
SELECT '=== VERIFICAÇÃO FINAL ===' as info;

-- Verificar se as tabelas estão vazias
SELECT 
    'Usuários após limpeza' as tabela,
    COUNT(*) as total
FROM "AspNetUsers";

SELECT 
    'Livros após limpeza' as tabela,
    COUNT(*) as total
FROM "Books";

SELECT 
    'Claims após limpeza' as tabela,
    COUNT(*) as total
FROM "AspNetUserClaims";

SELECT 
    'Logins externos após limpeza' as tabela,
    COUNT(*) as total
FROM "AspNetUserLogins";

SELECT 
    'Tokens após limpeza' as tabela,
    COUNT(*) as total
FROM "AspNetUserTokens";

SELECT 
    'Roles após limpeza' as tabela,
    COUNT(*) as total
FROM "AspNetRoles";

SELECT 
    'User roles após limpeza' as tabela,
    COUNT(*) as total
FROM "AspNetUserRoles";

-- =====================================================
-- 4. CRIAR USUÁRIO ADMIN PADRÃO (OPCIONAL)
-- =====================================================
-- Descomente as linhas abaixo se quiser criar um usuário admin padrão

/*
-- Criar usuário admin padrão
INSERT INTO "AspNetUsers" (
    "Id",
    "UserName",
    "NormalizedUserName",
    "Email",
    "NormalizedEmail",
    "EmailConfirmed",
    "PasswordHash",
    "SecurityStamp",
    "ConcurrencyStamp",
    "PhoneNumber",
    "PhoneNumberConfirmed",
    "TwoFactorEnabled",
    "LockoutEnd",
    "LockoutEnabled",
    "AccessFailedCount",
    "FirstName",
    "LastName",
    "DateOfBirth",
    "CreatedAt",
    "UpdatedAt",
    "IsActive"
) VALUES (
    gen_random_uuid(),
    'admin@desafioccaa.com',
    'ADMIN@DESAFIOCCAA.COM',
    'admin@desafioccaa.com',
    'ADMIN@DESAFIOCCAA.COM',
    true,
    'AQAAAAIAAYagAAAAELbXpFJgSbeN9D6sqx2ECEC9xftKVdtJL6u83/DkPx69ypQSKjGKYGjFeRBlOQ==', -- Senha: Admin123!
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    gen_random_uuid(),
    null,
    false,
    false,
    null,
    true,
    0,
    'Administrador',
    'Sistema',
    '1990-01-01',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    true
);
*/

-- =====================================================
-- 5. MENSAGEM FINAL
-- =====================================================
SELECT '=== LIMPEZA CONCLUÍDA ===' as info;
SELECT 'Sistema limpo e pronto para novos usuários!' as mensagem;
SELECT 'Execute as migrações do Entity Framework para recriar a estrutura!' as proximo_passo;
