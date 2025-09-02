-- Script para verificar se a exclusão de livros está funcionando como HARD DELETE
-- Execute este script antes e depois de deletar um livro para confirmar

-- 1. Verificar total de livros antes da exclusão
SELECT 
    COUNT(*) as TotalBooks,
    COUNT(CASE WHEN ISBN = '1234567890123' THEN 1 END) as TestBookCount
FROM Books;

-- 2. Listar todos os livros (para verificar se existem)
SELECT 
    Id,
    Title,
    ISBN,
    Author,
    CreatedAt,
    UserId
FROM Books 
ORDER BY CreatedAt DESC;

-- 3. Verificar se há livros com ISBN específico (substitua pelo ISBN do livro que você vai deletar)
SELECT 
    Id,
    Title,
    ISBN,
    Author,
    CreatedAt,
    UserId
FROM Books 
WHERE ISBN = '1234567890123'; -- Substitua pelo ISBN do livro que você vai deletar

-- 4. Verificar estrutura da tabela (confirmar que não há coluna IsActive)
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Books' 
ORDER BY ORDINAL_POSITION;

-- 5. Verificar índices da tabela Books
SELECT 
    i.name AS IndexName,
    i.type_desc AS IndexType,
    i.is_unique AS IsUnique,
    c.name AS ColumnName
FROM sys.indexes i
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.object_id = OBJECT_ID('Books')
ORDER BY i.name, ic.key_ordinal;
