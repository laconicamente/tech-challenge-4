# Módulo Users

Gerenciamento de autenticação e dados de usuários usando Clean Architecture.

## Estrutura

```
modules/Users/
├── domain/
│   ├── entities/            # Entidade User com validações
│   ├── interfaces/          # Contratos do repositório
│   └── use-cases/           # Casos de uso (Login, SignUp, etc)
├── infrastructure/
│   ├── repositories/        # Implementação Firebase Auth + Firestore
│   └── factories/           # Injeção de dependências
├── presentation/
│   ├── contexts/           # AuthContext
│   ├── hooks/              # Hooks customizados
│   └── components/         # Componentes UI
└── index.ts
```

## Uso

### AuthContext
```typescript
import { AuthProvider, useAuth } from '@/modules/Users';

// No _layout.tsx raiz
<AuthProvider>
  <App />
</AuthProvider>

// Em qualquer componente
const { user, isAuthenticated, login, signUp, logout, updateUser } = useAuth();
```

### Hook de usuário
```typescript
import { useUser } from '@/modules/Users';

const { fetchUserData, isLoading, error } = useUser();
const userData = await fetchUserData(userId);
```

### Casos de uso diretos
```typescript
import { loginUseCase, signUpUseCase, updateUserUseCase } from '@/modules/Users';

// Login
await loginUseCase.execute({ email, password });

// SignUp
await signUpUseCase.execute({ name, email, password });

// Update
await updateUserUseCase.execute(userId, { displayName: 'Novo Nome' });
```

## Arquitetura

**Entities**: Encapsula validações de dados do usuário (email, nome, etc).

**Use Cases**: Orquestra operações de autenticação e gerenciamento de usuário.

**Infrastructure**: Conecta com Firebase Auth e Firestore.

**Presentation**: Camada de UI com contexto de autenticação e hooks React.

## Entidade User

A entidade `UserEntity` centraliza as validações:

- UID é obrigatório
- Email deve ser válido
- Nome deve ter entre 2 e 100 caracteres

Métodos auxiliares: `hasEmail()`, `hasDisplayName()`, `create()`

## Tipos

```typescript
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCredentials {
  email: string;
  password: string;
}

interface SignUpData extends UserCredentials {
  name: string;
}
```

## Casos de Uso

### LoginUseCase
Valida credenciais e autentica o usuário via Firebase Auth.

### SignUpUseCase
Cria nova conta, atualiza perfil e salva dados no Firestore.

### LogoutUseCase
Faz logout do usuário atual.

### UpdateUserUseCase
Atualiza dados do usuário no Firebase Auth e Firestore.

### GetUserDataUseCase
Busca dados completos do usuário no Firestore.

## Extensibilidade

A separação em camadas facilita:
- Trocar provedor de autenticação sem afetar lógica de negócio
- Adicionar novos métodos de autenticação (Google, Apple, etc)
- Testar cada camada isoladamente
- Reutilizar lógica em diferentes interfaces
