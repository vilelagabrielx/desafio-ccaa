-- Script para limpar livros inativos (soft deleted) do banco de dados
-- Execute este script para preparar o banco para hard delete
-- ATENÇÃO: Esta operação é IRREVERSÍVEL!

-- 1. Verificar quantos livros inativos existem
SELECT 
    COUNT(*) as TotalInactiveBooks,
    COUNT(CASE WHEN PhotoBytes IS NOT NULL THEN 1 END) as BooksWithPhotos,
    COUNT(CASE WHEN PhotoBytes IS NULL THEN 1 END) as BooksWithoutPhotos
FROM Books 
WHERE IsActive = 0;

-- 2. Listar livros inativos antes da remoção
SELECT 
    Id,
    Title,
    ISBN,
    Author,
    CreatedAt,
    UpdatedAt,
    CASE WHEN PhotoBytes IS NOT NULL THEN 'Sim' ELSE 'Não' END as HasPhoto
FROM Books 
WHERE IsActive = 0
ORDER BY CreatedAt DESC;

-- 3. REMOVER PERMANENTEMENTE os livros inativos (EXECUTE APENAS SE TIVER CERTEZA)
DELETE FROM Books WHERE IsActive = 0;

-- 4. Verificar se a limpeza foi bem-sucedida
SELECT COUNT(*) as RemainingInactiveBooks FROM Books WHERE IsActive = 0;

-- 5. Verificar se há ISBNs duplicados após a limpeza
SELECT 
    ISBN,
    COUNT(*) as Count
FROM Books 
GROUP BY ISBN 
HAVING COUNT(*) > 1
ORDER BY Count DESC;

-- 6. Verificar total de livros ativos
SELECT COUNT(*) as TotalActiveBooks FROM Books WHERE IsActive = 1;

-- 7. Verificar total geral de livros
SELECT COUNT(*) as TotalBooks FROM Books;
