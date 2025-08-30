-- =====================================================
-- LIMPEZA RÁPIDA - DADOS ANTIGOS DO SISTEMA
-- =====================================================
-- 
-- Script simples para limpar rapidamente todos os dados
-- ⚠️  ATENÇÃO: DELETA TODOS os dados existentes!
-- ⚠️  Execute apenas quando tiver certeza!
--
-- =====================================================

-- Verificar dados antes
SELECT 'Dados antes da limpeza:' as info;
SELECT 'Usuários:', COUNT(*) FROM "AspNetUsers";
SELECT 'Livros:', COUNT(*) FROM "Books";

-- Limpeza rápida
DELETE FROM "AspNetUserRoles";
DELETE FROM "AspNetUserClaims";
DELETE FROM "AspNetUserLogins";
DELETE FROM "AspNetUserTokens";
DELETE FROM "Books";
DELETE FROM "AspNetUsers";
DELETE FROM "AspNetRoles";

-- Verificar dados depois
SELECT 'Dados após limpeza:' as info;
SELECT 'Usuários:', COUNT(*) FROM "AspNetUsers";
SELECT 'Livros:', COUNT(*) FROM "Books";

SELECT 'Limpeza concluída!' as resultado;
