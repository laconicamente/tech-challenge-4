# 🏦 Módulo Transactions

Este módulo implementa a funcionalidade de **Transações e Balance** (Saldo) com uma arquitetura **limpa e escalável**.

## 📁 Estrutura do Módulo

```
src/modules/Transactions/
├── domain/                               # 🎯 Camada de Domínio
│   ├── interfaces/
│   │   └── ITransactionRepository.ts     # Interface do repositório de transações
│   └── use-cases/
│       └── CalculateBalanceUseCase.ts    # Caso de uso para calcular saldo
├── infrastructure/                       # 🔧 Camada de Infraestrutura
│   ├── repositories/
│   │   └── TransactionRepository.ts      # Implementação Firebase
│   └── factories/
│       └── transactionFactories.ts       # Factories para instâncias
├── presentation/                        # 🎨 Camada de Apresentação
│   ├── hooks/
│   │   └── useBalanceValue.ts           # Hook para gerenciar saldo
│   └── components/
│       └── BalanceResume.tsx            # Componente de resumo do saldo
└── index.ts                             # Exports públicos do módulo
```

## 🔄 Fluxo da Arquitetura

```
UI Component → Hook → UseCase → Repository → Firebase
     ↑        (Presentation) (Domain)  (Infrastructure) ↓
  State UI ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← Response
```

## 🧭 Camadas da Arquitetura

### 1. **Domain Layer** 🎯
- **ITransactionRepository**: Interface que define o contrato para operações com transações
- **Transaction**: Entidade de domínio com tipos `income` e `expense`
- **100% independente** de tecnologias externas

### 2. **Infrastructure Layer** 🔧
- **TransactionRepository**: Implementação concreta que acessa o Firebase
- **transactionFactories**: Factories para criar instâncias dos repositórios
- **Responsabilidades**: Acesso a dados externos (Firebase)

### 3. **Use Cases Layer** 💼
- **CalculateBalanceUseCase**: Lógica de negócio para calcular o saldo
- **Responsabilidades**: Orquestrar operações e aplicar regras de negócio
- **Independente** de UI e infraestrutura

### 4. **Presentation Layer** 🎨
- **useBalanceValue**: Hook que gerencia estado da UI para saldo
- **BalanceResume**: Componente React para exibir resumo do saldo
- **Gerencia**: loading, erros e interações do usuário

## 🚀 Como Usar

### **Importar e usar o hook:**
```typescript
import { useBalanceValue } from '@/src/modules/Transactions';

// No seu componente
const { total, isLoadingBalance, errorTotal, refetchBalanceValue } = useBalanceValue();
```

### **Usar o componente:**
```typescript
import { BalanceResume } from '@/src/modules/Transactions';

// No seu componente
<BalanceResume />
```

### **Usar o use case diretamente (se necessário):**
```typescript
import { CalculateBalanceUseCase } from '@/src/modules/Transactions/usecases/CalculateBalanceUseCase';

// Em casos específicos
const useCase = new CalculateBalanceUseCase();
const balance = await useCase.execute({ userId: 'user123' });
```

## ✅ Vantagens da Arquitetura Implementada

### **🏗️ Clean Architecture**
- **Separação clara** de responsabilidades por camada
- **Inversão de dependências** através de interfaces
- **Testabilidade** com cada camada isolada
- **Flexibilidade** para mudanças futuras

### **💼 Casos de Uso Explícitos**
- Lógica de negócio centralizada e reutilizável
- Facilita testes unitários da regra de negócio
- Independente de frameworks e UI

### **🏭 Factories para Injeção de Dependência**
- Controle centralizado de instâncias
- Facilita configuração e testes
- Reduz acoplamento entre camadas

### **📊 Gestão de Transações e Saldo**
- Entidade `Transaction` com tipos definidos (`income`/`expense`)
- Cálculo automático de saldo baseado nas transações
- Interface clara para operações de consulta

## 🔧 Tipos de Dados

### **Transaction**
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

### **TransactionFilters**
```typescript
interface TransactionFilters {
  userId: string;
}
```

## 📈 Extensibilidade

Esta arquitetura está preparada para:

- ✅ **Novos tipos de transação**
- ✅ **Diferentes fontes de dados** (troca de implementação do repository)
- ✅ **Novos casos de uso** (ex: relatórios, categorias)
- ✅ **Diferentes interfaces** (web, mobile, etc.)
- ✅ **Testes automatizados** em todas as camadas

## 🎯 Princípios Implementados

- ✅ **Single Responsibility Principle**: Cada classe tem uma responsabilidade
- ✅ **Open/Closed Principle**: Aberto para extensão, fechado para modificação  
- ✅ **Liskov Substitution Principle**: Interfaces podem ser substituídas
- ✅ **Interface Segregation Principle**: Interfaces focadas e específicas
- ✅ **Dependency Inversion Principle**: Dependência de abstrações, não de concreções

