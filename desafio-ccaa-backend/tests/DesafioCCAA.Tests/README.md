# Testes Unitários - Desafio CCAA

Este diretório contém os testes unitários para o backend do projeto Desafio CCAA.

## Estrutura dos Testes

### 1. UserServiceTests.cs
Testes abrangentes para o `UserService`, cobrindo:
- **Registro de usuários**: Validação de dados, verificação de email duplicado, tratamento de erros de senha
- **Login**: Autenticação válida/inválida, usuários inativos, geração de JWT
- **Gerenciamento de usuários**: Busca por ID, atualização de perfil, desativação
- **Gerenciamento de senhas**: Alteração de senha, reset de senha, recuperação de senha
- **Verificações**: Existência de email

### 2. BookServiceTests.cs
Testes completos para o `BookService`, incluindo:
- **Criação de livros**: Dados válidos, usuário inexistente, ISBN duplicado, processamento de imagens
- **Busca de livros**: Por ID, por usuário, com controle de acesso
- **Atualização de livros**: Dados válidos, controle de acesso, ISBN duplicado
- **Exclusão de livros**: Controle de acesso, verificação de propriedade
- **Relatórios**: Geração de PDF com livros do usuário
- **Categorias**: Listagem de gêneros e contadores
- **Integração com OpenLibrary**: Busca por ISBN, criação de livros via API

### 3. EmailServiceTests.cs
Testes para o `EmailService`, cobrindo:
- **Configuração SMTP**: Valores padrão, configurações customizadas
- **Envio de emails**: SMTP válido, fallback para PickupDirectory, diferentes tipos de conteúdo
- **Teste de conexão**: Validação de credenciais, tratamento de erros
- **Tratamento de erros**: Emails inválidos, caracteres especiais, corpos longos
- **Integração**: Criação de arquivos em PickupDirectory

### 4. ValidationTests.cs
Testes para os validadores FluentValidation:
- **UserRegistrationDtoValidator**: Validação de nome, email, senha, data de nascimento
- **CreateBookDtoValidator**: Validação de título, ISBN, autor, sinopse
- **Casos extremos**: Valores nos limites, múltiplos erros, formatos inválidos

## Tecnologias Utilizadas

- **xUnit**: Framework de testes
- **FluentAssertions**: Assertions mais legíveis
- **Moq**: Framework de mocking
- **FluentValidation**: Validação de dados

## Executando os Testes

```bash
# Executar todos os testes
dotnet test

# Executar com detalhes
dotnet test --verbosity normal

# Executar testes específicos
dotnet test --filter "UserServiceTests"

# Executar com cobertura de código
dotnet test --collect:"XPlat Code Coverage"
```

## Cobertura de Testes

Os testes cobrem:
- ✅ Todos os métodos públicos dos serviços
- ✅ Cenários de sucesso e falha
- ✅ Validações de entrada
- ✅ Tratamento de erros
- ✅ Casos extremos e valores limite
- ✅ Integração entre componentes (via mocks)

## Padrões de Teste

### Estrutura AAA (Arrange, Act, Assert)
```csharp
[Fact]
public async Task MethodName_WithCondition_ShouldReturnExpectedResult()
{
    // Arrange
    var input = new InputDto { /* dados de teste */ };
    _mockService.Setup(x => x.Method()).ReturnsAsync(expectedResult);

    // Act
    var result = await _service.Method(input);

    // Assert
    result.IsSuccess.Should().BeTrue();
    result.Data.Should().NotBeNull();
}
```

### Mocking
- Uso extensivo de `Moq` para isolar unidades de código
- Mocks configurados para retornar dados de teste consistentes
- Verificação de chamadas de métodos quando necessário

### Dados de Teste
- Dados realistas mas simples
- Cobertura de casos extremos
- Validação de diferentes cenários de entrada

## Manutenção

Para adicionar novos testes:
1. Identifique o método/funcionalidade a ser testada
2. Crie cenários de teste cobrindo casos de sucesso e falha
3. Use mocks para isolar dependências
4. Siga o padrão AAA
5. Adicione documentação se necessário

## Dependências

As seguintes dependências foram adicionadas ao projeto de testes:
- `FluentValidation` - Para testes de validação
- `Microsoft.AspNetCore.Identity.EntityFrameworkCore` - Para testes de autenticação
- `Microsoft.Extensions.Configuration` - Para testes de configuração
- `Microsoft.Extensions.Logging.Abstractions` - Para testes de logging

