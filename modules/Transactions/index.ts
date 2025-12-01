// Domain
export type { ITransactionRepository, PaginatedTransactions, Transaction, TransactionFilters } from './domain/interfaces/ITransactionRepository';

// Use Cases
export { AddTransactionUseCase } from './domain/use-cases/AddTransactionUseCase';
export { CalculateBalanceUseCase } from './domain/use-cases/CalculateBalanceUseCase';
export { DeleteTransactionUseCase } from './domain/use-cases/DeleteTransactionUseCase';
export { GetTransactionsUseCase } from './domain/use-cases/GetTransactionsUseCase';
export { UpdateTransactionUseCase } from './domain/use-cases/UpdateTransactionUseCase';

// Infrastructure
export {
    addTransactionUseCase, calculateBalanceUseCase, deleteTransactionUseCase, getTransactionsUseCase, updateTransactionUseCase
} from './infrastructure/factories/transactionFactories';

// Presentation - Hooks
export { useBalanceValue } from './presentation/hooks/useBalanceValue';
export { useTransactions } from './presentation/hooks/useTransactions';
export type { TransactionsParams, TransactionsResponse } from './presentation/hooks/useTransactions';

// Presentation 
export * from './presentation';

