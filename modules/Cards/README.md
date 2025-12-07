# Módulo Cards

Este módulo implementa a gestão de cartões bancários seguindo os princípios da Clean Architecture.

## Estrutura

```
Cards/
├── domain/              # Regras de negócio
│   ├── entities/       # Entidades de domínio
│   ├── interfaces/     # Contratos (ports)
│   └── use-cases/      # Casos de uso
├── infrastructure/      # Implementações técnicas
│   ├── repositories/   # Implementação dos repositórios
│   └── factories/      # Factories para injeção de dependência
└── presentation/        # Camada de UI
    ├── hooks/          # React hooks
    └── components/     # Componentes React (futuros)
```

## Casos de Uso

- **AddCardUseCase**: Adiciona um novo cartão
- **GetCardsUseCase**: Busca cartões com filtros
- **GetCardByIdUseCase**: Busca um cartão específico
- **UpdateCardUseCase**: Atualiza dados de um cartão
- **DeleteCardUseCase**: Remove um cartão
- **SetPrincipalCardUseCase**: Define um cartão como principal

## Como usar

```typescript
import { useCards } from '@/modules/Cards';

function MyComponent() {
  const { 
    cards, 
    isLoading, 
    addCard, 
    updateCard, 
    deleteCard,
    setPrincipalCard 
  } = useCards();
}
```

## Validações

A entidade `CardEntity` valida:
- UserId obrigatório
- Número do cartão obrigatório
- Nome obrigatório
- CVV entre 100 e 9999
- Data de expiração válida (formato MM/YY)
- Tipo de cartão obrigatório
- Bandeira válida (Visa, MasterCard, Elo)
