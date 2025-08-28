# 📚 CCAA Books - Catálogo de Livros

Sistema CRUD completo para gerenciamento de catálogos de livros, desenvolvido em Angular como teste técnico para a CCAA. O projeto utiliza design inspirado na Livraria Cultura e paleta de cores da marca CCAA.

## ✨ Funcionalidades

- **Listagem de Livros**: Visualização em grid responsivo com cards de livros
- **Busca e Filtros**: Sistema de busca por título, autor ou categoria
- **Categorias**: Sidebar com categorias organizadas e contadores
- **CRUD Completo**: 
  - ✅ **Create**: Adicionar novos livros
  - ✅ **Read**: Visualizar todos os livros
  - ✅ **Update**: Editar livros existentes (preparado para implementação)
  - ✅ **Delete**: Excluir livros
- **Dados Mockados**: 5 livros de exemplo incluídos
- **Design Responsivo**: Interface adaptável para mobile e desktop

## 🎨 Decisões Técnicas de Design

### Layout e UX (Inspirado na Livraria Cultura):
- **Header com Gradiente**: Barra superior com gradiente e busca centralizada
- **Sidebar de Categorias**: Navegação lateral com contadores de livros por categoria
- **Cards de Destaque**: Seções promocionais em destaque no topo
- **Grid Responsivo**: Layout em grid para exibição dos livros
- **Breadcrumbs**: Navegação hierárquica para melhor experiência do usuário
- **Formulário Modal**: Formulário de adição integrado na interface principal

### Paleta de Cores (Inspirada no CCAA):
- **Vermelho CCAA**: `#F06292` (coral vibrante) - Usado para preços e destaques
- **Azul CCAA**: `#2196F3` (azul sky) - Cor principal para botões e links
- **Azul Escuro**: `#303F9F` (índigo) - Usado para elementos secundários
- **Branco**: `#FFFFFF` - Fundo principal e texto sobre cores
- **Cinza Claro**: `#F5F5F5` - Fundo secundário e elementos neutros
- **Cinza**: `#757575` - Texto secundário e ícones
- **Cinza Escuro**: `#424242` - Texto principal e títulos

### Justificativas Técnicas:
- **Gradiente Header**: Cria identidade visual forte e moderna
- **Cards com Sombras**: Profundidade visual e hierarquia clara
- **Hover Effects**: Interatividade e feedback visual para o usuário
- **Responsividade**: Layout adaptável para diferentes dispositivos
- **Tipografia Clara**: Hierarquia visual bem definida para melhor legibilidade

## 🚀 Como Executar

### Pré-requisitos:
- Node.js (versão 18+)
- npm ou yarn
- Angular CLI

### Instalação:
```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
ng serve

# Acessar no navegador
# http://localhost:4200
```

### Comandos Disponíveis:
```bash
ng serve          # Servidor de desenvolvimento
ng build          # Build para produção
ng test           # Executar testes
ng generate       # Gerar componentes/serviços
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   └── book-catalog/          # Componente principal
│   │       ├── book-catalog.ts     # Lógica do componente
│   │       ├── book-catalog.html   # Template HTML
│   │       └── book-catalog.scss   # Estilos SCSS
│   ├── models/
│   │   └── book.model.ts          # Interfaces TypeScript
│   ├── services/
│   │   └── book.ts                # Serviço CRUD
│   ├── app.ts                     # Componente raiz
│   └── styles.scss                # Estilos globais
```

## 🔧 Tecnologias Utilizadas

- **Angular 20.2.0** - Framework principal
- **TypeScript 5.9.2** - Linguagem de programação
- **SCSS** - Pré-processador CSS com variáveis e mixins
- **RxJS** - Programação reativa para operações assíncronas
- **Angular Signals** - Sistema de estado moderno e performático
- **Standalone Components** - Arquitetura Angular moderna e modular

## 📊 Dados de Exemplo

O sistema inclui 5 livros de exemplo:

1. **O Senhor dos Anéis: A Sociedade do Anel** - J.R.R. Tolkien
2. **Dom Casmurro** - Machado de Assis
3. **O Poder do Hábito** - Charles Duhigg
4. **Steve Jobs: A Biografia** - Walter Isaacson
5. **Batman: Ano Um** - Frank Miller

## 🎯 Próximos Passos

- [ ] Implementar funcionalidade de edição
- [ ] Adicionar validações de formulário
- [ ] Implementar paginação
- [ ] Adicionar testes unitários
- [ ] Integração com API real
- [ ] Sistema de autenticação
- [ ] Upload de imagens de capa

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido como teste técnico para CCAA com ❤️ usando Angular, design inspirado na Livraria Cultura e cores da marca CCAA**
