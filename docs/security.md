# Segurança no Bytebank (Tech Challenge Fase 4)

## Introdução

Este documento descreve a implementação de autenticação segura e criptografia de dados sensíveis no aplicativo **Bytebank**, desenvolvido como parte do **Tech Challenge – Fase 4** da pós-graduação em Front-end Engineering. O objetivo é detalhar as práticas adotadas para garantir a segurança dos dados do usuário, incluindo proteção de rotas, validações e criptografia.

---

## Autenticação Segura

A autenticação é gerenciada pelo **Firebase Auth**, que oferece segurança robusta para credenciais de usuário através de criptografia e validação no servidor.

**Implementação:**

-   **Login e Cadastro**: utilizam `signInWithEmailAndPassword` e `createUserWithEmailAndPassword` do Firebase Auth, que validam credenciais no servidor e criam contas com senhas automaticamente hasheadas.
-   **Criptografia de senhas**: senhas são hasheadas pelo Firebase usando algoritmos seguros antes do armazenamento, nunca sendo salvas em texto plano. Mesmo com acesso ao banco, não é possível recuperar senhas originais.
-   **Validações**: senha mínima de 6 caracteres e validação de email obrigatório, implementadas nos use cases (`LoginUseCase`, `SignUpUseCase`) antes do envio ao Firebase.
-   **Tratamento de erros**: mensagens genéricas para evitar vazamento de informações (ex.: "Email ou senha inválidos" em vez de especificar qual está incorreto).

**Localização:** `modules/Users/infrastructure/repositories/UserRepository.ts` e `modules/Users/domain/use-cases/`.

## Proteção de Rotas

As rotas são separadas em fluxos públicos e protegidos:

-   **Rotas públicas** (`app/(auth)/`): apenas telas de login e cadastro.
-   **Rotas protegidas** (`app/(protected)/`): layout verifica estado de autenticação via `useAuth` antes de renderizar telas.
-   **Monitoramento automático**: `AuthProvider` monitora mudanças no estado de autenticação via `onAuthStateChanged` do Firebase.

**Localização:** Proteção de rotas em `app/(protected)/_layout.tsx`.

---

## Criptografia de Dados Sensíveis

### Proteção de Senhas

Além do hashing automático pelo Firebase Auth, o sistema garante que senhas nunca sejam expostas em logs, mensagens de erro ou armazenamento local no dispositivo.

### Proteção de Dados de Cartões

Dados bancários recebem tratamento especial:

-   **CVV**: campo utiliza `secureTextEntry` na interface React Native, ocultando a entrada durante a digitação.
-   **Validações**: dados de cartão são validados na camada de domínio (`CardEntity`) antes do armazenamento:
    -   Número de cartão obrigatório, CVV entre 100 e 9999, data de expiração no formato MM/AA válido.
    -   Bandeira e tipo de cartão validados contra valores permitidos.

### Isolamento de Dados

O sistema implementa isolamento de dados por usuário:

-   Cartões, transações e dados de usuário são associados ao `userId` do usuário autenticado.
-   Validação de autorização antes de atualizar dados (verificação de `currentUser.uid === userId`).
-   Se um usuário tentar acessar ou modificar dados de outro usuário, uma exceção de "Não autorizado" é lançada.

**Localização:** `modules/Cards/domain/entities/Card.ts`, `modules/Transactions/domain/entities/Transaction.ts` e repositórios de cada módulo.

### Considerações Finais

A autenticação e criptografia de dados sensíveis no Bytebank são implementadas de forma que:

-   Senhas sejam hasheadas automaticamente pelo Firebase Auth antes do armazenamento.
-   Senhas nunca sejam expostas em logs, mensagens de erro ou armazenamento local.
-   Dados de cartão sejam validados na camada de domínio (`CardEntity`) antes do armazenamento.
-   Cartões, transações e dados de usuário sejam associados ao `userId` do usuário autenticado.

---
