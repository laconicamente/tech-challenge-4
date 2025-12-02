# Módulo Transactions

Gerenciamento de transações financeiras e cálculo de saldo usando Clean Architecture.

## Estrutura

```
modules/Transactions/
├── domain/
│   ├── interfaces/          # Contratos do repositório
│   └── use-cases/           # Lógica de negócio
├── infrastructure/
│   ├── repositories/        # Implementação Firebase
│   └── factories/           # Injeção de dependências
├── presentation/
│   ├── hooks/              # Hooks React
│   └── components/         # Componentes UI
└── index.ts
```

## Uso

### Hook de saldo
```typescript
import { useBalanceValue } from '@/modules/Transactions';

const { total, isLoadingBalance, errorTotal, refetchBalanceValue } = useBalanceValue();
```

### Componente
```typescript
import { BalanceResume } from '@/modules/Transactions';

<BalanceResume />
```

## Arquitetura

**Domain**: Define as regras de negócio e interfaces, independente de frameworks.

**Infrastructure**: Conecta com Firebase e fornece implementações concretas.

**Use Cases**: Orquestra operações (ex: calcular saldo total).

**Presentation**: Camada de UI com hooks e componentes React.

## Tipos

```typescript
interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  value: number;
  description?: string;
  createdAt?: Date;
}
```

## Extensibilidade

A separação em camadas facilita:
- Trocar fonte de dados sem afetar lógica de negócio
- Adicionar novos casos de uso
- Testar cada camada isoladamente
- Reutilizar lógica em diferentes interfaces

