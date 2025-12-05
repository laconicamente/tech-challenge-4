# Módulo Transactions

Gerenciamento de transações financeiras e cálculo de saldo usando Clean Architecture.

## Estrutura

```
modules/Transactions/
├── domain/
│   ├── entities/            # Regras de negócio e validações
│   ├── interfaces/          # Contratos do repositório
│   └── use-cases/           # Orquestração de operações
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

**Entities**: Encapsula regras de negócio e validações de dados da transação.

**Use Cases**: Orquestra operações usando entities e repositórios.

**Infrastructure**: Conecta com Firebase e fornece implementações concretas.

**Presentation**: Camada de UI com hooks e componentes React.

## Entidade Transaction

A entidade `TransactionEntity` centraliza as validações:

- Valor deve ser maior que zero
- UserId, categoryId e methodId são obrigatórios
- Tipo deve ser 'income' ou 'expense'
- Descrição limitada a 200 caracteres

Métodos auxiliares: `isExpense()`, `isIncome()`, `toJSON()`

## Tipos

```typescript
interface TransactionData {
  id?: string;
  userId: string;
  type: 'income' | 'expense';
  value: number;
  categoryId: string;
  methodId: string;
  description?: string;
  createdAt?: Date;
  fileUrl?: string;
}
```

## Extensibilidade

A separação em camadas facilita:
- Trocar fonte de dados sem afetar lógica de negócio
- Adicionar novos casos de uso
- Testar cada camada isoladamente
- Reutilizar lógica em diferentes interfaces

