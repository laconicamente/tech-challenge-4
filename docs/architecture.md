# Documentação de Arquitetura – Bytebank (Tech Challenge Fase 4)

## Introdução

Este documento descreve a arquitetura do projeto **Bytebank**, desenvolvida como parte do **Tech Challenge – Fase 4** da pós-graduação em Front-end Engineering. O objetivo é detalhar como a arquitetura da aplicação foi estruturada e modificada, quais camadas e módulos foram adotados e como elas se relacionam.

---

## Visão Geral da Arquitetura

A arquitetura do Bytebank combina organização por módulos de funcionalidade (feature modules) com princípios de clean architecture, aplicada nos principais domínios do sistema (cartões, transações, usuários, etc.). De forma resumida:

-   **Plataforma**: aplicativo **mobile** em React Native com **Expo Router** (`app/`).
-   **Organização principal**:
    -   `modules/` – módulos do sistema organizados por funcionalidade.
    -   `shared/` – recursos compartilhados (UI, helpers, hooks, constantes).
    -   `app/` – rotas e telas da aplicação (fluxos de autenticação e área protegida).
-   **Camadas por módulo (`modules/*`)**:
    -   `domain/` – regras do sistema (entidades, interfaces, casos de uso).
    -   `infrastructure/` – implementações concretas e integrações (Firebase, repositórios, factories).
    -   `presentation/` – UI, hooks e contexts.
-   **State Management**:
    -   Context API e hooks específicos por módulo (`useAuth`, `useCards`, `useTransactions`, etc.).
-   **Back-end**:
    -   Firebase (`firebaseConfig.ts`) para autenticação e persistência (Firestore).

---

## Organização da Arquitetura

A arquitetura do Bytebank é organizada em **módulos de funcionalidade** (feature modules), onde cada módulo agrupa sua própria lógica de negócio seguindo o mesmo padrão de camadas. Isso permite que cada área do sistema (cartões, transações, usuários, etc.) evolua de forma isolada, mantendo baixo acoplamento entre features.

### Separação por Módulos

A pasta `modules/` centraliza toda lógica do sistema em módulos independentes por feature. Os principais módulos são:

-   `Cards` – gestão de cartões bancários.
-   `Transactions` – gerenciamento de transações financeiras.
-   `Users` – autenticação e dados de usuário.
-   `PaymentMethods` – métodos de pagamento.
-   `Categories` – categorias de transações.
-   `Widgets` – widgets de dashboard e resumos financeiros.

Cada módulo segue a mesma estrutura interna e é dividido em três camadas principais:

#### Domain (`domain/`)

Concentra as **regras de negócio puras**.

-   `entities/` – modelagem de dados e validações de negócio.
-   `interfaces/` – contratos de repositório (ex.: `ICardRepository`, `IUserRepository`).
-   `use-cases/` – casos de uso com responsabilidade única (ex.: `AddCardUseCase`, `GetCardsUseCase`).

**Princípios**: Dependency Inversion (use cases dependem de interfaces) e Single Responsibility (cada use case representa um fluxo específico).

#### Infrastructure (`infrastructure/`)

Implementa as interfaces do domínio e conecta a aplicação aos serviços externos (Firebase, APIs, etc.).

-   `repositories/` – classes concretas que implementam interfaces do domínio, acessando Firestore/Auth.
-   `factories/` – cria instâncias dos casos de uso com as dependências corretas (injeção de dependência).

**Função**: isolar detalhes de persistência e rede, mantendo o domínio independente.

#### Presentation (`presentation/`)

Lida com a **interface de usuário**, estado da tela e orquestração de chamadas aos casos de uso.

-   `components/` – componentes específicos da feature.
-   `hooks/` – hooks que consomem os casos de uso e encapsulam estados (`isLoading`, `error`, dados), filtros e comportamento de UI.
-   `contexts/` – contextos para compartilhamento de estado em nível de módulo.

**Princípio**: Separation of Concerns – UI separada da lógica de negócio e persistência. A apresentação não conhece detalhes de Firebase; trabalha apenas com hooks e use cases já montados.

#### Exemplo: Módulo de Cards

O módulo `Cards` ilustra o padrão aplicado:

-   **Domain**: define `ICardRepository` e casos de uso como `GetCardsUseCase`, `AddCardUseCase`.
-   **Infrastructure**: `CardRepository` implementa `ICardRepository` usando Firestore, e `cardFactories.ts` cria instâncias dos use cases.
-   **Presentation**: hook `useCards` consome os use cases, gerencia estado (`cards`, `isLoading`, `error`, `filters`) e expõe operações (`addCard`, `updateCard`, etc.) para os componentes como `CardCreateDrawer` e `CardItem`.

Outros módulos seguem o mesmo padrão, cada um agrupando sua própria regra de negócio, repositórios e UI.

---

### Camada Compartilhada (`shared/`)

A pasta `shared/` concentra **recursos reutilizáveis** que não pertencem a um domínio específico, mas são usados por vários módulos e telas.

**Principais blocos:**

-   `shared/ui/`  
    Componentes de interface genéricos:

    -   `Button`, `Card`, `Drawer`, `Input`, `Select`, `TabBar`, `ThemedText`, `ThemedView`, e componentes de loading/skeleton (`SkeletonCard`, `SkeletonText`, etc.).

-   `shared/components/`  
    Componentes estruturais compartilhados:

    -   `AppHeader`, `ProtectedHeader` – usados em telas da área autenticada (`app/(protected)`).

-   `shared/hooks/`  
    Hooks de uso transversal:

    -   `useColorScheme`, `useThemeColor`, `useFeedbackAnimation`, `useUploadFile`, etc.

-   `shared/helpers/`  
    Funções utilitárias puras:

    -   `formatCurrency`, `formatDate`, `maskCardNumber`, `maskPhone`, entre outras.

-   `shared/classes/constants/`  
    Constantes e paleta de cores:
    -   `ColorsPalette` com variações `light` e `dark`, que definem as cores principais usadas no app.

Essa camada ajuda a **padronizar UI/UX**, reduzir duplicação de código e centralizar ajustes visuais e de comportamento.

---

### Camada de Aplicação e Rotas (`app/`)

A pasta `app/` usa **Expo Router** para organizar as telas e fluxos de navegação da aplicação.

**Principais grupos:**

-   `app/(auth)/`

    -   Fluxo público de autenticação, ex.: `account-access.tsx`.

-   `app/(protected)/`
    -   Fluxo autenticado:
        -   `dashboard.tsx` – consome widgets de `modules/Widgets` e `CardBalance` de `modules/Transactions`.
        -   `cards.tsx` – usa o módulo `Cards`.
        -   `transactions.tsx` – usa o módulo `Transactions`.
        -   `profile.tsx` – usa o módulo `Users`.
    -   `_layout.tsx` – layout comum da área protegida (headers, navegação, etc.).

A camada de aplicação funciona como **compositor**: ela monta as telas consumindo hooks, componentes e contexts de `modules/*` e `shared/`, sem conter lógica de negócio nem acesso direto ao Firebase.

---

## Considerações Finais

A arquitetura adotada no Bytebank combina organização por módulos de funcionalidade com princípios de clean architecture, permitindo que cada área do sistema evolua de forma independente.

---
