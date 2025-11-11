# 🏦 Módulo Balance - Clean Architecture

Este módulo implementa a funcionalidade de **Balance** (Saldo) seguindo os princípios da **Clean Architecture** com padrão **Feature-based**.

## 📁 Estrutura do Módulo

```
src/modules/Balance/
├── domain/                           # 🎯 Camada de Domínio
│   ├── repositories/
│   │   └── IBalanceRepository.ts     # Interface do repositório
│   └── useCases/
│       └── CalculateTotalBalanceUseCase.ts # Caso de uso principal
├── application/                      # 📋 Camada de Aplicação
│   └── useCases/
│       └── CalculateTotalBalanceUseCase.ts # Casos de uso
├── infrastructure/                   # 🔧 Camada de Infraestrutura
│   ├── repositories/
│   │   └── BalanceRepository.ts      # Implementação Firebase
│   └── factories/
│       └── BalanceFactory.ts         # Injeção de dependências
├── presentation/                     # 🎨 Camada de Apresentação
│   ├── hooks/
│   │   └── useBalanceValue.ts        # Hook refatorado
│   └── components/
│       └── BalanceResume.tsx         # Componente refatorado
└── index.ts                          # Exportações principais
```

## 🔄 Fluxo da Arquitetura

```
UI Component → Hook → Use Case → Repository Interface → Repository Impl → Firebase
     ↑              (App Layer)   (Domain Layer)    (Infrastructure Layer)    ↓
  State UI ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← Response
```

## 🧭 Camadas da Arquitetura

### 1. **Domain Layer** 🎯
- **IBalanceRepository**: Interface que define o contrato para cálculo de saldo
- **Entidades**: Objetos de domínio com regras de negócio
- **Value Objects**: Tipos específicos do domínio
- **100% independente** de tecnologias externas

### 2. **Application Layer** 📋
- **CalculateTotalBalanceUseCase**: Lógica de aplicação e orquestração
- **DTOs**: Objetos de transferência de dados
- **Validações**: Regras específicas da aplicação
- **Depende apenas**: do Domain Layer

### 3. **Infrastructure Layer** 🔧
- **BalanceRepository**: Implementação concreta que acessa o Firebase
- **BalanceFactory**: Gerencia a injeção de dependências
- **Configurações**: Database, APIs, Frameworks externos
- **Mappers**: Conversão entre camadas
- **Responsável por**: TODOS os detalhes técnicos

### 4. **Presentation Layer** 🎨
- **useBalanceValue**: Hook que gerencia estado da UI
- **BalanceResume**: Componente React otimizado
- **Controllers**: Adaptadores entre UI e Application
- **Gerencia**: loading, erros e interações do usuário

## 🚀 Como Usar

### 1. **Importar o hook refatorado:**
```typescript
import { useBalanceValue } from '@/src/modules/Balance';

// No seu componente
const { total, isLoadingBalance, errorTotal, refetchBalanceValue } = useBalanceValue({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  categoryId: 'optional-category-id'
});
```

### 2. **Usar o componente refatorado:**
```tsx
import { BalanceResume } from '@/src/modules/Balance';

// No seu JSX
<BalanceResume 
  showMinified={false}
  filters={{
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  }}
/>
```

### 3. **Usar o Use Case diretamente:**
```typescript
import { calculateTotalBalanceUseCase } from '@/src/modules/Balance';

// Em um controller ou service
const balance = await calculateTotalBalanceUseCase.execute(
  { startDate: '2024-01-01' }, 
  userId
);
```

## ✅ Vantagens da Nova Arquitetura

### **🔧 Separação de Responsabilidades**
- **Domain**: Lógica de negócio pura
- **Application**: Lógica de aplicação e orquestração
- **Data**: Acesso a dados e persistência  
- **Infrastructure**: Configuração e DI
- **Presentation**: Interface e estado da UI

### **🧪 Testabilidade**
- Use Cases podem ser testados independentemente
- Repositórios mockados facilmente via interface
- Componentes testáveis sem dependências externas

### **🔄 Flexibilidade**
- Troca do Firebase por outra DB sem impacto no domínio
- Lógica de negócio reutilizável em outros contextos
- Componentes desacoplados e configuráveis

### **📈 Escalabilidade**
- Estrutura preparada para novos casos de uso
- Factory pattern facilita gerenciamento de dependências
- Módulos independentes e coesos

## 🔄 Migração do Código Antigo

### **Antes:**
```typescript
// shared/hooks/useBalanceValue.ts - ANTIGO
const totalValue = await fetchBalanceValue(filters);
```

### **Depois:**
```typescript
// src/modules/Balance/presentation/hooks/useBalanceValue.ts - NOVO
const totalValue = await calculateTotalBalanceUseCase.execute(filters, user.uid);
```

### **Atualização nos Componentes:**
```tsx
// Substituir imports antigos
// import { useBalanceValue } from '@/shared/hooks/useBalanceValue'; ❌

// Por imports novos
import { useBalanceValue } from '@/src/modules/Balance'; ✅
```

## 🔧 Configuração

1. **Certifique-se que o Firebase está configurado**
2. **Importe o módulo onde necessário**
3. **Use o hook ou componente refatorado**
4. **Remove arquivos antigos após validação**

---

*Esta implementação segue as melhores práticas de Clean Architecture, garantindo código maintível, testável e escalável.*